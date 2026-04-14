# AI context — Entry point

**Project:** Atlas Narratif — Narrative analysis and construction tool for authors. React 19 SPA + Hono API + PostgreSQL 16.

**Working language:** French (code comments, commit messages, UI strings are in French; `ai/` files are in English)

> **Rules:** All `ai/` files in English. Never hallucinate — check docs, then ask user. Update `ai/` after learning something new.
> **MCP:** Before calling any MCP tool, read `ai/operations/mcp-servers/<name>.md` if it exists.

---

## 1. Context loading (mandatory)

**Tier 1 — Always:** `ai/index.md` (this file). Sufficient for trivial tasks.

**Common tasks — load exactly:**

| Task | Files |
|------|-------|
| DB schema / queries / stores | `ai/repo-map.md`, `ai/coding-rules.md` |
| Fix a test | `ai/testing-quality.md` |
| New feature (component, route, store) | `ai/architecture/overview.md`, `ai/repo-map.md` |
| Debug / deploy / Docker | `ai/operations/debug-operations.md` |

**Tier 2 — Max 3 files if above doesn't cover:**

| Need | File |
|------|------|
| Repo structure | `ai/repo-map.md` |
| Testing | `ai/testing-quality.md` |
| Coding rules | `ai/coding-rules.md` |
| Known issues | `ai/inconsistencies-tech-debt.md` |
| Architecture decisions | `ai/decisions.md` |
| Glossary | `ai/glossary.md` |

**Tier 3:** Only if Tier 1+2 insufficient. State which file and why. Never load all files.

---

## 2. DO NOT (critical)

- **Modify `src/db/schema.js` without incrementing `SCHEMA_VERSION`** — existing users won't receive migrations otherwise. Format: `'YYYY-MM-DD.N'`.
- **Add features/tables without updating the LOTR seed data** — every new feature must be illustrated in `lotr_seed_data.js` / `lotr_t2_seed_data.js` and inserted via `seed.generic.js`.
- **Change the data model without updating `analysis_prompt.js`** — the AI analysis prompt must stay in sync with schema, `importFromAiOutput.js`, `seed.generic.js`, and `queries.js`.
- **Guess** when info is missing — say `NOT_FOUND` and ask the user.
- **Invent file paths** — if you don't know where code goes, check `ai/repo-map.md` or ask.
- **Guess tool versions** — check § 3 Prerequisites below.
- **Guess languages or frameworks** — check § 6 Stack.
- **Edit auto-generated files** — if a file is marked as generated, never edit it by hand.
- **Load all Tier 2 files at once** — max 3, pick what you need.
- **Modify business code** when the task is only about AI context — edit `ai/` only.
- **Skip tests** — every code change requires tests. See § 4.

---

## 3. Prerequisites

- **Node.js 20+** (used in CI and server runtime)
- **npm** (package manager, lockfile committed)
- **Docker + Docker Compose** (required for PostgreSQL in dev and full prod stack)

| Command | What it does |
|---------|-------------|
| `npm install` | Install frontend dependencies |
| `npm run dev` | Vite dev server on port 5173 |
| `npm run build` | Production build (frontend) |
| `npm run lint` | ESLint |
| `npm run test:run` | Vitest (single run) |
| `npm run test` | Vitest (watch mode) |
| `make dev` | Docker Compose full dev stack (Postgres + API + frontend) |
| `make stop` | Stop dev stack |
| `make prod-up` | Build and start prod stack (Traefik + nginx + API + Postgres) |

Server (`server/`):
| Command | What it does |
|---------|-------------|
| `cd server && npm install` | Install API dependencies |
| `node --watch --env-file=.env src/index.js` | Run API with hot reload |

---

## 4. Constraints

- If no command output: ask user to paste it.
- Every modification to `src/db/` must be covered by a test. Run `npm run test:run` and fix failures before considering a task done.
- Any schema change requires: bump `SCHEMA_VERSION` in `schema.js`, update LOTR seed, update `analysis_prompt.js` if the field is importable, and update `ai/docs/data-layer.md`.

### Testing rule (mandatory)

**Every code change MUST include tests.** No exceptions. Details and checklist: `ai/testing-quality.md`.

---

## 5. Source of truth

| What | File(s) |
|------|---------|
| AI context | `ai/` |
| DB schema (server, prod) | `server/db/init.sql` |
| DB schema (client, PGlite) | `src/db/schema.js` |
| SQL queries & CRUD | `src/db/queries.js` |
| API routes | `server/src/routes/api.js` |
| Auth config | `server/src/auth.js`, `src/lib/authClient.js` |
| Frontend routing | `src/App.jsx` |
| AI analysis prompt | `src/data/analysis_prompt.js` |
| Seed data (LOTR demo) | `src/data/lotr_seed_data.js`, `src/data/lotr_t2_seed_data.js`, `src/db/seed.lotr.js` |
| Generic seeder | `src/db/seed.generic.js` (client), `server/src/seed.js` (server) |
| Docker (dev) | `docker-compose.dev-full.yml` |
| Docker (prod) | `docker-compose.prod.yml`, `Dockerfile.prod`, `server/Dockerfile` |
| CI | `.github/workflows/ci.yml` |
| CD | `.github/workflows/deploy.yml` |

---

## 6. Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | React + React Router | 19 / v7 |
| Bundler | Vite | 7 |
| State management | Zustand | 5 |
| In-browser DB (legacy/offline) | PGlite (PostgreSQL WASM) | 0.4 |
| Styling | Tailwind CSS | 4 |
| API server | Hono (on Node.js) | 4 |
| Database (server) | PostgreSQL | 16 |
| Auth | Better Auth | 1.5 |
| Email | Resend | 6 |
| Testing | Vitest + @testing-library/react | 4 / 16 |
| Linting | ESLint | 9 |
| CI/CD | GitHub Actions → SSH deploy to VPS | — |
| Reverse proxy (prod) | Traefik v3 + nginx | — |
| Containerization | Docker + Docker Compose | — |

**Key patterns:**
- One Zustand store per domain (`src/stores/`)
- Dark theme, primary color `#3F51B5` (indigo)
- `COOP/COEP` headers set in Vite config for SharedArrayBuffer (PGlite WASM)
- Frontend talks to API via `src/api/client.js`; auth via Better Auth React client
- Prod: Traefik handles TLS (Let's Encrypt), nginx proxies `/api/` and `/auth/` to Hono

---

## 7. Code placement

New code placement: see `ai/repo-map.md`.

---

## 8. Code generation

- Search repo for similar implementations first.
- Use `ai/repo-map.md` for file placement.
- Missing/ambiguous info → say `NOT_FOUND`, ask. Never guess.
- Large refactor needed → add entry to `ai/inconsistencies-tech-debt.md`.
- **Write tests for every change** — see § 4. No exceptions.
- After task: update `ai/` if you learned something non-obvious.

---

## 9. Multi-agent config

Redirectors: `CLAUDE.md`, `GEMINI.md`, `AGENTS.md`, `.kiro/steering/instructions.md`, `.vibe/instructions.md`, `.cursorrules`, `.cursor/rules/repo-instructions.mdc`, `.github/copilot-instructions.md`, `.windsurfrules`, `.clinerules`.

**Maintenance rule**: all content lives in `ai/`. Redirectors contain a summary of critical rules + pointer to `ai/index.md` as source of truth.

---

## 10. Last updated

AI context last reviewed: **2026-04-14**.
