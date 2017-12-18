<h1 align="center">
    <img src="https://raw.githubusercontent.com/haryratsimba/Yurt-downloader-server/master/static/img/logo.png" width=280 alt="Yurt downloader service">
    <br>
    Yurt downloader service
</p>

<h4 align="center">Chrome extension + desktop app to download songs as MP3 directly from Youtube.</h4>

## Introduction

*Yurt* consits of two applications : the *Yurt browser extension* and the *Yurt downloader* standalone websocket server. This server listens to download messages coming from the *Yurt browser extension* then trigger the conversion and download of Youtube videos to MP3 files.

![Yurt downloader service](https://raw.githubusercontent.com/haryratsimba/Yurt-downloader-server/master/static/screenshots/screenshot.png "Yurt downloader service")

## Running locally

[Gulp](https://gulpjs.com/) must be installed globally.

``` bash
# install dependencies
npm install

# Build components to be served as a single bundled file
npm run build

# Start the electron app
npm run start
```

## Credits

* [Yurt](https://thenounproject.com/term/yurt/457098/) and [Play](https://thenounproject.com/search/?q=play&i=938627) icons used in the empty / filled download list are respectively designed by Denis Sazhin and Shastry from the Noun Project
* Conversion is done using the [Youtube to MP3 API](https://www.yt-download.org)

## Limitations

* As the conversion is based on a third party API, the download speed may vary according to the API server availability
* In case of network errors, try a lower audio ratio (eg : 128kbps)

## License

MIT © Hary
