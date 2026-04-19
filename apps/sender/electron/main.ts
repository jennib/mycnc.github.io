import { app, BrowserWindow, ipcMain, Menu, shell, dialog, session, MenuItemConstructorOptions } from "electron";
import os from 'os';
import { autoUpdater } from "electron-updater";
import { createMenu } from './modules/menu';
import { setupAutoUpdater } from './modules/updater';
import { connectToTcp, disconnectTcp, sendTcp } from './modules/tcp-client';
import { loadPlugins, notifyPlugins, setupPluginHandlers } from './modules/plugin-manager';
import { startRemoteServer, broadcastStateToClients } from './modules/remote-server';
import { createWindows, getMainWindow } from './modules/windows';
import { handleStartupArgs, setupStartupHandler } from './modules/startup';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
handleStartupArgs();



let manualUpdateCheck = false;

// --- Remote Server Setup ---
// Cache for application state to send to new clients
let appState: Record<string, any> = {};

const broadcast = (channel: string, ...args: any[]) => {
  const mainWindow = getMainWindow();
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send(channel, ...args);
  }
  // The remote server will handle broadcasting to its own clients
};

const setupIpcHandlers = () => {
  // --- TCP Communication Handlers ---
  ipcMain.handle("connect-tcp", (event, ip: string, port: number) => {
    return connectToTcp(ip, port, broadcast);
  });

  ipcMain.on("send-tcp", (event, data: string) => {
    sendTcp(data, broadcast);
  });
  ipcMain.on("disconnect-tcp", () => {
    disconnectTcp();
  });

  // --- State Synchronization Handlers ---
  ipcMain.on("state-update", (event, { storeName, state }) => {
    appState[storeName] = { ...appState[storeName], ...state };
    notifyPlugins(storeName, state);
    broadcastStateToClients(storeName, state);
  });

  ipcMain.handle("get-initial-state", () => {
    return appState;
  });

  ipcMain.handle("get-server-urls", () => {
    const PORT = 8080;
    const urls: string[] = [`http://localhost:${PORT}`];
    Object.values(os.networkInterfaces()).forEach(iface => {
      iface?.forEach(addr => {
        if (addr.family === 'IPv4' && !addr.internal) {
          urls.push(`http://${addr.address}:${PORT}`);
        }
      });
    });
    return urls;
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
        const { response } = await dialog.showMessageBox(getMainWindow(), {
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
      await dialog.showMessageBox(getMainWindow(), {
        title: "No Serial Ports Found",
        message:
          "No serial ports were found. Please ensure your device is connected.",
      });
      callback("");
    }
  };

  // Set up the initial handler. It will re-register itself after each use.
  getMainWindow().webContents.session.once('select-serial-port', handleSelectSerialPort);

  getMainWindow().webContents.session.setPermissionCheckHandler((webContents, permission) => {

    if (permission === 'serial' || permission === 'media') {
      return true;
    }
    return false;
  });

  getMainWindow().webContents.session.setDevicePermissionHandler((details) => {
    if (details.deviceType === "serial") {
      return true;
    }
    return false;
  });

  // --- Webcam/Media Permission Handler ---
  getMainWindow().webContents.session.setPermissionRequestHandler((webContents, permission, callback, details) => {

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

  getMainWindow().webContents.on("did-finish-load", () => {
    getMainWindow().webContents.send(
      "main-process-message",
      new Date().toLocaleString()
    );
  });

  // Set a Content Security Policy
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    const isDevelopment = !!process.env.VITE_DEV_SERVER_URL;
    let csp = "";

    if (isDevelopment) {
      csp = `default-src 'self' http://localhost:*; connect-src 'self' ws://localhost:*; script-src 'self' http://localhost:* 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; media-src * blob:; img-src 'self' data:; worker-src blob: http://localhost:*;`;
    } else {
      csp = `default-src 'self'; connect-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; media-src 'self' blob:; img-src 'self' data:; worker-src blob:;`;
    }

    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [csp]
      }
    });
  });
}

console.log('Electron app object:', app);

app.on("ready", async () => {
  await loadPlugins();
  const mainWindow = createWindows();
  manualUpdateCheck = setupAutoUpdater(mainWindow, manualUpdateCheck);
  setupPluginHandlers();
  setupStartupHandler();
  manualUpdateCheck = createMenu(mainWindow, autoUpdater, manualUpdateCheck);
  setupIpcHandlers();
  startRemoteServer(appState, broadcast, connectToTcp, disconnectTcp, sendTcp, notifyPlugins, mainWindow);
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindows();
  }
});

