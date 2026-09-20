import { create } from 'zustand';
import {
  getCustomTypes,    insertCustomType,    updateCustomType,    deleteCustomType,
  getCustomEntities, insertCustomEntity,  updateCustomEntity,  deleteCustomEntity,
} from '../api/client';
import { useSaveIndicator } from './useSaveIndicator';
import { setCustomEntityCache } from '../utils/entityUtils';

/**
 * Store des types & entités custom (couche 3). Détient deux collections liées :
 * `types` (catégories définies par l'utilisateur) et `entities` (instances).
 * Pattern manuel calqué sur useLoreStore (_withSaving + _reload).
 */
export const useCustomEntityStore = create((set, get) => {
  async function _reload() {
    const { _projectId } = get();
    const [types, entities] = await Promise.all([
      getCustomTypes(_projectId),
      getCustomEntities(_projectId),
    ]);
    setCustomEntityCache(entities, types);
    set({ types, entities });
  }

  async function _withSaving(fn) {
    const { _projectId } = get();
    if (!_projectId) return;
    set({ saving: true });
    useSaveIndicator.getState().markSaving();
    try {
      const result = await fn(_projectId);
      await _reload();
      return result;
    } finally {
      set({ saving: false });
      useSaveIndicator.getState().markSaved();
    }
  }

  return {
    types:      [],
    entities:   [],
    ready:      false,
    saving:     false,
    _projectId: null,
    _loading:   false,

    load: async (projectId) => {
      const { _projectId, _loading, ready } = get();
      if (_loading || (_projectId === projectId && ready)) return;
      set({ _projectId: projectId, _loading: true });
      try {
        const [types, entities] = await Promise.all([
          getCustomTypes(projectId),
          getCustomEntities(projectId),
        ]);
        setCustomEntityCache(entities, types);
        set({ types, entities, ready: true, _loading: false });
      } catch (e) { set({ _loading: false }); throw e; }
    },

    _reload,

    // ── Types ───────────────────────────────────────────────────────────────────

    saveType: (typeId, data) => _withSaving((pid) =>
      typeId ? updateCustomType(typeId, data, pid) : insertCustomType(data, pid)
    ),

    removeType: (typeId) => _withSaving((pid) =>
      deleteCustomType(typeId, pid)
    ),

    // ── Entités ─────────────────────────────────────────────────────────────────

    saveEntity: (entId, data) => _withSaving((pid) =>
      entId ? updateCustomEntity(entId, data, pid) : insertCustomEntity(data, pid)
    ),

    removeEntity: (entId) => _withSaving((pid) =>
      deleteCustomEntity(entId, pid)
    ),

    reset: () => { setCustomEntityCache([], []); set({ types: [], entities: [], ready: false, saving: false, _projectId: null, _loading: false }); },
  };
});
