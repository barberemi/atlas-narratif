import { create } from 'zustand';
import {
  getLoreData,
  insertCharacter, updateCharacter, deleteCharacter,
  insertLocation,  updateLocation,  deleteLocation,
  insertObject,    updateObject,    deleteObject,
  setLocationCoordinates,
  insertGroup,     updateGroup,     deleteGroup,
  setCharacterGroups,
} from '../api/client';
import { initEntityCache } from '../utils/entityUtils';

export const useLoreStore = create((set, get) => {
  async function _reload() {
    const { _projectId } = get();
    const data = await getLoreData(_projectId);
    initEntityCache(data);
    set(data);
  }

  async function _withSaving(fn) {
    const { _projectId } = get();
    if (!_projectId) return;
    set({ saving: true });
    try {
      await fn(_projectId);
      await _reload();
    } finally {
      set({ saving: false });
    }
  }

  return {
    characters: [],
    locations:  [],
    objects:    [],
    groups:     [],
    ready:      false,
    saving:     false,
    _projectId: null,

    load: async (projectId) => {
      set({ _projectId: projectId });
      const data = await getLoreData(projectId);
      initEntityCache(data);
      set({ ...data, ready: true });
    },

    _reload,

    // ── Personnages ───────────────────────────────────────────────────────────

    saveCharacter: (charId, data) => _withSaving(async (pid) => {
      const id = charId
        ? (await updateCharacter(charId, data, pid), charId)
        : await insertCharacter(data, pid);
      if (data.groupIds !== undefined) {
        await setCharacterGroups(id, data.groupIds, pid);
      }
    }),

    removeCharacter: (charId) => _withSaving((pid) =>
      deleteCharacter(charId, pid)
    ),

    // ── Lieux ─────────────────────────────────────────────────────────────────

    saveLocation: (locId, data) => _withSaving((pid) =>
      locId ? updateLocation(locId, data, pid) : insertLocation(data, pid)
    ),

    removeLocation: (locId) => _withSaving((pid) =>
      deleteLocation(locId, pid)
    ),

    setCoordinates: async (locId, coords) => {
      const { _projectId } = get();
      if (!_projectId) return;
      set(s => ({ locations: s.locations.map(l => l.id === locId ? { ...l, coordinates: coords } : l) }));
      await setLocationCoordinates(locId, _projectId, coords);
    },

    // ── Objets ────────────────────────────────────────────────────────────────

    saveObject: (objId, data) => _withSaving((pid) =>
      objId ? updateObject(objId, data, pid) : insertObject(data, pid)
    ),

    removeObject: (objId) => _withSaving((pid) =>
      deleteObject(objId, pid)
    ),

    // ── Groupes ───────────────────────────────────────────────────────────────

    saveGroup: (groupId, data) => _withSaving((pid) =>
      groupId ? updateGroup(groupId, data, pid) : insertGroup(data, pid)
    ),

    removeGroup: (groupId) => _withSaving((pid) =>
      deleteGroup(groupId, pid)
    ),

    reset: () => set({ characters: [], locations: [], objects: [], groups: [], ready: false, saving: false, _projectId: null }),
  };
});
