/**
 * Seed LOTR — "Le Seigneur des Anneaux" (Tomes 1 et 2).
 * Fusionne les données T1 (lotr_seed_data) et T2 (lotr_t2_seed_data).
 * Pour re-seeder : supprimer le projet 'lotr' en DB puis rappeler seedLotr(db).
 */
import {
  loreDB, timelineDB, chaptersDB, incoherencesDB,
  aragornJourney, gandalfJourney, frodoJourney,
  groupsDB, plantsDB, arcPointsDB,
  threadsDB, eventExtrasDB, characterArcsDB,
  heroJourneyDB, volumesDB,
} from '../data/lotr_seed_data';

import {
  t2Characters, t2Locations,
  t2TimelineDB, t2IncoherencesDB, t2ChaptersDB,
  t2PlantsDB, t2ArcPointsDB, t2ThreadsDB,
  t2EventExtrasDB, t2CharacterArcsDB, t2HeroJourneyDB,
} from '../data/lotr_t2_seed_data';

import { seedProject } from './seed.generic';
import mapImageUrl from '../assets/ouest_terre_du_milieu.jpg';

const META = {
  id:          'lotr',
  name:        'Le Seigneur des Anneaux',
  description: "La Communauté de l'Anneau & Les Deux Tours — J.R.R. Tolkien",
};

async function fetchMapImageBase64() {
  try {
    const resp = await fetch(mapImageUrl);
    const blob = await resp.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload  = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

const DATA = {
  volumesDB,

  loreDB: {
    characters: [...loreDB.characters, ...t2Characters],
    locations:  [...loreDB.locations,  ...t2Locations],
    objects:    loreDB.objects,
  },

  // Les événements T1 reçoivent leur volumeId au moment du merge
  timelineDB: [
    ...timelineDB.map(e => ({ ...e, volumeId: 'vol_communaute' })),
    ...t2TimelineDB,
  ],

  incoherencesDB: [...incoherencesDB, ...t2IncoherencesDB],

  // Les chapitres STC T1 sont rattachés au tome 1
  chaptersDB: [
    ...chaptersDB.map(ch => ({ ...ch, volumeId: 'vol_communaute' })),
    ...t2ChaptersDB,
  ],

  journeys: [
    { key: 'aragorn', data: aragornJourney },
    { key: 'gandalf', data: gandalfJourney },
    { key: 'frodo',   data: frodoJourney   },
  ],

  groupsDB,

  plantsDB: [...plantsDB, ...t2PlantsDB],

  arcPointsDB: [...arcPointsDB, ...t2ArcPointsDB],

  threadsDB: [...threadsDB, ...t2ThreadsDB],

  eventExtrasDB: { ...eventExtrasDB, ...t2EventExtrasDB },

  characterArcsDB: [...characterArcsDB, ...t2CharacterArcsDB],

  heroJourneyDB: [...heroJourneyDB, ...t2HeroJourneyDB],
};

export async function seedLotr(db, { onProgress } = {}) {
  const mapImage = await fetchMapImageBase64();
  await seedProject(db, { ...META, mapImage }, DATA, { onProgress });
}

/** Retourne le payload {meta, data} sans insérer en DB — pour l'API serveur. */
export async function buildLotrSeedPayload() {
  const mapImage = await fetchMapImageBase64();
  return { meta: { ...META, mapImage }, data: DATA };
}
