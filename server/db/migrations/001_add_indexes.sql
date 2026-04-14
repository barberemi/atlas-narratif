-- Index sur projects pour les requêtes par utilisateur/device
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_device_id ON projects(device_id);

-- Index project_id sur toutes les tables enfants (requêtes les plus fréquentes)
CREATE INDEX IF NOT EXISTS idx_volumes_project_id ON volumes(project_id);
CREATE INDEX IF NOT EXISTS idx_characters_project_id ON characters(project_id);
CREATE INDEX IF NOT EXISTS idx_locations_project_id ON locations(project_id);
CREATE INDEX IF NOT EXISTS idx_objects_project_id ON objects(project_id);
CREATE INDEX IF NOT EXISTS idx_timeline_events_project_id ON timeline_events(project_id);
CREATE INDEX IF NOT EXISTS idx_incoherences_project_id ON incoherences(project_id);
CREATE INDEX IF NOT EXISTS idx_stc_chapters_project_id ON stc_chapters(project_id);
CREATE INDEX IF NOT EXISTS idx_plant_payoffs_project_id ON plant_payoffs(project_id);
CREATE INDEX IF NOT EXISTS idx_groups_project_id ON groups(project_id);
CREATE INDEX IF NOT EXISTS idx_narrative_threads_project_id ON narrative_threads(project_id);
CREATE INDEX IF NOT EXISTS idx_character_arc_axes_project_id ON character_arc_axes(project_id);
CREATE INDEX IF NOT EXISTS idx_hero_journey_entries_project_id ON hero_journey_entries(project_id);
