-- Démos LOTR déjà chargées : corrections du seed qui ne touchent que des identifiants.
--
-- Le seed corrigé (src/data/lotr_*_seed_data.js) ne s'applique qu'aux nouveaux chargements.
-- On aligne ici les copies existantes sur les points exprimables en SQL :
--   1. amorces « en suspens » en double d'une amorce déjà résolue au tome 3
--      (plant_008 et plant_t2_02 → plant_t3_01 ; plant_t2_05 → plant_t3_02)
--   2. Merry retiré de la marche vers la Porte Noire (evt_t3_09) : il reste à Minas Tirith.
--
-- Les corrections de texte (Armée des Morts, Ents femelles, trajet d'Aragorn) portent sur des
-- champs chiffrés par projet et traduits : non modifiables en SQL. Pour les obtenir, supprimer
-- la démo depuis l'accueil puis la recharger.
--
-- Garde-fous : projets de démo uniquement (id 'lotr%'), amorce supprimée seulement si elle est
-- encore « open » ET que sa version résolue existe dans le même projet. Rejouable sans effet.

DELETE FROM plant_payoffs d
WHERE d.project_id LIKE 'lotr%'
  AND d.status = 'open'
  AND (
    (d.id IN ('plant_008', 'plant_t2_02')
      AND EXISTS (SELECT 1 FROM plant_payoffs r WHERE r.project_id = d.project_id AND r.id = 'plant_t3_01'))
    OR
    (d.id = 'plant_t2_05'
      AND EXISTS (SELECT 1 FROM plant_payoffs r WHERE r.project_id = d.project_id AND r.id = 'plant_t3_02'))
  );

DELETE FROM event_entities
WHERE project_id LIKE 'lotr%'
  AND event_id = 'evt_t3_09'
  AND entity_id = 'char_merry'
  AND entity_type = 'character';
