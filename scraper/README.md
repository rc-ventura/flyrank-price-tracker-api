# Polite Scraper — W5 · A9

A small, polite scraping pipeline — FlyRank Internship, Backend Track, Week 5, Assignment A9.

## Quick Start

```bash
cd scraper
npm install
npm start
```

Output appears in `output/books.json`, `output/errors.json`, and `output/run-report.json`.

To test failure handling with a fake URL:

```bash
npm start -- --with-fake-url
```

## Lane

| | |
|---|---|
| **Language** | Node.js 20+ (ES Modules) |
| **HTTP** | Built-in `fetch` |
| **HTML parser** | Cheerio |
| **Schema validator** | Zod 4 |
| **Output** | JSON files |

## Target classification

- **Target:** [Books to Scrape](https://books.toscrape.com)
- **Why this site:** the site publicly declares itself a **sandbox** — "a safe place for beginners
  learning web scraping" (toscrape.com). That declaration is the permission; this project touches
  no other site.
- **Scope:** the first 3 catalogue pages only (~60 book pages), one pass
- **Data collected:** title, product URL, price, availability, rating, description — plus
  provenance (source catalogue page, fetch timestamp)
- **Why appropriate:** practice target, no personal data, no login, no paywall, low volume
- **robots.txt:** `GET https://books.toscrape.com/robots.txt` → **404 Not Found** (checked
  2026-08-22) — no robots file found. A missing file is not permission; it is just a missing file.

I will not reuse this code on another site without checking its rules and terms first.

## Record schema

Each record in `books.json` follows this shape (Zod-validated):

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `title` | string | yes | min 1 char |
| `product_url` | string | yes | absolute `https://` URL — canonical identity |
| `price_text` | string | yes | raw text as scraped, e.g. `"£51.77"` |
| `price_gbp` | number | yes | normalized float, positive — e.g. `51.77` |
| `availability_text` | string | yes | raw text, e.g. `"In stock (22 available)"` |
| `rating_text` | string \| null | yes | word rating, e.g. `"Three"` — null if absent |
| `description` | string \| null | yes | book description — null if absent (never invented) |
| `source_page` | string | yes | absolute URL of the catalogue page where the book was found |
| `fetched_at` | string | yes | ISO 8601 timestamp of when the page was fetched |

Records that fail validation go to `output/errors.json` with a reason — they never enter `books.json`.

## Politeness rules

| Rule | Value | How |
|------|-------|-----|
| **User-Agent** | `FlyRankInternshipA9/1.0 (+https://github.com/rc-ventura/fly_rank_ai_backend)` | honest identity on every request |
| **Delay** | 500 ms between real requests | cached pages skip the delay entirely |
| **Timeout** | 10 seconds | `AbortController` — never waits forever |
| **Cache** | disk-based, `cache/` directory | first run fetches; subsequent runs read from disk |
| **Retry** | 1 retry on timeout or 5xx only | 404/403 are never retried — asking again won't help |
| **Atomic writes** | temp file + rename | a crash mid-write never corrupts the cache |

## Run report (proof)

A real `output/run-report.json` from a warm run (all pages cached):

```json
{
  "started_at": "2026-09-05T23:26:14.900Z",
  "duration_ms": 251,
  "pages_fetched": 0,
  "cache_hits": 63,
  "valid_records": 60,
  "invalid_records": 0,
  "failed_pages": 0,
  "failures": []
}
```

With a fake URL injected via `--with-fake-url`, the run still finishes with 60 good records and `failed_pages: 1` — the broken page is logged and skipped, never crashing the run.

## Why no browser was needed

The data is already in the HTML the server sends — books.toscrape.com is a static site with no JavaScript rendering. A browser would only add cost (memory, startup time, a headless Chrome instance) without changing the result. The server's HTML is the complete document; `fetch` + Cheerio extracts everything the assignment needs.

## Ethics note

Use an official API when one exists. Never bypass logins, paywalls, or blocks. Collect only what you need. This scraper touches a single practice sandbox and respects its declared purpose — it is not a template for scraping production sites without checking their rules and terms first.

## Honest limitation

Cache keys are caller-supplied filenames, not URL-derived hashes. This is safe with one caller and one target (63 known URLs, no collision possible), but would need proper key derivation before adding a second site. The cache also has no TTL, eviction, or HTTP header awareness (`ETag`/`304`) — it is a development convenience, not a production cache. Assignment A16 covers the production version.
