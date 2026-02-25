import { app, BrowserWindow, ipcMain, Menu, shell, dialog, session, MenuItemConstructorOptions } from "electron";
import { autoUpdater } from "electron-updater";
import path from "path";
import net from "net";
import os from "os";
import http from "http";
// @ts-ignore
import express from "express";
import { Server as SocketIOServer } from "socket.io";
import { createProxyMiddleware } from "http-proxy-middleware";
import fs from "fs";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');



let mainWindow: BrowserWindow;
let tcpSocket: net.Socket | null = null;
let manualUpdateCheck = false;

// --- Remote Server Setup ---
// Cache for application state to send to new clients
let appState: Record<string, any> = {};

// --- Plugin System ---
const plugins: any[] = [];
let pluginsDir = '';

const loadPlugins = async () => {
  pluginsDir = path.join(app.getPath('userData'), 'plugins');
  if (!fs.existsSync(pluginsDir)) {
    fs.mkdirSync(pluginsDir, { recursive: true });

    // Write an example plugin
    const examplePath = path.join(pluginsDir, 'example-discord-webhook.js.disabled');
    const exampleContent = `// Rename this file to .js to enable it.
// This plugin listens for Job Completion events from mycnc.app and can act accordingly.

module.exports = {
    name: 'Discord Webhook Notification',
    onStateUpdate: async (storeName, state) => {
        // We look for job completion from the jobStore
        if (storeName === 'jobStore' && state.jobStatus === 'complete') {
            console.log('[Plugin] Job completed! Sending imaginary Discord webhook...');
            
            // Example of what a real payload might look like:
            // fetch('https://discord.com/api/webhooks/...', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ content: "CNC Job has finished successfully!" })
            // }).catch(console.error);
        }
    }
};
`;
    fs.writeFileSync(examplePath, exampleContent);
  }

  const files = fs.readdirSync(pluginsDir);
  for (const file of files) {
    if (file.endsWith('.js') || file.endsWith('.cjs')) {
      try {
        const filePath = path.join(pluginsDir, file);
        const pluginUrl = require('url').pathToFileURL(filePath).href;
        const imported = await import(pluginUrl);
        const pluginInstance = imported.default || imported;
        if (pluginInstance && typeof pluginInstance.onStateUpdate === 'function') {
          plugins.push(pluginInstance);
          console.log(`Loaded plugin: ${pluginInstance.name || file}`);
        }
      } catch (err) {
        console.error(`Failed to load plugin ${file}:`, err);
      }
    }
  }
};

const notifyPlugins = (storeName: string, state: any) => {
  plugins.forEach(plugin => {
    try {
      plugin.onStateUpdate(storeName, state);
    } catch (err) {
      console.error(`Plugin ${plugin.name || 'unknown'} error:`, err);
    }
  });
};

const appServer = express();
const httpServer = http.createServer(appServer);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  maxHttpBufferSize: 1e8 // 100 MB
});

const broadcast = (channel: string, ...args: any[]) => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send(channel, ...args);
  }
  if (io) {
    io.emit(channel, ...args);
  }
};

const connectToTcp = (ip: string, port: number): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    if (tcpSocket) {
      if (!tcpSocket.destroyed && !tcpSocket.connecting) {
        console.log("Using existing TCP connection.");
        resolve(true);
        return;
      }
      tcpSocket.destroy();
      tcpSocket = null;
    }

    tcpSocket = new net.Socket();

    const connectionTimeout = setTimeout(() => {
      broadcast("tcp-error", {
        message: "Connection timed out.",
        code: "CONNECTION_TIMEOUT",
      });
      // Only reject if pending? Promise logic handles this safely usually (first call wins)
      reject(new Error("Connection timed out."));
      tcpSocket?.destroy();
      tcpSocket = null;
    }, 5000);

    tcpSocket.on("connect", () => {
      clearTimeout(connectionTimeout);
      console.log(`TCP Connected to ${ip}: ${port}`);
      resolve(true);
    });

    tcpSocket.on("data", (data) => {
      broadcast("tcp-data", data.toString());
    });

    tcpSocket.on("error", (err) => {
      clearTimeout(connectionTimeout);
      console.error("TCP Socket Error:", err.message);
      broadcast("tcp-error", {
        message: err.message,
        code: "TCP_SOCKET_ERROR",
      });
      reject(new Error(err.message));
      tcpSocket?.destroy();
      tcpSocket = null;
    });

    tcpSocket.on("close", () => {
      clearTimeout(connectionTimeout);
      console.log("TCP Socket Closed");
      broadcast("tcp-disconnect");
      tcpSocket?.destroy();
      tcpSocket = null;
    });

    tcpSocket.connect(port, ip);
  });
};

