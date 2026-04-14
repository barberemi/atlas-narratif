import { create } from 'zustand';
import {
  getHeroJourneyEntries,
  saveHeroJourneyEntry,
  removeHeroJourneyEntry,
} from '../api/client';
import { useSaveIndicator } from './useSaveIndicator';

export const useHeroJourneyStore = create((set, get) => ({
  entries:    null,
  _projectId: null,
  _loading:   false,

  load: async (projectId) => {
    const { _projectId, _loading, entries } = get();
    if (_loading || (_projectId === projectId && entries !== null)) return;
    set({ _projectId: projectId, _loading: true });
    try {
      const result = await getHeroJourneyEntries(projectId);
      set({ entries: result, _loading: false });
    } catch (e) { set({ _loading: false }); throw e; }
  },

  saveEntry: async ({ stageKey, characterId, chapterNum, summary, volumeId }) => {
    const { _projectId } = get();
    if (!_projectId) return;
    useSaveIndicator.getState().markSaving();
    await saveHeroJourneyEntry({ stageKey, characterId, chapterNum, summary, volumeId }, _projectId);
    useSaveIndicator.getState().markSaved();
    const entries = await getHeroJourneyEntries(_projectId);
    set({ entries });
  },

  removeEntry: async (entryId) => {
    const { _projectId, entries } = get();
    if (!_projectId) return;
    useSaveIndicator.getState().markSaving();
    const snapshot = await removeHeroJourneyEntry(entryId, _projectId);
    useSaveIndicator.getState().markSaved();
    set({ entries: (entries ?? []).filter(e => e.id !== entryId) });
    return snapshot;
  },

  reset: () => set({ entries: null, _projectId: null, _loading: false }),
}));
