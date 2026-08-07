# W1–W3 Optional Extras — Evidence & Rationale

The following sections document the optional extras completed for assignments A1–A3, each with its rationale and terminal/browser evidence.

## 1 · Volumes — Why They Exist (Mortality Experiment)

Postgres writes its data files to `/var/lib/postgresql/data` **inside the container's writable layer**, which is destroyed when the container is removed. Without a volume, `docker compose down` would wipe your tables and the app would re-seed from scratch every restart. A **named volume** mounts a host-managed directory onto that path, so the data files persist outside the container's lifecycle and survive `docker compose down`.

**The experiment:**

- **Test 1 — volume preserved:** created a tracker ("Volume Persistence Proof", id 10004), ran `docker compose down` (no `-v`), then `up`. All 10004 trackers survived with unchanged `created_at` timestamps — the volume kept the data.
- **Test 2 — volume destroyed:** ran `docker compose down -v` (the `-v` flag deletes the named volume), then `up`. The database reset to the 3 seed trackers only — the manually-created data was gone.

![Mortality experiment — volume persistence vs destruction](../mortality-experiment.png)

This is exactly why volumes exist: **containers are disposable, data is not.** The named volume (`pg_data`) decouples the data's lifetime from the container's lifetime.

## 2 · Real Health Check (`GET /health` with DB ping)

A naive health check that only returns `{"status":"ok"}` proves nothing — it tells you the Express process is alive, but not whether the app can actually reach its database. A **real health check** runs the cheapest possible DB round-trip (`SELECT 1`) and reports the database status separately, returning the correct HTTP status code so automated systems can act on it.

**Implementation** (repository → service → route, following the existing layered architecture):

```js
// repository: pingDb()
const pingDB = async () => {
    await pool.query('SELECT 1');
    return true;
}

// service: healthCheck() — never throws, returns a status object
const healthCheck = async () => {
    try {
        await trackerRepository.pingDB();
        return { status: 'ok', db: 'ok' };
    } catch (err) {
        return { status: 'degraded', db: 'down' };
    }
}

// controller: maps status → HTTP code
const statusCode = health.status === 'ok' ? 200 : 503;
res.status(statusCode).json(health);
```

**Why the 503 matters:** a load balancer or Kubernetes liveness probe only looks at the HTTP status code — it doesn't parse JSON. Returning `200` with `"db":"down"` in the body is invisible to automated checks. The `503 Service Unavailable` is what tells the orchestrator "stop routing traffic to this instance." This is what real companies gate deploys on.

**One critical bug this surfaced:** the `pg` connection pool emits `'error'` events on **idle clients** when the DB goes down — a separate event stream from query-time errors. Without a `pool.on('error', ...)` handler, Node treats it as an unhandled error and the entire process crashes before the health check can respond. Adding the handler to `db/pool.js` is what makes the 503 path reachable.

![Health check — 200 ok → 503 degraded → 200 ok](../health-check.png)

## 3 · Index Performance — EXPLAIN ANALYZE Before/After

The app filters trackers by `status` (`GET /api/trackers?status=paused`). Without an index, Postgres must scan **every row** to find matches (a sequential scan). An index on the `status` column lets Postgres jump straight to the matching rows.

**Setup:** seeded 10,000 bulk rows so the difference is measurable (on 3 rows, the planner correctly chooses a sequential scan even with an index — consulting the index costs more than just reading the tiny table).

**Before (no index):**
```
Seq Scan on trackers  (actual time=0.140..5.990 rows=1001 loops=1)
  Filter: (status = 'paused'::text)
  Rows Removed by Filter: 9002
  Execution Time: 6.204 ms
```

**After (`CREATE INDEX idx_trackers_status ON trackers(status)`):**
```
Bitmap Heap Scan on trackers  (actual time=0.060..0.287 rows=1001 loops=1)
  -> Bitmap Index Scan on idx_trackers_status
  Execution Time: 0.381 ms
```

**Result: 6.204 ms → 0.381 ms ≈ 16x faster.** The query planner switched from `Seq Scan` (read all 10,003 rows, discard 9,002) to `Bitmap Index Scan` (consult the index, fetch only the 1,001 matching rows).

![EXPLAIN ANALYZE — before vs after index](../explain-analyze.png)

**Key takeaway:** indexes pay off at scale. On toy data they can be a net loss; the planner knows this and won't use them. Always verify with `EXPLAIN ANALYZE` on realistic data volumes.

## 4 · Slim Image — Multi-Stage Dockerfile

The production image uses a **multi-stage build**: one stage installs only production dependencies (`npm ci --omit=dev`), and a final slim stage copies only what's needed to run — the source and production `node_modules` — onto a minimal Alpine base. Dev dependencies, build tools, and npm cache never reach the shipped image.

**The comparison** (a naive single-stage build vs. the multi-stage build):

| Approach | Dockerfile | Size |
|----------|------------|------|
| Naive | `FROM node:24` + `npm install` (all deps, Debian base) | **1.65 GB** |
| Multi-stage | `FROM node:24-alpine3.23 AS deps` → `AS runner` + `npm ci --omit=dev` | **251 MB** |

**~85% smaller.** The savings come from three compounding choices:
1. **Alpine base** (`node:24-alpine3.23` ~50 MB vs. Debian `node:24` ~350 MB)
2. **`npm ci --omit=dev`** — skips `devDependencies` (nodemon) entirely
3. **Multi-stage** — the deps stage's layer cache and any build artifacts are discarded; only the final `COPY --from=deps` output ships

![Image size — naive 1.65GB vs multi-stage 251MB](../image-size.png)

Smaller images mean faster pulls, faster deploys, less disk, and a reduced attack surface (fewer packages = fewer potential vulnerabilities).

## 5 · Full-Stack Evidence — App & Swagger UI

The running application and its interactive API documentation, served from the containerized stack:

![Live health endpoint](../health-live.png)

![Swagger UI](../swagger-ui.png)
