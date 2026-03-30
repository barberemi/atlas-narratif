# Atlas Narratif — Contexte IA

Outil d'analyse et de construction narrative pour auteurs. SPA React, 100% in-browser.

## Stack (résumé)
- **React 19** + **React Router v7** + **Vite 7**
- **Zustand 5** — state management (un store par domaine)
- **PGlite 0.4** — PostgreSQL in-browser via WASM + OPFS (persistance locale)
- **Anthropic SDK** — analyse IA de manuscrits (claude-sonnet / opus / haiku)
- **Tailwind CSS 4** — dark theme, couleur principale `#3F51B5` (indigo)

→ Détails : `ai/docs/stack.md`

## Routes
| Path | Composant | Rôle |
|------|-----------|------|
| `/` | `HomePage` (App.jsx) | Onboarding : créer ou importer un projet |
| `/review` | `ReviewPage` | Validation après import IA |
| `/dashboard` | `NarrativeDashboard` | Stats, recommandations, incohérences |
| `/map` | `AtlasMapView` | Carte interactive + trajets personnages |
| `/lore` | `LoreBrowser` | Base lore : personnages, lieux, objets |
| `/relations` | `EntityGraph` | Graphe de relations entre entités |
| `/timeline` | `TimelineBrowser` | Timeline narrative par chapitre |
| `/savethecat` | `SaveTheCat` | Structure Save the Cat (15 beats) |
| `/arc` | `EmotionalArc` | Arc émotionnel par chapitre |
| `/plants` | `PlantsBrowser` | Tracker plant / payoff (amorces narratives) |
| `/threads` | `ThreadsBrowser` | Gestion des fils narratifs (subplots) |
| `/heros` | `HeroJourney` | Voyage du Héros — 12 étapes de Joseph Campbell |
| `/incoherences` | `IncoherencesBrowser` | Détection et résolution d'incohérences |

Routes protégées par `<RequireProject>` → redirige vers `/` si aucun projet chargé.

→ Détails : `ai/docs/routes.md`

## Couche données
**Architecture** : `PGlite (WASM worker)` → `DbContext` (React context) → `stores Zustand` → composants

**Stores** (src/stores/) :
- `useLoreStore` — personnages, lieux, objets
- `useTimelineStore` — événements timeline
- `useStcStore` — chapitres Save the Cat
- `useMapStore` — trajets carte
- `useArcStore` — arc émotionnel
- `useIncStore` — incohérences
- `useNotesStore` — notes libres par chapitre
- `useCharacterArcStore` — axes d'évolution + points par personnage
- `usePlantStore` — amorces narratives (plant / payoff)
- `useThreadStore` — fils narratifs (subplots)
- `useHeroJourneyStore` — étapes du Voyage du Héros

**Tables SQL principales** : `projects`, `characters`, `locations`, `objects`, `timeline_events`, `event_entities`, `incoherences`, `stc_chapters`, `arc_points`, `character_journeys`, `chapter_notes`, `character_arc_axes`, `character_arc_points`, `plant_payoffs`, `narrative_threads`, `groups`, `character_groups`, `hero_journey_entries`

→ Détails : `ai/docs/data-layer.md`

## Structure src/
```
src/
├── App.jsx              # Routing, layout, guards
├── components/
│   ├── dashboard/       # NarrativeDashboard, StatCard, CircularGauge
│   ├── graph/           # EntityGraph (D3 ou SVG)
│   ├── incoherences/    # IncoherencesBrowser, IncoherenceCard, FixButton
│   ├── lore/            # LoreBrowser, CharacterCard, LocationCard, EntityEditor
│   ├── map/             # AtlasMapView, MapCanvas, JourneySidebar
│   ├── nav/             # TopNav, NavDropdown, ProjectPicker
│   ├── savethecat/      # SaveTheCat, BeatRow, Frise
│   ├── search/          # GlobalSearch (Ctrl+K)
│   ├── timeline/        # TimelineBrowser, EventCard, ArcStrip
│   ├── ui/              # Button, DarkCard, SidePanel, SourceBadge…
│   └── upload/          # FilePicker (drag-drop)
├── pages/               # EmotionalArc, ReviewPage
├── stores/              # Zustand stores (1 fichier par domaine)
├── db/                  # PGlite : schema, queries, import, export, contexts
├── hooks/               # Custom React hooks
└── utils/               # entityUtils, etc.
```

→ Détails composants : `ai/docs/components.md`

## Flux principaux
1. **Import manuscrit** : `FilePicker` → `analyzeAndImport()` (appel Anthropic) → DB → `/review`
2. **Construction** : créer projet vide → `/savethecat` → saisie manuelle
3. **Restauration** : fichier `atlas_*.json` → `importFromBackup()` → `/dashboard`
4. **Navigation cross-vue** : les routes se passent des query params (`?tab=`, `?entity=`, `?filter=`)

## Fichiers IA
- `ai/agents/` — prompts des agents d'analyse (cohérence, product, refactoring…)
- `ai/reports/` — rapports générés par ces agents
- `ai/docs/` — cette documentation (générée pour le contexte IA)

## Commandes utiles
```bash
npm run dev      # Dev server (port 5173)
npm run build    # Production build
npm run lint     # ESLint
docker compose up  # Prod via Docker
```

## Maintenance de la documentation IA

**Règle : toute modification de code doit être suivie d'une mise à jour de la doc concernée.**

| Si tu modifies… | Mets à jour… |
|-----------------|-------------|
| `package.json`, `vite.config.js`, dépendances | `ai/docs/stack.md` |
| `src/db/schema.js`, `src/db/*.js`, `src/stores/*.js` | `ai/docs/data-layer.md` |
| `src/components/**`, `src/pages/**` | `ai/docs/components.md` |
| `src/App.jsx` (routes, guards, navigation) | `ai/docs/routes.md` + `CLAUDE.md` (table des routes) |
| Ajout d'une nouvelle route ou d'un nouveau store | `CLAUDE.md` (sections Routes et Couche données) |

Ne pas mettre à jour la doc si le changement est interne à un composant sans impact sur son interface (props, comportement visible) ni sur l'architecture.

## Tests

**Règle : toute modification de la couche `src/db/` doit être couverte par un test.**

| Si tu modifies… | Fichier de test à mettre à jour |
|-----------------|--------------------------------|
| Logique de `queries.js` (mapping, CRUD, calculs) | `src/db/queries.crud.test.js` |
| Calculs STC / alertes (`computeAlerts`, etc.) | `src/db/queries.test.js` |
| `detectIncoherences.js` | `src/db/detectIncoherences.test.js` |
| `exportProject.js` / `importFromBackup.js` | fichiers `.test.js` correspondants |
| Stores Zustand (`src/stores/`) | fichiers `.test.js` dans `src/stores/` |
| Utilitaires (`src/utils/`) | fichiers `.test.js` dans `src/utils/` |

Après avoir ajouté ou modifié des tests, lancer `npm run test:run` (ou `make test:run`) et corriger les échecs avant de considérer la tâche terminée.

Les composants React (`src/components/`, `src/pages/`) ne nécessitent pas de tests unitaires sauf si la logique est non triviale et extractible.
