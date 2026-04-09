import { create } from 'zustand';
import { getArcPoints, upsertArcPoint } from '../api/client';

export const useArcStore = create((set, get) => ({
  points:     null,
  _projectId: null,

  load: async (projectId) => {
    set({ _projectId: projectId });
    const points = await getArcPoints(projectId);
    set({ points });
  },

  setIntensity: async (chapterNumber, intensity) => {
    const { _projectId, points } = get();
    if (!_projectId) return;
    const existing = points?.find(p => p.chapterNumber === chapterNumber);
    const updated  = existing
      ? points.map(p => p.chapterNumber === chapterNumber ? { ...p, intensity } : p)
      : [...(points ?? []), { chapterNumber, intensity, note: null }];
    set({ points: updated });
    await upsertArcPoint(_projectId, chapterNumber, intensity);
  },

  reset: () => set({ points: null, _projectId: null }),
}));
