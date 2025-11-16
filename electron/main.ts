import {
  app,
  BrowserWindow,
  // dialog,
  // Menu,
  shell,
  // session,
  ipcMain,
} from "electron";
import path from "path";
import net from "net";
import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';

import { TcpManager } from '../services/tcpService';
import { ConsoleLog, MachineState, PortInfo } from '../types';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
// import('electron-squirrel-startup').then((squirrelStartup) => {
//   if (squirrelStartup.default) {
//     app.quit();
//   }
// });

let mainWindow: BrowserWindow;
let tcpManager: TcpManager | null = null;
let serialPort: SerialPort | null = null;

const createTcpManager = () => {
  if (tcpManager) {
    return tcpManager;
  }

  tcpManager = new TcpManager({
    onConnect: (info: PortInfo) => {
      mainWindow.webContents.send("tcp-connect", info);
    },
    onDisconnect: () => {
      mainWindow.webContents.send("tcp-disconnect");
    },
    onLog: (log: ConsoleLog) => {
      mainWindow.webContents.send("tcp-log", log);
    },
    onProgress: (p: { percentage: number; linesSent: number; totalLines: number; }) => {
      mainWindow.webContents.send("tcp-progress", p);
    },
    onError: (message: string) => {
      mainWindow.webContents.send("tcp-error", message);
    },
    onStatus: (status: MachineState, raw: string) => {
      mainWindow.webContents.send("tcp-status", status, raw);
    },
  });
  return tcpManager;
};

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: process.env.VITE_PRELOAD_JS,
      contextIsolation: true, // Enable context isolation
      sandbox: false, // Disable sandbox to allow preload script access
    },
  });

  // Add a handler for the 'toggle-fullscreen' event from the renderer
  // ipcMain.on("toggle-fullscreen", (event) => {
  //   const win = BrowserWindow.fromWebContents(event.sender);
  //   if (win) win.setFullScreen(!win.isFullScreen());
  // });

  // --- Menu Template ---
  // const menuTemplate: Electron.MenuItemConstructorOptions[] = [
  //   {
  //     label: "File",
  //     submenu: [{ role: "quit" }],
  //   },
  //   {
  //     role: "help",
  //     submenu: [
  //       {
  //         label: "About myCNC",
  //         click: () => {
  //           createAboutWindow();
  //         },
  //       },
  //       {
  //         label: "View on GitHub",
  //         click: async () => {
  //           await shell.openExternal(
//             "https://github.com/jennib/mycnc.github.io"
  //           );
  //         },
  //       },
  //     ],
  //   },
  // ];

  // const menu = Menu.buildFromTemplate(menuTemplate);
  // Menu.setApplicationMenu(menu);

  // --- TCP Communication Handlers ---
  ipcMain.handle("connect-tcp", async (event, host: string, port: number) => {
    const manager = createTcpManager();
    try {
      await manager.connect(host, port);
      return true;
    } catch (error) {
      console.error("Failed to connect TCP:", error);
      return false;
    }
  });

  ipcMain.on("send-tcp", (event, data: string) => {
    const manager = createTcpManager();
    manager.sendLine(data);
  });

  ipcMain.on("disconnect-tcp", () => {
    const manager = createTcpManager();
    manager.disconnect();
  });

  ipcMain.on("send-tcp-realtime", (event, data: string) => {
    const manager = createTcpManager();
    manager.sendRealtimeCommand(data);
  });

  ipcMain.on("send-tcp-gcode", (event, gcodeLines: string[], options: { startLine?: number; isDryRun?: boolean }) => {
    const manager = createTcpManager();
    manager.sendGCode(gcodeLines, options);
  });

  ipcMain.on("tcp-pause-job", () => {
    const manager = createTcpManager();
    manager.pause();
  });

  ipcMain.on("tcp-resume-job", () => {
    const manager = createTcpManager();
    manager.resume();
  });

  ipcMain.on("tcp-stop-job", () => {
    const manager = createTcpManager();
    manager.stopJob();
  });

  ipcMain.on("tcp-graceful-stop-job", () => {
    const manager = createTcpManager();
    manager.gracefulStop();
  });

  ipcMain.on("tcp-emergency-stop", () => {
    const manager = createTcpManager();
    manager.emergencyStop();
  });

  // --- Serial Port Communication Handlers ---
  ipcMain.handle('list-serial-ports', async () => {
    const ports = await SerialPort.list();
    return ports.map(p => ({
        path: p.path,
        manufacturer: p.manufacturer || 'N/A',
        pnpId: p.pnpId || 'N/A',
        productId: p.productId || 'N/A',
        vendorId: p.vendorId || 'N/A',
    }));
  });

  ipcMain.handle('request-serial-port', async () => {
      const ports = await SerialPort.list();
      return ports.map(p => ({
          path: p.path,
          manufacturer: p.manufacturer || 'N/A',
          pnpId: p.pnpId || 'N/A',
          productId: p.productId || 'N/A',
          vendorId: p.vendorId || 'N/A',
      }));
  });

  ipcMain.handle('open-serial-port', async (event, path: string, baudRate: number) => {
      if (serialPort && serialPort.isOpen) {
          await new Promise<void>((resolve) => serialPort?.close(() => resolve()));
      }

      serialPort = new SerialPort({ path, baudRate });

      const parser = serialPort.pipe(new ReadlineParser({ delimiter: '\n' }));

      serialPort.on('open', () => {
          console.log(`Serial port ${path} opened`);
          mainWindow.webContents.send('serial-connect', { portName: path, type: 'usb' }); // Assuming 'usb' for serial
      });

      parser.on('data', (data: string) => {
          mainWindow.webContents.send('serial-data', data);
      });

      serialPort.on('error', (err) => {
          console.error('Serial port error:', err.message);
          mainWindow.webContents.send('serial-error', err.message);
          if (serialPort && serialPort.isOpen) {
              serialPort.close();
          }
      });

      serialPort.on('close', () => {
          console.log('Serial port closed');
          mainWindow.webContents.send('serial-disconnect');
      });

      await new Promise<void>((resolve, reject) => {
          serialPort?.on('open', resolve);
          serialPort?.on('error', reject);
      });
  });

  ipcMain.handle('close-serial-port', async () => {
      if (serialPort && serialPort.isOpen) {
          await new Promise<void>((resolve) => serialPort?.close(() => resolve()));
          serialPort = null;
      }
  });

  ipcMain.on('write-serial-port', (event, data: string) => {
      if (serialPort && serialPort.isOpen) {
          serialPort.write(data + '\n', (err) => { // Add newline for typical serial communication
              if (err) {
                  console.error('Error writing to serial port:', err.message);
                  mainWindow.webContents.send('serial-error', err.message);
              }
          });
      } else {
          mainWindow.webContents.send('serial-error', 'Serial port not open.');
      }
  });

  // --- Serial Port Permission Handlers ---
  // Removed as we are using node-serialport directly and not the Web Serial API.

  // --- Webcam/Media Permission Handler ---
  // mainWindow.webContents.session.setPermissionRequestHandler(
  //   (webContents, permission, callback) => {
  //     // For this application, we will automatically grant media permission (camera, microphone).
  //     // In a production app, you might want to show a custom prompt here.
  //     if (permission === "media") {
  //       callback(true);
  //     } else {
  //       // Deny any other permission requests.
  //       callback(false);
  //     }
  //   }
  // );

  mainWindow.webContents.on("did-finish-load", () => {
    mainWindow.webContents.send(
      "main-process-message",
      new Date().toLocaleString()
    );
  });

  // and load the index.html of the app.
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
