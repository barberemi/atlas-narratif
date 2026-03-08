# Rapport de Migration Technique — AtlasNarratif
**Agent :** Architecte Technique — Migration Multi-Projet & Persistance
**Date :** 2026-03-19
**Version analysée :** état du dépôt à la branche `main` (commit `edf8302`)

---

## 1. Inventaire de la dette actuelle

### 1.1 Fichiers de données statiques

| Fichier | Contenu | Taille estimée | Nature du couplage |
|---------|---------|---------------|-------------------|
| `src/data/lore_database.js` | 17 personnages, 11 lieux, 9 objets + utilitaires | ~640 lignes | Importé dans 5 composants + App.jsx + buildGraph.js |
| `src/data/timeline_database.js` | 26 événements, fonctions `getChapters`, `detectConflicts`, `getConflictDetails` | ~495 lignes | TimelineBrowser, App.jsx |
| `src/data/incoherences_database.js` | 8 incohérences + constantes de sévérité + utilitaires | ~136 lignes | LoreBrowser, EntityGraph, NarrativeDashboard, IncoherencesBrowser |
| `src/data/save_the_cat_database.js` | 15 beats (statiques) + 9 chapitres + `generateAlerts` | ~345 lignes | SaveTheCat.jsx |
| `src/data/aragorn_journey.js` | 9 étapes cartographiées (x/y en %) | ~120 lignes | AtlasMapView via aragornJourney |
| `src/data/gandalf_journey.js` | Étapes Gandalf (même structure) | ~100 lignes | AtlasMapView |
| `src/data/frodo_journey.js` | Étapes Frodo (même structure) | ~100 lignes | AtlasMapView |

**Total : 7 fichiers, ~1 900 lignes de données SdA hardcodées.**

### 1.2 Structures de données identifiées

#### Personnage (`loreDB.characters[]`)
```
id, name, aliases[], race, role, origin, affiliation[], description, traits[], color, journeyKey
```

#### Lieu (`loreDB.locations[]`)
```
id, name, type, regime, description, coordinates{x,y}, inhabitants[], keyPlaces[], visitedBy[]{id,name,color}
```

#### Objet (`loreDB.objects[]`)
```
id, name, type, creator, createdIn, description, powers[], currentHolder, inscription?, holders[]{id,name,color}
```

#### Événement timeline (`timelineDB[]`)
```
id, chapter, chapterTitle, title, description, locationId, entities[]{id,entityType}, incoherenceIds[]?
```

#### Incohérence (`incoherencesDB[]`)
```
id, type, severity, title, explanation, links[]{label,entityId,entityType}
```

#### Chapitre Save the Cat (`chaptersDB[]`)
```
id, number, title, summary, beats[]  (tableau d'IDs de beats)
```

#### Étape de voyage cartographié
```
id, etape, scene, lieu, sous_lieu, chapitre, action, allies[], x, y
```

### 1.3 Code dépendant de données hardcodées

| Fichier | Couplage dur | Impact migration |
|---------|-------------|-----------------|
| `src/App.jsx` | Import `loreDB`, `findCharacterByAllyName` ; constante `lotrTestData` inline | Elevé — navigation croisée basée sur IDs SdA |
| `src/utils/buildGraph.js` | Import `loreDB` ; relations déduites des champs `affiliation`, `visitedBy`, `holders` | Élevé — logique de graphe intimement liée aux champs spécifiques SdA |
| `src/components/lore/LoreBrowser.jsx` | `loreDB` importé directement, tabs câblés sur les 3 collections | Moyen |
| `src/components/graph/EntityGraph.jsx` | `loreDB` + `getEntityInfo` cherchant dans les 3 collections fixes | Moyen |
| `src/components/timeline/TimelineBrowser.jsx` | `timelineDB`, `getChapters`, `detectConflicts`, `loreDB` (résolution de noms) | Élevé |
| `src/components/dashboard/NarrativeDashboard.jsx` | `incoherencesDB`, `loreDB` | Moyen |
| `src/components/incoherences/IncoherencesBrowser.jsx` | `incoherencesDB` | Faible |
| `src/components/savethecat/SaveTheCat.jsx` | `BEATS`, `chaptersDB`, `generateAlerts` | Moyen |
| `src/components/map/AtlasMapView.jsx` | 3 journeys hardcodés + personnages câblés dans CHARACTERS | Élevé |

