-- ─────────────────────────────────────────────────────────────────────────────
-- Atlas Narratif — Schéma PostgreSQL
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Tables Better Auth ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "user" (
  id                   TEXT PRIMARY KEY,
  name                 TEXT NOT NULL,
  email                TEXT NOT NULL UNIQUE,
  "emailVerified"      BOOLEAN NOT NULL DEFAULT false,
  image                TEXT,
  "createdAt"          TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS session (
  id             TEXT PRIMARY KEY,
  "expiresAt"    TIMESTAMPTZ NOT NULL,
  token          TEXT NOT NULL UNIQUE,
  "createdAt"    TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"    TIMESTAMPTZ NOT NULL DEFAULT now(),
  "ipAddress"    TEXT,
  "userAgent"    TEXT,
  "userId"       TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS account (
  id                    TEXT PRIMARY KEY,
  "accountId"           TEXT NOT NULL,
  "providerId"          TEXT NOT NULL,
  "userId"              TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  "accessToken"         TEXT,
  "refreshToken"        TEXT,
  "idToken"             TEXT,
  "accessTokenExpiresAt" TIMESTAMPTZ,
  "refreshTokenExpiresAt" TIMESTAMPTZ,
  scope                 TEXT,
  password              TEXT,
  "createdAt"           TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS verification (
  id         TEXT PRIMARY KEY,
  identifier TEXT NOT NULL,
  value      TEXT NOT NULL,
  "expiresAt" TIMESTAMPTZ NOT NULL,
  "createdAt" TIMESTAMPTZ DEFAULT now(),
  "updatedAt" TIMESTAMPTZ DEFAULT now()
);

-- ── Projets ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS projects (
  id          TEXT PRIMARY KEY,
  user_id     TEXT,   -- FK vers Better Auth users.id (null = projet anonyme)
  device_id   TEXT,   -- UUID anonymous (null une fois le projet claim par un user)
  name        TEXT NOT NULL,
  description TEXT,
  map_image   TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);
-- Migration pour les instances existantes
ALTER TABLE projects ADD COLUMN IF NOT EXISTS device_id TEXT;

-- ── Volumes (tomes d'une série) ───────────────────────────────────────────────
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
  id             TEXT NOT NULL,
  project_id     TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  aliases        JSONB DEFAULT '[]',
  race           TEXT,
  role           TEXT,
  origin         TEXT,
  affiliations   JSONB DEFAULT '[]',
  description    TEXT,
  traits         JSONB DEFAULT '[]',
  color          TEXT DEFAULT '#64748b',
  journey_key    TEXT,
  death_event_id TEXT,
  source         TEXT DEFAULT 'import',
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
  inhabitants JSONB DEFAULT '[]',
  visited_by  JSONB DEFAULT '[]',
  key_places  JSONB DEFAULT '[]',
  source      TEXT DEFAULT 'import',
  PRIMARY KEY (id, project_id)
);

-- ── Objets ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS objects (
  id                        TEXT NOT NULL,
  project_id                TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name                      TEXT NOT NULL,
  type                      TEXT,
  description               TEXT,
  creator                   TEXT,
  current_holder            TEXT,
  powers                    JSONB DEFAULT '[]',
  holders                   JSONB DEFAULT '[]',
  created_in                TEXT,
  inscription               TEXT,
  status                    TEXT DEFAULT 'active',
  status_changed_at_chapter INTEGER,
  source                    TEXT DEFAULT 'import',
  PRIMARY KEY (id, project_id)
);

-- ── Événements timeline ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS timeline_events (
  id                TEXT NOT NULL,
  project_id        TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  chapter_num       INTEGER NOT NULL,
  chapter_title     TEXT NOT NULL,
  title             TEXT NOT NULL,
  description       TEXT,
  location_id       TEXT,
  beat_id           TEXT,
  thread_ids        JSONB DEFAULT '[]',
  is_flashback      BOOLEAN DEFAULT false,
  story_chapter_ref INTEGER,
  pov_character_id  TEXT,
  scene_order       INTEGER DEFAULT 0,
  scene_goal        TEXT,
  scene_conflict    TEXT,
  scene_outcome     TEXT,
  volume_id         TEXT,
  source            TEXT DEFAULT 'import',
  PRIMARY KEY (id, project_id)
);

-- ── Jonction événements ↔ entités ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS event_entities (
  event_id    TEXT NOT NULL,
  project_id  TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
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

CREATE TABLE IF NOT EXISTS incoherence_links (
  incoherence_id TEXT NOT NULL,
  project_id     TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
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
  volume_id  TEXT,
  PRIMARY KEY (id, project_id)
);

CREATE TABLE IF NOT EXISTS stc_chapter_beats (
  chapter_id TEXT NOT NULL,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  beat_id    TEXT NOT NULL,
  PRIMARY KEY (chapter_id, project_id, beat_id)
);

CREATE TABLE IF NOT EXISTS stc_chapter_entities (
  chapter_id  TEXT NOT NULL,
  project_id  TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  entity_id   TEXT NOT NULL,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('character','location','object')),
  PRIMARY KEY (chapter_id, project_id, entity_id, entity_type)
);

-- ── Arc émotionnel ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS arc_points (
  project_id     TEXT    NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  chapter_number INTEGER NOT NULL,
  intensity      INTEGER CHECK (intensity >= 1 AND intensity <= 10),
  note           TEXT,
  volume_id      TEXT,
  PRIMARY KEY (project_id, chapter_number)
);

-- ── Notes libres par chapitre ─────────────────────────────────────────────────
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

-- ── Plant / Payoff (amorces narratives) ───────────────────────────────────────
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
  plant_volume_id    TEXT,
  payoff_volume_id   TEXT,
  PRIMARY KEY (id, project_id)
);

-- ── Groupes d'appartenance ────────────────────────────────────────────────────
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
  project_id    TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  role_in_group TEXT,
  PRIMARY KEY (character_id, group_id, project_id)
);

-- ── Fils narratifs ────────────────────────────────────────────────────────────
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
  volume_id   TEXT,
  PRIMARY KEY (project_id, axis_id, chapter_num)
);

