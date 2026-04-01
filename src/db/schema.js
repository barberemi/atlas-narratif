/**
 * Schéma SQL générique — AtlasNarratif
 * Indépendant de tout univers narratif : fonctionne pour LOTR, Star Wars, ou autre.
 * Chaque table est rattachée à un projet via project_id.
 */

export const SQL_SCHEMA = /* sql */ `

-- ── Projets ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS projects (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  description TEXT,
  map_image   TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);
-- Migration additive pour les DBs existantes
ALTER TABLE projects ADD COLUMN IF NOT EXISTS map_image TEXT;

-- ── Volumes (tomes d'une série) ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS volumes (
  id          TEXT NOT NULL,
  project_id  TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  number      INTEGER NOT NULL,
  title       TEXT NOT NULL,
  description TEXT,
  PRIMARY KEY (id, project_id)
);

-- ── Personnages ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS characters (
  id          TEXT NOT NULL,
  project_id  TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  aliases     JSONB DEFAULT '[]',
  race        TEXT,
  role        TEXT,
  origin      TEXT,
  affiliations JSONB DEFAULT '[]',
  description TEXT,
  traits      JSONB DEFAULT '[]',
  color       TEXT DEFAULT '#64748b',
  journey_key TEXT,
  extra       JSONB DEFAULT '{}',
  source      TEXT DEFAULT 'import',
  PRIMARY KEY (id, project_id)
);
ALTER TABLE characters ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'import';
ALTER TABLE characters DROP COLUMN IF EXISTS role;
ALTER TABLE characters DROP COLUMN IF EXISTS affiliations;
ALTER TABLE characters DROP COLUMN IF EXISTS traits;
ALTER TABLE characters DROP COLUMN IF EXISTS race;

-- ── Lieux ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS locations (
  id          TEXT NOT NULL,
  project_id  TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  type        TEXT,
  regime      TEXT,
  description TEXT,
  coordinates JSONB DEFAULT 'null',
  extra       JSONB DEFAULT '{}',
  source      TEXT DEFAULT 'import',
  PRIMARY KEY (id, project_id)
);
ALTER TABLE locations ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'import';

-- ── Objets ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS objects (
  id             TEXT NOT NULL,
  project_id     TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  type           TEXT,
  description    TEXT,
  creator        TEXT,
  current_holder TEXT,
  extra          JSONB DEFAULT '{}',
  source         TEXT DEFAULT 'import',
  PRIMARY KEY (id, project_id)
);
ALTER TABLE objects ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'import';

-- ── Événements timeline ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS timeline_events (
  id               TEXT NOT NULL,
  project_id       TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  chapter_num      INTEGER NOT NULL,
  chapter_title    TEXT NOT NULL,
  title            TEXT NOT NULL,
  description      TEXT,
  location_id      TEXT,
  extra            JSONB DEFAULT '{}',
  source           TEXT DEFAULT 'import',
  pov_character_id TEXT,
  scene_order      INTEGER DEFAULT 0,
  scene_goal       TEXT,
  scene_conflict   TEXT,
  scene_outcome    TEXT,
  PRIMARY KEY (id, project_id)
);
-- Migrations additives pour les DBs existantes
ALTER TABLE timeline_events ADD COLUMN IF NOT EXISTS source           TEXT DEFAULT 'import';
ALTER TABLE timeline_events ADD COLUMN IF NOT EXISTS pov_character_id TEXT;
ALTER TABLE timeline_events ADD COLUMN IF NOT EXISTS scene_order      INTEGER DEFAULT 0;
ALTER TABLE timeline_events ADD COLUMN IF NOT EXISTS scene_goal       TEXT;
ALTER TABLE timeline_events ADD COLUMN IF NOT EXISTS scene_conflict   TEXT;
ALTER TABLE timeline_events ADD COLUMN IF NOT EXISTS scene_outcome    TEXT;
ALTER TABLE timeline_events ADD COLUMN IF NOT EXISTS volume_id        TEXT;

-- Jonction événements ↔ entités
CREATE TABLE IF NOT EXISTS event_entities (
  event_id    TEXT NOT NULL,
  project_id  TEXT NOT NULL,
  entity_id   TEXT NOT NULL,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('character','location','object')),
  PRIMARY KEY (event_id, project_id, entity_id, entity_type)
);

-- ── Incohérences ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS incoherences (
  id              TEXT NOT NULL,
  project_id      TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  type            TEXT NOT NULL,
  severity        TEXT NOT NULL CHECK (severity IN ('critical','high','medium','low')),
  title           TEXT NOT NULL,
  explanation     TEXT,
  resolved        BOOLEAN DEFAULT false,
  resolution_note TEXT,
  PRIMARY KEY (id, project_id)
);
ALTER TABLE incoherences ADD COLUMN IF NOT EXISTS resolution_note TEXT;

CREATE TABLE IF NOT EXISTS incoherence_links (
  incoherence_id TEXT NOT NULL,
  project_id     TEXT NOT NULL,
  entity_id      TEXT NOT NULL,
  entity_type    TEXT NOT NULL,
  label          TEXT,
  PRIMARY KEY (incoherence_id, project_id, entity_id)
);

-- ── Save the Cat ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS stc_chapters (
  id         TEXT NOT NULL,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  number     INTEGER NOT NULL,
  title      TEXT NOT NULL,
  summary    TEXT,
  PRIMARY KEY (id, project_id)
);
ALTER TABLE stc_chapters ADD COLUMN IF NOT EXISTS volume_id TEXT;

CREATE TABLE IF NOT EXISTS stc_chapter_beats (
  chapter_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  beat_id    TEXT NOT NULL,
  PRIMARY KEY (chapter_id, project_id, beat_id)
);

-- ── Entités par chapitre STC ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS stc_chapter_entities (
  chapter_id   TEXT NOT NULL,
  project_id   TEXT NOT NULL,
  entity_id    TEXT NOT NULL,
  entity_type  TEXT NOT NULL CHECK (entity_type IN ('character','location','object')),
  PRIMARY KEY (chapter_id, project_id, entity_id, entity_type)
);

-- ── Arc émotionnel (indépendant du format d'écriture) ────────────────────────
CREATE TABLE IF NOT EXISTS arc_points (
  project_id     TEXT    NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  chapter_number INTEGER NOT NULL,
  intensity      INTEGER CHECK (intensity >= 1 AND intensity <= 10),
  note           TEXT,
  PRIMARY KEY (project_id, chapter_number)
);
ALTER TABLE arc_points ADD COLUMN IF NOT EXISTS volume_id TEXT;

-- ── Notes libres par chapitre ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chapter_notes (
  project_id  TEXT    NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  chapter_num INTEGER NOT NULL,
  content     TEXT    NOT NULL DEFAULT '',
  PRIMARY KEY (project_id, chapter_num)
);

-- ── Trajets personnages ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS character_journeys (
  project_id TEXT    NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  char_key   TEXT    NOT NULL,
  step_index INTEGER NOT NULL,
  data       JSONB   NOT NULL,
  PRIMARY KEY (project_id, char_key, step_index)
);

-- ── Plant / Payoff (amorces narratives) ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS plant_payoffs (
  id                 TEXT NOT NULL,
  project_id         TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  label              TEXT NOT NULL,
  type               TEXT DEFAULT 'information',
  plant_chapter_num  INTEGER,
  plant_event_id     TEXT,
  payoff_chapter_num INTEGER,
  payoff_event_id    TEXT,
  entity_id          TEXT,
  entity_type        TEXT,
  status             TEXT DEFAULT 'open',
  notes              TEXT,
  PRIMARY KEY (id, project_id)
);

ALTER TABLE plant_payoffs ADD COLUMN IF NOT EXISTS plant_volume_id  TEXT;
ALTER TABLE plant_payoffs ADD COLUMN IF NOT EXISTS payoff_volume_id TEXT;

-- ── Groupes d'appartenance (races, clans, factions…) ────────────────────────
CREATE TABLE IF NOT EXISTS groups (
  id          TEXT NOT NULL,
  project_id  TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  type        TEXT NOT NULL DEFAULT 'autre',
  color       TEXT DEFAULT '#64748B',
  description TEXT,
  homeland_id TEXT,
  PRIMARY KEY (id, project_id)
);

CREATE TABLE IF NOT EXISTS character_groups (
  character_id  TEXT NOT NULL,
  group_id      TEXT NOT NULL,
  project_id    TEXT NOT NULL,
  role_in_group TEXT,
  PRIMARY KEY (character_id, group_id, project_id)
);

-- ── Fils narratifs ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS narrative_threads (
  id          TEXT NOT NULL,
  project_id  TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  color       TEXT DEFAULT '#3F51B5',
  role        TEXT DEFAULT 'subplot',
  description TEXT,
  sort_order  INTEGER DEFAULT 0,
  PRIMARY KEY (id, project_id)
);
ALTER TABLE timeline_events ADD COLUMN IF NOT EXISTS thread_ids TEXT DEFAULT '[]';

-- ── Arc des personnages ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS character_arc_axes (
  id           TEXT NOT NULL,
  project_id   TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  character_id TEXT NOT NULL,
  label        TEXT NOT NULL,
  color        TEXT DEFAULT '#64748b',
  PRIMARY KEY (id, project_id)
);

CREATE TABLE IF NOT EXISTS character_arc_points (
  project_id  TEXT    NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  axis_id     TEXT    NOT NULL,
  chapter_num INTEGER NOT NULL,
  value       INTEGER CHECK (value >= 0 AND value <= 10),
  note        TEXT,
  PRIMARY KEY (project_id, axis_id, chapter_num)
);
ALTER TABLE character_arc_points ADD COLUMN IF NOT EXISTS volume_id TEXT;

-- ── Voyage du Héros ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hero_journey_entries (
  id           TEXT PRIMARY KEY,
  project_id   TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  stage_key    TEXT NOT NULL,
  character_id TEXT,
  chapter_num  INTEGER,
  summary      TEXT
);
ALTER TABLE hero_journey_entries ADD COLUMN IF NOT EXISTS character_id TEXT;
ALTER TABLE hero_journey_entries ADD COLUMN IF NOT EXISTS chapter_num INTEGER;
ALTER TABLE hero_journey_entries ADD COLUMN IF NOT EXISTS summary TEXT;
ALTER TABLE hero_journey_entries ADD COLUMN IF NOT EXISTS volume_id TEXT;

`;

/**
 * Version du schéma — à incrémenter à chaque modification de SQL_SCHEMA
 * pour forcer la ré-application des migrations sur les DBs existantes.
 */
export const SCHEMA_VERSION = '2026-04-01.1';

/** Applique le schéma sur la connexion PGlite donnée (idempotent).
 *  Si la version stockée dans _meta correspond à SCHEMA_VERSION,
 *  le schéma est ignoré pour accélérer le démarrage.
 */
export async function applySchema(db) {
  // Vérifie si la table _meta existe et contient la bonne version
  try {
    const { rows } = await db.query(
      `SELECT value FROM _meta WHERE key = 'schema_version'`
    );
    if (rows[0]?.value === SCHEMA_VERSION) return; // déjà à jour
  } catch {
    // _meta n'existe pas encore → première installation
  }

  await db.exec(SQL_SCHEMA);

  // Persiste la version pour les prochains démarrages
  await db.exec(`
    CREATE TABLE IF NOT EXISTS _meta (key TEXT PRIMARY KEY, value TEXT);
    INSERT INTO _meta (key, value) VALUES ('schema_version', '${SCHEMA_VERSION}')
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
  `);
}