const disconnectTcp = () => {
  if (tcpSocket) {
    tcpSocket.destroy();
    tcpSocket = null;
  }
};

const sendTcp = (data: string) => {
  if (tcpSocket && !tcpSocket.destroyed) {
    tcpSocket.write(data);
  } else {
    // Notify failure usually handled by frontend state or error
    console.warn("Attempted to send data on non-existent socket");
    broadcast("tcp-error", {
      message: "Not connected to TCP device.",
      code: "NOT_CONNECTED",
    });
  }
};


const createAboutWindow = () => {
  const aboutWindow = new BrowserWindow({
    width: 450,
    height: 450,
    resizable: false,
    minimizable: false,
    maximizable: false,
    parent: mainWindow,
    modal: true,
    show: false,
    webPreferences: {
      // No need for preload or node integration for a simple static page
    },
  });

  // Remove the menu from the about window
  aboutWindow.setMenu(null);

  const version = app.getVersion();

  // Find local network IP
  const interfaces = os.networkInterfaces();
  let localIp = 'Unknown';
  for (const ifaceName of Object.keys(interfaces)) {
    const iface = interfaces[ifaceName] || [];
    for (const address of iface) {
      if (address.family === 'IPv4' && !address.internal) {
        localIp = address.address;
        break;
      }
    }
  }

  if (process.env.VITE_DEV_SERVER_URL) {
    const aboutUrl = new URL("about.html", process.env.VITE_DEV_SERVER_URL);
    aboutUrl.searchParams.set("version", version);
    aboutUrl.searchParams.set("ip", localIp);
    aboutWindow.loadURL(aboutUrl.href);
  } else {
    aboutWindow.loadFile(path.join(__dirname, "../renderer/about.html"), { query: { version, ip: localIp } });
  }

  aboutWindow.once("ready-to-show", () => {
    aboutWindow.show();
  });

  // Open external links in the user's default browser
  aboutWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });
};

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    titleBarStyle: 'default',
    backgroundColor: '#0f172a', // Set background color to match theme (Slate 900)
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.cjs'),
      contextIsolation: true, // Enable context isolation
      sandbox: true, // Re-enable sandbox for security
    },
  });

  // --- Auto Updater ---
  // --- Auto Updater ---
  autoUpdater.autoDownload = false;

  // Check for updates once the window is ready
  mainWindow.once('ready-to-show', () => {
    autoUpdater.checkForUpdates();
  });

  // Optional: Log update events for debugging
  autoUpdater.on('checking-for-update', () => {
    console.log('Checking for update...');
  });

  autoUpdater.on('update-available', (info) => {
    console.log('Update available:', info);
    dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: 'Update Available',
      message: `A new version(${info.version}) is available.Do you want to download it now ? `,
      buttons: ['Yes', 'No']
    }).then((result) => {
      if (result.response === 0) { // 'Yes' button
        autoUpdater.downloadUpdate();
      }
    });
  });

  autoUpdater.on('update-not-available', (info) => {
    console.log('Update not available:', info);
    if (manualUpdateCheck) {
      dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: 'No Updates',
        message: 'Current version is up-to-date.'
      });
      manualUpdateCheck = false;
    }
  });

  autoUpdater.on('error', (err) => {
    console.log('Error in auto-updater. ' + err);
    dialog.showMessageBox(mainWindow, {
      type: 'error',
      title: 'Update Error',
      message: 'An error occurred while updating: ' + err
    });
    manualUpdateCheck = false;
  });

  autoUpdater.on('download-progress', (progressObj) => {
    let log_message = "Download speed: " + progressObj.bytesPerSecond;
    log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
    log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
    console.log(log_message);
    // Optional: Send progress to renderer to show a progress bar
    mainWindow.webContents.send('update-progress', progressObj.percent);
  });

  autoUpdater.on('update-downloaded', (info) => {
    console.log('Update downloaded');
    dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: 'Update Ready',
      message: 'Update downloaded. Application will be quit for update...',
      buttons: ['Restart Now', 'Later']
    }).then((result) => {
      if (result.response === 0) { // 'Restart Now' button
        autoUpdater.quitAndInstall();
      }
    });
  });

  // Add a handler for the 'toggle-fullscreen' event from the renderer
  ipcMain.on("toggle-fullscreen", (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) win.setFullScreen(!win.isFullScreen());
  });

  // Open external links in the user's default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  // --- Camera Popout Window ---
  let cameraWindow: BrowserWindow | null = null;

  ipcMain.on('open-camera-window', (event, params) => {
    if (cameraWindow) {
      cameraWindow.focus();
      return;
    }

    cameraWindow = new BrowserWindow({
      width: 800,
      height: 600,
      title: 'Camera View',
      backgroundColor: '#0f172a',
      autoHideMenuBar: true,
      webPreferences: {
        preload: path.join(__dirname, '../preload/preload.cjs'),
        contextIsolation: true,
        sandbox: true,
      },
    });

    const query = new URLSearchParams(params).toString();
    const hash = `# / camera - popout ? ${query}`;

    if (process.env.VITE_DEV_SERVER_URL) {
      cameraWindow.loadURL(`${process.env.VITE_DEV_SERVER_URL}${hash}`);
    } else {
      cameraWindow.loadFile(path.join(__dirname, "../renderer/index.html"), { hash: hash });
    }

    cameraWindow.on('closed', () => {
      cameraWindow = null;
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('camera-window-closed');
      }
    });
  });

  ipcMain.on('close-camera-window', () => {
    if (cameraWindow) {
      cameraWindow.close();
    }
  });

  // --- Menu Template ---
  const menuTemplate: MenuItemConstructorOptions[] = [
    {
      label: "File",
      submenu: [{ role: "quit" }],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
      ]
    },
    {
      label: "Tools",
      submenu: [
        {
          label: "Reset All",
          click: async () => {
            const { response } = await dialog.showMessageBox(mainWindow, {
              type: "warning",
              buttons: ["Cancel", "Reset All"],
              defaultId: 0,
              title: "Reset All Settings",
              message: "Are you sure you want to reset all settings?",
              detail: "This will clear all saved data, including connection history, macros, and preferences. The application will reload. This action cannot be undone.",
            });

            if (response === 1) {
              // Clear localStorage
              await mainWindow.webContents.executeJavaScript("localStorage.clear();");

              // Clear session cache and storage
              await session.defaultSession.clearCache();
              await session.defaultSession.clearStorageData();

              // Reload
              mainWindow.reload();
            }
          },
        },
      ],
    },
    {
      role: "help",
      submenu: [
        {
          label: "Check for Updates...",
          click: () => {
            manualUpdateCheck = true;
            autoUpdater.checkForUpdates();
          },
        },
        {
          label: "About myCNC",
          click: () => {
            createAboutWindow();
          },
        },
        {
          label: "Open Plugins Folder",
          click: async () => {
            const tempPluginsDir = path.join(app.getPath('userData'), 'plugins');
            if (!fs.existsSync(tempPluginsDir)) {
              fs.mkdirSync(tempPluginsDir, { recursive: true });
            }
            await shell.openPath(tempPluginsDir);
          },
        },
        {
          label: "View on GitHub",
          click: async () => {
            await shell.openExternal(
              "https://github.com/jennib/mycnc.github.io"
            );
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  // --- TCP Communication Handlers ---
  ipcMain.handle("connect-tcp", (event, ip: string, port: number) => {
    return connectToTcp(ip, port);
  });

  ipcMain.on("send-tcp", (event, data: string) => {
    sendTcp(data);
  });
  ipcMain.on("disconnect-tcp", () => {
    disconnectTcp();
  });

  // --- State Synchronization Handlers ---
  ipcMain.on("state-update", (event, { storeName, state }) => {
    // Update local cache
    appState[storeName] = { ...appState[storeName], ...state };

    notifyPlugins(storeName, state);

    // Broadcast to remote clients
    if (io) {
      io.emit("state-update", { storeName, state });
    }
  });

  ipcMain.handle("get-initial-state", () => {
    return appState;
  });

  let autoSelectIndex = -1;

  ipcMain.handle("set-auto-select-index", (event, index) => {
    autoSelectIndex = index;
  });

  const handleSelectSerialPort = async (event: any, portList: any[], webContents: any, callback: any) => {
    // Re-register the handler for the next time, as `once` makes it a single-use handler.
    webContents.session.once('select-serial-port', handleSelectSerialPort);

    event.preventDefault();

    if (autoSelectIndex >= 0) {
      if (portList && portList.length > 0 && autoSelectIndex < portList.length) {
        callback(portList[autoSelectIndex].portId);
      } else {
        callback("");
      }
      return;
    }

    if (portList && portList.length > 0) {
      try {
        const { response } = await dialog.showMessageBox(mainWindow, {
          title: "Select a Serial Port",
          message: "Please select a serial port to connect to:",
          type: "question",
          buttons: [...portList.map((p) => p.portName), "Cancel"],
          cancelId: portList.length, // The index of the 'Cancel' button
        });

        if (response < portList.length) {
          // User selected a port
          callback(portList[response].portId);
        } else {
          // User clicked 'Cancel' or closed the dialog
          callback("");
        }
      } catch (err) {
        console.error("Error showing serial port selection dialog:", err);
        callback(""); // Cancel on error
      }
    } else {
      await dialog.showMessageBox(mainWindow, {
        title: "No Serial Ports Found",
        message:
          "No serial ports were found. Please ensure your device is connected.",
      });
      callback("");
    }
  };

  // Set up the initial handler. It will re-register itself after each use.
  mainWindow.webContents.session.once('select-serial-port', handleSelectSerialPort);

  mainWindow.webContents.session.setPermissionCheckHandler((webContents, permission) => {

    if (permission === 'serial' || permission === 'media') {
      return true;
    }
    return false;
  });

  mainWindow.webContents.session.setDevicePermissionHandler((details) => {
    if (details.deviceType === "serial") {
      return true;
    }
    return false;
  });

  // --- Webcam/Media Permission Handler ---
  mainWindow.webContents.session.setPermissionRequestHandler((webContents, permission, callback, details) => {

    if (permission === 'media') {
      // In a real app, you'd want to ask the user, but for now, we'll grant it.
      // This will cover 'video' and 'audio' permissions.

      return callback(true);
    }
    // Handle individual camera/microphone requests if they come separately
    if ((permission as string) === 'camera' || (permission as string) === 'microphone') {

      return callback(true);
    }
    // Deny other requests
    callback(false);
  });

  mainWindow.webContents.on("did-finish-load", () => {
    mainWindow.webContents.send(
      "main-process-message",
      new Date().toLocaleString()
    );
  });

  // and load the index.html of the electron.app.
  // Log the environment variable to the console.
  console.log("VITE_DEV_SERVER_URL:", process.env.VITE_DEV_SERVER_URL);

  // Set a Content Security Policy
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    const isDevelopment = !!process.env.VITE_DEV_SERVER_URL; let csp = "";

    if (isDevelopment) {
      // Relaxed CSP for development
      csp = `default -src 'self' http://localhost:3000; connect-src 'self' ws://10.0.0.162:8888; script-src 'self' http://localhost:3000 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; media-src * blob:; img-src 'self' data:;`;
    } else {
      // Stricter CSP for production
      csp = `default-src 'self'; connect-src 'self' ws://10.0.0.162:8888; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; media-src 'self' blob:; img-src 'self' data:;`;
    }

    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [csp]
      }
    });
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    // Open the DevTools.
    // mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
};

