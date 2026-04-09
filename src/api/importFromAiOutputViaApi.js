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
  data.journeys                = [];

  onProgress?.('Envoi au serveur…');

  const projectId = slugify(projectName);
  await seedProjectViaApi(
    { id: projectId, name: projectName, description: projectDesc || null, mapImage: null },
    { ...data, volumesDB: data.volumes },
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
