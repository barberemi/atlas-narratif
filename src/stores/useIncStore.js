import { create } from 'zustand';
import { getIncoherences, setIncoherenceResolved } from '../db/queries';

export const useIncStore = create((set, get) => ({
  data: null,
  _db: null,
  _projectId: null,

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

  reset: () => set({ data: null, _db: null, _projectId: null }),
}));