### 1.4 État de l'interface d'upload

La page d'accueil (`HomePage` dans `App.jsx`) propose un `FilePicker` et simule une "analyse" (barre de progression fictive) qui charge en réalité `lotrTestData` — une constante inline ne contenant que 3 personnages et 2 lieux. Le vrai lore (SdA complet) est importé statiquement et toujours affiché dans les vues, indépendamment de tout fichier téléchargé. **Il n'existe aucune persistance réelle.**

---

## 2. Comparaison des options d'architecture

### 2.1 Tableau récapitulatif

| Critère | A — Electron + better-sqlite3 | B — SQLite WASM (wa-sqlite / PGlite) | C — Backend Node.js local | D — IndexedDB seul |
|---------|-------------------------------|--------------------------------------|--------------------------|-------------------|
| **Complexité de mise en place** | Haute (Electron build, IPC, packaging) | Moyenne (WASM, Worker, OPFS) | Moyenne (Express + cors + scripts npm) | Faible |
| **Offline-first** | Total | Total | Partiel (nécessite le serveur lancé) | Total |
| **Performance pour requêtes relationnelles** | Excellente | Bonne (limites WASM) | Excellente | Mauvaise (pas de SQL) |
| **Multi-projets / fichiers de projet** | Natif (fichiers système) | Complexe (export/import manuels) | Natif (chemin SQLite paramétrable) | Possible (préfixe de clés) |
| **Export / portabilité du projet** | Natif (`.atlasnar` = fichier SQLite) | Export JSON ou dump SQL | Fichier SQLite accessible | JSON manuel |
| **Reste une web app** | Non | Oui | Oui (avec serveur local) | Oui |
| **Distribution** | Installateur (Electron Forge / Builder) | Simple (npm build → static) | 2 processus à lancer | Simple (static) |
| **Maintenabilité** | Bonne (React + Node séparés) | Moyenne (complexité WASM + Workers) | Bonne (API REST claire) | Médiocre (logique SQL simulée en JS) |
| **Adéquation au projet** | Excellente | Bonne | Bonne | Insuffisante |

### 2.2 Recommandation motivée : Option B — SQLite via WebAssembly (PGlite ou wa-sqlite)

**Justification :**

AtlasNarratif est conçu pour des auteurs qui veulent un outil simple à lancer, sans serveur, sans installation lourde. Les deux options viables pour ce profil sont B et D. D (IndexedDB seul) est éliminé d'emblée car les données narratives sont relationnelles par nature : détection d'incohérences, graphe d'entités, timeline avec jointures entre événements et lieux — tout cela nécessite des requêtes SQL lisibles et maintenables.

**PGlite** (PostgreSQL compilé en WASM, par ElectricSQL) est retenu plutôt que wa-sqlite pour les raisons suivantes :
- API moderne basée sur Promises, compatible React natif
- Support OPFS (Origin Private File System) pour la persistance cross-session dans Chrome/Edge/Firefox récents
- Schéma SQL standard (PostgreSQL), plus expressif que SQLite pour les contraintes et les types JSON
- Bibliothèque activement maintenue avec support TypeScript

**Concessions acceptées :**
- L'export de projet sera un dump JSON/SQL déclenché manuellement (pas de glisser-déposer de fichier comme Electron)
- Les limites de stockage OPFS (~plusieurs Go selon le navigateur) sont largement suffisantes pour des données narratives textuelles

**Alternative sérieuse :** L'Option A (Electron) est la meilleure sur le plan technique pur (performances, gestion de fichiers, multi-projets naturels), mais elle implique de changer radicalement le modèle de distribution et d'ajouter une couche de complexité de build. Elle peut être envisagée dans un deuxième temps, en réutilisant exactement le même schéma SQL défini ci-dessous.

