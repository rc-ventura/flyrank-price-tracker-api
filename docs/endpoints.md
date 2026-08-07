# Endpoints Reference

## Tracker CRUD (W1–W3)

| Operation | Method | Endpoint | Success | Error |
|-----------|--------|----------|---------|-------|
| Read All | GET | `/api/trackers` | 200 OK | 500 Server Error |
| Read Single | GET | `/api/trackers/:id` | 200 OK | 404 Not Found |
| Create | POST | `/api/trackers` | 201 Created | 400 Bad Request |
| Update | PUT | `/api/trackers/:id` | 200 OK | 400 / 404 |
| Delete | DELETE | `/api/trackers/:id` | 204 No Content | 404 Not Found |
| Health | GET | `/health` | 200 (db up) / 503 (db down) | — |
| Stats | GET | `/stats` | 200 OK | — |
| Reset | POST | `/reset` | 200 OK | — |
| Swagger UI | GET | `/docs` | 200 OK | — |

`GET /api/trackers` also supports optional query parameters: `?status=active|paused` (SQL `WHERE` filter) and `?search=keyword` (SQL `ILIKE` on the name, case-insensitive).

## Auth Endpoints (W4)

| Endpoint | Method | Auth Required | Success | Errors |
|----------|--------|---------------|---------|--------|
| `/auth/signup` | POST | No | 201 + user object | 400 (missing email/password) |
| `/auth/login` | POST | No | 200 + `{ accessToken, refreshToken }` | 400 / 401 (invalid credentials) |
| `/auth/logout` | POST | **Yes** (Bearer) | 204 (no content) | 401 (missing/invalid token) |
| `/public/info` | GET | No | 200 + welcome message | — |
| `/protected/profile` | GET | **Yes** (Bearer) | 200 + `{ id, email, created_at }` | 401 (missing/invalid token) |
| `/protected/dashboard` | GET | **Yes** (Bearer) | 200 + dashboard + user | 401 (missing/invalid token) |

## Seed Data

On first run, the database is seeded with 3 trackers (only if the table is empty — restarting does not duplicate them):

| id | name | url | targetSelector | frequency | status |
|----|------|-----|----------------|-----------|--------|
| 1 | Tech Store Headphones | `https://site1.com/p1` | `.price` | daily | active |
| 2 | Marketplace Monitor | `https://site2.com/p2` | `#price-tag` | hourly | active |
| 3 | Boutique Retailer | `https://site3.com/p3` | `span.amount` | weekly | paused |

The three seed inserts run inside a single **transaction**, so seeding is all-or-nothing. Two indexes are also created on startup: `idx_trackers_status` and `idx_trackers_name`.

## Sample curl Output

### GET /api/trackers — List all trackers

```bash
curl -i http://localhost:3000/api/trackers
```

```http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

[
  {"id":1,"name":"Tech Store Headphones","url":"https://site1.com/p1","targetSelector":".price","frequency":"daily","status":"active"},
  {"id":2,"name":"Marketplace Monitor","url":"https://site2.com/p2","targetSelector":"#price-tag","frequency":"hourly","status":"active"},
  {"id":3,"name":"Boutique Retailer","url":"https://site3.com/p3","targetSelector":"span.amount","frequency":"weekly","status":"paused"}
]
```

### POST /api/trackers — Create a tracker

```bash
curl -i -X POST http://localhost:3000/api/trackers \
  -H "Content-Type: application/json" \
  -d '{"name":"New Tracker","url":"https://example.com/p1","targetSelector":".price"}'
```

```http
HTTP/1.1 201 Created
Content-Type: application/json; charset=utf-8

{"id":4,"name":"New Tracker","url":"https://example.com/p1","targetSelector":".price","frequency":"daily","status":"active"}
```

### DELETE /api/trackers/1 — Delete a tracker

```bash
curl -i -X DELETE http://localhost:3000/api/trackers/1
```

```http
HTTP/1.1 204 No Content
```

### POST /auth/signup — Register a user

```bash
curl -i -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

```http
HTTP/1.1 201 Created
Content-Type: application/json; charset=utf-8

{"id":"e20be2ee-...","email":"test@example.com","created_at":"2026-08-06T17:37:36.873417Z"}
```

### POST /auth/login — Get tokens

```bash
curl -i -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

```http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{"accessToken":"eyJhbGciOi...","refreshToken":"htjgt2vj6lkd"}
```

### GET /protected/profile — Use the token

```bash
curl -i http://localhost:3000/protected/profile \
  -H "Authorization: Bearer eyJhbGciOi..."
```

```http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{"id":"e20be2ee-...","email":"test@example.com","created_at":"2026-08-06T17:37:36.873417Z"}
```
