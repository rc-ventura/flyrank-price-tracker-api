import {mkdir, readFile, rename, stat, writeFile} from 'fs/promises';
import config from './config.js';

const CACHE_DIR = new URL('../cache/', import.meta.url);

export const fetchPage = async (url, cacheName) => {
    const cachePath = new URL(cacheName, CACHE_DIR);

    // PATH 1: cache hit
    try {
        const cached = await readFile(cachePath, 'utf8');
        const {size} = await stat(cachePath);
        console.log(`CACHE HIT ${url} (${size} bytes)`);
        
        return { html: cached, fromCache: true };
    
    } catch (error) {
        if (error.code !== 'ENOENT') throw error;
        // ENOENT = file missing → fall through to fetch
    }

    // PATH 2: cache miss 
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
        if (error.name === 'AbortError') {
            throw new Error('Request timeout');
        }
        throw error;
    } finally {
        clearTimeout(timeout);
    }

    if (response.status !== 200) {
        throw new Error(`fetch failed: status ${response.status} for ${url}`);
    }

    const html = await response.text();

    await mkdir(CACHE_DIR, {recursive: true});
    // atomic write
    const tmpPath = new URL(cacheName + '.tmp', CACHE_DIR);
    await writeFile(tmpPath, html);
    await rename(tmpPath, cachePath);
    console.log(`FETCH ${url} (${html.length} bytes, status 200)`);

    return { html, fromCache: false };
};
