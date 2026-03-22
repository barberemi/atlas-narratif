import { seedProject } from './seed.generic';

/**
 * Crée un projet vide (sans import IA) pour les auteurs en phase de planification.
 * @returns {string} projectId
 */
export async function createEmptyProject(db, { name, description = '' }) {
  const id = crypto.randomUUID();
  await seedProject(db, { id, name, description }, {
    loreDB:     { characters: [], locations: [], objects: [] },
    timelineDB: [],
    chaptersDB: [],
    journeys:   [],
  });
  return id;
}
