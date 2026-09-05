import {mkdir, readFile, rename, stat, writeFile} from 'fs/promises';
import config from './config.js';
import {trackFetch} from './report.js';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const CACHE_DIR = new URL('../cache/', import.meta.url);

// function to fetch a page by URL and cache it
export const fetchPage = async (url, cacheName) => {
    const cachePath = new URL(cacheName, CACHE_DIR);

    // PATH 1: cache hit
    try {
        const cached = await readFile(cachePath, 'utf8');
        const {size, mtime} = await stat(cachePath);
        console.log(`CACHE HIT ${url} (${size} bytes)`);
        trackFetch(true);
        return {html: cached, fromCache: true, fetchedAt: mtime.toISOString()};
    } catch (error) {
        if (error.code !== 'ENOENT') throw error;
        // ENOENT = file missing → fall through to fetch
    }

    // PATH 2: cache miss - retry on timeout/5xx, never on 404/403
    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), config.timeoutMs);

        let response;
        try {
            response = await fetch(url, {
                signal: controller.signal,
                headers: {
                    'User-Agent': config.userAgent
                }
            });
        } catch (error) {
            if (error.name === 'AbortError' && attempt < config.maxRetries) {
                console.log(`RETRY ${url} (timeout)`);
                await sleep(config.delayMs);
                continue;
            }
            throw error.name === 'AbortError' ? new Error(`request timeout: ${url}`) : error;
        } finally {
            clearTimeout(timeout);
        }

        if (response.status !== 200) {
            const retryable = response.status >= 500;

            if (retryable && attempt < config.maxRetries) {
                console.log(`RETRY ${url} (status ${response.status})`);
                await sleep(config.delayMs);
                continue;
            }
            // 404/403 never retry; 5xx exhausted also fails here
            throw new Error(`fetch failed: status ${response.status} for ${url}`);
        }

        const html = await response.text();

        await mkdir(CACHE_DIR, {recursive: true});
        // atomic write
        const tmpPath = new URL(cacheName + '.tmp', CACHE_DIR);
        await writeFile(tmpPath, html);
        await rename(tmpPath, cachePath);
        console.log(`FETCH ${url} (${html.length} bytes, status 200)`);

        trackFetch(false);
        return {html, fromCache: false, fetchedAt: new Date().toISOString()};
    }
};
