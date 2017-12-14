import axios from 'axios';
import Scrapper from './htmlScrapper';

const {EventEmitter} = require('events');
const fs = require('fs');
const path = require('path');
const {Buffer} = require('buffer/');

/**
 * Youtube to audio client based on the awesome www.yt2mp3.ws service and its
 * API https://github.com/matthew-asuncion/Fast-YouTube-to-MP3-Converter-API.
 */
class YtClient {

  constructor() {
    this.axiosOptions = {
      validateStatus: status => status < 500 // Reject only if the status code is greater than or equal to 500
    };

    this.axiosDownloadOption = {
      headers: {
        'Accept': 'application/octet-stream'
      },
      // Data must be set in order to set headers options
      data: null,
      responseType: 'arraybuffer'
    };

    // HTTP headers referer option is set on the main process using electron-referer module because it cannot be set on client side
    // axios.defaults.headers.referer = 'https://www.yt-download.org/';
  }

  download(url, destPath, mediaRatio = 128 /*Mbps*/ ) {
    // Download event emitter
    const download = new Download();

    const mediaId = YtClient.extractMediaId(url);
    if (!mediaId) {
      download.emit('error', 'Media id could not be retrieve from the URL ' + url);
    } else {
      this.getDownloadURL(mediaId, mediaRatio).then(downloadURL => {
        const filename = YtClient.extractMediaTitle(mediaId, downloadURL);
        const thumbnail = YtClient.getThumbnailURL(mediaId);

        if (!downloadURL || !filename) {
          download.emit('The Youtube to MP3 API may be unavailable. Please try later.');
        } else {
          download.emit('download-details', {
            filename,
            thumbnail
          });

          this.downloadMedia(downloadURL, download, destPath, filename)
            .catch(error => {
              download.emit('error', error.toString());
            })
        }
      });
    }

    return download;
}

  getDownloadURL(mediaId, mediaRatio) {
    return new Promise((resolve, reject) => {
      console.log(YtClient.getAPIUrl(mediaId));
      axios.get(YtClient.getAPIUrl(mediaId), this.axiosOptions)
        .then(({data}) => {
          let downloadLink = Scrapper.scrapDownloadURL(data, mediaRatio);

          console.log('Download link', downloadLink);

          resolve('http:' + downloadLink);
        })
        .catch(error => reject(error.toString()));
    });
  }

  downloadMedia(downloadURL, download, destPath, filename) {
    return new Promise((resolve, reject) => {
      const downloadConfig = Object.assign({}, this.axiosOptions, this.axiosDownloadOption);
      downloadConfig.onDownloadProgress = progress => {
        download.emit('download-progress', progress);
      };

      axios(downloadURL, downloadConfig).then(response => {
          console.log('download path', destPath + path.sep + filename);

          // Convert response data Array buffer to a Buffer for fs
          let file = fs.writeFile((destPath + path.sep + filename), Buffer.from(response.data), 'binary', error => {
            if (error) {
              reject(error.toString());
            } else {
              resolve('File was written successfully');
            }
          });
        })
        .catch(error => reject(error.toString()));
    });
  }

  static extractMediaId(url) {
    // Video: https://www.youtube.com/watch?v=(mediaId)
    // Playlists: https://www.youtube.com/watch?v=(mediaId)&list=RD_sI_Ps7JSEk&t=10
    try {
      const [, mediaId] = /v=([^&=]+)/gi.exec(url);
      return mediaId;
    } catch (e) {
      return null;
    }
  }

  /**
   * The base API is https://www.yt-download.org/@api/button/mp3/(mediaId). This link fetch a page which grab the download links
   * with JS using this URL : https://www.yt-download.org/@grab?vidID=(mediaId)&format=mp3&streams=mp3&api=button.
   * Use directly the grab URL.
   */
  static getAPIUrl(mediaId) {
    return `https://www.yt-download.org/@grab?vidID=${mediaId}&format=mp3&streams=mp3&api=button`;
  }

  static getThumbnailURL(mediaId) {
    return `https://img.youtube.com/vi/${mediaId}/default.jpg`;
  }

  static extractMediaTitle(mediaId, downloadURL) {
    downloadURL = decodeURIComponent(downloadURL);
    try {
      const [, title] = new RegExp(`${mediaId}/(.*)`, 'gi').exec(downloadURL);
      // Spaces are replaced with +
      return title.replace(/\+/g, ' ');
    } catch (e) {
      return null;
    }
  }

}

import yeast from 'yeast';

/**
 * Download is an event emitter. It has also an unique id which allows
 * to track multiple downloads events.
 */
class Download extends EventEmitter {

  constructor() {
    super();

    // Each download has an unique id
    this.id = yeast();
  }

  emit(eventName, ...args) {
    // Always send the download id as first argument
    super.emit(eventName, this.id, ...args);
  }

}

export default YtClient;
