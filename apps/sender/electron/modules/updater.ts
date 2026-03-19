import { BrowserWindow, dialog } from 'electron';
import { autoUpdater } from 'electron-updater';

export const setupAutoUpdater = (mainWindow: BrowserWindow, manualUpdateCheck: boolean) => {
    autoUpdater.autoDownload = false;

    // Check for updates once the window is ready
    mainWindow.once('ready-to-show', () => {
        autoUpdater.checkForUpdates();
    });

    // Optional: Log update events for debugging
    autoUpdater.on('checking-for-update', () => {
        console.log('Checking for update...');
    });

    autoUpdater.on('update-available', (info: any) => {
        console.log('Update available:', info);
        dialog.showMessageBox(mainWindow, {
            type: 'info',
            title: 'Update Available',
            message: `A new version(${info.version}) is available.Do you want to download it now ? `,
            buttons: ['Yes', 'No']
        }).then((result) => {
            if (result.response === 0) { // 'Yes' button
                autoUpdater.downloadUpdate();
            }
        });
    });

    autoUpdater.on('update-not-available', (info: any) => {
        console.log('Update not available:', info);
        if (manualUpdateCheck) {
            dialog.showMessageBox(mainWindow, {
                type: 'info',
                title: 'No Updates',
                message: 'Current version is up-to-date.'
            });
            manualUpdateCheck = false;
        }
    });

    autoUpdater.on('error', (err: any) => {
        console.log('Error in auto-updater. ' + err);
        dialog.showMessageBox(mainWindow, {
            type: 'error',
            title: 'Update Error',
            message: 'An error occurred while updating: ' + err
        });
        manualUpdateCheck = false;
    });

    autoUpdater.on('download-progress', (progressObj: any) => {
        let log_message = "Download speed: " + progressObj.bytesPerSecond;
        log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
        log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
        console.log(log_message);
        // Optional: Send progress to renderer to show a progress bar
        mainWindow.webContents.send('update-progress', progressObj.percent);
    });

    autoUpdater.on('update-downloaded', (info: any) => {
        console.log('Update downloaded');
        dialog.showMessageBox(mainWindow, {
            type: 'info',
            title: 'Update Ready',
            message: 'Update downloaded. Application will be quit for update...',
            buttons: ['Restart Now', 'Later']
        }).then((result) => {
            if (result.response === 0) { // 'Restart Now' button
                autoUpdater.quitAndInstall();
            }
        });
    });

    return manualUpdateCheck;
};
