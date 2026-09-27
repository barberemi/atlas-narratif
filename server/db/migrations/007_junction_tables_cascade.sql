-- Tables de jonction : ON DELETE CASCADE manquant sur project_id pour les bases existantes.
--
-- Le bloc équivalent de server/db/init.sql ne s'exécute qu'à la création d'une base neuve
-- (docker-entrypoint-initdb.d). Sur les bases plus anciennes, supprimer un projet laissait
-- ses lignes de jonction en place ; recréer un projet au même id (démo LOTR : id déterministe
-- par user/device) les ressuscitait via ON CONFLICT DO NOTHING.
--
-- 1. Purge des lignes orphelines (projet supprimé) — sinon l'ajout de la FK échoue.
-- 2. Ajout idempotent des FK project_id → projects(id) ON DELETE CASCADE.
-- DDL rejouable sans erreur. Miroir déjà présent dans server/db/init.sql.

DELETE FROM event_entities       x WHERE NOT EXISTS (SELECT 1 FROM projects p WHERE p.id = x.project_id);
DELETE FROM incoherence_links    x WHERE NOT EXISTS (SELECT 1 FROM projects p WHERE p.id = x.project_id);
DELETE FROM stc_chapter_beats    x WHERE NOT EXISTS (SELECT 1 FROM projects p WHERE p.id = x.project_id);
DELETE FROM stc_chapter_entities x WHERE NOT EXISTS (SELECT 1 FROM projects p WHERE p.id = x.project_id);
DELETE FROM character_groups     x WHERE NOT EXISTS (SELECT 1 FROM projects p WHERE p.id = x.project_id);

DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['event_entities', 'incoherence_links', 'stc_chapter_beats', 'stc_chapter_entities', 'character_groups']
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE constraint_name = t || '_project_id_fkey' AND table_name = t
    ) THEN
      EXECUTE format(
        'ALTER TABLE %I ADD CONSTRAINT %I FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE',
        t, t || '_project_id_fkey'
      );
    END IF;
  END LOOP;
END $$;
