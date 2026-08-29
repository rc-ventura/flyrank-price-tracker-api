import config from './config.js';
import { discoveryCatalogue } from './discover.js';
import {extractAll} from './extract.js';


const main = async () => {
    const firstPageUrl = `${config.baseUrl}/catalogue/page-1.html`;
    const { pagesFetched, discovered, bookUrls } = await discoveryCatalogue(firstPageUrl);
    
    console.log(`catalogue_pages=${pagesFetched}`);
    console.log(`discovered=${discovered}`);
    console.log(`unique_urls=${bookUrls.size}`);
    
    const records = await extractAll(bookUrls);
    console.log(JSON.stringify(records[0], null, 2));   // one complete raw record
    console.log(`detail_pages=${records.length}`);

};

main().catch((error) => {
    console.error(`error: ${error.message}`);
    process.exitCode = 1;
});
