import { create } from 'zustand';
import { getArcPoints, upsertArcPoint } from '../api/client';
import { useSaveIndicator } from './useSaveIndicator';

export const useArcStore = create((set, get) => ({
  points:     null,
  _projectId: null,
  _loading:   false,

  load: async (projectId) => {
    const { _projectId, _loading, points } = get();
    if (_loading || (_projectId === projectId && points !== null)) return;
    set({ _projectId: projectId, _loading: true });
    try {
      const result = await getArcPoints(projectId);
      set({ points: result, _loading: false });
    } catch (e) { set({ _loading: false }); throw e; }
  },

  setIntensity: async (chapterNumber, intensity) => {
    const { _projectId, points } = get();
    if (!_projectId) return;
    const existing = points?.find(p => p.chapterNumber === chapterNumber);
    const updated  = existing
      ? points.map(p => p.chapterNumber === chapterNumber ? { ...p, intensity } : p)
      : [...(points ?? []), { chapterNumber, intensity, note: null }];
    set({ points: updated });
    useSaveIndicator.getState().markSaving();
    await upsertArcPoint(_projectId, chapterNumber, intensity);
    useSaveIndicator.getState().markSaved();
  },

  reset: () => set({ points: null, _projectId: null, _loading: false }),
}));
