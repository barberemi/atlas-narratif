import { create } from 'zustand';
import { getAllJourneys, getProjectMapImage, setProjectMapImage, saveJourney } from '../api/client';
import { computeAutoJourneys } from '../utils/journeyUtils';
import { useSaveIndicator } from './useSaveIndicator';

export const useMapStore = create((set, get) => ({
  journeys:     null,
  autoJourneys: null,
  unlocalized:  [],
  mode:         'auto',
  mapImage:     null,
  _projectId:   null,
  _loading:     false,

  load: async (projectId) => {
    const { _projectId, _loading, journeys } = get();
    if (_loading || (_projectId === projectId && journeys !== null)) return;
    set({ _projectId: projectId, _loading: true });
    try {
      const [j, mi] = await Promise.all([
        getAllJourneys(projectId),
        getProjectMapImage(projectId),
      ]);
      set({ journeys: j, mapImage: mi, _loading: false });
    } catch (e) { set({ _loading: false }); throw e; }
  },

  loadAuto: (events, locations, characters) => {
    const { autoJourneys, unlocalized } = computeAutoJourneys(events, locations, characters);
    set({ autoJourneys, unlocalized });
  },

  setMode: (mode) => set({ mode }),

  persistJourney: async (charKey, steps) => {
    const { _projectId } = get();
    if (!_projectId) return;
    useSaveIndicator.getState().markSaving();
    await saveJourney(_projectId, charKey, steps);
    useSaveIndicator.getState().markSaved();
    const journeys = await getAllJourneys(_projectId);
    set({ journeys });
  },

  saveMapImage: async (base64) => {
    const { _projectId } = get();
    if (!_projectId) return;
    useSaveIndicator.getState().markSaving();
    await setProjectMapImage(_projectId, base64);
    useSaveIndicator.getState().markSaved();
    set({ mapImage: base64 });
  },

  reset: () => set({ journeys: null, autoJourneys: null, unlocalized: [], mode: 'auto', mapImage: null, _projectId: null, _loading: false }),
}));
