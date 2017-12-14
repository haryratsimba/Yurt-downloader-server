const Main = new(function() {

  const electron = require('electron');
  const {app, BrowserWindow} = electron;

  const path = require('path');
  const appRoot = path.resolve(__dirname, '../');

  const Server = require('./server/server');
  const IpcManager = require('./ipc');

  const referer = require('electron-referer');

  this.init = function() {
    app.on('ready', this.createWindow.bind(this));

    app.on('window-all-closed', () => {
      // Only quit the application on OS X if the user hits cmd + q
      if (process.platform !== 'darwin') {
        app.quit()
      }
    });

    app.on('activate', () => {
      // Re-create the mainWindow if the dock icon is clicked in OS X and no other
      // windows were open
      if (this.window === null) {
        this.createWindow();
      }
    });
  };

  this.createWindow = function() {
    this.server = new Server();

    // Because headers referer option cannot be set on client side because of restrictions
    // inject the following referer to every HTTP requests, to allow to fetch the Youtube API content
    // from https://www.yt-download.org/
    referer('https://www.yt-download.org/');

    this.window = new BrowserWindow({
      width: 500,
      height: 300,
      resizable: false,
      maximizable: false,
      title: 'Yurt downloader',
      titleBarStyle: 'hidden-inset',
      // Frameless on Windows and Linux
      frame: process.platform === 'darwin'
    });
    this.window.setMenu(null);
    this.window.loadURL('file://' + appRoot + '/index.html');

    const ipcManager = new IpcManager(this.window, this.server);
    ipcManager.bindEvents();

    this.window.on('closed', () => {
      this.server.stopServer();
      this.window = null;
    });

    if (process.env.NODE_ENV === 'DEVELOPMENT') {
      this.window.webContents.openDevTools({
        detach: true
      });
    }
  };

});

Main.init();
