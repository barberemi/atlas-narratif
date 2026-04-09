import { create } from 'zustand';
import { getChapterNotes, setChapterNote } from '../api/client';

export const useNotesStore = create((set, get) => ({
  notes:      null, // { [chapterNum]: content } — null = pas encore chargé
  _projectId: null,

  load: async (projectId) => {
    set({ _projectId: projectId });
    const notes = await getChapterNotes(projectId);
    set({ notes });
  },

  setNote: async (chapterNum, content) => {
    const { _projectId } = get();
    if (!_projectId) return;
    set(s => ({ notes: { ...s.notes, [chapterNum]: content } }));
    await setChapterNote(_projectId, chapterNum, content);
  },

  reset: () => set({ notes: null, _projectId: null }),
}));
