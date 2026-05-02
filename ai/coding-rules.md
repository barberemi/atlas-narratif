# Coding rules (AI contract)

> Glossary: `ai/glossary.md`.

## Global

- Prefer smallest diffs. Avoid drive-by refactors.
- Follow existing naming in adjacent code. Avoid generic names (`Helper`, `Utils`).
- **Every change must include tests** — see `ai/testing-quality.md`.

## JavaScript / JSX (Frontend — `src/`)

### Tools

| Tool | Config file | Run command |
|------|------------|-------------|
| **ESLint 9** (linter) | `eslint.config.js` | `npm run lint` |
| **Vitest 4** (test runner) | `vite.config.js` (`test` section) | `npm run test:run` (single) / `npm run test` (watch) |
| **Vite 7** (bundler) | `vite.config.js` | `npm run dev` / `npm run build` |
| **PostCSS** | `postcss.config.js` | runs via Vite |
| **Tailwind CSS 4** | `tailwind.config.js` + `postcss.config.js` (via `@tailwindcss/postcss`) | runs via PostCSS |

No formatter (Prettier) configured. No type checker (plain JS, not TypeScript).

### Conventions

- **One Zustand store per domain** in `src/stores/`. Store file = `use<Domain>Store.js`.
- **ES modules everywhere** (`"type": "module"` in `package.json`). Use `import`/`export`, never `require`.
- **JSX in `.jsx` files only**. Plain logic in `.js`.
- **`no-unused-vars` rule**: uppercase or underscore-prefixed vars are ignored (`varsIgnorePattern: '^[A-Z_]'`, `argsIgnorePattern: '^_'`).
- **Test globals enabled**: `describe`, `it`, `expect` are global (Vitest `globals: true` in `vite.config.js`). No need to import them.

### Common mistakes to avoid

- **(Legacy) Removing COOP/COEP headers**: PGlite is phased out, but `vite.config.js` still sets these headers for the dev server. They can be cleaned up but are harmless.
- **(Legacy) Pre-bundling PGlite**: `@electric-sql/pglite` is excluded from Vite's `optimizeDeps`. This config is residual from the PGlite era.
- **Schema changes without version bump**: any edit to `src/db/schema.js` requires incrementing `SCHEMA_VERSION` (format `'YYYY-MM-DD.N'`), or existing users will not receive migrations. Note: the server schema source of truth is `server/db/init.sql`.

## JavaScript (Server — `server/`)

### Tools

| Tool | Config file | Run command |
|------|------------|-------------|
| **ESLint 9** (shared) | `eslint.config.js` (root — `server/**/*.{js,jsx}` block) | `npm run lint` (from root) |

No dedicated server linter config, formatter, or test runner. The root ESLint config includes a `server/` override that adds Node.js globals alongside browser globals.

### Conventions

- **Hono 4** for routing. Routes defined in `server/src/routes/api.js`.
- **Plain `node` runtime** — no transpilation. Use `node --watch --env-file=.env src/index.js` for dev.
- **PostgreSQL 16** via `pg` / `postgres` drivers. Schema source of truth: `server/db/init.sql`.
- **Auth**: Better Auth configured in `server/src/auth.js`.

### Common mistakes to avoid

- **Importing browser-only code** in `server/`: PGlite, React, Zustand, and anything under `src/` are frontend-only.
- **Missing env vars**: the server reads `.env` via `--env-file`. Forgetting a required variable causes silent `undefined` at runtime.
