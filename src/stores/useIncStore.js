import { create } from 'zustand';
import {
  getIncoherences,
  setIncoherenceResolved,
  setResolutionNote,
  deleteScanIncoherences,
  insertScannedIncoherence,
} from '../api/client';
import { runDetection } from '../db/detectIncoherences';

export const useIncStore = create((set, get) => ({
  data:          null,
  scanning:      false,
  lastScanCount: null,
  _projectId:    null,

  load: async (projectId) => {
    set({ _projectId: projectId });
    const data = await getIncoherences(projectId);
    set({ data });
  },

  toggle: async (incId) => {
    const { _projectId, data } = get();
    const inc = data?.find(i => i.id === incId);
    if (!inc || !_projectId) return;
    set({ data: data.map(i => i.id === incId ? { ...i, resolved: !i.resolved } : i) });
    await setIncoherenceResolved(incId, !inc.resolved, _projectId);
  },

  setNote: async (incId, note) => {
    const { _projectId, data } = get();
    if (!_projectId) return;
    set({ data: data.map(i => i.id === incId ? { ...i, resolutionNote: note } : i) });
    await setResolutionNote(incId, note, _projectId);
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

  reset: () => set({ data: null, scanning: false, lastScanCount: null, _projectId: null }),
}));
