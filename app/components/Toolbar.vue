<template>
<header class="toolbar toolbar-header">
  <h1 class="title">Yurt downloader</h1>
  <div class="toolbar-actions">
    <button class="btn btn-default">
                <span @click="toggleServerState" :class="['icon', isServerOpen ? 'icon-stop' : 'icon-play']" title="Start / Stop the server"></span>
            </button>

    <div class="btn-group">
      <button class="btn btn-default">
                    <span @click="updateDownloadPath" class="icon icon-folder" title="Choose the download destination"></span>
                </button>
      <button class="btn btn-default">
                    <span @click="flushDownloadList" class="icon icon-archive" title="Clear download list"></span>
                </button>
    </div>

    <div class="pull-right server-status">
      <span :class="['icon', isServerOpen ? 'icon-signal' : 'icon-block']"></span> {{serverStatus}}
    </div>
  </div>

  <!-- Window min / close buttons. To prevent clicks from being blocked, no-drag area must be placed after draggable area
        https://github.com/electron/electron/issues/1354 -->
  <div class="toolbar-window-actions" v-show="!isMac">
    <span @click="minimizeWindow" class="icon icon-minus"></span>
    <span @click="closeWindow" class="icon icon-cancel"></span>
  </div>
</header>
</template>

<script>
import Store from '../store';
import {EventBus} from '../events';

// Use require for importing global node packages into the web content
const {ipcRenderer} = require('electron');

export default {
  name: 'toolbar',
  data() {
    return {
      isServerOpen: true,
      downloadPath: ''
    }
  },
  created() {
    // Display Window controls only on non Mac app
    this.isMac = /Mac/.test(navigator.userAgent);

    ipcRenderer.on('server-listening', (event, {address, port}) => {
      this.isServerOpen = true;
    });

    ipcRenderer.on('server-state-change', (event, hasServerChanged) => {
      if (hasServerChanged) {
        this.isServerOpen = !this.isServerOpen;
      }
    });

    ipcRenderer.on('main-selected-directory', (event, path) => {
      Store.updateDownloadPath(this.downloadPath = path);
    });
  },
  methods: {
    minimizeWindow() {
      console.log('min');
      ipcRenderer.send('main-window-minimize');
    },
    closeWindow() {
      console.log('close');
      ipcRenderer.send('main-window-close');
    },
    toggleServerState() {
      let newServerState = this.isServerOpen ? 'stop' : 'start';
      ipcRenderer.send(`server-${newServerState}`);
    },
    updateDownloadPath() {
      ipcRenderer.send('main-open-file-dialog');
    },
    flushDownloadList() {
      EventBus.$emit('ui-evt-flush-downloads');
    }
  },
  computed: {
    serverStatus() {
      return this.isServerOpen ? 'Listening' : 'Offline';
    }
  }
}
</script>
