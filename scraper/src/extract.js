import * as cheerio from 'cheerio';
import {fetchPage} from './fetch.js';
import config from './config.js';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const cacheNameFromUrl = (url) => {
    const {pathname} = new URL(url);
    return pathname.replace(/^\//, '').replace(/\//g, '-');
};

// rating lives in the class attribute: <p class="star-rating Three">
const extractRating = ($) => {
    const classAttr = $('article.product_page p.star-rating').attr('class') ?? '';
    return classAttr.split(' ').find((c) => c !== 'star-rating') ?? null;

};

const extractRecord = (html, productUrl, sourcePage, fetchedAt) => {
    const $ = cheerio.load(html);

    const description = $('#product_description').next('p').text().trim();

    return {
        title: $('article.product_page div.product_main h1').text().trim() || null,
        product_url: productUrl,
        price_text: $('article.product_page div.product_main p.price_color').text().trim() || null,
        availability_text: $('article.product_page div.product_main p.availability').text().trim() || null,
        rating_text: extractRating($),
        description: description || null,   // some books have none — never invent text
        source_page: sourcePage,
        fetched_at: fetchedAt,
    };
};

export const extractAll = async (bookUrls) => {
    const records = [];
    const failures = [];

    for (const [productUrl, sourcePage] of bookUrls) {
        try {
            const {html, fromCache, fetchedAt} = await fetchPage(productUrl, cacheNameFromUrl(productUrl));
            records.push(extractRecord(html, productUrl, sourcePage, fetchedAt));
     
            if (!fromCache) await sleep(config.delayMs);
        } catch (error) {
            // a page broken is logged and skipped — the other pages survive
            console.error(`ERROR extracting ${productUrl}: ${error.message}`);
            failures.push({productUrl, sourcePage, error: error.message});
        }
    }
 
    return {records, failures};
};
