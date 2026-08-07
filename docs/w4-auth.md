# W4 Auth — Test Results, Analysis & Findings

## Test Results — All Checkpoints Passed

Every stage was verified with `curl -i` and (for Stage 5) Playwright browser automation.

### Stage 0 — Server & Supabase client setup

| Test | Expected | Result |
|------|----------|--------|
| `npm run dev` | Server starts, no errors | **PASS** — `Server is running on port 3000` |
| `.env` git-ignored | Not in `git status` | **PASS** — `.env` in `.gitignore`, never committed |
| Supabase client init | No crash at startup | **PASS** — `db/supabase.client.js` throws if env vars missing |

### Stage 1 — Signup & Login

| Test | Expected | Result |
|------|----------|--------|
| Valid signup | 201 + user object | **PASS** — `201 Created`, Supabase user returned |
| Signup without password | 400 | **PASS** — `400 {"error":"Password is required"}` |
| Valid login | 200 + access_token | **PASS** — `200 OK`, `{ accessToken, refreshToken }` |
| Login with wrong password | 401 | **PASS** — `401 {"error":"Invalid login credentials"}` |

### Stage 2 — Public & protected gates (unverified)

| Test | Expected | Result |
|------|----------|--------|
| `GET /public/info` | 200 + welcome message | **PASS** — `200 {"message":"Welcome stranger! This info is public."}` |
| `GET /protected/profile` (no token) | 401 | **PASS** — `401 {"error":"Access token required"}` |
| Malformed header (`Authorization: abc123`) | 401 | **PASS** — `401 {"error":"Access token required"}` |
| Empty token (`Authorization: Bearer `) | 401 | **PASS** — `401 {"error":"Access token required"}` |

### Stage 3 — Token verification

| Test | Expected | Result |
|------|----------|--------|
| Valid token → `GET /protected/profile` | 200 + `{ id, email, created_at }` | **PASS** — `200 OK` with user metadata |
| Tampered token (1 char changed) | 401 | **PASS** — `401 {"error":"Invalid or expired token"}` |

### Stage 4 — Middleware protection & logout

| Test | Expected | Result |
|------|----------|--------|
| `GET /protected/dashboard` with valid token | 200 | **PASS** — `200 {"message":"Welcome to your dashboard","user":{...}}` |
| `GET /protected/dashboard` with fake token | 401 | **PASS** — `401 {"error":"Invalid or expired token"}` |
| `POST /auth/logout` with valid token | 204 | **PASS** — `204 No Content` |
| `POST /auth/logout` without token | 401 | **PASS** — `401 {"error":"Access token required"}` |
| `GET /protected/profile` after logout | 401 | **PASS** — token invalidated, `401 "Invalid or expired token"` |
| Middleware reuse (dashboard uses same guard, zero new auth code) | — | **PASS** — `router.use(authMiddleware)` guards all `/protected/*` routes |

### Stage 5 — Swagger UI with bearer auth

Verified end-to-end via Playwright browser automation:

| Test | Expected | Result |
|------|----------|--------|
| `/docs` loads | 200 | **PASS** |
| Authorize button visible | Yes | **PASS** — `bearerAuth (http, Bearer)` scheme |
| Lock icon on `/protected/profile`, `/protected/dashboard`, `/auth/logout` | Yes | **PASS** — all three show padlock |
| No lock on `/auth/signup`, `/auth/login`, `/public/info` | Yes | **PASS** — public routes unguarded |
| Authorize → paste token → Try it out on `/protected/profile` | 200 + user data | **PASS** — `200 OK` with `{ id, email, created_at }` from browser |
| Token sent correctly in `Authorization: Bearer <token>` header | — | **PASS** — verified via network inspection |

![Swagger UI overview — all endpoints with auth tags](../swagger-1-overview.png)

![Authorize dialog — bearerAuth scheme](../swagger-2-authorize-dialog.png)

![Authorized — padlocks locked on protected routes](../swagger-3-authorized-locked.png)

![Try it out — /protected/profile returns 200 with user data](../swagger-5-profile-200-success.png)

### Stage 6 — Publish & documentation

| Test | Expected | Result |
|------|----------|--------|
| `.env` in `.gitignore` | Yes | **PASS** |
| `.env.example` committed with placeholders | Yes | **PASS** — `SUPABASE_URL`, `SUPABASE_KEY` placeholders |
| No Supabase keys in git history | Yes | **PASS** — only placeholder values in tracked files |
| ≥6 clean commits | Yes | **PASS** — 6 W4-specific commits + 27 from W1–W3 |
| README with setup, endpoint table, Swagger screenshot | Yes | **PASS** |

## W4 Requirements Checklist (from w4.md §6)

