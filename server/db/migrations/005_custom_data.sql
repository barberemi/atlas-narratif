-- Extensibilité du schéma : champs custom sur les entités natives + types/entités custom.
-- Couche 2 : bag JSONB chiffré `custom_fields` sur characters/locations/objects.
-- Couche 3 : catégories définies par l'utilisateur (custom_entity_types + custom_entities).
-- DDL idempotent (rejouable sans erreur). Miroir dans server/db/init.sql pour les installs neuves.

-- ── Couche 2 : champs custom sur le noyau typé ────────────────────────────────
ALTER TABLE characters ADD COLUMN IF NOT EXISTS custom_fields JSONB;
ALTER TABLE locations  ADD COLUMN IF NOT EXISTS custom_fields JSONB;
ALTER TABLE objects    ADD COLUMN IF NOT EXISTS custom_fields JSONB;

-- ── Couche 3 : types d'entités custom ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS custom_entity_types (
  id            TEXT NOT NULL,
  project_id    TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  label         TEXT NOT NULL,
  icon          TEXT,
  color         TEXT DEFAULT '#64748b',
  field_schema  JSONB DEFAULT '[]',
  base_behavior TEXT DEFAULT 'entity',
  source        TEXT DEFAULT 'import',
  PRIMARY KEY (id, project_id)
);

-- ── Couche 3 : instances d'entités custom ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS custom_entities (
  id            TEXT NOT NULL,
  project_id    TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  type_id       TEXT NOT NULL,
  name          TEXT NOT NULL,
  aliases       JSONB DEFAULT '[]',
  custom_fields JSONB,
  description   TEXT,
  source        TEXT DEFAULT 'import',
  PRIMARY KEY (id, project_id)
);
CREATE INDEX IF NOT EXISTS idx_custom_entities_type ON custom_entities(project_id, type_id);

-- ── Élargir les CHECK entity_type pour accepter le type 'custom' ──────────────
-- Les entités custom se lient aux events/chapitres via entity_type='custom' + entity_id.
ALTER TABLE event_entities       DROP CONSTRAINT IF EXISTS event_entities_entity_type_check;
ALTER TABLE stc_chapter_entities DROP CONSTRAINT IF EXISTS stc_chapter_entities_entity_type_check;
ALTER TABLE event_entities       ADD CONSTRAINT event_entities_entity_type_check
  CHECK (entity_type IN ('character','location','object','custom'));
ALTER TABLE stc_chapter_entities ADD CONSTRAINT stc_chapter_entities_entity_type_check
  CHECK (entity_type IN ('character','location','object','custom'));
