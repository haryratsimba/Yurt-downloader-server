<template>
<ul v-if="hasDownload" class="list-group">
  <download v-for="value in downloads" :download="value" />
</ul>
<div v-else class="empty-list">
  <img src="./static/img/yurt-empty.svg" alt="empty-list" height="110">
  <p>Looks like your download list is empty.</p>
</div>
</template>

<script>
// Use require for importing global node packages into the web content
const {ipcRenderer, remote} = require('electron');

import Download from './Download.vue';
import Store from '../store';
import {EventBus} from '../events';

import YtClient from '../service/ytClient';
const ytClient = new YtClient();

export default {
  name: 'download-list',
  components: {
    Download
  },
  data() {
    return {
      /* Map with {downloadId: downloadDetails}
      downloads: {'id1': {
          title: 'Download with a really long title',
          thumbnail: '',
          size: 5826765,
          progressReceived: 65536,
          progressPercentage: 1
      }} */
      downloads: {}
    };
  },
  created() {
    EventBus.$on('ui-evt-flush-downloads', () => this.downloads = {});

    ipcRenderer.on('download-start', (event, {url, ratio}) => {
      const download = ytClient.download(url, Store.downloadPath, parseInt(ratio));

      download.on('error', (id, error) => {
        ipcRenderer.send('main-error-dialog', error);
      });

      download.on('download-details', (id, {filename, thumbnail}) => {
        console.log(id, filename);
        this.addNewDownload(id, filename, thumbnail);
      });

      download.on('download-progress', (id, {loaded, total}) => {
        console.log(id, loaded, total);
        this.updateDownloadProgress(id, loaded, total);
      });
    });
  },
  methods: {
    addNewDownload(id, title, thumbnail) {
      this.$set(this.downloads, id, {
        title,
        thumbnail,
        size: 0,
        progressReceived: 0,
        progressPercentage: 0
      });
    },
    updateDownloadProgress(id, received, size) {
      const currentDownload = this.downloads[id];

      if (currentDownload.size != size) {
        this.$set(currentDownload, 'size', size);
      }

      // Update the view only if the rounded percentage with 2 decimals has changed to avoid
      // refreshing the DOM too many times
      const percent = parseFloat((parseFloat(received) * 100.0 / parseFloat(size)).toFixed(2));
      if (currentDownload.progressPercentage != percent) {
        this.$set(currentDownload, 'progressPercentage', percent);
        this.$set(currentDownload, 'progressReceived', received);
      }
    }
  },
  computed: {
    hasDownload() {
      return Object.keys(this.downloads || {}).length > 0;
    }
  }
}
</script>
