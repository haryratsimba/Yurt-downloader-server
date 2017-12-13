const {ipcMain, dialog, app, session} = require('electron');
const settings = require('electron-settings');

class IpcManager {

    constructor(window, server) {
        this.window = window;
        this.server = server;
    }

    bindEvents() {
        ipcMain.on('main-window-minimize', event=> {
            this.window.minimize();
        });

        ipcMain.on('main-window-close', event=> {
            this.window.close();
        });

        ipcMain.on('main-error-dialog', (event, error)=> {
            dialog.showErrorBox('Download error', error);
        });

        ipcMain.on('server-start', event=> {
            this.server.createNewServer();
            event.sender.send('server-state-change', true);
        });

        ipcMain.on('server-stop', event=> {
            this.server.stopServer();
            event.sender.send('server-state-change', true);
        });

        ipcMain.on('main-open-file-dialog', (event, defaultPath)=> {
            const options = {properties: ['openFile', 'openDirectory']};

            if(defaultPath && defaultPath.length > 0) {
                options.defaultPath = defaultPath;
            }

            dialog.showOpenDialog(options, path=> {
                if (path) {
                    // Store the download path
                    settings.set('path', path);

                    event.sender.send('main-selected-directory', path);
                }
            })
        });

        let {webContents} = this.window;

        // Sync the download path with the web content after a delay to ensure the window is ready to listen
        setTimeout(()=> {
            // If not stored, default path is the download user folder
            let downloadPath = app.getPath('downloads');
            if(settings.has('path')) {
                downloadPath = settings.get('path');
            }

            // The app component will handle the storage sync
            webContents.send('download-sync-path', downloadPath);
        }, 800);

        this.server.on('listening', details=> {
            webContents.send('server-listening', details);
        });

        this.server.on('connection', id=> {
            webContents.send('server-connection', id);
        });

        this.server.on('download', downloadDetails=> {
            webContents.send('download-start', downloadDetails);
        });

        // process.on('uncaughtException', error=> console.log(error));
    }

}

module.exports = IpcManager;
