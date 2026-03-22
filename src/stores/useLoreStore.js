import { create } from 'zustand';
import {
  getLoreData,
  insertCharacter, updateCharacter, deleteCharacter,
  insertLocation,  updateLocation,  deleteLocation,
  insertObject,    updateObject,    deleteObject,
  setLocationCoordinates,
  insertGroup,     updateGroup,     deleteGroup,
  setCharacterGroups,
} from '../db/queries';
import { initEntityCache } from '../utils/entityUtils';

export const useLoreStore = create((set, get) => {
  async function _reload() {
    const { _db, _projectId } = get();
    const data = await getLoreData(_db, _projectId);
    initEntityCache(data);
    set(data);
  }

  async function _withSaving(fn) {
    const { _db, _projectId } = get();
    if (!_db || !_projectId) return;
    set({ saving: true });
    try {
      await fn(_db, _projectId);
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
    _db:        null,
    _projectId: null,

    load: async (db, projectId) => {
      set({ _db: db, _projectId: projectId });
      const data = await getLoreData(db, projectId);
      initEntityCache(data);
      set({ ...data, ready: true });
    },

    _reload,

    // ── Personnages ───────────────────────────────────────────────────────────

    saveCharacter: (charId, data) => _withSaving(async (db, pid) => {
      const id = charId
        ? (await updateCharacter(db, charId, data, pid), charId)
        : await insertCharacter(db, data, pid);
      if (data.groupIds !== undefined) {
        await setCharacterGroups(db, id, data.groupIds, pid);
      }
    }),

    removeCharacter: (charId) => _withSaving((db, pid) =>
      deleteCharacter(db, charId, pid)
    ),

    // ── Lieux ─────────────────────────────────────────────────────────────────

    saveLocation: (locId, data) => _withSaving((db, pid) =>
      locId ? updateLocation(db, locId, data, pid) : insertLocation(db, data, pid)
    ),

    removeLocation: (locId) => _withSaving((db, pid) =>
      deleteLocation(db, locId, pid)
    ),

    // Met à jour les coordonnées d'un lieu (optimiste) + persiste en DB
    setCoordinates: async (locId, coords) => {
      const { _db, _projectId } = get();
      if (!_db || !_projectId) return;
      set(s => ({ locations: s.locations.map(l => l.id === locId ? { ...l, coordinates: coords } : l) }));
      await setLocationCoordinates(_db, locId, _projectId, coords);
    },

    // ── Objets ────────────────────────────────────────────────────────────────

    saveObject: (objId, data) => _withSaving((db, pid) =>
      objId ? updateObject(db, objId, data, pid) : insertObject(db, data, pid)
    ),

    removeObject: (objId) => _withSaving((db, pid) =>
      deleteObject(db, objId, pid)
    ),

    // ── Groupes ───────────────────────────────────────────────────────────────

    saveGroup: (groupId, data) => _withSaving((db, pid) =>
      groupId ? updateGroup(db, groupId, data, pid) : insertGroup(db, data, pid)
    ),

    removeGroup: (groupId) => _withSaving((db, pid) =>
      deleteGroup(db, groupId, pid)
    ),

    reset: () => set({ characters: [], locations: [], objects: [], groups: [], ready: false, saving: false, _db: null, _projectId: null }),
  };
});
