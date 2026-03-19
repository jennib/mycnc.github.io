import { BrowserWindow, ipcMain, shell } from 'electron';
import path from 'path';

let mainWindow: BrowserWindow;
let cameraWindow: BrowserWindow | null = null;

export const getMainWindow = () => mainWindow;

export const createWindows = () => {
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
            cameraWindow.loadFile(path.join(__dirname, "../../renderer/index.html"), { hash: hash });
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

    if (process.env.VITE_DEV_SERVER_URL) {
        mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
        // Open the DevTools.
        // mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(__dirname, "../../renderer/index.html"));
    }

    return mainWindow;
};
