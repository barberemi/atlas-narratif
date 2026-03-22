/**
 * Seed LOTR — point d'entrée pour le projet "Le Seigneur des Anneaux".
 * Les données sont dans src/data/lotr_seed_data.js (source de vérité).
 * Pour re-seeder : supprimer le projet en DB puis rappeler seedLotr(db).
 */
import {
  loreDB, timelineDB, chaptersDB, incoherencesDB,
  aragornJourney, gandalfJourney, frodoJourney,
  groupsDB, plantsDB, arcPointsDB,
  threadsDB, eventExtrasDB, characterArcsDB,
} from '../data/lotr_seed_data';
import { seedProject } from './seed.generic';

const META = {
  id:          'lotr',
  name:        'Le Seigneur des Anneaux',
  description: "La Communauté de l'Anneau — J.R.R. Tolkien",
};

const DATA = {
  loreDB,
  timelineDB,
  incoherencesDB,
  chaptersDB,
  journeys: [
    { key: 'aragorn', data: aragornJourney },
    { key: 'gandalf', data: gandalfJourney },
    { key: 'frodo',   data: frodoJourney   },
  ],
  groupsDB,
  plantsDB,
  arcPointsDB,
  threadsDB,
  eventExtrasDB,
  characterArcsDB,
};

export async function seedLotr(db) {
  await seedProject(db, META, DATA);
}
