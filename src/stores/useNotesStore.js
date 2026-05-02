import { create } from 'zustand';
import { getChapterNotes, setChapterNote } from '../api/client';
import { useSaveIndicator } from './useSaveIndicator';

export const useNotesStore = create((set, get) => ({
  notes:      null, // { [chapterNum]: content } — null = pas encore chargé
  _projectId: null,
  _loading:   false,

  load: async (projectId) => {
    const { _projectId, _loading, notes } = get();
    // Déjà chargé ou en cours pour ce projet → skip
    if ((_projectId === projectId && notes !== null) || _loading) return;
    set({ _projectId: projectId, _loading: true });
    const result = await getChapterNotes(projectId);
    set({ notes: result, _loading: false });
  },

  setNote: async (chapterNum, content) => {
    const { _projectId } = get();
    if (!_projectId) return;
    set(s => ({ notes: { ...s.notes, [chapterNum]: content } }));
    useSaveIndicator.getState().markSaving();
    await setChapterNote(_projectId, chapterNum, content);
    useSaveIndicator.getState().markSaved();
  },

  reset: () => set({ notes: null, _projectId: null, _loading: false }),
}));
