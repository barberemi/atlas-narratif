# Debug & operations (AI reference)

## Common commands

### Frontend (root directory)

| Command | What it does |
|---------|-------------|
| `npm install` | Install frontend dependencies |
| `npm run dev` | Vite dev server on port 5173 |
| `npm run build` | Production build (outputs to `dist/`) |
| `npm run preview` | Serve production build locally |
| `npm run lint` | ESLint |
| `npm run test` | Vitest in watch mode |
| `npm run test:run` | Vitest single run (CI-friendly) |

### API server (`server/` directory)

| Command | What it does |
|---------|-------------|
| `cd server && npm install` | Install API dependencies |
| `node --watch --env-file=.env src/index.js` | Run Hono API with hot reload (from `server/`) |

### Makefile shortcuts (from project root)

| Command | What it does |
|---------|-------------|
| `make dev` | Start full dev stack (Postgres + API + Frontend) via Docker Compose |
| `make stop` | Stop dev stack |
| `make logs` | Tail logs for all dev services |
| `make logs-s s=api` | Tail logs for a specific service (`api`, `frontend`, `postgres`) |
| `make dev-rebuild` | Rebuild and restart dev stack (use after dependency changes) |
| `make lint` | Run ESLint |
| `make test` | Run Vitest (single run) |
| `make build` | Production build (frontend only) |
| `make prod-up` | Build and start prod stack (Traefik + nginx + API + Postgres) |
| `make prod-down` | Stop prod stack |
| `make prod-logs` | Tail prod logs |
| `make prod-backup` | Dump prod Postgres DB to `backups/atlas_YYYYMMDD_HHMMSS.sql.gz` |

## Docker services

### Dev stack (`docker-compose.dev-full.yml`)

| Service | Image | Port | Role | Health check |
|---------|-------|------|------|-------------|
| `postgres` | `postgres:16-alpine` | 5432 | PostgreSQL database | `pg_isready -U atlas` (5s interval, 5 retries) |
| `api` | `node:20-alpine` | 3001 | Hono API server (hot reload via `node --watch`) | None |
| `frontend` | `node:20-alpine` | 5173 | Vite dev server | None |

Dev DB credentials: user `atlas`, password `atlas_dev`, database `atlas`.

The API container auto-installs deps on start (`npm install --silent && node --watch src/index.js`). Schema is initialized from `server/db/init.sql` via Docker entrypoint.

### Prod stack (`docker-compose.prod.yml`)

| Service | Image / Build | Port | Role |
|---------|---------------|------|------|
| `traefik` | `traefik:v3` | 80, 443 | Reverse proxy + TLS (Let's Encrypt HTTP challenge) |
| `frontend` | `Dockerfile.prod` (multi-stage: node build + nginx) | 80 (internal) | Serves SPA + proxies `/api/` and `/auth/` to API |
| `api` | `server/Dockerfile` (node:20-alpine) | 3001 (internal) | Hono API |
| `postgres` | `postgres:16-alpine` | — (not exposed) | PostgreSQL |

Prod requires `.env.prod` with: `DOMAIN`, `ACME_EMAIL`, `POSTGRES_PASSWORD`, `BETTER_AUTH_SECRET`, and optionally `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `RESEND_API_KEY`, `EMAIL_FROM`.

## Troubleshooting

### PGlite / SharedArrayBuffer not working in browser

**Symptom:** PGlite fails to initialize; console errors about `SharedArrayBuffer` being undefined.
**Cause:** Missing COOP/COEP headers. SharedArrayBuffer requires `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: credentialless`.
**Fix:** These headers are set in `vite.config.js` for dev. For prod, verify `nginx.prod.conf` sets them. If using a proxy or CDN, ensure headers are not stripped.

### Dev stack: API cannot connect to Postgres

**Symptom:** API crashes with connection refused on startup.
**Cause:** Postgres is not yet healthy when API starts.
**Fix:** The compose file uses `depends_on.condition: service_healthy`. If still failing, run `make logs-s s=postgres` to check if Postgres is stuck. Try `make stop && make dev` to restart cleanly.

### Dev stack: frontend HMR not working

**Symptom:** File changes don't trigger hot reload in the browser.
**Cause:** Docker volume polling misconfiguration or wrong HMR host.
**Fix:** `vite.config.js` enables polling (`usePolling: true`, 100ms interval) and sets `hmr.host: 'localhost'`. If on a non-localhost setup, check that port 5173 is accessible and not blocked by firewall.

### `npm run dev` fails with port already in use

**Symptom:** `EADDRINUSE` on port 5173 or 3001.
**Cause:** A previous dev server or Docker container is still running.
**Fix:** Run `make stop` to kill Docker containers, or `lsof -i :5173` / `lsof -i :3001` to find and kill the process.

### Tests fail after schema change

**Symptom:** Test errors about missing columns or tables.
**Cause:** `SCHEMA_VERSION` in `src/db/schema.js` was not incremented.
**Fix:** Bump `SCHEMA_VERSION` (format `'YYYY-MM-DD.N'`). This triggers `applySchema()` to re-run at startup.

### Prod deploy: Traefik not issuing TLS cert

**Symptom:** HTTPS not working, browser shows insecure connection.
**Cause:** DNS not pointing to the VPS, or port 80 blocked (needed for HTTP challenge).
**Fix:** Verify DNS A record points to the server IP. Ensure port 80 is open. Check `make prod-logs` for Traefik ACME errors.

### Prod build: `VITE_API_URL` confusion

**Symptom:** Frontend tries to call `localhost:3001` in production.
**Cause:** `VITE_API_URL` was set at build time instead of being empty.
**Fix:** In prod, `VITE_API_URL` must be empty (`""`) so the frontend uses relative URLs. nginx proxies `/api/` and `/auth/` to the API container. This is the default in `Dockerfile.prod`.
