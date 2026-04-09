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
| `/login` | `LoginPage` | Connexion email + mot de passe |
| `/register` | `RegisterPage` | Création de compte (envoie email de vérification) |
| `/verify-email` | `VerifyEmailPage` | Écran "vérifiez votre boîte mail" |
| `/forgot-password` | `ForgotPasswordPage` | Demande de réinitialisation mot de passe |
| `/reset-password` | `ResetPasswordPage` | Saisie du nouveau mot de passe (token en query param) |

Routes protégées par `<RequireProject>` → redirige vers `/` si aucun projet chargé.

Auth client : `src/lib/authClient.js` (better-auth/react, baseURL = `VITE_API_URL`)

→ Détails : `ai/docs/routes.md`

## Couche données
**Architecture** : `PGlite (WASM worker)` → `DbContext` (React context) → `stores Zustand` → composants

**Stores** (src/stores/) :
- `useVolumeStore` — volumes (tomes) + `activeVolumeId` (filtre global de tome)
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

**Tables SQL principales** : `projects`, `volumes`, `characters`, `locations`, `objects`, `timeline_events`, `event_entities`, `incoherences`, `stc_chapters`, `arc_points`, `character_journeys`, `chapter_notes`, `character_arc_axes`, `character_arc_points`, `plant_payoffs`, `narrative_threads`, `groups`, `character_groups`, `hero_journey_entries`

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

## Migrations de schéma

**Règle : toute modification de `src/db/schema.js` doit s'accompagner d'un incrément de `SCHEMA_VERSION`.**

`SCHEMA_VERSION` est défini à la fin de `schema.js` (ex: `'2026-04-01.1'`). Il contrôle si `applySchema()` est rejoué au démarrage. Sans incrément, les utilisateurs existants ne recevront pas les nouvelles migrations.

Format suggéré : `'YYYY-MM-DD.N'` (date + numéro de révision du jour).

## Seed de test LOTR (données de démonstration)

Le projet "Le Seigneur des Anneaux" sert de jeu de données de test. Il couvre les Tomes 1 et 2.

**Sources de données :**
| Fichier | Contenu |
|---------|---------|
| `src/data/lotr_seed_data.js` | Lore T1, timeline T1, STC T1, plants T1, arcs T1, hero journey T1, `volumesDB` |
| `src/data/lotr_t2_seed_data.js` | Tout le Tome 2 : personnages, lieux, événements, STC, plants cross-tomes, arcs, hero journey |
| `src/db/seed.lotr.js` | Point d'entrée : fusionne T1 + T2, assigne les `volumeId` |
| `src/db/seed.generic.js` | Seeder générique réutilisable pour tout projet |

**Règle : toute nouvelle fonctionnalité doit être illustrée dans le seed LOTR.**

| Si tu ajoutes… | Mets à jour… |
|----------------|-------------|
| Une nouvelle table SQL | `seed.generic.js` (nouveau bloc d'INSERT) + données dans `lotr_seed_data.js` ou `lotr_t2_seed_data.js` |
| Un nouveau champ dans une table existante | `seed.generic.js` (ajouter le champ dans l'INSERT concerné) + données exemple dans le seed LOTR |
| Un nouveau store Zustand | Des données représentatives dans `lotr_seed_data.js` ou `lotr_t2_seed_data.js` |
| Un nouveau tome / volume | Dupliquer le pattern de `lotr_t2_seed_data.js`, fusionner dans `seed.lotr.js` |

**Structure des données T2 (`lotr_t2_seed_data.js`) :**
- `t2Characters` / `t2Locations` → fusionnés dans `loreDB` via spread
- `t2TimelineDB` → événements avec `volumeId: 'vol_deux_tours'`
- `t2ChaptersDB` → chapitres STC avec `volumeId` (requis pour les stats par tome)
- `t2PlantsDB` → plants avec `plantVolumeId` / `payoffVolumeId` pour les plants cross-tomes
- `t2EventExtrasDB` → extras indexés par `event_id` (beatId, threadIds, POV, goal/conflict/outcome)

**Pour re-seeder** : supprimer le projet LOTR depuis la page d'accueil, puis cliquer "Charger".

## Prompt d'analyse IA (`src/data/analysis_prompt.js`)

Ce prompt est envoyé par l'utilisateur à n'importe quel outil IA (ChatGPT, Gemini, Claude…) pour analyser un manuscrit. Il décrit exactement la structure JSON que l'IA doit retourner, qui est ensuite importée via `src/db/importFromAiOutput.js` → `src/db/seed.generic.js`.

**Règle : toute modification du modèle de données doit être répercutée dans le prompt.**

| Si tu modifies… | Mets à jour dans `analysis_prompt.js`… |
|-----------------|----------------------------------------|
| Ajout d'un champ dans `characters` / `locations` / `objects` | La structure de l'entité concernée + éventuellement une règle de cohérence |
| Suppression ou renommage d'un champ | Retirer ou renommer dans la structure correspondante |
| Nouvelle table importable (ex: nouvelle entité) | Ajouter la clé au format de sortie JSON + une section `### nomTable[]` |
| Nouvelle table **non** importable (gérée uniquement en app) | Ne pas l'ajouter au prompt |
| Nouveau préfixe d'ID | L'ajouter à la section "Règles de génération des IDs" |
| Contrainte `NOT NULL` sur un champ nullable dans le prompt | Corriger le type dans le prompt + ajouter un `?? ''` / `?? []` dans `seed.generic.js` |

**Cohérence à maintenir entre les fichiers :**
- `analysis_prompt.js` — déclare ce que l'IA doit générer
- `importFromAiOutput.js` — initialise les clés manquantes (`??= []`), valide le format
- `seed.generic.js` — insère les données ; les champs non colonnes SQL doivent passer par `extra` (JSONB)
- `queries.js` — relit les champs stockés dans `extra` pour les exposer aux stores

## Maintenance de la documentation IA

**Règle : toute modification de code doit être suivie d'une mise à jour de la doc concernée — sans attendre que l'utilisateur le demande.**

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