let startupFile: string | null = null;
const args = process.argv.slice(1);
for (const arg of args) {
  if (arg.endsWith('.nc') || arg.endsWith('.gcode') || arg.endsWith('.tap') || arg.endsWith('.txt')) {
    if (fs.existsSync(arg)) {
      startupFile = arg;
      break;
    }
  }
}

ipcMain.handle("get-startup-file", () => {
  if (startupFile) {
    try {
      const content = fs.readFileSync(startupFile, 'utf-8');
      // Clear it so we don't load it twice
      const fileToLoad = startupFile;
      startupFile = null;
      return { name: path.basename(fileToLoad), content };
    } catch (e) {
      console.error("Failed to read startup file:", e);
    }
  }
  return null;
});

console.log('Electron app object:', app);

// Start the remote access server
const PORT = 8080;
// Configure Express
appServer.use(express.json({ limit: '100mb' }));
appServer.post('/api/upload', (req: express.Request, res: express.Response) => {
  const { name, content } = req.body;
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send("load-remote-file", { name, content });
    res.json({ success: true });
  } else {
    res.status(500).json({ error: 'Main window not ready' });
  }
});

if (process.env.VITE_DEV_SERVER_URL) {
  // Proxy to Vite Dev Server
  appServer.use('/', createProxyMiddleware({
    target: process.env.VITE_DEV_SERVER_URL,
    changeOrigin: true,
    ws: true, // Proxy websockets
  } as any));
} else {
  // Serve static files
  appServer.use(express.static(path.join(__dirname, '../renderer')));
}

