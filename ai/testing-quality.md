# Testing & quality

> **Rule: every code change MUST include tests.** See `ai/index.md` § 4.

## Build checks

CI runs on every push and every PR to `main` (`.github/workflows/ci.yml`). Three quality gates, all must pass:

| Step | Command | Blocks merge? |
|------|---------|---------------|
| Lint | `npm run lint` | Yes |
| Tests | `npm run test:run` | Yes |
| Build | `npm run build` | Yes |

No type-checking gate (project is plain JS, no TypeScript).

## Test infrastructure

| Item | Value |
|------|-------|
| Runner | **Vitest 4** |
| Config | `vite.config.js` → `test` block (inline, no separate vitest config) |
| Environment | `jsdom` |
| Globals | `true` (`describe`, `it`, `expect` available without import) |
| Setup file | None |
| Node version (CI) | 20 |
| DOM utilities | `@testing-library/react` 16 |

Commands:

| Command | Purpose |
|---------|---------|
| `npm run test:run` | Single run (CI, pre-commit) |
| `npm run test` | Watch mode (development) |

## Test suites

### Database layer (`src/db/`)

| File | Scope |
|------|-------|
| `src/db/queries.test.js` | STC computations, alerts |
| `src/db/detectIncoherences.test.js` | Incoherence detection logic |
| `src/db/exportProject.test.js` | Project export |
| `src/db/importFromBackup.test.js` | Backup import |
| `src/db/createEmptyProject.test.js` | Empty project creation |

### Stores (`src/stores/`)

| File | Scope |
|------|-------|
| `src/stores/createEntityStore.test.js` | Generic entity store factory |
| `src/stores/useArcStore.test.js` | Emotional arc store |
| `src/stores/useCharacterArcStore.test.js` | Character arc store |
| `src/stores/useIncStore.test.js` | Incoherences store |
| `src/stores/useLoreStore.test.js` | Lore (characters, locations, objects) store |
| `src/stores/useMapStore.test.js` | Map journeys store |
| `src/stores/useNotesStore.test.js` | Chapter notes store |

### Utilities (`src/utils/`)

| File | Scope |
|------|-------|
| `src/utils/arcUtils.test.js` | Arc computation helpers |
| `src/utils/buildGraph.test.js` | Entity graph builder |
| `src/utils/color.test.js` | Color utilities |
| `src/utils/coverageUtils.test.js` | Coverage calculation |
| `src/utils/entityUtils.test.js` | Entity helpers |
| `src/utils/journeyUtils.test.js` | Journey computation |
| `src/utils/reviewUtils.test.js` | Review helpers |

### Hooks (`src/hooks/`)

| File | Scope |
|------|-------|
| `src/hooks/useDragScroll.test.js` | Drag-scroll hook |

## What to test (by change type)

| Change type | Required tests | Where |
|-------------|---------------|-------|
| `src/db/queries.js` (CRUD, mapping) | Unit tests for new/changed queries | `src/db/queries.crud.test.js` or `src/db/queries.test.js` |
| `src/db/detectIncoherences.js` | Regression + edge cases | `src/db/detectIncoherences.test.js` |
| `src/db/exportProject.js` / `importFromBackup.js` | Round-trip tests | Matching `.test.js` files |
| New Zustand store | CRUD actions, selectors | `src/stores/<storeName>.test.js` |
| New utility function | Unit test (happy + error + edge) | `src/utils/<utilName>.test.js` |
| Bug fix | Regression test that fails without the fix | Relevant test file |
| React component | Not required unless logic is non-trivial and extractible |

## Test quality checklist

Before declaring a task done:
- [ ] Tests cover the **happy path**
- [ ] Tests cover at least one **error path** (invalid input, missing data)
- [ ] Tests cover **edge cases** (empty, unicode, large input)
- [ ] Assertions are **meaningful** (not just "renders" or "is defined")
- [ ] Mocks match **real API shapes** (check generated types)
- [ ] No **flaky** tests (no sleeps, no timing assumptions)
- [ ] Full test suite passes (`npm run test:run`)
- [ ] If a test is flaky, **fix the root cause** — do not add retries

## Coverage

No coverage threshold configured. Vitest supports `--coverage` but it is not wired into `package.json` scripts or CI.

## NOT tested (known gaps)

- React components (`src/components/`, `src/pages/`) — no component tests
- `src/db/schema.js` — schema application not tested in isolation
- `src/db/seed.generic.js` / `src/db/seed.lotr.js` — seeding logic not unit-tested
- `src/data/analysis_prompt.js` — prompt template not validated
- `src/lib/authClient.js` — auth client not tested
- `src/api/client.js` — API client not tested
- `queries.crud.test.js` referenced in `CLAUDE.md` does not exist yet
- Stores without tests: `useVolumeStore`, `useStcStore`, `usePlantStore`, `useThreadStore`, `useHeroJourneyStore`

## Smoke checks (pre-commit)

```bash
npm run lint && npm run test:run && npm run build
```

Same sequence as CI. If all three pass locally, the CI pipeline will pass.
