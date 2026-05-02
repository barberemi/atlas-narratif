import { create } from 'zustand';
import {
  getIncoherences,
  setIncoherenceResolved,
  setResolutionNote,
  deleteScanIncoherences,
  insertScannedIncoherence,
} from '../api/client';
import { runDetection } from '../db/detectIncoherences';
import { useSaveIndicator } from './useSaveIndicator';

export const useIncStore = create((set, get) => ({
  data:          null,
  scanning:      false,
  lastScanCount: null,
  _projectId:    null,
  _loading:      false,

  load: async (projectId) => {
    const { _projectId, _loading, data } = get();
    if (_loading || (_projectId === projectId && data !== null)) return;
    set({ _projectId: projectId, _loading: true });
    try {
      const result = await getIncoherences(projectId);
      set({ data: result, _loading: false });
    } catch (e) { set({ _loading: false }); throw e; }
  },

  toggle: async (incId) => {
    const { _projectId, data } = get();
    const inc = data?.find(i => i.id === incId);
    if (!inc || !_projectId) return;
    set({ data: data.map(i => i.id === incId ? { ...i, resolved: !i.resolved } : i) });
    useSaveIndicator.getState().markSaving();
    await setIncoherenceResolved(incId, !inc.resolved, _projectId);
    useSaveIndicator.getState().markSaved();
  },

  setNote: async (incId, note) => {
    const { _projectId, data } = get();
    if (!_projectId) return;
    set({ data: data.map(i => i.id === incId ? { ...i, resolutionNote: note } : i) });
    useSaveIndicator.getState().markSaving();
    await setResolutionNote(incId, note, _projectId);
    useSaveIndicator.getState().markSaved();
  },

  rescan: async (loreAndEvents) => {
    const { _projectId } = get();
    if (!_projectId) return;
    set({ scanning: true });
    try {
      const detected = runDetection(loreAndEvents);
      await deleteScanIncoherences(_projectId);
      for (const inc of detected) {
        await insertScannedIncoherence(inc, _projectId);
      }
      const data = await getIncoherences(_projectId);
      set({ data, lastScanCount: detected.length });
    } finally {
      set({ scanning: false });
    }
  },

  reset: () => set({ data: null, scanning: false, lastScanCount: null, _projectId: null, _loading: false }),
}));
