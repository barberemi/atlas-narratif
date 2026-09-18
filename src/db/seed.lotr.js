/**
 * Seed LOTR — "Le Seigneur des Anneaux" (Tomes 1, 2 et 3).
 * Fusionne les données T1, T2 et T3.
 * Pour re-seeder : supprimer le projet 'lotr' en DB puis rappeler seedLotr(db).
 */
import {
  loreDB, timelineDB, chaptersDB, incoherencesDB,
  aragornJourney, gandalfJourney, frodoJourney,
  groupsDB, plantsDB, arcPointsDB,
  threadsDB, eventExtrasDB, characterArcsDB,
  heroJourneyDB, gandalfHeroJourneyDB, volumesDB,
  customTypesDB, customEntitiesDB,
} from '../data/lotr_seed_data';

import {
  t2Characters, t2Locations, t2Objects,
  t2TimelineDB, t2IncoherencesDB, t2ChaptersDB,
  t2PlantsDB, t2ArcPointsDB, t2ThreadsDB,
  t2EventExtrasDB, t2CharacterArcsDB, t2HeroJourneyDB,
  t2GroupsDB,
  t2FrodoJourney, t2AragornJourney,
} from '../data/lotr_t2_seed_data';

import {
  t3VolumeDB,
  t3Characters, t3Locations, t3Objects,
  t3TimelineDB, t3IncoherencesDB, t3ChaptersDB,
  t3PlantsDB, t3ArcPointsDB, t3ThreadsDB,
  t3EventExtrasDB, t3CharacterArcsDB, t3HeroJourneyDB,
  t3GroupsDB,
  t3FrodoJourney, t3AragornJourney, t3SamJourney,
} from '../data/lotr_t3_seed_data';

import { seedProject } from './seed.generic';
import { translateSeedData } from '../data/lotr_translations';
import mapImageUrl from '../assets/ouest_terre_du_milieu.jpg';

const META = {
  id:          'lotr',
  name:        'Le Seigneur des Anneaux',
  description: "La Communauté de l'Anneau, Les Deux Tours & Le Retour du Roi — J.R.R. Tolkien",
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
  volumesDB: [...volumesDB, t3VolumeDB],

  loreDB: {
    characters: [...loreDB.characters, ...t2Characters, ...t3Characters],
    locations:  [...loreDB.locations,  ...t2Locations,  ...t3Locations],
    objects:    [...loreDB.objects,     ...t2Objects,    ...t3Objects],
  },

  // Les événements T1 reçoivent leur volumeId au moment du merge
  timelineDB: [
    ...timelineDB.map(e => ({ ...e, volumeId: 'vol_communaute' })),
    ...t2TimelineDB,
    ...t3TimelineDB,
  ],

  incoherencesDB: [...incoherencesDB, ...t2IncoherencesDB, ...t3IncoherencesDB],

  // Les chapitres STC T1 sont rattachés au tome 1
  chaptersDB: [
    ...chaptersDB.map(ch => ({ ...ch, volumeId: 'vol_communaute' })),
    ...t2ChaptersDB,
    ...t3ChaptersDB,
  ],

  journeys: [
    { key: 'aragorn', data: [...aragornJourney, ...t2AragornJourney, ...t3AragornJourney] },
    { key: 'gandalf', data: gandalfJourney },
    { key: 'frodo',   data: [...frodoJourney, ...t2FrodoJourney, ...t3FrodoJourney] },
    { key: 'sam',     data: t3SamJourney },
  ],

  groupsDB: [...groupsDB, ...t2GroupsDB, ...t3GroupsDB],

  plantsDB: [...plantsDB, ...t2PlantsDB, ...t3PlantsDB],

  arcPointsDB: [...arcPointsDB, ...t2ArcPointsDB, ...t3ArcPointsDB],

  threadsDB: [...threadsDB, ...t2ThreadsDB, ...t3ThreadsDB],

  eventExtrasDB: { ...eventExtrasDB, ...t2EventExtrasDB, ...t3EventExtrasDB },

  characterArcsDB: [...characterArcsDB, ...t2CharacterArcsDB, ...t3CharacterArcsDB],

  heroJourneyDB: [...heroJourneyDB, ...gandalfHeroJourneyDB, ...t2HeroJourneyDB, ...t3HeroJourneyDB],

  customTypesDB,
  customEntitiesDB,
};

export async function seedLotr(db, { onProgress, lang = 'fr' } = {}) {
  const mapImage = await fetchMapImageBase64();
  const { meta, data } = translateSeedData({ ...META, mapImage }, DATA, lang);
  await seedProject(db, meta, data, { onProgress });
}

/** Retourne le payload {meta, data} sans insérer en DB — pour l'API serveur. */
export async function buildLotrSeedPayload({ lang = 'fr' } = {}) {
  const mapImage = await fetchMapImageBase64();
  const { meta, data } = translateSeedData({ ...META, mapImage }, DATA, lang);
  return { meta, data };
}
