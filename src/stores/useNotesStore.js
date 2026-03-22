import { create } from 'zustand';
import { getChapterNotes, setChapterNote } from '../db/queries';

export const useNotesStore = create((set, get) => ({
  notes:      null, // { [chapterNum]: content } — null = pas encore chargé
  _db:        null,
  _projectId: null,

  load: async (db, projectId) => {
    set({ _db: db, _projectId: projectId });
    const notes = await getChapterNotes(db, projectId);
    set({ notes });
  },

  setNote: async (chapterNum, content) => {
    const { _db, _projectId } = get();
    if (!_db || !_projectId) return;
    // Mise à jour optimiste
    set(s => ({ notes: { ...s.notes, [chapterNum]: content } }));
    await setChapterNote(_db, _projectId, chapterNum, content);
  },

  reset: () => set({ notes: null, _db: null, _projectId: null }),
}));
