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
- `updateProject(projectId, { name?, description? })` → `PUT /api/projects/:projectId` (met à jour nom et/ou logline ; utilisé par la checklist d'onboarding pour enregistrer la logline). Côté serveur : `q.updateProject` + validateur `updateProject`.

## ProjectContext (src/db/ProjectContext.jsx)

- `<ProjectProvider>` en racine de l'app (dans `App.jsx`, sans `<DbProvider>`)
- `useProject()` → `{ projects, projectId, setProjectId, reloadProjects, loading }`
- `projectId` = projet actif (persisté dans `localStorage`)
- `loadAll(projectId)` — déclenche le `load(projectId)` de tous les stores

## Stores Zustand (src/stores/)

### Factory : `createEntityStore`

Fonction factory dans `createEntityStore.js` pour créer des stores CRUD standardisés.

Paramètres :
```js
createEntityStore({ initialState, fetchFn, insertFn, updateFn, deleteFn })
```

Le store généré expose :
- `load(projectId)` — charge via `client.js` (fetch API)
- `save(data)` — insert ou update (optimistic update + persist serveur)
- `remove(id)` — suppression (optimistic)
- `_reload()` — recharge depuis le serveur
- `reset()` — vide le store
- `saving` / `_loading` / `_projectId` — état interne

Intègre automatiquement `useSaveIndicator` pour le feedback visuel global.

Utilisé par : `useStcStore`, `useTimelineStore`.

### Pattern custom

Certains stores ont une logique trop spécifique pour la factory et utilisent Zustand directement avec un wrapper `_withSaving()` :
- `useLoreStore` — gère 4 types d'entités (characters, locations, objects, groups) + cache d'entités
- `useVolumeStore` — gère `activeVolumeId` (état global cross-stores)
- `useMapStore` — mode auto/manual, auto-calcul de trajets
- `useIncStore` — rescan client-side via `runDetection()`
- `useCharacterArcStore` — axes + points

### Inventaire

| Store | Données gérées | Pattern | Fichier |
|-------|---------------|---------|---------|
| `useVolumeStore` | volumes + `activeVolumeId` | custom | useVolumeStore.js |
| `useLoreStore` | characters, locations, objects, groups | custom | useLoreStore.js |
| `useTimelineStore` | timeline_events + event_entities | factory | useTimelineStore.js |
| `useStcStore` | stc_chapters + beats + entities | factory | useStcStore.js |
| `useMapStore` | character_journeys + mapImage | custom | useMapStore.js |
| `useArcStore` | arc_points | custom | useArcStore.js |
| `useCharacterArcStore` | character_arc_axes + character_arc_points | custom | useCharacterArcStore.js |
| `useIncStore` | incoherences + incoherence_links | custom | useIncStore.js |
| `useNotesStore` | chapter_notes | custom | useNotesStore.js |
| `usePlantStore` | plant_payoffs | custom | usePlantStore.js |
| `useThreadStore` | narrative_threads | custom | useThreadStore.js |
| `useHeroJourneyStore` | hero_journey_entries | custom | useHeroJourneyStore.js |
| `useTourStore` | tour guidé (active, stepIndex) | custom | useTourStore.js |
| `useSaveIndicator` | indicateur de sauvegarde global | custom | useSaveIndicator.js |

### useTourStore — détail

- `active` — tour en cours (boolean)
- `stepIndex` — étape courante
- `start(fromIndex)` / `startAtRoute(route)` / `next()` / `prev()` / `stop()`
- Étapes définies dans `src/data/tour_steps.js` (`TOUR_STEPS`)

### useSaveIndicator — détail

- `saving` — compteur de sauvegardes en cours
- `lastSavedAt` — timestamp de la dernière sauvegarde
- `markSaving()` / `markSaved()` — incrémente/décrémente le compteur
- Utilisé par `SaveIndicator` dans la TopNav

### useVolumeStore — détail

- `volumes` — liste des tomes du projet actif
- `activeVolumeId` — tome sélectionné (`null` = vue "toute la série")
- `setActiveVolume(id | null)` — change le filtre global cross-stores
- Ne pas utiliser `createEntityStore` car `activeVolumeId` est un état global

## Schéma SQL (server/db/init.sql + migrations/)

### Migrations

- Fichiers dans `server/db/migrations/` (ex: `001_add_indexes.sql`)
- Table `schema_migrations` — suivi des migrations appliquées
- Runner : `server/src/migrate.js`

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
| `custom_entity_types` | `(id, project_id)` | Types d'entités custom (catégories user : Véhicule, Langue…) |
| `custom_entities` | `(id, project_id)` | Instances d'entités custom (rattachées à un `type_id`) |
| `schema_migrations` | `name` | Migrations SQL appliquées |

### Extensibilité (migration 005)

Modèle en 3 couches pour ne rien jeter à l'import (Obsidian, IA) :
1. **Noyau typé** (characters/locations/objects/events…) — inchangé, alimente STC/héros/arcs/graphe.
2. **Champs custom** — colonne JSONB **chiffrée** `custom_fields` sur `characters`, `locations`, `objects`.
   Bag clé→valeur libre (âge, signe…). Écriture `encrypt(customFields ?? {}, dek)`, lecture `parseJ(decrypt(r.custom_fields, dek), {})` — même pattern que `aliases`.
3. **Types custom** — `custom_entity_types` (label, icon, color, `field_schema` JSONB, `base_behavior`) + `custom_entities`
   (`type_id`, name, aliases, `custom_fields`, description). Reliés aux events/chapitres via `entity_type='custom'`.
   Le CHECK `entity_type` de `event_entities` / `stc_chapter_entities` est élargi à `('character','location','object','custom')`.

### Conventions

- Toutes les tables app ont `project_id` → isolation multi-projets
- `volume_id = NULL` → appartient au tome 1 implicite (rétrocompat mono-tome)
- `source TEXT` sur characters/locations/objects/timeline_events : `'import'` (IA), `'manual'`, `'modified'` ou `'obsidian'`
- `custom_fields JSONB` (chiffré) sur characters/locations/objects → champs custom (couche 2)
- `extra JSONB DEFAULT '{}'` pour données arbitraires (utilisé pour beat_id, thread_ids, POV, goal/conflict/outcome sur timeline_events)
- Champs directs sur `timeline_events` : `pov_character_id`, `scene_order`, `scene_goal`, `scene_conflict`, `scene_outcome`

## Fichiers de configuration (src/data/)

| Fichier | Contenu |
|---------|---------|
| `beats_config.js` | `BEATS` — 15 beats Save the Cat (ideal%, tolérance, alertes, exemples) |
| `hero_journey_config.js` | Structure du Voyage du Héros |
| `severity_config.js` | Niveaux de sévérité des incohérences |
| `outcome_config.js` | Types de dénouement de scène |
| `tour_steps.js` | `TOUR_STEPS` — étapes du tour guidé (route, dataKey, title, description) |
| `analysis_prompt.js` | `buildAnalysisPrompt()` — prompt envoyé à l'IA pour analyser un manuscrit |

## Hooks custom (src/hooks/)

| Hook | Rôle |
|------|------|
| `useVolumeFilter` | Filtre les données par volume actif |
| `useUndoableDelete` | Suppression avec undo (toast + timer) |
| `useDragScroll` | Scroll par drag sur les frises horizontales |
| `useLotrReseed` | Re-seed du projet LOTR de démo |
| `useStoreLoader` | Initialisation des stores au changement de projet |

## Utilitaires (src/utils/)

| Fichier | Rôle |
|---------|------|
| `entityUtils.js` | Cache de métadonnées entités — `getEntityMeta(id)` |
| `buildGraph.js` | Construction du graphe de relations (nœuds + arêtes) |
| `color.js` | Utilitaires couleur (hex → rgba, contraste) |
| `coverageUtils.js` | Métriques de couverture narrative |
| `arcUtils.js` | Calculs d'arc / intensité |
| `journeyUtils.js` | Calcul auto des trajets (`computeAutoJourneys`) |
| `reviewUtils.js` | Données de la page review |
| `exportMarkdown.js` | Export projet en Markdown |
| `crisp.js` | `loadCrisp(websiteId)` / `unloadCrisp()` — chargement dynamique du chat Crisp |

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
