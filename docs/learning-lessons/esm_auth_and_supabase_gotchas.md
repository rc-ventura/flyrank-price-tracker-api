# ESM, Express & Supabase Auth: Eight Gotchas from Building a JWT-Secured API

**Context:** Discovered during Week 4 (Assignment A4 — Auth: Login & Protect) while building a Supabase Auth-secured Express API with signup, login, logout, token verification, middleware guards, and Swagger bearer auth.
**Date:** 2026-08-07
**Future intent:** Apply these patterns to any future ESM + Express + third-party auth project; avoid re-discovering the same crashes.

---

## Mental Model: ESM Import Evaluation Order

The root cause of the first three gotchas is the same: **ESM imports are hoisted and evaluated before any module-body code runs.**

```
┌─────────────────────────────────────────────────────────┐
│  index.js                                               │
│                                                         │
│  import 'dotenv/config';        ← runs FIRST (side-effect)│
│  import createApp from './src/app.js';  ← runs SECOND   │
│      └─ imports controllers                              │
│          └─ imports services                             │
│              └─ imports db/supabase.client.js            │
│                  └─ reads process.env.SUPABASE_URL       │
│                     (must exist by now!)                 │
│                                                         │
│  dotenv.config();   ← NEVER REACHED if import 2 throws  │
└─────────────────────────────────────────────────────────┘
```

| Pattern | CommonJS (`require`) | ESM (`import`) |
|----------|---------------------|-----------------|
| File extension in path | Optional (`'./error'` works) | **Mandatory** (`'./error.js'`) |
| When `dotenv.config()` runs | At the call site (line-by-line) | After ALL imports evaluate (hoisted) |
| Module evaluation order | Top-to-bottom, interleaved with code | All imports first, then module body |

---

## Gotcha 1: Env-load order in ESM

**Symptom:** `supabase.client.js` throws `Missing SUPABASE_URL or SUPABASE_KEY` at startup — even though `.env` has the values and `dotenv.config()` is in `index.js`.

**Root cause:** `dotenv.config()` runs *after* all imports are hoisted and evaluated. Any module reading `process.env` at import time sees `undefined`.

**Fix:**
```js
// index.js — FIRST line must be the side-effect import
import 'dotenv/config';        // runs config() during import evaluation
import createApp from './src/app.js';   // env vars now exist when this tree loads
```

`import 'dotenv/config'` is the idiomatic ESM pattern — it runs `config()` as a side effect of the import, before the rest of the import tree is evaluated.

**Alternative:** `node --env-file=.env index.js` (Node >= 20.6) — loads env vars before any JS runs, no dotenv dependency needed.

---

## Gotcha 2: ESM requires file extensions

**Symptom:** `Error [ERR_MODULE_NOT_FOUND]: Cannot find module '.../src/error'`

**Root cause:** In CommonJS, `require('./error')` auto-resolves to `./error.js`. ESM does **not** — `import { X } from './error'` looks for a file literally named `error` (no extension), which doesn't exist.

**Fix:**
```js
// WRONG — works in CommonJS, fails in ESM
import { AuthenticationError } from '../error';

// CORRECT — explicit .js extension
import { AuthenticationError } from '../error.js';
```

This bit us multiple times during W4 development — it's the most common ESM migration error.

---

## Gotcha 3: Express router prefix composition

**Symptom:** `curl http://localhost:3000/protected/profile` returns `404 Route not found`.

**Root cause:** Double prefix. When a router defines `router.get('/protected/profile', ...)` and is mounted with `app.use('/protected', router)`, the final path becomes `/protected/protected/profile`.

```
Router path:     "/protected/profile"     ← what you wrote in the router
Mount point:     "/protected"             ← what you wrote in app.js
Final URL:       "/protected/protected/profile"  ← what Express serves
```

**Fix:** Routes inside a router use **relative** paths; the mount point provides the prefix.

```js
// app.js
app.use('/protected', protectedRouter);

// protectedRouter.js — RELATIVE paths, no prefix
router.get('/profile', protectedController.getProfile);
router.get('/dashboard', protectedController.getDashboard);
```

| Router path | Mount | Final URL |
|---|---|---|
| `/profile` | `/protected` | `/protected/profile` ✓ |
| `/protected/profile` | `/protected` | `/protected/protected/profile` ✗ |

---

## Gotcha 4: Supabase `signOut()` singleton trap

**Symptom:** `POST /auth/logout` returns `401 "Logout failed"` after a nodemon restart, even with a valid access token.

**Root cause:** `supabase.auth.signOut()` signs out the session stored in the **shared singleton client's memory** — not the caller's specific token. After a server restart, the in-memory session is gone → `signOut()` returns `"Auth session missing!"`.

```
Request flow:
  Client sends:  Authorization: Bearer <user-A-token>
  Server calls:  supabase.auth.signOut()
  Supabase signs out: whatever session is in the SHARED client memory
  After restart:  memory is empty → "Auth session missing!" → 401
```

This is the **stateless JWT nature** that w4.md's "real logout test" extra is designed to reveal. The access token remains technically valid until it expires — Supabase can't revoke a signed JWT instantly.

**Current approach (acceptable for W4):** `scope: 'local'` — revokes only the current session's refresh token. Returns `204` on success.

**Production-grade fix (not implemented):** create a per-request Supabase client, or call Supabase's REST endpoint `POST {SUPABASE_URL}/auth/v1/logout` with the user's own `Authorization` header — so Supabase revokes *that* user's session, not whatever is in memory.

