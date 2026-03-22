import { create } from 'zustand';
import { getIncoherences, setIncoherenceResolved, setResolutionNote, deleteScanIncoherences, insertScannedIncoherence } from '../db/queries';
import { runDetection } from '../db/detectIncoherences';

export const useIncStore = create((set, get) => ({
  data:          null,
  scanning:      false,
  lastScanCount: null,
  _db:           null,
  _projectId:    null,

  load: async (db, projectId) => {
    set({ _db: db, _projectId: projectId });
    const data = await getIncoherences(db, projectId);
    set({ data });
  },

  /** Bascule resolved d'une incohérence (optimistic update). */
  toggle: async (incId) => {
    const { _db, _projectId, data } = get();
    const inc = data?.find(i => i.id === incId);
    if (!inc || !_db || !_projectId) return;
    // Mise à jour optimiste immédiate
    set({ data: data.map(i => i.id === incId ? { ...i, resolved: !i.resolved } : i) });
    await setIncoherenceResolved(_db, incId, !inc.resolved, _projectId);
  },

  setNote: async (incId, note) => {
    const { _db, _projectId, data } = get();
    if (!_db || !_projectId) return;
    set({ data: data.map(i => i.id === incId ? { ...i, resolutionNote: note } : i) });
    await setResolutionNote(_db, incId, note, _projectId);
  },

  /** Lance la détection client-side et fusionne avec les incohérences existantes. */
  rescan: async (loreAndEvents) => {
    const { _db, _projectId } = get();
    if (!_db || !_projectId) return;
    set({ scanning: true });
    try {
      const detected = runDetection(loreAndEvents);
      await deleteScanIncoherences(_db, _projectId);
      for (const inc of detected) {
        await insertScannedIncoherence(_db, inc, _projectId);
      }
      const data = await getIncoherences(_db, _projectId);
      set({ data, lastScanCount: detected.length });
    } finally {
      set({ scanning: false });
    }
  },

  reset: () => set({ data: null, scanning: false, lastScanCount: null, _db: null, _projectId: null }),
}));
