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
  PRIMARY KEY (id, project_id)
);

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
  PRIMARY KEY (id, project_id)
);

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
  PRIMARY KEY (id, project_id)
);

-- ── Événements timeline ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS timeline_events (
  id            TEXT NOT NULL,
  project_id    TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  chapter_num   INTEGER NOT NULL,
  chapter_title TEXT NOT NULL,
  title         TEXT NOT NULL,
  description   TEXT,
  location_id   TEXT,
  extra         JSONB DEFAULT '{}',
  PRIMARY KEY (id, project_id)
);

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
  id          TEXT NOT NULL,
  project_id  TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  type        TEXT NOT NULL,
  severity    TEXT NOT NULL CHECK (severity IN ('critical','high','medium','low')),
  title       TEXT NOT NULL,
  explanation TEXT,
  resolved    BOOLEAN DEFAULT false,
  PRIMARY KEY (id, project_id)
);

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

-- ── Trajets personnages ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS character_journeys (
  project_id TEXT    NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  char_key   TEXT    NOT NULL,
  step_index INTEGER NOT NULL,
  data       JSONB   NOT NULL,
  PRIMARY KEY (project_id, char_key, step_index)
);

`;

/** Applique le schéma sur la connexion PGlite donnée (idempotent). */
export async function applySchema(db) {
  await db.exec(SQL_SCHEMA);
}
