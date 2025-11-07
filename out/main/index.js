import { app, BrowserWindow, dialog } from "electron";
import path from "path";
import __cjs_mod__ from "node:module";
const __filename = import.meta.filename;
const __dirname = import.meta.dirname;
const require2 = __cjs_mod__.createRequire(import.meta.url);
if (require2("electron-squirrel-startup")) {
  app.quit();
}
const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      sandbox: false
    }
  });
  mainWindow.webContents.session.on("select-serial-port", async (event, portList, webContents, callback) => {
    event.preventDefault();
    if (portList && portList.length > 0) {
      try {
        const { response } = await dialog.showMessageBox(mainWindow, {
          title: "Select a Serial Port",
          message: "Please select a serial port to connect to:",
          type: "question",
          buttons: [...portList.map((p) => p.portName), "Cancel"],
          cancelId: portList.length
          // The index of the 'Cancel' button
        });
        if (response < portList.length) {
          callback(portList[response].portId);
        } else {
          callback("");
        }
      } catch (err) {
        console.error("Error showing serial port selection dialog:", err);
        callback("");
      }
    } else {
      await dialog.showMessageBox(mainWindow, { title: "No Serial Ports Found", message: "No serial ports were found. Please ensure your device is connected." });
      callback("");
    }
  });
  mainWindow.webContents.session.setPermissionCheckHandler((webContents, permission, requestingOrigin, details) => {
    if (permission === "serial") {
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
  mainWindow.webContents.on("did-finish-load", () => {
    mainWindow.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  console.log("VITE_DEV_SERVER_URL:", process.env.VITE_DEV_SERVER_URL);
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
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
