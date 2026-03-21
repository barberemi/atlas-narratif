import { create } from 'zustand';
import { getLoreData } from '../db/queries';
import { initEntityCache } from '../utils/entityUtils';

export const useLoreStore = create((set) => ({
  characters: [],
  locations:  [],
  objects:    [],
  ready: false,

  load: async (db, projectId) => {
    const data = await getLoreData(db, projectId);
    initEntityCache(data);
    set({ ...data, ready: true });
  },

  reset: () => set({ characters: [], locations: [], objects: [], ready: false }),
}));
