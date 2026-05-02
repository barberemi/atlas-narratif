/**
 * Import d'un projet Atlas Narratif depuis un fichier JSON
 * généré par le prompt d'analyse (utilisé dans n'importe quel outil IA :
 * ChatGPT, Gemini, Claude, Mistral…).
 *
 * Accepte :
 *  - un fichier JSON contenant directement l'objet { loreDB, timelineDB, … }
 *  - un fichier texte contenant un bloc ```json … ``` (réponse brute d'une IA)
 */

import { seedProject } from './seed.generic';

/**
 * @param {object}   db
 * @param {File}     file         — fichier .json sélectionné par l'utilisateur
 * @param {object}   opts
 *   projectName : string   (requis)
 *   projectDesc : string   (optionnel)
 *   onProgress  : callback(message)
 * @returns {string} projectId inséré en DB
 */
export async function importFromAiOutput(db, file, { projectName, projectDesc, onProgress } = {}) {
  onProgress?.('Lecture du fichier…');

  const text = await file.text();

  onProgress?.('Validation du JSON…');

  // Support : JSON brut OU réponse IA avec bloc ```json ... ```
  let rawJson;
  const block = text.match(/```json\s*([\s\S]*?)```/);
  rawJson = block ? block[1] : text;

  let data;
  try {
    data = JSON.parse(rawJson);
  } catch {
    throw new Error(
      'Fichier invalide — le JSON n\'a pas pu être parsé.\n' +
      'Vérifiez que le fichier contient bien la réponse JSON générée par votre IA (bloc ```json … ```).'
    );
  }

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('Format non reconnu. Le fichier doit contenir le JSON généré par le prompt Atlas Narratif.');
  }

  // Garantir les clés requises
  data.volumes                   ??= [];
  data.loreDB                    ??= {};
  data.loreDB.characters         ??= [];
  data.loreDB.locations          ??= [];
  data.loreDB.objects            ??= [];
  data.groupsDB                  ??= [];
  data.timelineDB                ??= [];
  data.incoherencesDB            ??= [];
  data.chaptersDB                ??= [];
  data.plantsDB                  ??= [];
  data.threadsDB                 ??= [];
  data.heroJourneyDB             ??= [];
  data.journeys                    = []; // pas de carte dans ce flow

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

  onProgress?.('Insertion en base de données…');

  const projectId = slugify(projectName);
  await seedProject(
    db,
    { id: projectId, name: projectName, description: projectDesc || null, mapImage: null },
    { ...data, volumesDB: data.volumes, eventExtrasDB },
  );

  return projectId;
}

function slugify(str) {
  return (str ?? 'projet')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 40) || 'projet';
}
