# Architecture decisions (why, not what)

This file captures **intentional choices** — patterns that look unusual but are deliberate. It prevents agents from "fixing" things that aren't broken.

## Decisions

| Decision | Why chosen | What NOT to do | Source |
|----------|-----------|---------------|--------|
| PGlite replaced by server-side PostgreSQL 16 | Needed multi-user auth, shared projects, and proper persistence beyond browser storage | Do not re-introduce PGlite for production data; `src/db/` files remain only for LOTR seed/demo flow and pure JS computations (`computeAlerts`) | `ai/docs/stack.md`, `ai/architecture/overview.md` |
| Better Auth `basePath: '/auth'` (not default `/api/auth`) | Keeps auth routes separate from application API routes under `/api/` | Do not change basePath — nginx prod config routes `/auth/**` to the API container based on this | `server/src/auth.js`, `nginx.prod.conf` |
| One Zustand store per domain via `createEntityStore` factory | Standardizes CRUD boilerplate; each store has `load()`, `add()`, `edit()`, `remove()` | Do not create monolithic stores or mix domains; do not bypass `createEntityStore` unless the store needs custom shape (e.g., `useVolumeStore` has `activeVolumeId`) | `src/stores/createEntityStore.js` |
| LOTR demo as seed dataset covering Tomes 1+2 | Every new feature must be illustrated with realistic data; ensures features work with multi-volume projects | Do not remove LOTR seed data; do not add features without updating the seed | `CLAUDE.md`, `src/data/lotr_seed_data.js` |
| No TypeScript, no Prettier | Project uses plain JS + ESLint only; avoids toolchain complexity for a solo/small-team project | Do not add `.ts`/`.tsx` files or Prettier config | `package.json`, `eslint.config.js` |
| `VITE_API_URL=""` in production builds | Empty string makes frontend use relative URLs; nginx proxies `/api/` and `/auth/` to the API container — avoids CORS entirely | Do not set `VITE_API_URL` to an absolute URL in prod Docker builds | `Dockerfile.prod`, `nginx.prod.conf` |
| `src/db/` files kept despite PGlite deprecation | `queries.js` still exports `computeAlerts`/`computeAlertsFromEvents` (pure JS); seed files power the LOTR demo flow; `detectIncoherences.js` runs on store data | Do not delete `src/db/` wholesale; migrate individual functions to server-side as needed | `src/api/client.js` (re-exports), `src/db/seed.lotr.js` |
