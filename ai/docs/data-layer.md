# Couche données — Atlas Narratif

## Architecture générale
```
PGlite WASM Worker (pglite-worker.js)
    ↓
client.js — getDb() singleton
    ↓
init.js — applySchema() au démarrage
    ↓
DbContext.jsx — React context { db }
    ↓
queries.js — fonctions SQL réutilisables
    ↓
Zustand stores — state réactif pour les composants
```

## DbContext
- `<DbProvider>` en racine de l'app (dans `App.jsx`)
- `useDb()` → retourne l'instance PGlite ou `null` pendant l'init
- Les composants qui écrivent en DB reçoivent `db` via `useDb()`
- Les composants qui lisent utilisent les stores Zustand

## ProjectContext
- `<ProjectProvider>` wrappé dans `<DbProvider>`
- `useProject()` → `{ projects, projectId, setProjectId, reloadProjects, loading }`
- `projectId` = projet actif (persisté dans `localStorage`)
- `projects` = liste de tous les projets (id + name + description)

## Schéma SQL (src/db/schema.js)

### Tables principales
| Table | Clé primaire | Description |
|-------|-------------|-------------|
| `projects` | `id` | Projets narratifs (= séries) |
| `volumes` | `(id, project_id)` | Tomes d'une série (number, title, description) |
| `characters` | `(id, project_id)` | Personnages — partagés entre tous les tomes |
| `locations` | `(id, project_id)` | Lieux — partagés entre tous les tomes |
| `objects` | `(id, project_id)` | Objets narratifs — partagés entre tous les tomes |
| `timeline_events` | `(id, project_id)` | Événements par chapitre — `volume_id` optionnel |
| `event_entities` | `(event_id, project_id, entity_id, entity_type)` | Jonction events ↔ entités |
| `incoherences` | `(id, project_id)` | Incohérences détectées |
| `incoherence_links` | `(incoherence_id, project_id, entity_id)` | Entités liées à une incohérence |
| `stc_chapters` | `(id, project_id)` | Chapitres Save the Cat — `volume_id` optionnel |
| `stc_chapter_beats` | `(chapter_id, project_id, beat_id)` | Beats associés aux chapitres |
| `stc_chapter_entities` | `(chapter_id, project_id, entity_id, entity_type)` | Entités par chapitre STC |
| `arc_points` | `(project_id, chapter_number)` | Arc émotionnel (intensité 1-10) — `volume_id` optionnel |
| `chapter_notes` | `(project_id, chapter_num)` | Notes libres par chapitre |
| `character_journeys` | `(project_id, char_key, step_index)` | Trajets sur la carte |
| `plant_payoffs` | `(id, project_id)` | Amorces narratives — `plant_volume_id` et `payoff_volume_id` pour les plants cross-tomes |
| `hero_journey_entries` | `id` | Étapes du Voyage du Héros — `volume_id` optionnel |
| `character_arc_axes` | `(id, project_id)` | Axes d'évolution par personnage (label + couleur) |
| `character_arc_points` | `(project_id, axis_id, chapter_num)` | Valeur (0-10) d'un axe pour un chapitre |

### Rétrocompatibilité multi-tomes
- `volume_id = NULL` → appartient au tome 1 implicite. Aucun projet existant (mono-tome) n'est cassé.
- Le lore (characters, locations, objects, groups) est intentionnellement **partagé** entre tous les tomes.

### Champs communs
- Toutes les tables (sauf `projects`) ont `project_id` → isolation multi-projets
- Champ `source TEXT` sur characters/locations/objects/timeline_events : `'import'` (IA) ou `'manual'` (saisie)
- Champ `extra JSONB DEFAULT '{}'` pour données arbitraires non schématisées
- `timeline_events.pov_character_id TEXT` — personnage focalisateur de la scène (optionnel)
- `timeline_events.scene_order INTEGER DEFAULT 0` — position relative au sein du chapitre (tri intra-chapitre)
- `timeline_events.scene_goal TEXT` — objectif du POV dans la scène (anatomie narrative)
- `timeline_events.scene_conflict TEXT` — obstacle / conflit de la scène
- `timeline_events.scene_outcome TEXT` — issue parmi : `success`, `failure`, `disaster`, `revelation`, `mixed`

## Stores Zustand (src/stores/)

### Pattern général
Chaque store expose :
- Les données : `characters`, `events`, etc.
- `load(db, projectId)` — charge depuis PGlite
- Setters/updaters pour les mutations

### Inventaire
| Store | Données gérées | Fichier |
|-------|---------------|---------|
| `useVolumeStore` | volumes + activeVolumeId | useVolumeStore.js |
| `useLoreStore` | characters, locations, objects | useLoreStore.js |
| `useTimelineStore` | timeline_events + event_entities | useTimelineStore.js |
| `useStcStore` | stc_chapters + beats + entities | useStcStore.js |
| `useMapStore` | character_journeys + coordinates | useMapStore.js |
| `useArcStore` | arc_points | useArcStore.js |
| `useCharacterArcStore` | character_arc_axes + character_arc_points | useCharacterArcStore.js |
| `useIncStore` | incoherences + incoherence_links | useIncStore.js |
| `useNotesStore` | chapter_notes | useNotesStore.js |

### useVolumeStore — détail
- `volumes` — liste des tomes du projet actif
- `activeVolumeId` — tome sélectionné (`null` = vue "toute la série")
- `setActiveVolume(id | null)` — change le filtre global
- `addVolume(data)`, `editVolume(id, data)`, `removeVolume(id)` — CRUD
- Ne pas utiliser `createEntityStore` car `activeVolumeId` est un état global cross-stores

## Flux d'import IA (src/db/importProject.js)
1. Réception du texte manuscrit ou des notes
2. Appel streaming vers l'API Anthropic (claude-sonnet par défaut)
3. Parse du JSON structuré retourné
4. Insertion en cascade : project → characters → locations → objects → timeline_events → event_entities → incoherences → journeys → arc_points
5. Retour du `projectId` → navigation vers `/review`

## Export/Import backup (src/db/exportProject.js + importFromBackup.js)
- Format : `atlas_<projectName>_<date>.json`
- Contient toutes les tables du projet en JSON
- `importFromBackup` recrée le projet et toutes ses données

## Détection d'incohérences (src/db/detectIncoherences.js)
- Analyse SQL sur les données existantes
- Types : continuité temporelle, présence simultanée, cohérence des objets…
- Sévérités : `critical`, `high`, `medium`, `low`
