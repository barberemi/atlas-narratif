import { create } from 'zustand';
import { getAllJourneys, getProjectMapImage } from '../db/queries';

export const useMapStore = create((set) => ({
  journeys:  null,
  mapImage:  null,

  load: async (db, projectId) => {
    const [journeys, mapImage] = await Promise.all([
      getAllJourneys(db, projectId),
      getProjectMapImage(db, projectId),
    ]);
    set({ journeys, mapImage });
  },

  reset: () => set({ journeys: null, mapImage: null }),
}));
