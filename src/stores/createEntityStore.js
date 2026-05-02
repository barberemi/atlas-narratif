import { create } from 'zustand';
import { useSaveIndicator } from './useSaveIndicator';

/**
 * Factory pour un store d'entités avec le pattern load/save/remove/_reload.
 *
 * @param {Object}   opts
 * @param {Object}   opts.initialState  - champs de données + valeurs par défaut
 * @param {Function} opts.fetchFn       - (projectId) => Object à merger dans le state
 * @param {Function} opts.insertFn      - (data, projectId) => id
 * @param {Function} opts.updateFn      - (id, data, projectId) => void
 * @param {Function} opts.deleteFn      - (id, projectId) => void
 */
export function createEntityStore({ initialState, fetchFn, insertFn, updateFn, deleteFn }) {
  return create((set, get) => {
    async function _reload() {
      const { _projectId } = get();
      set(await fetchFn(_projectId));
    }

    return {
      ...initialState,
      saving:     false,
      _projectId: null,
      _loading:   false,

      load: async (projectId) => {
        const { _projectId, _loading } = get();
        if (_loading || (_projectId === projectId && get()[Object.keys(initialState)[0]] !== null)) return;
        set({ _projectId: projectId, _loading: true });
        try { set(await fetchFn(projectId)); }
        finally { set({ _loading: false }); }
      },

      _reload,

      save: async (id, data) => {
        const { _projectId } = get();
        if (!_projectId) return;
        set({ saving: true });
        useSaveIndicator.getState().markSaving();
        try {
          if (id) await updateFn(id, data, _projectId);
          else    await insertFn(data, _projectId);
          await _reload();
        } finally {
          set({ saving: false });
          useSaveIndicator.getState().markSaved();
        }
      },

      remove: async (id) => {
        const { _projectId } = get();
        if (!_projectId) return;
        set({ saving: true });
        useSaveIndicator.getState().markSaving();
        try {
          const snapshot = await deleteFn(id, _projectId);
          await _reload();
          return snapshot;
        } finally {
          set({ saving: false });
          useSaveIndicator.getState().markSaved();
        }
      },

      reset: () => set({ ...initialState, saving: false, _projectId: null, _loading: false }),
    };
  });
}