-- ── Voyage du Héros ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hero_journey_entries (
  id           TEXT PRIMARY KEY,
  project_id   TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  stage_key    TEXT NOT NULL,
  character_id TEXT,
  chapter_num  INTEGER,
  summary      TEXT,
  volume_id    TEXT
);

-- ── Migration : ajout ON DELETE CASCADE manquant sur les tables de jonction ──
DO $$
BEGIN
  -- event_entities
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'event_entities_project_id_fkey' AND table_name = 'event_entities'
  ) THEN
    ALTER TABLE event_entities
      ADD CONSTRAINT event_entities_project_id_fkey
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;
  END IF;

  -- incoherence_links
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'incoherence_links_project_id_fkey' AND table_name = 'incoherence_links'
  ) THEN
    ALTER TABLE incoherence_links
      ADD CONSTRAINT incoherence_links_project_id_fkey
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;
  END IF;

  -- stc_chapter_beats
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'stc_chapter_beats_project_id_fkey' AND table_name = 'stc_chapter_beats'
  ) THEN
    ALTER TABLE stc_chapter_beats
      ADD CONSTRAINT stc_chapter_beats_project_id_fkey
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;
  END IF;

  -- stc_chapter_entities
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'stc_chapter_entities_project_id_fkey' AND table_name = 'stc_chapter_entities'
  ) THEN
    ALTER TABLE stc_chapter_entities
      ADD CONSTRAINT stc_chapter_entities_project_id_fkey
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;
  END IF;

  -- character_groups
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'character_groups_project_id_fkey' AND table_name = 'character_groups'
  ) THEN
    ALTER TABLE character_groups
      ADD CONSTRAINT character_groups_project_id_fkey
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;
  END IF;
END $$;
