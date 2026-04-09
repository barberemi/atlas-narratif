# Couche données — Atlas Narratif

## Architecture générale

```
PostgreSQL 16 (serveur Docker)
    ↓
server/src/db-queries.js  — fonctions SQL (postgres.js)
    ↓
server/src/routes/api.js  — routes REST Hono
    ↓  (HTTP fetch)
src/api/client.js         — client fetch frontend
    ↓
Zustand stores            — state réactif pour les composants
```

## src/api/client.js

Point d'entrée unique pour toutes les données côté frontend. Remplace les anciens appels `queries.js` + PGlite.

- `BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'`
- En prod, `VITE_API_URL=""` → URLs relatives → nginx proxifie vers `api:3001`
- `credentials: 'include'` sur tous les appels (cookies Better Auth)
- Fonctions nommées identiquement aux anciennes `queries.js` (sauf sans le paramètre `db`)
- Re-exporte `computeAlerts`, `computeAlertsFromEvents` depuis `../db/queries` (calculs purement JS, pas de SQL)

## ProjectContext (src/db/ProjectContext.jsx)

- `<ProjectProvider>` en racine de l'app (dans `App.jsx`, sans `<DbProvider>`)
- `useProject()` → `{ projects, projectId, setProjectId, reloadProjects, loading }`
- `projectId` = projet actif (persisté dans `localStorage`)
- `loadAll(projectId)` — déclenche le `load(projectId)` de tous les stores

## Stores Zustand (src/stores/)

### Pattern général (`createEntityStore`)

Chaque store expose :
- Les données : `items`, `characters`, `events`, etc.
- `load(projectId)` — charge via `client.js` (fetch API)
- CRUD : `add(data)`, `edit(id, data)`, `remove(id)` — optimistic update + persist serveur

### Inventaire

| Store | Données gérées | Fichier |
|-------|---------------|---------|
| `useVolumeStore` | volumes + `activeVolumeId` | useVolumeStore.js |
| `useLoreStore` | characters, locations, objects, groups | useLoreStore.js |
| `useTimelineStore` | timeline_events + event_entities | useTimelineStore.js |
| `useStcStore` | stc_chapters + beats + entities | useStcStore.js |
| `useMapStore` | character_journeys + mapImage | useMapStore.js |
| `useArcStore` | arc_points | useArcStore.js |
| `useCharacterArcStore` | character_arc_axes + character_arc_points | useCharacterArcStore.js |
| `useIncStore` | incoherences + incoherence_links | useIncStore.js |
| `useNotesStore` | chapter_notes | useNotesStore.js |
| `usePlantStore` | plant_payoffs | usePlantStore.js |
| `useThreadStore` | narrative_threads | useThreadStore.js |
| `useHeroJourneyStore` | hero_journey_entries | useHeroJourneyStore.js |

### useVolumeStore — détail

- `volumes` — liste des tomes du projet actif
- `activeVolumeId` — tome sélectionné (`null` = vue "toute la série")
- `setActiveVolume(id | null)` — change le filtre global cross-stores
- Ne pas utiliser `createEntityStore` car `activeVolumeId` est un état global

## Schéma SQL (server/db/init.sql)

### Tables Better Auth (en premier, avant les tables app)

| Table | Description |
|-------|-------------|
| `"user"` | Comptes utilisateurs (quoted — mot réservé PG) |
| `session` | Sessions actives |
| `account` | Comptes OAuth liés |
| `verification` | Tokens email de vérification |

### Tables application

| Table | Clé primaire | Description |
|-------|-------------|-------------|
| `projects` | `id` | Projets narratifs — `user_id` FK vers `"user"` |
| `volumes` | `(id, project_id)` | Tomes |
| `characters` | `(id, project_id)` | Personnages |
| `locations` | `(id, project_id)` | Lieux |
| `objects` | `(id, project_id)` | Objets narratifs |
| `groups` | `(id, project_id)` | Groupes / factions |
| `character_groups` | `(character_id, project_id, group_id)` | Jonction personnages ↔ groupes |
| `timeline_events` | `(id, project_id)` | Événements par chapitre |
| `event_entities` | `(event_id, project_id, entity_id, entity_type)` | Jonction events ↔ entités |
| `incoherences` | `(id, project_id)` | Incohérences détectées |
| `incoherence_links` | `(incoherence_id, project_id, entity_id)` | Entités liées à une incohérence |
| `stc_chapters` | `(id, project_id)` | Chapitres Save the Cat |
| `stc_chapter_beats` | `(chapter_id, project_id, beat_id)` | Beats par chapitre |
| `stc_chapter_entities` | `(chapter_id, project_id, entity_id, entity_type)` | Entités par chapitre |
| `arc_points` | `(project_id, chapter_number)` | Arc émotionnel (intensité 1-10) |
| `chapter_notes` | `(project_id, chapter_num)` | Notes libres par chapitre |
| `character_journeys` | `(project_id, char_key, step_index)` | Trajets carte |
| `plant_payoffs` | `(id, project_id)` | Amorces narratives (plant/payoff) |
| `narrative_threads` | `(id, project_id)` | Fils narratifs (subplots) |
| `hero_journey_entries` | `id` | Étapes du Voyage du Héros |
| `character_arc_axes` | `(id, project_id)` | Axes d'évolution par personnage |
| `character_arc_points` | `(project_id, axis_id, chapter_num)` | Valeur (0-10) d'un axe |

### Conventions

- Toutes les tables app ont `project_id` → isolation multi-projets
- `volume_id = NULL` → appartient au tome 1 implicite (rétrocompat mono-tome)
- `source TEXT` sur characters/locations/objects/timeline_events : `'import'` (IA) ou `'manual'`
- `extra JSONB DEFAULT '{}'` pour données arbitraires (utilisé pour beat_id, thread_ids, POV, goal/conflict/outcome sur timeline_events)
- Champs directs sur `timeline_events` : `pov_character_id`, `scene_order`, `scene_goal`, `scene_conflict`, `scene_outcome`

## Flux d'import IA

1. `buildAnalysisPrompt()` → prompt généré → l'utilisateur le colle dans son IA
2. L'utilisateur importe le JSON résultant via `src/api/importFromAiOutputViaApi.js`
3. Le JSON est validé + normalisé côté frontend
4. `POST /api/seed` → `server/src/seed.js` → transaction PostgreSQL

## Flux export backup

`exportProject(_db, projectId)` dans `src/db/exportProject.js` (le paramètre `_db` est ignoré, conservé pour compatibilité d'appel) → `GET /api/projects/:id/export` → téléchargement JSON. Accessible via le `ProjectPicker` dans la TopNav.

## Détection d'incohérences (src/db/detectIncoherences.js)

- Analyse sur les données chargées dans les stores (pas de SQL direct)
- Types : continuité temporelle, présence simultanée, cohérence objets…
- Sévérités : `critical`, `high`, `medium`, `low`
