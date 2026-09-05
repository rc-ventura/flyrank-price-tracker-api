import {mkdir, rename, writeFile} from 'node:fs/promises';

const OUTPUT_DIR = new URL('../output/', import.meta.url);

const state = {
    started_at: null,
    pages_fetched: 0,
    cache_hits: 0,
};

export const startReport = () => {
    state.started_at = new Date();
};

// track fetches (real vs cache)
export const trackFetch = (fromCache) => {
    if (fromCache) state.cache_hits += 1;
    else state.pages_fetched += 1;
};

export const writeReport = async ({validRecords, invalidRecords, failedPages}) => {
    const finished = new Date();
    const report = {
        started_at: state.started_at.toISOString(),
        duration_ms: finished.getTime() - state.started_at.getTime(),
        pages_fetched: state.pages_fetched,
        cache_hits: state.cache_hits,
        valid_records: validRecords,
        invalid_records: invalidRecords,
        failed_pages: failedPages.length,
        failures: failedPages,
    };

    await mkdir(OUTPUT_DIR, {recursive: true});
    const path = new URL('run-report.json', OUTPUT_DIR);
    const tmpPath = new URL('run-report.json.tmp', OUTPUT_DIR);
    await writeFile(tmpPath, JSON.stringify(report, null, 2));
    await rename(tmpPath, path);

    console.log(`run-report: fetched=${report.pages_fetched} cache_hits=${report.cache_hits} valid=${validRecords} invalid=${invalidRecords} failed=${failedPages.length}`);
};