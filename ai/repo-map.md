# Repository map (where things live)

- Focus: *where* code/config/tests live.
- For *how to run checks*: see `ai/testing-quality.md`.

## Stack overview

React 19 SPA (Vite 7) with Zustand 5 state management. Server-side: Hono 4 API on Node.js, PostgreSQL 16, Better Auth. PGlite (in-browser PostgreSQL WASM) is legacy — residual files in `src/db/` power the LOTR seed/demo and pure JS computations only. Prod deployment via Docker Compose + Traefik + nginx. Full stack details in `ai/index.md` § 6.

## Key folders

```
/                           Root — config, Docker, Makefile
├── src/                    Frontend source (React SPA)
│   ├── App.jsx             Root component: routing, layout, guards
│   ├── main.jsx            Vite entry point, renders <App>
│   ├── index.css            Global styles (Tailwind directives)
│   ├── api/                API client layer
│   │   ├── client.js              Fetch wrapper for server API
│   │   └── importFromAiOutputViaApi.js   AI import via server endpoint
│   ├── lib/
│   │   └── authClient.js          Better Auth React client (baseURL = VITE_API_URL)
│   ├── components/         UI components, one subfolder per domain
│   │   ├── arc/            Emotional arc charts
│   │   ├── dashboard/      NarrativeDashboard, StatCard, CircularGauge
│   │   ├── graph/          EntityGraph (D3/SVG relation graph)
│   │   ├── incoherences/   IncoherencesBrowser, cards, fix actions
│   │   ├── lore/           LoreBrowser, CharacterCard, LocationCard, EntityEditor
│   │   ├── map/            AtlasMapView, MapCanvas, JourneyEditor
│   │   ├── nav/            TopNav, NavDropdown, ProjectPicker
│   │   ├── savethecat/     Save the Cat beats (BeatRow, Frise)
│   │   ├── search/         GlobalSearch (Ctrl+K)
│   │   ├── timeline/       TimelineBrowser, EventCard, ArcStrip
│   │   ├── tour/           Guided tour overlay
│   │   └── ui/             Shared primitives: Button, DarkCard, SidePanel, EmptyState…
│   ├── pages/              Route-level page components
│   │   ├── auth/           LoginPage, RegisterPage, VerifyEmailPage, ForgotPasswordPage, ResetPasswordPage
│   │   ├── EmotionalArc.jsx
│   │   ├── HeroJourney.jsx
│   │   ├── PlantsBrowser.jsx
│   │   ├── ReviewPage.jsx
│   │   └── ThreadsBrowser.jsx
│   ├── stores/             Zustand stores (one file per domain)
│   │   ├── createEntityStore.js   Store factory for CRUD entity stores
│   │   ├── useVolumeStore.js      Volumes + activeVolumeId (global tome filter)
│   │   ├── useLoreStore.js        Characters, locations, objects
│   │   ├── useTimelineStore.js    Timeline events
│   │   ├── useStcStore.js         Save the Cat chapters
│   │   ├── useMapStore.js         Map journeys
│   │   ├── useArcStore.js         Emotional arc points
│   │   ├── useIncStore.js         Incoherences
│   │   ├── useNotesStore.js       Chapter notes
│   │   ├── useCharacterArcStore.js  Character arc axes + points
│   │   ├── usePlantStore.js       Plant/payoff tracker
│   │   ├── useThreadStore.js      Narrative threads (subplots)
│   │   ├── useHeroJourneyStore.js Hero's Journey entries
│   │   └── useTourStore.js        Tour state
│   ├── db/                 PGlite database layer (in-browser)
│   │   ├── ProjectContext.jsx     React context providing DB instance
│   │   ├── queries.js            SQL queries, CRUD, computed data
│   │   ├── seed.generic.js       Generic seeder (INSERT from structured data)
│   │   ├── seed.lotr.js          LOTR demo: merges T1+T2 data, calls seed.generic
│   │   ├── createEmptyProject.js  Blank project scaffold
│   │   ├── importFromAiOutput.js  Parse AI JSON output → normalize → seed
│   │   ├── importFromBackup.js    Restore from atlas_*.json export
│   │   ├── exportProject.js       Export project to JSON
│   │   ├── detectIncoherences.js  Automated incoherence detection
│   │   └── *.test.js             Tests for each module above
│   ├── data/               Static data and config
│   │   ├── analysis_prompt.js     AI analysis prompt (defines expected JSON output)
│   │   ├── lotr_seed_data.js      LOTR Tome 1 seed data
│   │   ├── lotr_t2_seed_data.js   LOTR Tome 2 seed data
│   │   ├── beats_config.js        Save the Cat beat definitions
│   │   ├── hero_journey_config.js Hero's Journey step definitions
│   │   ├── outcome_config.js      Outcome labels/colors
│   │   ├── severity_config.js     Incoherence severity levels
│   │   └── tour_steps.js          Guided tour step definitions
│   ├── hooks/              Custom React hooks
│   │   ├── useDragScroll.js       Drag-to-scroll behavior
│   │   └── useVolumeFilter.js     Volume filtering hook
│   ├── utils/              Pure utility functions
│   │   ├── entityUtils.js         Entity helpers (ID gen, display)
│   │   ├── buildGraph.js          Graph data builder for EntityGraph
│   │   ├── arcUtils.js            Arc computation helpers
│   │   ├── coverageUtils.js       Coverage calculations
│   │   ├── journeyUtils.js        Hero's Journey helpers
│   │   ├── reviewUtils.js         Review page helpers
│   │   ├── color.js               Color utilities
│   │   └── *.test.js              Tests for each util
│   └── assets/             Static assets (images, SVG)
├── server/                 Backend API (Hono on Node.js)
│   ├── src/
│   │   ├── index.js        Server entry point
│   │   ├── auth.js         Better Auth config
│   │   ├── db.js           PostgreSQL connection (pg pool)
│   │   ├── db-queries.js   Server-side SQL queries
│   │   ├── seed.js         Server-side seeder
│   │   ├── routes/         API route handlers
│   │   │   └── api.js      Main API routes
│   │   └── middleware/      Express-style middleware
│   ├── db/
│   │   └── init.sql        Server PostgreSQL schema (source of truth for prod DB)
│   ├── Dockerfile          Server Docker image
│   └── package.json        Server dependencies
├── public/                 Static files served as-is (favicon, OG image, robots.txt, sitemap)
├── ai/                     AI context documentation (English)
│   ├── index.md            Entry point for AI agents
│   ├── repo-map.md         This file
│   ├── coding-rules.md     Code style and conventions
│   ├── testing-quality.md  Test strategy and checklist
│   ├── decisions.md        Architecture decision records
│   ├── glossary.md         Domain glossary
│   ├── inconsistencies-tech-debt.md  Known issues
│   ├── docs/               Detailed documentation (stack, routes, data-layer, components)
│   ├── architecture/       Architecture diagrams/overviews
│   ├── agents/             AI agent prompts
│   ├── operations/         Debug, deploy, MCP server docs
│   ├── reports/            Agent-generated reports
│   ├── templates/          File templates
│   └── tech-debt/          Tech debt tracking
├── .github/workflows/      CI/CD
│   ├── ci.yml              Lint + test on PR
│   └── deploy.yml          Deploy to VPS via SSH
└── todo/                   Task tracking
```

