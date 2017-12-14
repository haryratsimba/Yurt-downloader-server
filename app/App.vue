<template>
<div id="app" class="window">
  <toolbar/>
  <div class="window-content">
    <div class="pane-group">
      <div class="pane">
        <download-list></download-list>
      </div>
    </div>
  </div>
</div>
</template>

<script>
import Toolbar from './components/Toolbar.vue';
import DownloadList from './components/DownloadList.vue';
import Store from './store';

// Use require for importing global node packages into the web content
const {ipcRenderer} = require('electron');

export default {
  name: 'app',
  components: {
    Toolbar,
    DownloadList
  },
  created() {
    // Sync the download path
    ipcRenderer.on('download-sync-path', (event, downloadPath) => {
      console.log('sync path', downloadPath);

      Store.updateDownloadPath(downloadPath);
    });
  }
}
</script>
