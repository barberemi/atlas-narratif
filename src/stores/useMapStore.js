import { create } from 'zustand';
import { getAllJourneys, getProjectMapImage, setProjectMapImage, saveJourney } from '../db/queries';
import { computeAutoJourneys } from '../utils/journeyUtils';

export const useMapStore = create((set) => ({
  journeys:     null,   // trajets manuels (DB)
  autoJourneys: null,   // trajets calculés depuis timeline
  unlocalized:  [],     // lieux sans coordonnées détectés en mode auto
  mode:         'auto', // 'auto' | 'manual'
  mapImage:     null,

  load: async (db, projectId) => {
    const [journeys, mapImage] = await Promise.all([
      getAllJourneys(db, projectId),
      getProjectMapImage(db, projectId),
    ]);
    set({ journeys, mapImage });
  },

  /** Calcule les trajets depuis les données déjà chargées (synchrone). */
  loadAuto: (events, locations, characters) => {
    const { autoJourneys, unlocalized } = computeAutoJourneys(events, locations, characters);
    set({ autoJourneys, unlocalized });
  },

  setMode: (mode) => set({ mode }),

  persistJourney: async (db, projectId, charKey, steps) => {
    await saveJourney(db, projectId, charKey, steps);
    const journeys = await getAllJourneys(db, projectId);
    set({ journeys });
  },

  saveMapImage: async (db, projectId, base64) => {
    await setProjectMapImage(db, projectId, base64);
    set({ mapImage: base64 });
  },

  reset: () => set({ journeys: null, autoJourneys: null, unlocalized: [], mode: 'auto', mapImage: null }),
}));
