# Yurt downloader service

> Yurt downloader service for the Yurt browser extension

## About

*Yurt downloader* is a standalone websocket server which listen to download messages coming from the *Yurt browser extension*. It then trigger the conversion and download of Youtube videos to MP3 files. This allows to download songs directly from Youtube and manage them in the desktop.

## Running locally

``` bash
# install dependencies
npm install

# Build components to be served as a single bundled file
npm run build

# Start the electron app
npm run start
```

## Credits

* SVG icons used in the download list come from the free icons provider [iconninja.com](http://www.iconninja.com/geest-travel-kit-icon-sets-211)
* Conversion is done using the [Youtube to MP3 API](https://www.yt-download.org)

## License

MIT © Hary
