import { app, BrowserWindow, ipcMain, Menu, shell, dialog } from "electron";
import path from "path";
import net from "net";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

let mainWindow:BrowserWindow;
let tcpSocket: net.Socket | null = null;

const createAboutWindow = () => {
  const aboutWindow = newBrowserWindow({
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
  mainWindow = newBrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: process.env.VITE_PRELOAD_JS,
      contextIsolation: true, // Enable context isolation
      sandbox: false, // Disable sandbox to allow preload script access
    },
  });

  // Add a handler for the 'toggle-fullscreen' event from the renderer
  ipcMain.on("toggle-fullscreen", (event) => {
    const win =BrowserWindow.fromWebContents(event.sender);
    if (win) win.setFullScreen(!win.isFullScreen());
  });

  // --- Menu Template ---
  const menuTemplate: Electron.MenuItemConstructorOptions[] = [
    {
      label: "File",
      submenu: [{ role: "quit" }],
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

  const menu =Menu.buildFromTemplate(menuTemplate);
 Menu.setApplicationMenu(menu);

  // --- TCP Communication Handlers ---
  ipcMain.handle("connect-tcp", async (event, ip: string, port: number) => {
    return new Promise<boolean>((resolve) => {
      if (tcpSocket) {
        tcpSocket.destroy();
        tcpSocket = null;
      }

      tcpSocket = new net.Socket();

      tcpSocket.connect(port, ip, () => {
        console.log(`TCP Connected to ${ip}:${port}`);
        resolve(true);
      });

      tcpSocket.on("data", (data) => {
        mainWindow.webContents.send("tcp-data", data.toString());
      });

      tcpSocket.on("error", (err) => {
        console.error("TCP Socket Error:", err.message);
        mainWindow.webContents.send("tcp-error", err.message);
        if (tcpSocket) {
          tcpSocket.destroy();
          tcpSocket = null;
        }
        resolve(false); // Resolve false on connection error
      });

      tcpSocket.on("close", () => {
        console.log("TCP Socket Closed");
        mainWindow.webContents.send("tcp-disconnect");
        if (tcpSocket) {
          tcpSocket.destroy();
          tcpSocket = null;
        }
      });

      // Handle connection timeout
      tcpSocket.setTimeout(5000, () => {
        if (tcpSocket && !tcpSocket.connecting) {
          // Check if it's still trying to connect
          console.error("TCP Connection Timeout");
          mainWindow.webContents.send("tcp-error", "Connection timed out.");
          tcpSocket.destroy();
          tcpSocket = null;
          resolve(false);
        }
      });
    });
  });

  ipcMain.on("send-tcp", (event, data: string) => {
    if (tcpSocket && !tcpSocket.destroyed) {
      tcpSocket.write(data + "\n"); // GRBL expects newline
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

  mainWindow.webContents.session.on(
    "select-serial-port",
    async (event, portList, webContents, callback) => {
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
    }
  );

  mainWindow.webContents.session.setPermissionCheckHandler(
    (webContents, permission, requestingOrigin, details) => {
      if (permission === "serial") {
        return true;
      }
      return false;
    }
  );

  mainWindow.webContents.session.setDevicePermissionHandler((details) => {
    if (details.deviceType === "serial") {
      return true;
    }
    return false;
  });

  // --- Webcam/Media Permission Handler ---
  mainWindow.webContents.session.setPermissionRequestHandler(
    (webContents, permission, callback) => {
      // For this electron.application, we will automatically grant media permission (camera, microphone).
      // In a production electron.app, you might want to show a custom prompt here.
      if (permission === "media") {
        callback(true);
      } else {
        // Deny any other permission requests.
        callback(false);
      }
    }
  );

  mainWindow.webContents.on("did-finish-load", () => {
    mainWindow.webContents.send(
      "main-process-message",
      new Date().toLocaleString()
    );
  });

  // and load the index.html of the electron.app.
  // Log the environment variable to the console.
  console.log("VITE_DEV_SERVER_URL:", process.env.VITE_DEV_SERVER_URL);

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    // Open the DevTools.
    mainWindow.webContents.openDevTools();
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