---

## 3. Schéma de base de données complet

Le schéma suivant est valide PostgreSQL (PGlite) et SQLite (compatible si on retire les types `TEXT[]` et on sérialise en JSON).

```sql
-- ─────────────────────────────────────────────────────────────────────────────
-- PROJETS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE projects (
  id          TEXT PRIMARY KEY,          -- nanoid() côté client
  name        TEXT NOT NULL,
  description TEXT,
  cover_image TEXT,                      -- URL base64 ou chemin OPFS
  created_at  TIMESTAMP DEFAULT now(),
  updated_at  TIMESTAMP DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- PERSONNAGES
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE characters (
  id          TEXT PRIMARY KEY,
  project_id  TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  aliases     JSONB DEFAULT '[]',        -- string[]
  race        TEXT,
  role        TEXT,
  origin      TEXT,
  description TEXT,
  traits      JSONB DEFAULT '[]',        -- string[]
  color       TEXT DEFAULT '#64748B',
  journey_key TEXT,                      -- null si pas de trajet cartographié
  created_at  TIMESTAMP DEFAULT now(),
  updated_at  TIMESTAMP DEFAULT now()
);
CREATE INDEX idx_characters_project ON characters(project_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- AFFILIATIONS (character ↔ groupe/faction — relation N:N)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE affiliations (
  character_id  TEXT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  label         TEXT NOT NULL,           -- nom de la faction/groupe (texte libre)
  PRIMARY KEY (character_id, label)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- LIEUX
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE locations (
  id           TEXT PRIMARY KEY,
  project_id   TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  type         TEXT,                     -- Région, Bourg, Forteresse…
  regime       TEXT,
  description  TEXT,
  coord_x      REAL,                     -- % sur la carte (0-100)
  coord_y      REAL,
  inhabitants  JSONB DEFAULT '[]',       -- string[]
  key_places   JSONB DEFAULT '[]',       -- string[]
  created_at   TIMESTAMP DEFAULT now(),
  updated_at   TIMESTAMP DEFAULT now()
);
CREATE INDEX idx_locations_project ON locations(project_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- OBJETS / ARTEFACTS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE objects (
  id              TEXT PRIMARY KEY,
  project_id      TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  type            TEXT,
  creator         TEXT,                  -- texte libre
  created_in      TEXT,                  -- texte libre
  description     TEXT,
  powers          JSONB DEFAULT '[]',    -- string[]
  current_holder  TEXT,                  -- texte libre (non FK, peut être ambigu)
  inscription     TEXT,
  created_at      TIMESTAMP DEFAULT now(),
  updated_at      TIMESTAMP DEFAULT now()
);
CREATE INDEX idx_objects_project ON objects(project_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- RELATIONS GÉNÉRIQUES (graphe d'entités)
-- Couvre : visites, possession, origine, alliances, fellowships…
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE relationships (
  id          TEXT PRIMARY KEY,
  project_id  TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  source_id   TEXT NOT NULL,             -- ID de l'entité source
  source_type TEXT NOT NULL,             -- 'character' | 'location' | 'object'
  target_id   TEXT NOT NULL,
  target_type TEXT NOT NULL,
  label       TEXT NOT NULL,             -- 'visited_by' | 'holds' | 'origin' | 'fellowship' | 'ally' | etc.
  created_at  TIMESTAMP DEFAULT now()
);
CREATE INDEX idx_relationships_project  ON relationships(project_id);
CREATE INDEX idx_relationships_source   ON relationships(source_id);
CREATE INDEX idx_relationships_target   ON relationships(target_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- ÉVÉNEMENTS TIMELINE
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE timeline_events (
  id            TEXT PRIMARY KEY,
  project_id    TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  chapter       INTEGER NOT NULL,
  chapter_title TEXT,
  title         TEXT NOT NULL,
  description   TEXT,
  location_id   TEXT REFERENCES locations(id) ON DELETE SET NULL,
  created_at    TIMESTAMP DEFAULT now(),
  updated_at    TIMESTAMP DEFAULT now()
);
CREATE INDEX idx_timeline_events_project  ON timeline_events(project_id);
CREATE INDEX idx_timeline_events_chapter  ON timeline_events(project_id, chapter);

-- ─────────────────────────────────────────────────────────────────────────────
-- ENTITÉS LIÉES À UN ÉVÉNEMENT (présence, participation)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE event_entities (
  event_id    TEXT NOT NULL REFERENCES timeline_events(id) ON DELETE CASCADE,
  entity_id   TEXT NOT NULL,
  entity_type TEXT NOT NULL,             -- 'character' | 'location' | 'object'
  PRIMARY KEY (event_id, entity_id, entity_type)
);
CREATE INDEX idx_event_entities_entity ON event_entities(entity_id, entity_type);

-- ─────────────────────────────────────────────────────────────────────────────
-- INCOHÉRENCES
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE incoherences (
  id          TEXT PRIMARY KEY,
  project_id  TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  type        TEXT,                      -- 'Contradiction Temporelle' | etc.
  severity    TEXT NOT NULL DEFAULT 'medium', -- 'critical' | 'high' | 'medium' | 'low'
  title       TEXT NOT NULL,
  explanation TEXT,
  status      TEXT NOT NULL DEFAULT 'open', -- 'open' | 'resolved' | 'ignored'
  source      TEXT NOT NULL DEFAULT 'manual', -- 'manual' | 'auto'
  created_at  TIMESTAMP DEFAULT now(),
  updated_at  TIMESTAMP DEFAULT now()
);
CREATE INDEX idx_incoherences_project  ON incoherences(project_id);
CREATE INDEX idx_incoherences_severity ON incoherences(project_id, severity);

-- Liens d'une incohérence vers des entités
CREATE TABLE incoherence_links (
  incoherence_id TEXT NOT NULL REFERENCES incoherences(id) ON DELETE CASCADE,
  entity_id      TEXT NOT NULL,
  entity_type    TEXT NOT NULL,
  label          TEXT,
  PRIMARY KEY (incoherence_id, entity_id, entity_type)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- CHAPITRES SAVE THE CAT
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE save_the_cat_chapters (
  id         TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  number     INTEGER NOT NULL,
  title      TEXT NOT NULL,
  summary    TEXT,
  beats      JSONB DEFAULT '[]',         -- string[] d'IDs de beats (référentiel fixe)
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE (project_id, number)
);
CREATE INDEX idx_stc_chapters_project ON save_the_cat_chapters(project_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- TRAJETS CARTOGRAPHIÉS (remplace aragorn_journey.js etc.)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE journey_steps (
  id           TEXT PRIMARY KEY,
  project_id   TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  character_id TEXT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  step_order   INTEGER NOT NULL,
  scene_key    TEXT,                     -- slug unique pour la scène
  lieu         TEXT,
  sous_lieu    TEXT,
  chapitre_ref TEXT,
  action       TEXT,
  allies       JSONB DEFAULT '[]',       -- string[]
  coord_x      REAL,
  coord_y      REAL,
  created_at   TIMESTAMP DEFAULT now(),
  UNIQUE (character_id, step_order)
);
CREATE INDEX idx_journey_steps_project   ON journey_steps(project_id);
CREATE INDEX idx_journey_steps_character ON journey_steps(character_id);
```

