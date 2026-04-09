import { create } from 'zustand';

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

      load: async (projectId) => {
        set({ _projectId: projectId });
        set(await fetchFn(projectId));
      },

      _reload,

      save: async (id, data) => {
        const { _projectId } = get();
        if (!_projectId) return;
        set({ saving: true });
        try {
          if (id) await updateFn(id, data, _projectId);
          else    await insertFn(data, _projectId);
          await _reload();
        } finally {
          set({ saving: false });
        }
      },

      remove: async (id) => {
        const { _projectId } = get();
        if (!_projectId) return;
        set({ saving: true });
        try {
          await deleteFn(id, _projectId);
          await _reload();
        } finally {
          set({ saving: false });
        }
      },

      reset: () => set({ ...initialState, saving: false, _projectId: null }),
    };
  });
}
