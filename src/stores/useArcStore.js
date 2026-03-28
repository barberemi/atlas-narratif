import { create } from 'zustand';
import { getArcPoints, upsertArcPoint } from '../db/queries';

export const useArcStore = create((set, get) => ({
  points:     null,
  _db:        null,
  _projectId: null,

  load: async (db, projectId) => {
    set({ _db: db, _projectId: projectId });
    const points = await getArcPoints(db, projectId);
    set({ points });
  },

  setIntensity: async (chapterNumber, intensity) => {
    const { _db, _projectId, points } = get();
    if (!_db || !_projectId) return;
    const existing = points?.find(p => p.chapterNumber === chapterNumber);
    const updated  = existing
      ? points.map(p => p.chapterNumber === chapterNumber ? { ...p, intensity } : p)
      : [...(points ?? []), { chapterNumber, intensity, note: null }];
    set({ points: updated });
    await upsertArcPoint(_db, _projectId, chapterNumber, intensity);
  },

  reset: () => set({ points: null, _db: null, _projectId: null }),
}));
