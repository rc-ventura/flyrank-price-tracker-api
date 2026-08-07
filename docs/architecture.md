# Architecture

## Tech Stack

- **Runtime:** Node.js (ES Modules)
- **Framework:** Express 5
- **Documentation:** Swagger UI (OpenAPI 3.0)
- **Architecture:** Controller → Service → Repository (MVC Layered)
- **Storage:** PostgreSQL 17 (containerized, persistent via named volume)
- **Infrastructure:** Docker + Docker Compose (multi-stage build)
- **Auth (W4):** Supabase Auth — `@supabase/supabase-js` v2, JWT verification via `supabase.auth.getUser(token)`

## MVC Layered Architecture

```text
src/
├── controllers/
│   ├── trackerController.js        # Tracker CRUD — receives HTTP, calls Service, returns status codes
│   ├── authController.js           # signup, login, logout — thin HTTP shells
│   ├── protectedController.js      # profile, dashboard — returns req.user (guard already ran)
│   └── publicController.js         # public info — static message, no auth
├── services/
│   ├── trackerService.js           # Tracker business rules & validation
│   └── authService.js              # Supabase SDK calls: signUp, signInWithPassword, getUser, signOut
├── repositories/
│   └── trackerRepository.js        # Executes SQL queries against PostgreSQL
├── routes/
│   ├── trackerRouter.js            # /api/trackers — CRUD URL paths & HTTP verbs
│   ├── metaRouter.js               # /, /health, /stats, /reset
│   ├── authRouter.js               # /auth/* — signup (open), login (open), logout (guarded)
│   ├── publicRouter.js             # /public/* — no auth
│   └── protectedRouter.js          # /protected/* — router-wide authMiddleware
├── middlewares/
│   ├── errorHandlerMiddleware.js   # Centralized error handling (instanceof chain → statusCode fallback)
│   └── authMiddleware.js           # Extracts Bearer token → verifies via Supabase → attaches req.user
├── error.js                        # Custom error classes: ValidationError(400), NotFoundError(404), AuthenticationError(401), UniqueViolationError(400)
└── app.js                          # Express app configuration — mounts all routers

db/
├── pool.js                         # pg connection pool (reads DATABASE_URL from env)
├── tracker.db.js                   # Creates table, indexes, seeds 3 trackers on first run
└── supabase.client.js              # Singleton Supabase client (publishable key only — never service_role)
```

## Container Topology

```text
┌─────────────────────────────────────────────┐
│  Docker Compose network                     │
│                                             │
│  ┌──────────────┐      ┌─────────────────┐  │
│  │   server     │─────▶│      db         │  │
│  │  (Node app)  │ 5432 │  (Postgres 17)  │  │
│  │  port 3000   │      │  volume: pg_data│  │
│  └──────────────┘      └─────────────────┘  │
│        │                                    │
│   depends_on: db (service_healthy)          │
└─────────────────────────────────────────────┘
        │
   localhost:3000 (published to host)
```

The `server` service reaches Postgres by the service name `db` (Compose's internal DNS), not `localhost`. The app only starts after Postgres passes its `pg_isready` healthcheck, eliminating the cold-start race condition.

## Auth Middleware — Two Application Patterns

The auth guard (`src/middlewares/authMiddleware.js`) is applied two ways:

| Pattern | Where | Example | Why |
|---------|-------|---------|-----|
| **Router-wide** | `protectedRouter.js` | `router.use(authMiddleware)` | Every route under `/protected/*` is guarded with zero per-route auth code |
| **Per-route** | `authRouter.js` | `router.post("/logout", authMiddleware, authController.logout)` | Only `/auth/logout` is guarded, while `/auth/signup` and `/auth/login` stay open |

## Golden Rule (W4)

No password is ever stored, and no hashing is done in our code. Supabase stores accounts, hashes passwords, and signs tokens. Our code only sends credentials to Supabase and verifies the tokens it hands back.