## Primary entrypoints

| File | Role |
|------|------|
| `src/main.jsx` | Vite/React entry — mounts `<App>` |
| `src/App.jsx` | Root component: all routes, layout, auth guards |
| `server/src/index.js` | Hono API server entry |
| `index.html` | SPA HTML shell (Vite injects `main.jsx`) |
| `src/db/ProjectContext.jsx` | PGlite DB provider — wraps app with DB access |
| `src/db/queries.js` | All client-side SQL (CRUD, computed) |
| `src/data/analysis_prompt.js` | AI analysis prompt — defines import contract |
| `server/db/init.sql` | Server DB schema (prod source of truth) |

## Config files

| File | Purpose |
|------|---------|
| `vite.config.js` | Vite config (COOP/COEP headers for SharedArrayBuffer) |
| `tailwind.config.js` | Tailwind CSS config |
| `postcss.config.js` | PostCSS plugins |
| `eslint.config.js` | ESLint 9 flat config |
| `package.json` | Frontend dependencies + scripts |
| `server/package.json` | Server dependencies |
| `Makefile` | Dev/prod Docker Compose shortcuts |
| `docker-compose.dev-full.yml` | Dev stack (Postgres + API + frontend) |
| `docker-compose.prod.yml` | Prod stack (Traefik + nginx + API + Postgres) |
| `Dockerfile.prod` | Frontend prod Docker image |
| `nginx.prod.conf` | nginx reverse proxy config (prod) |

## Auto-generated files (do NOT edit manually)

| File/Dir | Generated by |
|----------|-------------|
| `dist/` | `npm run build` (Vite output) |
| `package-lock.json` | `npm install` |
| `server/package-lock.json` | `npm install` (server) |
| `ai/checksums.json` | AI doc tooling |

## Notes
- `README.md` is not guaranteed to be up-to-date; prefer actual config files as source of truth.
- Tests live alongside their source files (`*.test.js` next to the module they test).
- Store files follow naming convention `use<Domain>Store.js`.
