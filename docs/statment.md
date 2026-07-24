# 💡 Business Proposal & Core Purpose

## 💼 Business Proposal (The Product Vision)

**Problem Statement:** E-commerce store owners, digital marketers, and pricing analysts waste hours manually visiting competitor websites daily to track price drops, stock updates, and promotional strategy shifts.

**Value Proposition:** An automated, lightweight SaaS API that continuously monitors competitor product URLs and extracts prices via CSS selectors—delivering instant alerts and AI-driven market intelligence whenever prices fluctuate.

**Target Audience:** E-commerce merchants, agency account managers, and market intelligence teams.

**SaaS Growth Roadmap:**

- **Phase 1 (Now - Week 2):** Core management API for registering and configuring tracking targets in memory.
- **Phase 2:** Persistent database storage (PostgreSQL) and automated background web scrapers.
- **Phase 3:** AI integration (LLM summarization of market moves) and a Next.js/React frontend dashboard.

## 🎯 Assignment Purpose (The Learning Vision)

- **Educational Purpose:** Mastery of fundamental HTTP methods (GET, POST, PUT, DELETE), standard REST status codes (200, 201, 204, 400, 404), and in-memory list manipulation.
- **Architectural Purpose:** Implementing a clean, production-grade MVC Layered Architecture (Controller ➔ Service ➔ Repository) early on, teaching you how real engineering teams decouple business rules from storage mechanisms.
- **Portfolio Value:** Replacing a standard "To-Do list" with a real-world SaaS blueprint that demonstrates product thinking, domain design, and technical maturity to recruiters.

## 🎯 FlyRank Week 2 Assignment A1 Alignment

- **Domain:** Competitor Price Tracker (`/trackers` instead of `/tasks`).
- **Architecture:** MVC Layered Design (Controller ➔ Service ➔ Repository).
- **Storage:** In-memory list (no database or external files yet).
- **Target Delivery:** Public GitHub repository with ≥6 stage commits, Swagger UI at `/docs`, and a complete README.

## 🛠️ Stage-by-Stage Implementation Specification

### Stage 0: Hello, Server 🚪

**Objective:** Start a basic server on localhost (Port 3000 for Express or Port 8000 for FastAPI).

**Checkpoint:** Running `curl -i http://localhost:3000/` (or 8000/) returns status 200 OK.

**Git Commit:** `Stage 0: hello server`

### Stage 1: Root & Health Endpoints 🏥

**Objective:** Create the front-door endpoints that describe the service and check server health.

**Endpoints:**

- `GET /` ➔ Returns API metadata describing the service:
  - Name: `"Competitor Price Tracker API"`
  - Version: `"1.0"`
  - Endpoints: `["/trackers"]`
- `GET /health` ➔ Returns `{ "status": "ok" }`.

**Checkpoint:** Both URLs return valid JSON with 200 OK in the browser and via curl.

**Git Commit:** `Stage 1: root and health endpoints`

### Stage 2: Read Endpoints (List & Single Item) 🔍

**Objective:** Set up in-memory storage seeded with 3 example trackers.

**Pre-filled Data (Seed):**

| id | name | url | targetSelector | frequency | status |
| --- | --- | --- | --- | --- | --- |
| 1 | Tech Store Headphones | `https://site1.com/p1` | `.price` | daily | active |
| 2 | Marketplace Monitor | `https://site2.com/p2` | `#price-tag` | hourly | active |
| 3 | Boutique Retailer | `https://site3.com/p3` | `span.amount` | weekly | paused |

**Endpoints:**

- `GET /trackers` ➔ Returns the entire list of trackers.
- `GET /trackers/:id` ➔ Returns one tracker using path parameters.

**Error Handling:** If an ID does not exist, return status 404 Not Found with JSON: `{ "error": "Tracker 99 not found" }`.

**Git Commit:** `Stage 2: read endpoints with 404`

### Stage 3: Create Endpoint with Input Validation ➕

