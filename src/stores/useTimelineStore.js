import { create } from 'zustand';
import { getTimelineEvents } from '../db/queries';

export const useTimelineStore = create((set) => ({
  events: null,

  load: async (db, projectId) => {
    const events = await getTimelineEvents(db, projectId);
    set({ events });
  },

  reset: () => set({ events: null }),
}));
