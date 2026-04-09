import { create } from 'zustand';
import {
  getHeroJourneyEntries,
  saveHeroJourneyEntry,
  removeHeroJourneyEntry,
} from '../api/client';

export const useHeroJourneyStore = create((set, get) => ({
  entries:    null,
  _projectId: null,

  load: async (projectId) => {
    set({ _projectId: projectId });
    const entries = await getHeroJourneyEntries(projectId);
    set({ entries });
  },

  saveEntry: async ({ stageKey, characterId, chapterNum, summary, volumeId }) => {
    const { _projectId } = get();
    if (!_projectId) return;
    await saveHeroJourneyEntry({ stageKey, characterId, chapterNum, summary, volumeId }, _projectId);
    const entries = await getHeroJourneyEntries(_projectId);
    set({ entries });
  },

  removeEntry: async (entryId) => {
    const { _projectId, entries } = get();
    if (!_projectId) return;
    await removeHeroJourneyEntry(entryId, _projectId);
    set({ entries: (entries ?? []).filter(e => e.id !== entryId) });
  },

  reset: () => set({ entries: null, _projectId: null }),
}));
