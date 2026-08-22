import config from './config.js';
import {fetchPage} from './fetch.js';

const main = async () => {
    const pageUrl = `${config.baseUrl}/catalogue/page-1.html`;
    await fetchPage(pageUrl, 'catalogue-page-1.html');
};

main().catch((error) => {
    console.error(`error: ${error.message}`);
    process.exitCode = 1;
});
