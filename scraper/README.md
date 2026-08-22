# Polite Scraper — W5 · A9

A small, polite scraping pipeline — FlyRank Internship, Backend Track, Week 5, Assignment A9.

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
