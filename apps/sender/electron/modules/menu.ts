import { Menu, BrowserWindow, app, shell, dialog, MenuItemConstructorOptions } from 'electron';
import path from 'path';
import os from 'os';
import fs from 'fs';

export const createMenu = (mainWindow: BrowserWindow, autoUpdater: any, manualUpdateCheck: boolean) => {
    const createAboutWindow = (mainWindow: BrowserWindow) => {
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
            aboutWindow.loadFile(path.join(app.getAppPath(), 'out/renderer/about.html'), { query: { version, ip: localIp } });
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
                            await mainWindow.webContents.session.clearCache();
                            await mainWindow.webContents.session.clearStorageData();

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
                        createAboutWindow(mainWindow);
                    },
                },
                {
                    label: "Open Plugins Folder",
                    click: async () => {
                        const pluginsDir = path.join(app.getPath('userData'), 'plugins');
                        if (!fs.existsSync(pluginsDir)) {
                            fs.mkdirSync(pluginsDir, { recursive: true });
                        }
                        await shell.openPath(pluginsDir);
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
    return manualUpdateCheck;
};

