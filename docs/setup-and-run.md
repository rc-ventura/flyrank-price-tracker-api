# Setup & Run

## Option A — Full Docker Stack (app + Postgres)

The entire stack starts with a single command:

```bash
# 1. Copy the example env file and fill in your values
cp .env.example .env

# 2. Build and start everything (app + Postgres)
docker compose up -d --build
```

The API is available at `http://localhost:3000`. Postgres runs in its own container with a persistent named volume, so your data survives restarts.

- **API base URL:** `http://localhost:3000/api/trackers`
- **Swagger UI:** `http://localhost:3000/docs`
- **Health check:** `http://localhost:3000/health`

### Useful Docker commands

```bash
docker compose up -d          # start (reuses existing image)
docker compose up -d --build  # start and rebuild the app image (use after code changes)
docker compose down           # stop and remove containers (keeps the volume → data preserved)
docker compose down -v        # stop, remove containers AND the volume (data destroyed → re-seeds on next start)
docker compose logs server    # view app logs
docker compose ps             # view container status
```

## Option B — Local Dev with Supabase Auth (W4)

For W4 auth development, run the app locally with nodemon (hot reload) and only Postgres in Docker:

```bash
# 1. Clone the repo
git clone <repo-url> && cd fly_rank_ai_backend

# 2. Copy env file and fill in your values
cp .env.example .env
# Edit .env: add SUPABASE_URL, SUPABASE_KEY (publishable), DATABASE_URL, POSTGRES_*

# 3. Start Postgres (Docker — only the db service)
docker compose up db -d

# 4. Install dependencies
npm install

# 5. Start the dev server
npm run dev
```

The server logs `Server is running on port 3000`. Swagger UI is at `http://localhost:3000/docs`.

> **Important:** `DATABASE_URL` must use `@localhost:5432` for local dev (host), not `@db:5432` (Docker internal DNS). The `db` hostname only resolves inside the Docker network.

## Supabase Dashboard Setup (one-time, W4)

1. Create a free project at [supabase.com](https://supabase.com) (no credit card)
2. **Settings → API Keys** → copy the **Publishable key** (`sb_publishable_...`)
3. **Authentication → Sign In / Providers → Email** → turn **"Confirm email" OFF** (so fresh signups can log in immediately — leave ON in production)
4. *(Optional, for the `/protected/admin` extra)* Grant a user the admin role in **`app_metadata`** (server-controlled — `user_metadata` is client-editable and must not be trusted for authorization). Open the **SQL Editor** in the Supabase Dashboard and run:
   ```sql
   update auth.users
   set raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}'::jsonb
   where email = 'you@example.com';
   ```
   The user's next verified request returns `role: "admin"` and passes the `requireAdmin` guard.

## Environment Variables

Secrets live in `.env` (git-ignored) and are injected into containers via Docker Compose's `${VAR}` interpolation — **no credentials are hardcoded in any committed file**.

| Variable | Purpose | Example |
|----------|---------|---------|
| `PORT` | Server port | `3000` |
| `DATABASE_URL` | Postgres connection string | `postgres://postgres:changeme@localhost:5432/trackers` |
| `POSTGRES_USER` | Postgres superuser (Docker image) | `postgres` |
| `POSTGRES_PASSWORD` | Postgres password (Docker image) | `changeme` |
| `POSTGRES_DB` | Database name (Docker image) | `trackers` |
| `SUPABASE_URL` | Supabase project URL | `https://yourproject.supabase.co` |
| `SUPABASE_KEY` | Supabase publishable key | `sb_publishable_...` |

The `.env.example` file is committed with placeholder values so anyone can clone and run the project.

> **Note:** `SUPABASE_KEY` is the **publishable key** (`sb_publishable_...`) — the modern replacement for the legacy `anon` key. The `service_role` / `sb_secret_...` key is **never** used (it bypasses all security). Supabase deprecated the `anon`/`service_role` JWT keys in June 2025; legacy keys will stop working by end of 2026.

## Database Access

Connect to the containerized Postgres from your host with any DB GUI (e.g. DBeaver, TablePlus):

| Field | Value |
|-------|-------|
| Host | `localhost` |
| Port | `5432` |
| Database | `trackers` |
| Username | `postgres` |
| Password | *(your `POSTGRES_PASSWORD` from `.env`)* |

Or use `psql` directly inside the container:

```bash
docker exec -it fly_rank_ai_backend-db-1 psql -U postgres -d trackers
```
