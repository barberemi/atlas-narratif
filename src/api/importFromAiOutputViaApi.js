/**
 * Import d'un projet depuis un JSON généré par le prompt d'analyse IA.
 * Version API — ne dépend pas de PGlite, envoie le payload au serveur.
 */

import { seedProjectViaApi } from './client';

export async function importFromAiOutputViaApi(file, { projectName, projectDesc, onProgress } = {}) {
  onProgress?.('Lecture du fichier…');

  const text = await file.text();

  onProgress?.('Validation du JSON…');

  const block = text.match(/```json\s*([\s\S]*?)```/);
  const rawJson = block ? block[1] : text;

  let data;
  try {
    data = JSON.parse(rawJson);
  } catch {
    throw new Error(
      'Fichier invalide — le JSON n\'a pas pu être parsé.\n' +
      'Vérifiez que le fichier contient bien la réponse JSON générée par votre IA.',
    );
  }

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('Format non reconnu. Le fichier doit contenir le JSON généré par le prompt Atlas Narratif.');
  }

  data.volumes               ??= [];
  data.loreDB                ??= {};
  data.loreDB.characters     ??= [];
  data.loreDB.locations      ??= [];
  data.loreDB.objects        ??= [];
  data.groupsDB              ??= [];
  data.timelineDB            ??= [];
  data.incoherencesDB        ??= [];
  data.chaptersDB            ??= [];
  data.plantsDB              ??= [];
  data.threadsDB             ??= [];
  data.heroJourneyDB         ??= [];
  data.customTypesDB         ??= [];
  data.customEntitiesDB      ??= [];
  data.relationsDB           ??= [];
  data.journeys                = [];

  // Extraire les champs extras inline des événements vers eventExtrasDB
  const eventExtrasDB = {};
  for (const evt of data.timelineDB) {
    const ex = {};
    if (evt.beatId)           ex.beatId           = evt.beatId;
    if (evt.povCharacterId)   ex.povCharacterId   = evt.povCharacterId;
    if (evt.threadIds?.length) ex.threadIds        = evt.threadIds;
    if (evt.sceneGoal)        ex.sceneGoal        = evt.sceneGoal;
    if (evt.sceneConflict)    ex.sceneConflict    = evt.sceneConflict;
    if (evt.sceneOutcome)     ex.sceneOutcome     = evt.sceneOutcome;
    if (Object.keys(ex).length) eventExtrasDB[evt.id] = ex;
  }

  // ── Point d'insertion staging /review (étape 5, ImportPreview) ────────────────
  // Ici, `data` est le payload canonique EN MÉMOIRE, avant tout écriture DB.
  // TODO(étape 5) : monter <ImportPreview data={{...data, volumesDB: data.volumes,
  //   eventExtrasDB}} /> et n'appeler seedProjectViaApi que sur « Confirmer l'import »
  //   (dédup via src/import/dedup.js + rapport de liens cassés). Aujourd'hui : seed direct.

  onProgress?.('Envoi au serveur…');

  const projectId = slugify(projectName);
  // Le validateur seed est strict : `volumes` n'y figure pas (seul `volumesDB`),
  // et `meta.description` doit être une string (pas null). On mappe donc
  // `volumes` → `volumesDB` et on n'inclut la description que si elle est fournie.
  const { volumes, ...rest } = data;
  const meta = { id: projectId, name: projectName, mapImage: null };
  if (projectDesc) meta.description = projectDesc;
  // Le serveur suffixe l'id (`_d_<device>` / `_u_<user>`) : renvoyer l'id RÉSOLU,
  // pas le slug de base — sinon l'app charge un projet inexistant (404).
  const seededId = await seedProjectViaApi(
    meta,
    { ...rest, volumesDB: volumes, eventExtrasDB },
  );

  return seededId;
}

function slugify(str) {
  return (str ?? 'projet')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 40) || 'projet';
}
