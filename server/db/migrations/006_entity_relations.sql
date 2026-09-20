-- Niveau 3 : relations explicites, typées et éditables entre deux entités.
-- Polymorphe (source/target sur character|location|object|custom), libellé chiffré,
-- orienté ou symétrique. DDL idempotent. Miroir dans server/db/init.sql.

CREATE TABLE IF NOT EXISTS entity_relations (
  id          TEXT NOT NULL,
  project_id  TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  source_id   TEXT NOT NULL,
  source_type TEXT NOT NULL,   -- 'character' | 'location' | 'object' | 'custom'
  target_id   TEXT NOT NULL,
  target_type TEXT NOT NULL,
  label       TEXT,            -- libellé chiffré (enc:v1:…) ; nullable
  directed    BOOLEAN DEFAULT TRUE,
  source      TEXT DEFAULT 'import',
  PRIMARY KEY (id, project_id)
);
CREATE INDEX IF NOT EXISTS idx_entity_relations_source ON entity_relations(project_id, source_id);
CREATE INDEX IF NOT EXISTS idx_entity_relations_target ON entity_relations(project_id, target_id);
