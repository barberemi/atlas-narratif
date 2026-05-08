-- Fix LOTR demo map coordinates for object-contain rendering
-- The map changed from object-cover to object-contain, requiring recalibration.
--
-- Note : seules les coordonnées de LOCATIONS sont mises à jour ici.
-- Les character_journeys sont chiffrées (AES-256-GCM) et ne peuvent pas
-- être modifiées en SQL. Pour mettre à jour les trajets, supprimer le
-- projet LOTR depuis la page d'accueil et cliquer "Charger" pour re-seeder.

-- T1
UPDATE locations SET coordinates = '{"x":34,"y":33}' WHERE id = 'loc_shire';
UPDATE locations SET coordinates = '{"x":43,"y":33}' WHERE id = 'loc_bree';
UPDATE locations SET coordinates = '{"x":38,"y":32}' WHERE id = 'loc_barrowdowns';
UPDATE locations SET coordinates = '{"x":47,"y":31}' WHERE id = 'loc_weathertop';
UPDATE locations SET coordinates = '{"x":49,"y":25}' WHERE id = 'loc_ford';
UPDATE locations SET coordinates = '{"x":51,"y":24}' WHERE id = 'loc_rivendell';
UPDATE locations SET coordinates = '{"x":46,"y":53}' WHERE id = 'loc_isengard';
UPDATE locations SET coordinates = '{"x":50,"y":31}' WHERE id = 'loc_caradhras';
UPDATE locations SET coordinates = '{"x":51,"y":44}' WHERE id = 'loc_moria';
UPDATE locations SET coordinates = '{"x":55,"y":42}' WHERE id = 'loc_lothlorien';
UPDATE locations SET coordinates = '{"x":59,"y":49}' WHERE id = 'loc_parthgalen';
UPDATE locations SET coordinates = '{"x":76,"y":65}' WHERE id = 'loc_mordor';

-- T2
UPDATE locations SET coordinates = '{"x":62,"y":50}' WHERE id = 'loc_emyn_muil';
UPDATE locations SET coordinates = '{"x":65,"y":57}' WHERE id = 'loc_dead_marshes';
UPDATE locations SET coordinates = '{"x":52,"y":48}' WHERE id = 'loc_fangorn';
UPDATE locations SET coordinates = '{"x":58,"y":59}' WHERE id = 'loc_edoras';
UPDATE locations SET coordinates = '{"x":55,"y":58}' WHERE id = 'loc_helms_deep';
UPDATE locations SET coordinates = '{"x":69,"y":63}' WHERE id = 'loc_ithilien';

-- T3
UPDATE locations SET coordinates = '{"x":65,"y":74}' WHERE id = 'loc_minas_tirith';
UPDATE locations SET coordinates = '{"x":66,"y":72}' WHERE id = 'loc_pelennor';
UPDATE locations SET coordinates = '{"x":76,"y":66}' WHERE id = 'loc_cirith_ungol';
UPDATE locations SET coordinates = '{"x":76,"y":65}' WHERE id = 'loc_mount_doom';
UPDATE locations SET coordinates = '{"x":53,"y":66}' WHERE id = 'loc_paths_dead';
UPDATE locations SET coordinates = '{"x":73,"y":68}' WHERE id = 'loc_minas_morgul';
UPDATE locations SET coordinates = '{"x":16,"y":30}' WHERE id = 'loc_grey_havens';
