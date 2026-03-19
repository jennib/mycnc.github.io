import { app, ipcMain, shell } from 'electron';
import path from 'path';
import fs from 'fs';

const plugins: any[] = [];
let pluginsDir = '';

export const loadPlugins = async () => {
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
                    pluginInstance.filename = file;
                    plugins.push(pluginInstance);
                    console.log(`Loaded plugin: ${pluginInstance.name || file}`);
                }
            } catch (err) {
                console.error(`Failed to load plugin ${file}:`, err);
            }
        }
    }
};

export const notifyPlugins = (storeName: string, state: any) => {
    plugins.forEach(plugin => {
        try {
            plugin.onStateUpdate(storeName, state);
        } catch (err) {
            console.error(`Plugin ${plugin.name || 'unknown'} error:`, err);
        }
    });
};

export const setupPluginHandlers = () => {
    ipcMain.handle("get-plugins", async () => {
        const list: any[] = [];
        if (!fs.existsSync(pluginsDir)) return list;
        const files = fs.readdirSync(pluginsDir);
        for (const file of files) {
            if (file.endsWith('.js') || file.endsWith('.cjs') || file.endsWith('.disabled')) {
                const isEnabled = file.endsWith('.js') || file.endsWith('.cjs');
                const ext = path.extname(file);
                let name = file;
                if (isEnabled) {
                    const plugin = plugins.find(p => p.filename === file || p.name === file);
                    if (plugin && plugin.name) {
                        name = plugin.name;
                    }
                } else {
                    name = file; // Might just use filename for disabled ones
                }
                list.push({ filename: file, name, isEnabled });
            }
        }
        return list;
    });

    ipcMain.handle("toggle-plugin", async (event, filename: string, enable: boolean) => {
        try {
            const oldPath = path.join(pluginsDir, filename);
            let newPath = '';
            if (enable) {
                newPath = oldPath.replace('.disabled', '');
            } else {
                newPath = oldPath + '.disabled';
            }
            if (fs.existsSync(oldPath)) {
                fs.renameSync(oldPath, newPath);
                return true;
            }
        } catch (err) {
            console.error("Failed to toggle plugin:", err);
        }
        return false;
    });

    ipcMain.handle("delete-plugin", async (event, filename: string) => {
        try {
            const targetPath = path.join(pluginsDir, filename);
            if (fs.existsSync(targetPath)) {
                fs.unlinkSync(targetPath);
                return true;
            }
        } catch (err) {
            console.error("Failed to delete plugin:", err);
        }
        return false;
    });

    ipcMain.handle("open-plugins-folder", async () => {
        if (!fs.existsSync(pluginsDir)) {
            fs.mkdirSync(pluginsDir, { recursive: true });
        }
        await shell.openPath(pluginsDir);
    });
};