| # | Requirement | Status |
|---|-------------|--------|
| 1 | Server starts on localhost, connects to Supabase without errors | **PASS** |
| 2 | `.env` git-ignored, `.env.example` committed, no keys in git history | **PASS** |
| 3 | `POST /auth/signup` and `POST /auth/login` talk to Supabase Auth; login returns access token | **PASS** |
| 4 | `GET /protected/profile` extracts and verifies bearer token via Supabase | **PASS** |
| 5 | Correct status codes: 201/200/204/400/401 — each with JSON error message | **PASS** |
| 6 | Auth check is reusable middleware, applied to more than one protected route | **PASS** |
| 7 | Swagger UI at `/docs` shows lock icon, Bearer auth works from browser | **PASS** |
| 8 | Public GitHub repo, ≥6 commits, comprehensive README | **PASS** |

## 401 vs 403 — The Difference

These two status codes answer two fundamentally different questions:

| | `401 Unauthorized` | `403 Forbidden` |
|---|---|---|
| **Question it answers** | "Who are you?" | "I know who you are — and no." |
| **Meaning** | The server doesn't know your identity (no token, bad token, expired token) | The server knows your identity, but you're not allowed to do this |
| **Authentication state** | **Unauthenticated** — no valid identity established | **Authenticated** — identity verified, but insufficient permissions |
| **What the client should do** | Provide valid credentials (log in, fix the token) | Don't bother retrying — you need different permissions, not a new login |
| **In this project** | Missing `Authorization` header → `"Access token required"`; tampered/expired token → `"Invalid or expired token"` | Not implemented yet (would require an admin role check) |

**The mental model:** `401` is the bouncer asking for your ID. `403` is the bouncer reading your ID, recognizing you, and saying "you're not on the VIP list." A missing or forged ID is always `401` — the bouncer never got to the list. Only a **verified** ID that fails a **permission** check becomes `403`.

**Why the order matters:** you can only return `403` **after** authentication succeeds. If you return `403` to an unauthenticated request, you're leaking information — you've confirmed the route exists and implied the user is known. Always authenticate first (`401` if it fails), then authorize (`403` if the authenticated user lacks permissions).

In our code, `authMiddleware` handles the `401` path: missing/malformed/invalid token → `AuthenticationError` → `401`. A `403` would require an additional check **after** `req.user` is attached — e.g., `if (req.user.role !== 'admin') throw new ForbiddenError()`.

## W4 Findings & Lessons Learned

1. **Env-load order in ESM:** `dotenv.config()` runs *after* all imports are hoisted and evaluated. If a module reads `process.env` at import time (like `supabase.client.js`), it sees `undefined`. Fix: `import 'dotenv/config'` as the first import — it runs `config()` during import evaluation, before the rest of the tree loads.

2. **ESM requires file extensions:** `import { X } from '../error'` fails with `ERR_MODULE_NOT_FOUND` in ESM — you must write `'../error.js'`. CommonJS (`require`) auto-resolves the extension; ESM does not. This bit us multiple times during development.

3. **Express router prefix composition:** `router.get("/protected/profile", ...)` mounted at `app.use("/protected", router)` produces `/protected/protected/profile` — a double prefix. Routes inside a router use **relative** paths; the mount point adds the prefix.

4. **Supabase `signOut()` singleton trap:** `supabase.auth.signOut()` signs out the session stored in the **shared client's memory**, not the caller's specific token. After a nodemon restart, the in-memory session is gone → `signOut()` returns "Auth session missing!" → `401`. This is the stateless JWT nature w4.md's "real logout test" extra is designed to reveal. A production-grade fix would use a per-request Supabase client or call Supabase's REST logout endpoint with the user's own `Authorization` header.

5. **`AuthenticationError` must extend `Error`, not `ValidationError`:** our `errorHandler` checks `instanceof ValidationError` first (returns 400). If `AuthenticationError` extended `ValidationError`, `instanceof` would match the 400 branch and override `statusCode = 401` — returning "Bad Request" for bad credentials. Extending `Error` directly skips both `instanceof` branches and lands on the `err.statusCode` fallback → correct 401.

6. **Legacy vs new Supabase API keys:** Supabase deprecated the `anon`/`service_role` JWT keys in June 2025. New projects use publishable (`sb_publishable_...`) and secret (`sb_secret_...`) keys. The publishable key is a drop-in replacement for `anon` in `createClient()` — same low privileges, same RLS behavior. This project uses the publishable key from the start.

7. **Swagger UI bearer token:** in the Authorize dialog, paste **only the token** (`eyJhbG...`) — not `Bearer eyJhbG...`. The `scheme: bearer` configuration makes Swagger UI add the `Bearer ` prefix automatically. Pasting with the prefix produces `Bearer Bearer eyJ...` → `401`.

8. **Nodemon doesn't watch `docs/`:** the dev script watches `./src` and `index.js`. After editing `openapi.json`, type `rs` in the nodemon terminal to reload the server — otherwise the browser shows the old spec.

> Full technical details for each finding: [learning-lessons/esm_auth_and_supabase_gotchas.md](./learning-lessons/esm_auth_and_supabase_gotchas.md)
