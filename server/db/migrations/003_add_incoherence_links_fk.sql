-- Supprime les liens orphelins (pas de FK existante vers incoherences)
DELETE FROM incoherence_links WHERE (incoherence_id, project_id) NOT IN (
  SELECT id, project_id FROM incoherences
);

-- Ajoute la FK manquante avec ON DELETE CASCADE
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'incoherence_links_incoherence_fkey'
      AND table_name = 'incoherence_links'
  ) THEN
    ALTER TABLE incoherence_links
      ADD CONSTRAINT incoherence_links_incoherence_fkey
      FOREIGN KEY (incoherence_id, project_id)
      REFERENCES incoherences(id, project_id)
      ON DELETE CASCADE;
  END IF;
END $$;