**Objective:** Accept new tracking targets via `POST /trackers` with server-side validation.

**Request Payload Attributes:** `name`, `url`, `targetSelector`.

**Business & Validation Rules:**

- Assigns the next free id and sets default status: `"active"`.
- **Input Validation:** If `name`, `url`, or `targetSelector` is missing or empty, return status 400 Bad Request with a descriptive JSON error.
- Returns status 201 Created along with the newly created tracker object.

**Git Commit:** `Stage 3: create with validation`

### Stage 4: Update & Delete Endpoints 🔄

**Objective:** Support modifying parameters or removing tracked sites.

**Endpoints:**

- `PUT /trackers/:id` ➔ Replaces or updates tracker attributes (name, url, targetSelector, frequency, status). Returns updated object (200 OK). Invalid payload returns 400 Bad Request; unknown ID returns 404 Not Found.
- `DELETE /trackers/:id` ➔ Removes the tracker from memory. Returns status 204 No Content with an empty body. Unknown ID returns 404 Not Found.

**Git Commit:** `Stage 4: full CRUD`

### Stage 5: Interactive Swagger UI Documentation 📄

**Objective:** Expose interactive visual API documentation at `/docs`.

- **Python/FastAPI Lane:** Automatically available at `http://localhost:8000/docs`.
- **JavaScript/Express Lane:** Integrated via `swagger-ui-express` pointing to an `openapi.json` spec file served at `/docs`.

**Checkpoint:** Execute a full CRUD sequence directly inside Swagger UI using "Try it out". Take a screenshot for your README.

**Git Commit:** `Stage 5: Swagger UI`

### Stage 6: Publish & Documentation 🚀

**Objective:** Publish to GitHub and write a clear README.

**README Content:**

- Business Proposal & Overview of the Competitor Tracker API.
- One-command installation & startup instructions.
- Endpoint reference table.
- Sample `curl -i` output demonstrating HTTP status codes.
- Swagger UI screenshot.

**Git Commit:** `Stage 6: publish and docs`

## 📊 Endpoints & Status Codes Reference Table

| CRUD Operation | Method | Endpoint | Success Status | Error Status |
| --- | --- | --- | --- | --- |
| System Info | GET | `/` | 200 OK | — |
| Health Check | GET | `/health` | 200 OK | — |
| Read All | GET | `/trackers` | 200 OK | 500 Server Error |
| Read Single | GET | `/trackers/:id` | 200 OK | 404 Not Found |
| Create | POST | `/trackers` | 201 Created | 400 Bad Request |
| Update | PUT | `/trackers/:id` | 200 OK | 400 Bad Request / 404 Not Found |
| Delete | DELETE | `/trackers/:id` | 204 No Content | 404 Not Found |

## 🎁 Optional Extras & Stretch Goals

To go beyond basic requirements, you can implement these optional extras in your repository:

- **Query Parameter Filtering:** `GET /trackers?status=active` returns only active monitoring targets.
- **Search Parameter:** `GET /trackers?search=headphones` returns targets matching a keyword.
- **Stats Endpoint:** `GET /stats` ➔ Returns computing summaries such as `{ "total": 5, "active": 4, "paused": 1 }`.
- **Seed & Reset:** `POST /reset` restores memory back to the initial 3 sample trackers.
- **Stage 7 (AI Rematch Bonus):** Prompt an AI to build the same API in an `ai-version/` folder, run `git diff --no-index`, and summarize key differences in an "AI vs me" section of your README.

## 🏗️ Layered MVC Architecture Layout

To keep code clean and modular across all stages, organize your source code as follows:

```text
src/
├── controllers/
│   └── tracker.controller   # Receives HTTP requests, calls Service, returns status codes
├── services/
│   └── tracker.service      # Business rules & URL/selector validation
├── repositories/
│   └── tracker.repository   # Manages in-memory array data
├── routes/
│   └── tracker.routes       # Defines URL paths & HTTP verbs
└── app                      # Express/FastAPI entry point
```
