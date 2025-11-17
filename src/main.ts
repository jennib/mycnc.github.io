


import path from 'node:path';
import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';
import { MainTcpService } from './electron/mainTcpService.js';
import { ConsoleLog, MachineState, PortInfo } from '../types';
import { app, BrowserWindow, ipcMain } from 'electron';
import { VITE_DEV_SERVER_URL } from './main-logic';

let win: BrowserWindow | null = null;

const tcpService = new MainTcpService();


// The built directory structure
//
// ├─┬ dist
// │ ├─┬ electron
// │ │ └── main.js
// │ └── index.html
// │
process.env.DIST = path.join(__dirname, '../dist');
function createWindow() {
    process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, '../public');
    win = new BrowserWindow({
        icon: path.join(process.env.VITE_PUBLIC, 'mycnclogo.png'),
        webPreferences: {
            preload: path.join(__dirname, '../preload/index.cjs'),
            nodeIntegration: false,
            contextIsolation: true,
        },
    });

    // Set webContents for tcpService
    tcpService.setWebContents(win.webContents);

    // Test actively push a message to the renderer every 5 seconds
    // setInterval(() => {
    //   win.webContents.send('main-process-message', new Date().toLocaleString())
    // }, 5000)

    if (VITE_DEV_SERVER_URL) {
        win.loadURL(VITE_DEV_SERVER_URL);
    } else {
        // Load your static HTML file
        win.loadFile(path.join(process.env.DIST, 'index.html'));
    }
}

app.on('window-all-closed', () => {
    win = null;
    app.quit();
});

app.whenReady().then(createWindow);

// IPC handlers for TCP
ipcMain.handle('connect-tcp', async (event, host, port) => {
    try {
        await tcpService.connect(host, port);
        return { success: true };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
});

ipcMain.handle('disconnect-tcp', async () => {
    tcpService.disconnect();
    return { success: true };
});

ipcMain.handle('send-tcp', async (event, data: string) => {
    tcpService.write(data);
    return { success: true };
});

ipcMain.handle('send-tcp-realtime', async (event, data: string) => {
    tcpService.writeRealtime(data);
    return { success: true };
});

ipcMain.handle('send-tcp-gcode', async (event, gcodeLines: string[], options: { startLine?: number; isDryRun?: boolean }) => {
    tcpService.sendGCode(gcodeLines, options);
    return { success: true };
});

ipcMain.handle('tcp-pause-job', async () => {
    tcpService.pauseJob();
    return { success: true };
});

ipcMain.handle('tcp-resume-job', async () => {
    tcpService.resumeJob();
    return { success: true };
});

ipcMain.handle('tcp-stop-job', async () => {
    tcpService.stopJob();
    return { success: true };
});

ipcMain.handle('tcp-graceful-stop-job', async () => {
    tcpService.gracefulStopJob();
    return { success: true };
});

ipcMain.handle('tcp-emergency-stop', async () => {
    tcpService.emergencyStop();
    return { success: true };
});

// Serial Port API (existing)
ipcMain.handle('list-serial-ports', async () => {
    const ports = await SerialPort.list();
    return ports;
});

ipcMain.handle('request-serial-port', async () => {
    // This is a placeholder. In a real app, you'd use a dialog
    // or a custom UI to let the user select a port.
    // For now, we'll just return the first available port.
    const ports = await SerialPort.list();
    if (ports.length > 0) {
        return ports[0];
    }
    return undefined;
});

let serialPort: SerialPort | null = null;
let parser: ReadlineParser | null = null;

ipcMain.handle('open-serial-port', async (event, path: string, baudRate: number) => {
    if (serialPort && serialPort.isOpen) {
        await serialPort.close();
    }

    serialPort = new SerialPort({ path, baudRate, autoOpen: false });
    parser = serialPort.pipe(new ReadlineParser({ delimiter: '\n' }));

    serialPort.on('open', () => {
        console.log('Serial port opened');
        win?.webContents.send('serial-on-connect', { type: 'usb', portName: path });
    });

    serialPort.on('data', (data) => {
        // This is raw data, not parsed lines
        // console.log('Serial raw data:', data.toString());
    });

    parser.on('data', (line: string) => {
        win?.webContents.send('serial-on-data', line);
    });

    serialPort.on('error', (err) => {
        console.error('Serial port error:', err.message);
        win?.webContents.send('serial-on-error', err.message);
        serialPort?.close();
    });

    serialPort.on('close', () => {
        console.log('Serial port closed');
        win?.webContents.send('serial-on-disconnect');
    });

    return new Promise<void>((resolve, reject) => {
        serialPort?.open((err) => {
            if (err) {
                console.error('Error opening serial port:', err.message);
                return reject(err);
            }
            resolve();
        });
    });
});

ipcMain.handle('close-serial-port', async () => {
    if (serialPort && serialPort.isOpen) {
        await new Promise<void>((resolve, reject) => {
            serialPort?.close((err) => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
    }
    serialPort = null;
    parser = null;
    return { success: true };
});

ipcMain.handle('write-serial-port', async (event, data) => {
    if (serialPort && serialPort.isOpen) {
        await new Promise((resolve, reject) => {
            serialPort?.write(data + '\n', (err) => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
        return { success: true };
    }
    return { success: false, message: 'Serial port not open.' };
});