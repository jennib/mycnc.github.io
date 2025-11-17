import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import fs from "fs";
import net from "net";

let mainWindow: BrowserWindow | null = null;
let serialPortInstance: any = null;
let tcpSocket: net.Socket | null = null; // Declare tcpSocket at a higher scope


const createWindow = () => {
  // Try several places electron-vite might provide the preload path, then fall back to the built preload file.
  const candidates = [
    process.env.VITE_PRELOAD_JS,
    process.env.VITE_PRELOAD,
    process.env.ELECTRON_PRELOAD,
    // common out path after build / dev bundling:
    path.join(__dirname, "../preload/index.mjs"),
    path.join(__dirname, "../preload/index.js"),
    path.join(__dirname, "preload.js"),
    path.join(__dirname, "preload.mjs"),
  ].filter(Boolean) as string[];

  let preloadPath: string | undefined = undefined;
  for (const c of candidates) {
    try {
      const resolved = path.isAbsolute(c) ? c : path.join(__dirname, c);
      if (fs.existsSync(resolved)) {
        preloadPath = resolved;
        break;
      }
    } catch (err) {
      // ignore and try next
    }
  }

  console.log("main: env VITE_PRELOAD_JS=", process.env.VITE_PRELOAD_JS);
  console.log("main: env VITE_PRELOAD=", process.env.VITE_PRELOAD);
  console.log("main: env ELECTRON_PRELOAD=", process.env.ELECTRON_PRELOAD);
  console.log("main: resolved preloadPath=", preloadPath);

  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      sandbox: false,
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
};

app.on("ready", createWindow);

// --- TCP Connection Management ---
let tcpBuffer: string = '';

function connectTCP(ip: string, port: number) {
  if (tcpSocket) {
    tcpSocket.destroy();
    tcpSocket = null;
  }

  return new Promise<{ ok: boolean; error?: string }>((resolve) => {
    tcpSocket = net.createConnection({ host: ip, port: port }, () => {
      console.log(`TCP: Connected to ${ip}:${port}`);
      mainWindow?.webContents.send("tcp:event", {
        type: "connected",
        payload: { ip, port },
      });
      resolve({ ok: true });
    });

    tcpSocket.on("data", (chunk: Buffer) => {
      tcpBuffer += chunk.toString();
      let newlineIndex;
      while ((newlineIndex = tcpBuffer.indexOf('\n')) !== -1) {
        const line = tcpBuffer.substring(0, newlineIndex).trim();
        tcpBuffer = tcpBuffer.substring(newlineIndex + 1);
        if (line) {
          mainWindow?.webContents.send("tcp:event", { type: "data", payload: line });
        }
      }
    });

    tcpSocket.on("error", (err) => {
      console.error("TCP: Socket error:", err.message);
      mainWindow?.webContents.send("tcp:event", {
        type: "error",
        payload: err.message,
      });
      // No need to call destroy, 'close' will be emitted.
    });

    tcpSocket.on("close", () => {
      console.log("TCP: Connection closed");
      tcpSocket = null;
      tcpBuffer = '';
      mainWindow?.webContents.send("tcp:event", { type: "disconnected" });
    });

    // Handle connection timeout
    tcpSocket.on("timeout", () => {
      console.error("TCP: Connection timed out.");
      tcpSocket?.destroy(new Error("Connection timed out"));
    });

    tcpSocket.setTimeout(5000); // 5 second connection timeout
  });
}

function disconnectTCP() {
  if (tcpSocket) {
    tcpSocket.destroy();
    tcpSocket = null;
  }
  return { ok: true };
}

// --- IPC Handlers ---
ipcMain.handle("serial:list", async () => {
  try {
    const { SerialPort } = await import("serialport");
    const ports = await SerialPort.list();
    return ports;
  } catch (err) {
    console.error("serial:list error", err);
    return [];
  }
});

ipcMain.handle(
  "serial:open",
  async (_e, options: { path: string; baudRate: number }) => {
    try {
      const { SerialPort } = await import("serialport");
      if (serialPortInstance) {
        serialPortInstance.close();
        serialPortInstance = null;
      }
      serialPortInstance = new SerialPort({
        path: options.path,
        baudRate: options.baudRate,
        autoOpen: true,
      });
      serialPortInstance.on("data", (chunk: Buffer) => {
        mainWindow?.webContents.send("serial:data", chunk.toString());
      });
      serialPortInstance.on("error", (err: Error) => {
        mainWindow?.webContents.send("connection:status", {
          type: "serial",
          error: err.message,
        });
      });
      return { ok: true };
    } catch (err: any) {
      console.error("serial:open error", err);
      return { ok: false, error: err?.message || String(err) };
    }
  }
);

ipcMain.handle("serial:close", async () => {
  try {
    if (serialPortInstance) {
      serialPortInstance.close();
      serialPortInstance = null;
    }
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err?.message || String(err) };
  }
});

ipcMain.handle("tcp:connect", async (_e, options: { ip: string; port: number }) => {
  return connectTCP(options.ip, options.port);
});

ipcMain.handle("tcp:disconnect", async () => {
  return disconnectTCP();
});

ipcMain.handle("tcp:write", async (_e, data: string) => {
  try {
    if (!tcpSocket) {
      return { ok: false, error: "TCP not connected" };
    }
    tcpSocket.write(data);
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err?.message || String(err) };
  }
});

// --- Additional IPC Handlers (added) ---
ipcMain.handle("serial:write", async (_e, data: string) => {
  try {
    if (!serialPortInstance) {
      throw new Error("No serial port open");
    }
    serialPortInstance.write(data, (err: Error | null | undefined) => {
      if (err) {
        mainWindow?.webContents.send("serial:error", err.message);
      }
    });
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err?.message || String(err) };
  }
});

ipcMain.handle("serial:request", async () => {
  // Node serialport has no user-prompt; fallback to list
  try {
    const { SerialPort } = await import("serialport");
    const ports = await SerialPort.list();
    return { ok: true, ports };
  } catch (err: any) {
    return { ok: false, error: err?.message || String(err) };
  }
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
