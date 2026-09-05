import config from './config.js';
import {discoveryCatalogue} from './discover.js';
import {extractAll} from './extract.js';
import {normalizeAndValidate} from './validate.js';
import {storeResults} from './store.js';

const main = async () => {
    const firstPageUrl = `${config.baseUrl}/catalogue/page-1.html`;
    const {pagesFetched, discovered, bookUrls} = await discoveryCatalogue(firstPageUrl);

    console.log(`catalogue_pages=${pagesFetched}`);
    console.log(`discovered=${discovered}`);
    console.log(`unique_urls=${bookUrls.size}`);

    const rawRecords = await extractAll(bookUrls);
    console.log(`detail_pages=${rawRecords.length}`);

    const results = rawRecords.map(normalizeAndValidate);
    const {valid, invalid} = await storeResults(results);

    console.log(`valid_records=${valid}`);
    console.log(`invalid_records=${invalid}`);
};

main().catch((error) => {
    console.error(`error: ${error.message}`);
    process.exitCode = 1;
});