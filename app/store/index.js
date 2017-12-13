class Store {

    constructor() {
        this.downloadPath = '';
    }

    updateDownloadPath(path) {
        this.downloadPath = path;
    }
}

// Using module allows to export an unique store instance
export default new Store();
