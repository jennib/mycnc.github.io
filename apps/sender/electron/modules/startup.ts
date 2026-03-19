import { ipcMain } from 'electron';
import fs from 'fs';
import path from 'path';

let startupFile: string | null = null;

export const handleStartupArgs = () => {
    const args = process.argv.slice(1);
    for (const arg of args) {
        if (arg.endsWith('.nc') || arg.endsWith('.gcode') || arg.endsWith('.tap') || arg.endsWith('.txt')) {
            if (fs.existsSync(arg)) {
                startupFile = arg;
                break;
            }
        }
    }
};

export const setupStartupHandler = () => {
    ipcMain.handle("get-startup-file", () => {
        if (startupFile) {
            try {
                const content = fs.readFileSync(startupFile, 'utf-8');
                // Clear it so we don't load it twice
                const fileToLoad = startupFile;
                startupFile = null;
                return { name: path.basename(fileToLoad), content };
            } catch (e) {
                console.error("Failed to read startup file:", e);
            }
        }
        return null;
    });
};
