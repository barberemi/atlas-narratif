import { create } from 'zustand';

/**
 * Factory pour un store d'entités avec le pattern load/save/remove/_reload.
 *
 * @param {Object}   opts
 * @param {Object}   opts.initialState  - champs de données + valeurs par défaut
 * @param {Function} opts.fetchFn       - (db, projectId) => Object à merger dans le state
 * @param {Function} opts.insertFn      - (db, data, projectId) => id
 * @param {Function} opts.updateFn      - (db, id, data, projectId) => void
 * @param {Function} opts.deleteFn      - (db, id, projectId) => void
 */
export function createEntityStore({ initialState, fetchFn, insertFn, updateFn, deleteFn }) {
  return create((set, get) => {
    async function _reload() {
      const { _db, _projectId } = get();
      set(await fetchFn(_db, _projectId));
    }

    return {
      ...initialState,
      saving:     false,
      _db:        null,
      _projectId: null,

      load: async (db, projectId) => {
        set({ _db: db, _projectId: projectId });
        set(await fetchFn(db, projectId));
      },

      _reload,

      save: async (id, data) => {
        const { _db, _projectId } = get();
        if (!_db || !_projectId) return;
        set({ saving: true });
        try {
          if (id) await updateFn(_db, id, data, _projectId);
          else    await insertFn(_db, data, _projectId);
          await _reload();
        } finally {
          set({ saving: false });
        }
      },

      remove: async (id) => {
        const { _db, _projectId } = get();
        if (!_db || !_projectId) return;
        set({ saving: true });
        try {
          await deleteFn(_db, id, _projectId);
          await _reload();
        } finally {
          set({ saving: false });
        }
      },

      reset: () => set({ ...initialState, saving: false, _db: null, _projectId: null }),
    };
  });
}
