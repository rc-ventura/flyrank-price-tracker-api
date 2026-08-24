import config from './config.js';
import { discoveryCatalogue } from './discover.js';

const main = async () => {
    const firstPageUrl = `${config.baseUrl}/catalogue/page-1.html`;
    const { pagesFetched, discovered, bookUrls } = await discoveryCatalogue(firstPageUrl);
    
    console.log(`catalogue_pages=${pagesFetched}`);
    console.log(`discovered=${discovered}`);
    console.log(`unique_urls=${bookUrls.size}`);
};

main().catch((error) => {
    console.error(`error: ${error.message}`);
    process.exitCode = 1;
});