---

## Gotcha 5: `AuthenticationError` must extend `Error`, not `ValidationError`

**Symptom:** Bad credentials return `400 Bad Request` instead of `401 Unauthorized`.

**Root cause:** The `errorHandler` middleware checks `instanceof` in order:

```js
if (err instanceof ValidationError)  return res.status(400)...   // ← catches first
if (err instanceof NotFoundError)    return res.status(404)...
if (err.statusCode)                  return res.status(err.statusCode)...
```

`instanceof` walks the **entire prototype chain**. If `AuthenticationError extends ValidationError`, then `authErr instanceof ValidationError` is `true` → the first branch catches it → **400**, even if `statusCode` is set to 401. The `err.statusCode` fallback is never reached.

```
AuthenticationError extends ValidationError:
  authErr instanceof ValidationError  →  true   →  400 (WRONG)

AuthenticationError extends Error:
  authErr instanceof ValidationError  →  false  →  skip
  authErr instanceof NotFoundError    →  false  →  skip
  authErr.statusCode (401)            →  401 (CORRECT)
```

**Fix:** `AuthenticationError` extends `Error` directly, with `this.statusCode = 401`. It skips both `instanceof` branches and lands on the `err.statusCode` fallback.

```js
class AuthenticationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AuthenticationError';
    this.statusCode = 401;   // ← lands on the statusCode fallback
  }
}
```

---

## Gotcha 6: Legacy vs new Supabase API keys

**Discovery:** The w4.md assignment references the `anon` key, but Supabase deprecated it in June 2025.

| Legacy key | New key | Format |
|---|---|---|
| `anon` | Publishable key | `sb_publishable_...` |
| `service_role` | Secret key | `sb_secret_...` |

- Legacy keys will stop working by end of 2026
- New projects created after Nov 2025 may not have legacy keys at all
- The publishable key is a **drop-in replacement** for `anon` in `createClient()` — same low privileges, same RLS behavior
- The publishable key is **not a JWT** (goes in the `apikey` header, which the SDK handles automatically)
- The user's **access token is still a JWT** — the Bearer flow is unchanged

**What we did:** used `SUPABASE_KEY` (the publishable key) from the start, named the env var to match the assignment's convention, and noted the migration in the README.

---

## Gotcha 7: Swagger UI bearer token — paste WITHOUT the prefix

**Symptom:** Authorize → paste token → Try it out → `401 Unauthorized`.

**Root cause:** With `scheme: bearer` in the OpenAPI spec, Swagger UI **automatically adds** the `Bearer ` prefix. If you paste `Bearer eyJhbG...`, the header becomes `Authorization: Bearer Bearer eyJhbG...` → the server extracts `Bearer eyJhbG...` as the token → verification fails.

```
Correct:  paste "eyJhbG..."        → header: "Bearer eyJhbG..."     → 200
Wrong:    paste "Bearer eyJhbG..." → header: "Bearer Bearer eyJ..." → 401
```

---

## Gotcha 8: Nodemon doesn't watch `docs/`

**Symptom:** Edit `openapi.json`, refresh `/docs` in the browser — the old spec is still served.

**Root cause:** The dev script (`nodemon -w ./src -w ./index.js index.js`) only watches `src/**` and `index.js`. The `docs/` directory is not in the watch list, so editing `openapi.json` doesn't trigger a restart.

**Fix:** type `rs` in the nodemon terminal to manually restart, or add `docs/` to the watch list in `package.json`:
```json
"dev": "nodemon -w ./src -w ./index.js -w ./docs index.js"
```

---

## Examples for FlyRank Backend

### 1. Correct env-load order (index.js)

```js
import 'dotenv/config';                                    // FIRST — side-effect import
import createApp from './src/app.js';                      // SECOND — env vars exist
import { initDb } from './db/tracker.db.js';               // THIRD — DB pool reads DATABASE_URL
import './db/supabase.client.js';                          // FOURTH — reads SUPABASE_URL/KEY
```

### 2. Correct router prefix composition (app.js + protectedRouter.js)

```js
// app.js — mount points provide the prefix
app.use('/auth', authRouter);
app.use('/public', publicRouter);
app.use('/protected', protectedRouter);

// protectedRouter.js — relative paths only
router.use(authMiddleware);                    // guard applied router-wide
router.get('/profile', protectedController.getProfile);
router.get('/dashboard', protectedController.getDashboard);

// authRouter.js — guard applied per-route (signup/login stay open)
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/logout', authMiddleware, authController.logout);  // guarded
```

### 3. Error class hierarchy (error.js)

```js
class ValidationError extends Error { statusCode = 400 }
class NotFoundError extends Error { statusCode = 404 }
class AuthenticationError extends Error { statusCode = 401 }  // extends Error, NOT ValidationError
class UniqueViolationError extends ValidationError { }         // OK — 400 is correct for unique violations
```

**Responsibility split:**
- `errorHandler`: checks `instanceof` in order, falls back to `err.statusCode`
- Error classes: set `statusCode` and `name`; the class hierarchy determines which `instanceof` branch catches them

---

## Relation to ADRs and next steps

- No ADRs currently exist in this project; consider creating ADR-001 for the ESM + dotenv config pattern
- **Next step:** if implementing the refresh-token stretch goal, create a per-request Supabase client to avoid the singleton `signOut()` trap (Gotcha 4)
- **Next step:** add `docs/` to the nodemon watch list to avoid manual `rs` restarts (Gotcha 8)