io.on("connection", (socket) => {
  console.log("New remote connection:", socket.id);

  socket.on("connect-tcp", (ip, port, callback) => {
    connectToTcp(ip, port)
      .then(() => callback({ success: true }))
      .catch((err) => callback({ success: false, error: err.message }));
  });

  socket.on("send-tcp", (data) => {
    sendTcp(data);
  });

  socket.on("disconnect-tcp", () => {
    disconnectTcp();
  });

  // --- State Synchronization ---
  // Send current cached state to new client
  socket.emit("initial-state", appState);

  socket.on("state-update", ({ storeName, state }) => {
    // Update local cache
    appState[storeName] = { ...appState[storeName], ...state };

    notifyPlugins(storeName, state);

    // Broadcast to other remote clients (excluding sender)
    socket.broadcast.emit("state-update", { storeName, state });

    // Send to main window
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send("state-update", { storeName, state });
    }
  });

  socket.on("state-action", (action) => {
    // Forward actions from remote to main window to be executed
    // (Optional: if we want remote to trigger complex logic in main window)
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send("remote-action", action);
    }
  });
});

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Remote access server listening on http://0.0.0.0:${PORT}`);
  const interfaces = os.networkInterfaces();
  console.log("Available remote access URLs:");
  Object.keys(interfaces).forEach((ifaceName) => {
    const iface = interfaces[ifaceName];
    if (iface) {
      iface.forEach((address) => {
        if (address.family === 'IPv4' && !address.internal) {
          console.log(`  http://${address.address}:${PORT}`);
        }
      });
    }
  });
});

app.on("ready", async () => {
  await loadPlugins();
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