### 3.1 Notes sur le schéma

- **`relationships`** remplace les champs dénormalisés `visitedBy[]`, `holders[]`, `affiliation[]` et `fellowships[]` éparpillés dans `loreDB`. Toutes les relations du graphe passent par cette table unique.
- **`beats` dans `save_the_cat_chapters`** reste un tableau JSON d'IDs car les 15 beats sont un référentiel métier immuable, non des données utilisateur.
- **`incoherences.source`** distingue les incohérences détectées automatiquement (futur moteur de détection) des incohérences saisies manuellement.
- La résolution d'incohérences (actuellement un `Set` React éphémère dans `App.jsx`) devient persistante via le champ `status`.

---

## 4. Plan de migration par phases

### Phase 1 — Fondations persistance + sélection de projet

**Objectif :** remplacer les imports statiques par une couche de données PGlite, et ajouter un écran d'accueil permettant de créer/sélectionner un projet.

**Complexité :** Élevée (infrastructure, mais pas de changement UI visible pour l'auteur)

**Dépendances npm à ajouter :**
```
@electric-sql/pglite        # SQLite WASM avec OPFS
nanoid                      # génération d'IDs côté client
```

**Fichiers à créer :**
- `src/db/pglite.js` — initialisation de PGlite (OPFS), export du singleton `db`
- `src/db/schema.js` — exécution du schéma SQL au premier lancement (migrations)
- `src/db/queries/` — un fichier par domaine : `characters.js`, `locations.js`, `objects.js`, `timeline.js`, `incoherences.js`, `savethecat.js`, `journeys.js`
- `src/db/seed/lotr-demo.js` — données SdA converties en INSERT SQL (projet de démonstration)
- `src/store/projectStore.js` — état global du projet courant (Zustand ou Context)
- `src/components/home/ProjectPicker.jsx` — liste + création de projets
- `src/components/home/ProjectCard.jsx` — carte d'un projet

**Fichiers à modifier :**
- `src/App.jsx` — remplacer `HomePage` par un `ProjectPicker`, ajouter `projectId` dans le contexte global
- `src/main.jsx` — initialiser PGlite avant le render React

**Travaux :**
1. Installer PGlite, configurer Vite pour les workers WASM (`vite.config.js` : `optimizeDeps.exclude`, `worker.format: 'es'`)
2. Écrire et tester le schéma SQL
3. Écrire les fonctions CRUD de base pour toutes les entités
4. Convertir les 7 fichiers statiques SdA en seed SQL pour le projet démo
5. Créer l'écran ProjectPicker

**Durée estimée :** 3-5 jours

---

### Phase 2 — CRUD Lore (personnages, lieux, objets)

**Objectif :** rendre LoreBrowser dynamique — les données viennent de la BDD, l'auteur peut ajouter/modifier/supprimer.

**Complexité :** Moyenne

**Dépendances npm :**
- Aucune nouvelle (formulaires en React natif)

**Fichiers à créer :**
- `src/components/lore/CharacterForm.jsx` — formulaire création/édition personnage
- `src/components/lore/LocationForm.jsx`
- `src/components/lore/ObjectForm.jsx`
- `src/components/ui/Modal.jsx` — modale générique
- `src/components/ui/ConfirmDialog.jsx`
- `src/hooks/useLore.js` — hook React wrappant les queries PGlite avec état loading/error

**Fichiers à modifier :**
- `src/components/lore/LoreBrowser.jsx` — supprimer `import { loreDB }`, brancher sur `useLore`, ajouter boutons Ajouter/Éditer/Supprimer
- `src/utils/buildGraph.js` — recevoir les entités en paramètre plutôt que les importer depuis `loreDB`
- `src/components/graph/EntityGraph.jsx` — idem

**Travaux :**
1. Implémenter `useLore(projectId)` (fetch au montage + invalidation après mutation)
2. Créer les formulaires avec validation (champs requis, couleur picker)
3. Gérer les relations (affiliations, visitedBy, holders) via des multi-selects
4. Adapter `buildGraph` pour recevoir `{ characters, locations, objects }` en props

**Durée estimée :** 4-6 jours

---

### Phase 3 — CRUD Timeline et Incohérences

**Objectif :** rendre la timeline et le navigateur d'incohérences éditables. Bonus : détection automatique des conflits de présence (déjà codée dans `timeline_database.js`) branchée sur les données réelles.

**Complexité :** Moyenne-Élevée (logique de détection à préserver)

**Fichiers à créer :**
- `src/components/timeline/EventForm.jsx` — formulaire événement (chapitre, lieu, entités liées)
- `src/components/incoherences/IncoherenceForm.jsx` — signalement manuel d'incohérence
- `src/hooks/useTimeline.js`
- `src/hooks/useIncoherences.js`
- `src/db/detectors/conflictDetector.js` — portage de `detectConflicts` et `getConflictDetails` sur données PGlite

**Fichiers à modifier :**
- `src/components/timeline/TimelineBrowser.jsx` — supprimer imports statiques, brancher hooks
- `src/components/incoherences/IncoherencesBrowser.jsx` — supprimer `incoherencesDB`, persistance du statut via `status` en BDD (plus de `resolvedIds` dans `App.jsx`)
- `src/App.jsx` — supprimer `resolvedIds` / `toggleResolved`
- `src/components/dashboard/NarrativeDashboard.jsx` — brancher sur données dynamiques

**Travaux :**
1. CRUD complet des événements (avec sélection d'entités via autocomplete)
2. Porter `detectConflicts` pour requêter la BDD
3. CRUD incohérences (ajout manuel + marquer comme résolue/ignorée)
4. Dashboard recalculé dynamiquement

**Durée estimée :** 4-7 jours

---

### Phase 4 — CRUD Save the Cat

**Objectif :** rendre la frise Save the Cat éditable — l'auteur saisit ses propres chapitres et assigne les beats.

**Complexité :** Faible-Moyenne (la logique de calcul des alertes est déjà propre)

**Fichiers à créer :**
- `src/components/savethecat/ChapterForm.jsx` — formulaire chapitre (numéro, titre, résumé, beats)
- `src/hooks/useSaveTheCat.js`

**Fichiers à modifier :**
- `src/components/savethecat/SaveTheCat.jsx` — supprimer `chaptersDB` statique, brancher hook ; conserver `BEATS` (référentiel immuable, peut rester en JS)
- `src/data/save_the_cat_database.js` — ne garder que `BEATS` et les fonctions pures de calcul (`getBeatActualPercent`, `generateAlerts`) ; supprimer `chaptersDB`

**Travaux :**
1. Implémenter `useSaveTheCat(projectId)`
2. Interface glisser-déposer des beats sur les chapitres (ou multi-select simple)
3. Recalcul temps réel des alertes

**Durée estimée :** 2-3 jours

---

### Phase 5 — Multi-projet et carte interactive dynamique

**Objectif :** finaliser le multi-projet (duplication, export/import) et rendre la carte interactive basée sur des trajets utilisateur plutôt que les données SdA hardcodées.

**Complexité :** Élevée

**Fichiers à créer :**
- `src/components/home/ProjectMenu.jsx` — actions (renommer, dupliquer, supprimer, export, import)
- `src/db/export.js` — sérialisation d'un projet en JSON portable
- `src/db/import.js` — désérialisation et insertion d'un projet JSON
- `src/components/map/JourneyStepForm.jsx` — formulaire étape de trajet
- `src/hooks/useJourneys.js`

**Fichiers à modifier :**
- `src/components/map/AtlasMapView.jsx` — remplacer `aragornJourney` etc. hardcodés par les trajets du projet en cours, permettre d'ajouter des étapes en cliquant sur la carte
- `src/data/aragorn_journey.js`, `gandalf_journey.js`, `frodo_journey.js` — déplacés dans le seed SdA, supprimés de `src/data/`

**Travaux :**
1. Export JSON (dump complet d'un projet) + téléchargement navigateur
2. Import JSON (parse + INSERT en transaction)
3. Duplication de projet (INSERT … SELECT)
4. Carte interactive : PIN cliquable pour créer une étape de trajet
5. Sélecteur de personnages dynamique (basé sur `characters` du projet)

**Durée estimée :** 5-8 jours

---

### Récapitulatif des phases

| Phase | Objectif | Complexité | Estimation |
|-------|----------|-----------|------------|
| 1 | Fondations PGlite + sélecteur de projets | Élevée | 3-5 j |
| 2 | CRUD Lore (personnages, lieux, objets) | Moyenne | 4-6 j |
| 3 | CRUD Timeline + Incohérences | Moyenne-Élevée | 4-7 j |
| 4 | CRUD Save the Cat | Faible-Moyenne | 2-3 j |
| 5 | Multi-projet complet + carte dynamique | Élevée | 5-8 j |
| **Total** | | | **18-29 j** |

---

## 5. Gestion de la transition

### 5.1 Conserver les données SdA comme projet démo

Les 7 fichiers statiques actuels ne sont pas supprimés immédiatement. En Phase 1, ils sont convertis en un fichier `src/db/seed/lotr-demo.js` qui génère un projet complet "Le Seigneur des Anneaux — Démo" via des INSERT SQL au premier démarrage (si aucun projet n'existe). Ce projet est en lecture seule (flag `is_demo` sur la table `projects`), ou au contraire dupliquable pour que l'auteur puisse l'explorer librement.

```js
// src/db/seed/lotr-demo.js — structure indicative
export async function seedLotrDemo(db) {
  const exists = await db.query("SELECT id FROM projects WHERE name = 'SdA — Démonstration'");
  if (exists.rows.length > 0) return;
  // INSERT projects, characters, locations, objects, relationships, timeline_events…
}
```

### 5.2 Stratégie de migration progressive (sans casser l'existant)

La migration se fait **module par module**, en maintenant les données statiques le temps que chaque composant bascule :

1. **Adapter tour par tour** : chaque composant reçoit ses données en props plutôt que de les importer directement. Cela permet de lui passer soit les données statiques (pendant la migration), soit les données de la BDD (après).
2. **Feature flag** : une variable d'environnement `VITE_USE_DB=true` active la couche PGlite ; à `false`, les imports statiques sont préservés. Cela évite de bloquer le développement si PGlite pose des problèmes de configuration Vite.
3. **Tests en double** : pendant la Phase 2, les deux sources de données peuvent coexister ; les résultats visuels doivent être identiques (validation visuelle des composants avec le seed SdA).

### 5.3 Données de test en développement

- Le projet démo SdA sert de jeu de données de référence pour tous les tests visuels.
- Les fonctions utilitaires pures (`detectConflicts`, `generateAlerts`, `buildGraph`) sont testables indépendamment de PGlite en leur passant des fixtures JSON.
- Les tests d'intégration PGlite utilisent une instance en mémoire (PGlite supporte le mode `memory://` sans OPFS).

---

## 6. Première étape concrète recommandée

**Démarrer par la configuration Vite + PGlite et la création du schéma.**

C'est le bloc de risque le plus élevé (compatibilité WASM + Workers + Vite 7) et il doit être levé en premier, avant tout travail UI.

### Actions immédiates (dans l'ordre)

1. **Installer PGlite :**
   ```
   npm install @electric-sql/pglite nanoid
   ```

2. **Configurer Vite** (`vite.config.js`) pour autoriser les Workers WASM :
   ```js
   export default defineConfig({
     plugins: [react()],
     optimizeDeps: {
       exclude: ['@electric-sql/pglite'],
     },
     worker: {
       format: 'es',
     },
   });
   ```

3. **Créer `src/db/pglite.js`** — initialisation singleton avec OPFS et exécution du schéma au démarrage.

4. **Écrire le schéma SQL** dans `src/db/schema.sql` (ou directement en string JS) et valider qu'il s'exécute sans erreur dans PGlite.

5. **Écrire le seed SdA** (`src/db/seed/lotr-demo.js`) en convertissant `loreDB` + `timelineDB` + `incoherencesDB` + `chaptersDB` en INSERT.

6. **Vérifier manuellement** que `db.query("SELECT * FROM characters WHERE project_id = 'lotr-demo'")` retourne les 17 personnages attendus.

7. **Créer un hook `useProject()`** minimal qui retourne le projet courant depuis un Context, et modifier `App.jsx` pour afficher le `ProjectPicker` si aucun projet n'est sélectionné.

Ce premier livrable ne change rien à l'UI existante (le seed SdA garantit que tout s'affiche identiquement), mais pose l'infrastructure sur laquelle toutes les phases suivantes s'appuient.

---

*Rapport généré par l'Agent Architecte Technique — AtlasNarratif*
