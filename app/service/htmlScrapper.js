const cheerio = require('cheerio');

class Scrapper {

    /**
     * Retrieve media ID and name from the raw HTML download page.
     * @param {string} rawHTML raw HTML download page.
     * @param {integer} ratio between 320, 256, 192, 128kbps.
     * @return {string} download URL.
     */
    static scrapDownloadURL(rawHTML, ratio) {
        // Scrap the page and return the media ID
        const $ = cheerio.load(rawHTML);
        const linkPos = [320, 256, 192, 128].indexOf(ratio) + 1;
        if(linkPos > -1) {
            return $(`.link:nth-of-type(${linkPos}) a`).attr('href');
        } else {
            return null;
        }
    }

}

export default Scrapper;
