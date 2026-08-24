import * as cheerio from 'cheerio';
 
import config from './config.js';
import {fetchPage} from './fetch.js';
 
// sleep utility for polite scraping
// each new request waits a bit
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// '/catalogue/page-1.html' → 'catalogue-page-1.html'
const cacheNameFromUrl = (url) => {
    const {pathname} = new URL(url);
    return pathname.replace(/^\//, '').replace(/\//g, '-');
}

export const discoveryCatalogue = async (startUrl) => {
    const bookUrls = new Map();    
    let discovered = 0;
    let pageUrl = startUrl;
    let pagesFetched = 0;

    while (pageUrl && pagesFetched < config.maxPages) {
        const {html, fromCache} = await fetchPage(pageUrl, cacheNameFromUrl(pageUrl));
        pagesFetched++;

        const $ = cheerio.load(html);

        $('article.product_pod h3 a').each((_, element) => {
          const href = $(element).attr('href');
          if (!href) return;
          discovered++;

          const absoluteUrl = new URL(href, pageUrl).toString(); // ensure absolute URL
          if (!bookUrls.has(absoluteUrl)) bookUrls.set(absoluteUrl, pageUrl);

        })

        const nextHref = $('li.next a').attr('href');
        const nextUrl = nextHref ? new URL(nextHref, pageUrl).toString() : null;
        
        if (nextUrl && !fromCache) await sleep(config.delayMs); // / delay only after a REAL request
        pageUrl = nextUrl;
    }

    return {pagesFetched, discovered, bookUrls};
}
