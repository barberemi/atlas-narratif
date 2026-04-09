import { create } from 'zustand';
import { getAllJourneys, getProjectMapImage, setProjectMapImage, saveJourney } from '../api/client';
import { computeAutoJourneys } from '../utils/journeyUtils';

export const useMapStore = create((set, get) => ({
  journeys:     null,
  autoJourneys: null,
  unlocalized:  [],
  mode:         'auto',
  mapImage:     null,
  _projectId:   null,

  load: async (projectId) => {
    set({ _projectId: projectId });
    const [journeys, mapImage] = await Promise.all([
      getAllJourneys(projectId),
      getProjectMapImage(projectId),
    ]);
    set({ journeys, mapImage });
  },

  loadAuto: (events, locations, characters) => {
    const { autoJourneys, unlocalized } = computeAutoJourneys(events, locations, characters);
    set({ autoJourneys, unlocalized });
  },

  setMode: (mode) => set({ mode }),

  persistJourney: async (charKey, steps) => {
    const { _projectId } = get();
    if (!_projectId) return;
    await saveJourney(_projectId, charKey, steps);
    const journeys = await getAllJourneys(_projectId);
    set({ journeys });
  },

  saveMapImage: async (base64) => {
    const { _projectId } = get();
    if (!_projectId) return;
    await setProjectMapImage(_projectId, base64);
    set({ mapImage: base64 });
  },

  reset: () => set({ journeys: null, autoJourneys: null, unlocalized: [], mode: 'auto', mapImage: null, _projectId: null }),
}));
