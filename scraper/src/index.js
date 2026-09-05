import config from './config.js';
import {discoveryCatalogue} from './discover.js';
import {extractAll} from './extract.js';
import {normalizeAndValidate} from './validate.js';
import {storeResults} from './store.js';
import { startReport, writeReport } from './report.js';

const main = async () => {
    startReport();

    const firstPageUrl = `${config.baseUrl}/catalogue/page-1.html`;
    const {pagesFetched, discovered, bookUrls} = await discoveryCatalogue(firstPageUrl);

    console.log(`catalogue_pages=${pagesFetched}`);
    console.log(`discovered=${discovered}`);
    console.log(`unique_urls=${bookUrls.size}`);

    // dev proof: a fake URL that will fail with 404 — breaks only on our side
    if (process.argv.includes('--with-fake-url')) {
        bookUrls.set(`${config.baseUrl}/catalogue/this-book-does-not-exist_0/index.html`, firstPageUrl);
    }

    const {records, failures} = await extractAll(bookUrls);
    console.log(`detail_pages=${records.length}`);

    const results = records.map(normalizeAndValidate);
    const {valid, invalid} = await storeResults(results);

    console.log(`valid_records=${valid}`);
    console.log(`invalid_records=${invalid}`);

    await writeReport({validRecords: valid, invalidRecords: invalid, failedPages: failures});

};

main().catch((error) => {
    console.error(`error: ${error.message}`);
    process.exitCode = 1;
});