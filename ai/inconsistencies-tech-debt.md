# Tech debt (index)

> Do not refactor items listed here without reading their detail file first.

Track-only list. Prevents AI from doing large refactors without context.
Details in `ai/tech-debt/TD-YYYYMMDD-slug.md` (use today's date for YYYYMMDD).

**To add:** create detail file, add one-line entry below.

**Detail file example** (`ai/tech-debt/TD-20260315-hardcoded-secret.md`):
- **ID**: TD-20260315-hardcoded-secret
- **Area**: Backend
- **Severity**: Critical
- **Problem**: API key hardcoded in `src/config.rs:42`
- **Impact**: security — key exposed in version control
- **Where**: `src/config.rs:42`, `src/payments/client.rs:15`
- **Suggested fix**: Move to environment variable
- **Next step**: create ticket

**Severity scale:**
- **Critical** — security risk or data loss
- **High** — blocks production readiness
- **Medium** — developer friction or performance degradation
- **Low** — cosmetic or minor improvement

## Outdated dependencies

No outdated dependencies detected as of 2026-04-14. All major deps are on current major versions:

| Component | Current | Status | Risk |
|-----------|---------|--------|------|
| React | ^19.2.0 | Current | None |
| React Router | ^7.13.1 | Current | None |
| Vite | ^7.3.1 | Current | None |
| Zustand | ^5.0.12 | Current | None |
| PGlite | ^0.4.1 | Current | None |
| Tailwind CSS | ^4.2.1 | Current | None |
| ESLint | ^9.39.1 | Current (flat config) | None |
| Vitest | ^4.1.1 | Current | None |
| better-auth | ^1.5.6 | Current | Version drift risk (see TD-20260414-better-auth-version-drift) |

## Current list

| ID | Problem | Area | Severity |
|----|---------|------|----------|
| [TD-20260414-hardcoded-lotr-default](tech-debt/TD-20260414-hardcoded-lotr-default.md) | 18 query functions default `projectId` to `'lotr'` — silent wrong-project reads | Data layer | High |
| [TD-20260414-env-tracked](tech-debt/TD-20260414-env-tracked.md) | `.env` tracked in git; missing from `.gitignore` | DevOps | Medium |
| [TD-20260414-hardcoded-localhost](tech-debt/TD-20260414-hardcoded-localhost.md) | 3 files fallback to `localhost:3001` when `VITE_API_URL` is unset | Config | Medium |
| [TD-20260414-console-log-auth](tech-debt/TD-20260414-console-log-auth.md) | 8 console statements in `server/src/auth.js` log PII and verification URLs | Server / Security | Medium |
| [TD-20260414-no-error-boundary](tech-debt/TD-20260414-no-error-boundary.md) | No React Error Boundary around lazy-loaded routes — white screen on chunk failure | Frontend / UX | Medium |
| [TD-20260414-better-auth-version-drift](tech-debt/TD-20260414-better-auth-version-drift.md) | Frontend and server can resolve different better-auth versions independently | Dependencies | Medium |
| [TD-20260414-source-case-duplication](tech-debt/TD-20260414-source-case-duplication.md) | `SOURCE_CASE` SQL fragment duplicated across client and server query files | Data layer | Low |
| [TD-20260414-lotr-check-in-app](tech-debt/TD-20260414-lotr-check-in-app.md) | `App.jsx` hardcodes `startsWith('lotr')` check for demo project | Frontend | Low |

## Inconsistencies

1. **Client vs server query defaults**: `src/db/queries.js` defaults `projectId` to `'lotr'` on 18 functions. `server/src/db-queries.js` requires explicit `projectId` everywhere. The server pattern is correct.

2. **Client vs server SQL library**: Client uses PGlite `db.query()` with `$1, $2` positional params. Server uses postgres.js tagged template literals (`sql\`...\``). Both are parameterized (safe), but the divergence makes shared logic impossible.

3. **No startup env validation**: Frontend reads `VITE_API_URL` at 3 separate import sites with identical fallbacks. No central config or validation. Server has similar pattern with `process.env` reads scattered across files.

4. **Logging inconsistency**: Server uses raw `console.log/warn/error` with no level filtering. Some messages are informational (startup config), others are sensitive (email addresses, verification URLs). No structured logging library.
