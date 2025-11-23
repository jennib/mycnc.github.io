import * as electron from "electron";
const { app, BrowserWindow, ipcMain, Menu, shell, dialog, session } = electron;
import path from "path";
import net from "net";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

let mainWindow: BrowserWindow;
let tcpSocket: net.Socket | null = null;

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

  if (process.env.VITE_DEV_SERVER_URL) {
    const aboutUrl = new URL("about.html", process.env.VITE_DEV_SERVER_URL)
      .href;
    aboutWindow.loadURL(aboutUrl);
  } else {
    aboutWindow.loadFile(path.join(__dirname, "../renderer/about.html"));
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
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.cjs'),
      contextIsolation: true, // Enable context isolation
      sandbox: false, // Disable sandbox to allow preload script access
    },
  });

  // Add a handler for the 'toggle-fullscreen' event from the renderer
  ipcMain.on("toggle-fullscreen", (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) win.setFullScreen(!win.isFullScreen());
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
      role: "help",
      submenu: [
        {
          label: "About myCNC",
          click: () => {
            createAboutWindow();
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
  return new Promise((resolve, reject) => {
    if (tcpSocket) {
      tcpSocket.destroy();
      tcpSocket = null;
    }

    tcpSocket = new net.Socket();

    const connectionTimeout = setTimeout(() => {
      reject(new Error("Connection timed out."));
      tcpSocket?.destroy();
      tcpSocket = null;
    }, 5000);

    tcpSocket.on("connect", () => {
      clearTimeout(connectionTimeout);
      console.log(`TCP Connected to ${ip}:${port}`);
      resolve(true);
    });

    tcpSocket.on("data", (data) => {
      mainWindow.webContents.send("tcp-data", data.toString());
    });

    tcpSocket.on("error", (err) => {
      clearTimeout(connectionTimeout);
      console.error("TCP Socket Error:", err.message);
      mainWindow.webContents.send("tcp-error", err.message);
      reject(new Error(err.message));
      tcpSocket?.destroy();
      tcpSocket = null;
    });

    tcpSocket.on("close", () => {
      clearTimeout(connectionTimeout);
      console.log("TCP Socket Closed");
      mainWindow.webContents.send("tcp-disconnect");
      tcpSocket?.destroy();
      tcpSocket = null;
    });

    tcpSocket.connect(port, ip);
  });
});

  ipcMain.on("send-tcp", (event, data: string) => {
    if (tcpSocket && !tcpSocket.destroyed) {
      tcpSocket.write(data); // Newline is now handled by the caller
    } else {
      console.warn(
        "Attempted to send data on a non-existent or destroyed TCP socket."
      );
      mainWindow.webContents.send("tcp-error", "Not connected to TCP device.");
    }
  });
  ipcMain.on("disconnect-tcp", () => {
    if (tcpSocket) {
      tcpSocket.destroy();
      tcpSocket = null;
    }
  });

  const handleSelectSerialPort = async (event, portList, webContents, callback) => {
    // Re-register the handler for the next time, as `once` makes it a single-use handler.
    webContents.session.once('select-serial-port', handleSelectSerialPort);
    
    event.preventDefault();
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
    console.log(`[Main Process] Checking permission for: ${permission}`);
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
    console.log(`[Main Process] Permission request for: ${permission} from origin ${details.requestingUrl}`);
    if (permission === 'media') {
      // In a real app, you'd want to ask the user, but for now, we'll grant it.
      // This will cover 'video' and 'audio' permissions.
      console.log('[Main Process] Granting media permission.');
      return callback(true);
    }
    // Handle individual camera/microphone requests if they come separately
    if (permission === 'camera' || permission === 'microphone') {
        console.log(`[Main Process] Granting ${permission} permission.`);
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
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': ["default-src 'self' http://localhost:3000; connect-src 'self' http://localhost:3000 ws://10.0.0.162:8888; script-src 'self' http://localhost:3000 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; media-src *;"]
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

app.on("ready", createWindow);

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
