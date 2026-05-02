# Architecture (AI context)

> Folder structure: `ai/repo-map.md`.

## Services

| Service | Technology | Port | Role |
|---------|-----------|------|------|
| **Frontend** | React 19 + Vite 7 | `5173` (dev) | SPA served by Vite dev server; prod built as static files behind nginx |
| **API** | Hono 4 on Node.js 20 | `3001` | REST API — auth, CRUD, project management |
| **Database** | PostgreSQL 16 | `5432` | Persistent storage for all project data |
| **Reverse proxy (prod)** | Traefik v3 | `80` / `443` | TLS termination (Let's Encrypt), routes to nginx |
| **Static + proxy (prod)** | nginx | internal | Serves frontend assets; proxies `/api/` and `/auth/` to Hono |

Dev: frontend connects to API at `http://localhost:3001` via `VITE_API_URL`.
Prod: Traefik → nginx → same-origin for both static and API (no CORS issues).

## Key patterns

### 3-tier client-server

```
React SPA  ──HTTP──▸  Hono API  ──SQL──▸  PostgreSQL
```

No BFF, no GraphQL. Plain REST with JSON payloads.

### Zustand domain stores (1 per domain)

12 stores in `src/stores/`, each following the same shape:

- `load(projectId)` — fetches data from API via `src/api/client.js`
- `save()` / `remove()` — write back through the same client
- Selectors consumed by components via React hooks

A `createEntityStore` factory standardizes CRUD boilerplate.

### API client (`src/api/client.js`)

Single fetch wrapper over `VITE_API_URL`. All requests include:
- `credentials: 'include'` (Better Auth session cookies)
- `X-Device-Id` header (anonymous device tracking)

40+ exported functions mapping 1:1 to REST endpoints (`/api/projects/:projectId/{entity}`).

### Project context (`src/db/ProjectContext.jsx`)

`ProjectProvider` wraps the app and manages `projectId` (persisted to localStorage).
On project switch, `loadAll(projectId)` orchestrates store hydration:
- 5 critical stores loaded first (blocking)
- 6+ secondary stores loaded in parallel (non-blocking)

Stores reset on project change.

### Authentication (Better Auth)

- Email + password, optional Google OAuth (env-gated)
- Server: `server/src/auth.js` — PostgreSQL-backed sessions
- Client: `src/lib/authClient.js` — Better Auth React bindings
- Email delivery: Resend API in prod, console fallback in dev

### Multi-tenancy

API routes extract `userId` (from session) and `deviceId` (from header) via `getContext(c)`.
Projects are scoped to either authenticated user or anonymous device.

### REST API structure

All entity routes follow: `GET|POST /api/projects/:projectId/{entity}`, `GET|PUT|DELETE /api/projects/:projectId/{entity}/:id`.
Defined in `server/src/routes/api.js`, queries in `server/src/db-queries.js`.

## Data flow

```
PostgreSQL 16
    ↑↓  server/src/db-queries.js (pg queries)
Hono API (server/src/routes/api.js)
    ↑↓  HTTP fetch (src/api/client.js)
Zustand stores (src/stores/*.js)
    ↓   React hooks / selectors
Components
```

**Read path:** Component mounts → store `load(projectId)` → client fetch → API query → Postgres → JSON response → store state update → React re-render.

**Write path:** User action → store `save(data)` → client POST/PUT → API upsert → Postgres → store refreshes local state.

**Project load orchestration:** `ProjectProvider.loadAll()` hydrates all 12 domain stores on project switch.

## Legacy / planned migrations

### PGlite (in-browser PostgreSQL WASM) — phased out

Originally the app was offline-first with PGlite (PostgreSQL compiled to WASM, persisted via OPFS). This has been replaced by server-side PostgreSQL 16.

**Current state:**
- No active PGlite imports in application code
- Vite config still includes PGlite-related settings (`optimizeDeps.exclude: ['@electric-sql/pglite']`, `worker.format: 'es'`) — can be cleaned up
- Client-side DB files (`src/db/schema.js`, `src/db/queries.js`) remain for the LOTR seed/demo flow but are not used for live data

**Residual artifacts:** `src/db/` still contains PGlite schema, context, queries, and seed logic. These power the demo seed flow but are not part of the production data path.

### Related docs

- `ai/decisions.md` — intentional architecture choices (PGlite deprecation, Better Auth basePath, store pattern, etc.)
- `ai/inconsistencies-tech-debt.md` — 8 tracked tech debt items (hardcoded defaults, env tracking, console logging, etc.) + 4 known inconsistencies
