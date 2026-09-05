import {mkdir, rename, writeFile} from 'node:fs/promises';

const OUTPUT_DIR = new URL('../output/', import.meta.url);

const writeJsonAtomic = async (name, data) => {
    const path = new URL(name, OUTPUT_DIR);
    const tmpPath = new URL(name + '.tmp', OUTPUT_DIR);
    await writeFile(tmpPath, JSON.stringify(data, null, 2));
    await rename(tmpPath, path);
};

export const storeResults = async (results) => {
    // idempotency: canonical product_url is the identity — duplicates overwrite, never duplicate
    const valid = new Map();
    const errors = [];

    for (const result of results) {
        if (result.ok) {
            valid.set(result.data.product_url, result.data);
        } else {
            errors.push({product_url: result.url, reason: result.reason});
        }
    }

    // stable order → reruns produce identical files
    const books = [...valid.values()].sort((a, b) => a.product_url.localeCompare(b.product_url));

    await mkdir(OUTPUT_DIR, {recursive: true});
    await writeJsonAtomic('books.json', books);
    await writeJsonAtomic('errors.json', errors);

    return {valid: books.length, invalid: errors.length};
};