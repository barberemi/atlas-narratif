import { create } from 'zustand';
import {
  getStcChapters,
  insertStcChapter,
  updateStcChapter,
  deleteStcChapter,
} from '../db/queries';

export const useStcStore = create((set, get) => ({
  chapters: null,
  saving: false,
  _db: null,
  _projectId: null,

  load: async (db, projectId) => {
    set({ _db: db, _projectId: projectId });
    const chapters = await getStcChapters(db, projectId);
    set({ chapters });
  },

  save: async (chapterId, data) => {
    const { _db, _projectId } = get();
    if (!_db || !_projectId) return;
    set({ saving: true });
    try {
      if (chapterId) {
        await updateStcChapter(_db, chapterId, data, _projectId);
      } else {
        await insertStcChapter(_db, data, _projectId);
      }
      const chapters = await getStcChapters(_db, _projectId);
      set({ chapters });
    } finally {
      set({ saving: false });
    }
  },

  remove: async (chapterId) => {
    const { _db, _projectId } = get();
    if (!_db || !_projectId) return;
    set({ saving: true });
    try {
      await deleteStcChapter(_db, chapterId, _projectId);
      const chapters = await getStcChapters(_db, _projectId);
      set({ chapters });
    } finally {
      set({ saving: false });
    }
  },

  reset: () => set({ chapters: null, saving: false, _db: null, _projectId: null }),
}));
