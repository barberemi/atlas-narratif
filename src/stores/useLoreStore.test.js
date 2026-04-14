import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../api/client', () => ({
  getLoreData:            vi.fn(),
  insertCharacter:        vi.fn(),
  updateCharacter:        vi.fn(),
  deleteCharacter:        vi.fn(),
  insertLocation:         vi.fn(),
  updateLocation:         vi.fn(),
  deleteLocation:         vi.fn(),
  insertObject:           vi.fn(),
  updateObject:           vi.fn(),
  deleteObject:           vi.fn(),
  setLocationCoordinates: vi.fn(),
  insertGroup:            vi.fn(),
  updateGroup:            vi.fn(),
  deleteGroup:            vi.fn(),
  setCharacterGroups:     vi.fn(),
}));

vi.mock('../utils/entityUtils', () => ({
  initEntityCache: vi.fn(),
}));

import { useLoreStore } from './useLoreStore';
import {
  getLoreData,
  insertCharacter, updateCharacter, deleteCharacter,
  insertLocation,  updateLocation,  deleteLocation,
  insertObject,    updateObject,
  setLocationCoordinates,
} from '../api/client';
import { initEntityCache } from '../utils/entityUtils';

const PROJECT_ID = 'proj_test';

const LORE_DATA = {
  characters: [{ id: 'char_1', name: 'Alice', coordinates: null }],
  locations:  [{ id: 'loc_1',  name: 'Paris', coordinates: { x: 10, y: 20 } }],
  objects:    [{ id: 'obj_1',  name: 'Épée' }],
  groups:     [],
};

beforeEach(() => {
  vi.clearAllMocks();
  useLoreStore.getState().reset();
});

// ── load() ───────────────────────────────────────────────────────────────────

describe('load()', () => {
  it('charge characters, locations et objects', async () => {
    vi.mocked(getLoreData).mockResolvedValue(LORE_DATA);
    await useLoreStore.getState().load(PROJECT_ID);
    const s = useLoreStore.getState();
    expect(s.characters).toEqual(LORE_DATA.characters);
    expect(s.locations).toEqual(LORE_DATA.locations);
    expect(s.objects).toEqual(LORE_DATA.objects);
  });

  it('passe ready à true', async () => {
    vi.mocked(getLoreData).mockResolvedValue(LORE_DATA);
    await useLoreStore.getState().load(PROJECT_ID);
    expect(useLoreStore.getState().ready).toBe(true);
  });

  it("initialise le cache d'entités", async () => {
    vi.mocked(getLoreData).mockResolvedValue(LORE_DATA);
    await useLoreStore.getState().load(PROJECT_ID);
    expect(initEntityCache).toHaveBeenCalledWith(LORE_DATA);
  });
});

// ── saveCharacter() ───────────────────────────────────────────────────────────

describe('saveCharacter()', () => {
  beforeEach(async () => {
    vi.mocked(getLoreData).mockResolvedValue(LORE_DATA);
    vi.mocked(insertCharacter).mockResolvedValue('new_char_id');
    vi.mocked(updateCharacter).mockResolvedValue();
    await useLoreStore.getState().load(PROJECT_ID);
  });

  it("appelle insertCharacter si pas d'id", async () => {
    await useLoreStore.getState().saveCharacter(null, { name: 'Bob' });
    expect(insertCharacter).toHaveBeenCalledWith({ name: 'Bob' }, PROJECT_ID);
  });

  it('appelle updateCharacter si id fourni', async () => {
    await useLoreStore.getState().saveCharacter('char_1', { name: 'Alice 2' });
    expect(updateCharacter).toHaveBeenCalledWith('char_1', { name: 'Alice 2' }, PROJECT_ID);
  });

  it('recharge les données et re-initialise le cache après save', async () => {
    vi.mocked(getLoreData).mockResolvedValue(LORE_DATA);
    await useLoreStore.getState().saveCharacter(null, { name: 'Bob' });
    expect(initEntityCache).toHaveBeenCalledTimes(2); // load + reload
  });

  it("remet saving à false après l'opération", async () => {
    await useLoreStore.getState().saveCharacter(null, { name: 'Bob' });
    expect(useLoreStore.getState().saving).toBe(false);
  });

  it('ne fait rien si _projectId est null', async () => {
    useLoreStore.getState().reset();
    await useLoreStore.getState().saveCharacter(null, { name: 'Bob' });
    expect(insertCharacter).not.toHaveBeenCalled();
  });
});

// ── removeCharacter() ────────────────────────────────────────────────────────

describe('removeCharacter()', () => {
  const SNAPSHOT = { entity: { id: 'char_1', name: 'Alice' }, eventEntities: [] };

  beforeEach(async () => {
    vi.mocked(getLoreData).mockResolvedValue(LORE_DATA);
    vi.mocked(deleteCharacter).mockResolvedValue(SNAPSHOT);
    await useLoreStore.getState().load(PROJECT_ID);
  });

  it('appelle deleteCharacter', async () => {
    await useLoreStore.getState().removeCharacter('char_1');
    expect(deleteCharacter).toHaveBeenCalledWith('char_1', PROJECT_ID);
  });

  it('recharge les données après suppression', async () => {
    const updated = { ...LORE_DATA, characters: [] };
    vi.mocked(getLoreData).mockResolvedValue(updated);
    await useLoreStore.getState().removeCharacter('char_1');
    expect(useLoreStore.getState().characters).toEqual([]);
  });

  it('retourne le snapshot pour undo', async () => {
    const result = await useLoreStore.getState().removeCharacter('char_1');
    expect(result).toEqual(SNAPSHOT);
  });
});

// ── setCoordinates() ──────────────────────────────────────────────────────────

describe('setCoordinates()', () => {
  beforeEach(async () => {
    vi.mocked(getLoreData).mockResolvedValue(LORE_DATA);
    vi.mocked(setLocationCoordinates).mockResolvedValue();
    await useLoreStore.getState().load(PROJECT_ID);
  });

  it('met à jour les coordonnées immédiatement (optimiste)', async () => {
    await useLoreStore.getState().setCoordinates('loc_1', { x: 50, y: 60 });
    const loc = useLoreStore.getState().locations.find(l => l.id === 'loc_1');
    expect(loc?.coordinates).toEqual({ x: 50, y: 60 });
  });

  it('ne modifie pas les autres lieux', async () => {
    const extra = { ...LORE_DATA, locations: [
      { id: 'loc_1', name: 'Paris',   coordinates: { x: 10, y: 20 } },
      { id: 'loc_2', name: 'Londres', coordinates: { x: 30, y: 40 } },
    ]};
    vi.mocked(getLoreData).mockResolvedValue(extra);
    useLoreStore.getState().reset();
    await useLoreStore.getState().load(PROJECT_ID);

    await useLoreStore.getState().setCoordinates('loc_1', { x: 99, y: 99 });
    const loc2 = useLoreStore.getState().locations.find(l => l.id === 'loc_2');
    expect(loc2?.coordinates).toEqual({ x: 30, y: 40 });
  });

  it('persiste via setLocationCoordinates', async () => {
    const coords = { x: 50, y: 60 };
    await useLoreStore.getState().setCoordinates('loc_1', coords);
    expect(setLocationCoordinates).toHaveBeenCalledWith('loc_1', PROJECT_ID, coords);
  });

  it('ne fait rien si _projectId est null', async () => {
    useLoreStore.getState().reset();
    await useLoreStore.getState().setCoordinates('loc_1', { x: 1, y: 2 });
    expect(setLocationCoordinates).not.toHaveBeenCalled();
  });
});

// ── saveLocation() / removeLocation() / saveObject() ─────────────────────────

describe('saveLocation()', () => {
  beforeEach(async () => {
    vi.mocked(getLoreData).mockResolvedValue(LORE_DATA);
    vi.mocked(insertLocation).mockResolvedValue();
    vi.mocked(updateLocation).mockResolvedValue();
    await useLoreStore.getState().load(PROJECT_ID);
  });

  it("insert si pas d'id", async () => {
    await useLoreStore.getState().saveLocation(null, { name: 'Lyon' });
    expect(insertLocation).toHaveBeenCalledWith({ name: 'Lyon' }, PROJECT_ID);
  });

  it('update si id fourni', async () => {
    await useLoreStore.getState().saveLocation('loc_1', { name: 'Paris updated' });
    expect(updateLocation).toHaveBeenCalledWith('loc_1', { name: 'Paris updated' }, PROJECT_ID);
  });
});

describe('removeLocation()', () => {
  const SNAPSHOT = { entity: { id: 'loc_1', name: 'Paris' }, eventEntities: [] };

  beforeEach(async () => {
    vi.mocked(getLoreData).mockResolvedValue(LORE_DATA);
    vi.mocked(deleteLocation).mockResolvedValue(SNAPSHOT);
    await useLoreStore.getState().load(PROJECT_ID);
  });

  it('appelle deleteLocation', async () => {
    await useLoreStore.getState().removeLocation('loc_1');
    expect(deleteLocation).toHaveBeenCalledWith('loc_1', PROJECT_ID);
  });

  it('retourne le snapshot pour undo', async () => {
    const result = await useLoreStore.getState().removeLocation('loc_1');
    expect(result).toEqual(SNAPSHOT);
  });
});

describe('saveObject()', () => {
  beforeEach(async () => {
    vi.mocked(getLoreData).mockResolvedValue(LORE_DATA);
    vi.mocked(insertObject).mockResolvedValue();
    vi.mocked(updateObject).mockResolvedValue();
    await useLoreStore.getState().load(PROJECT_ID);
  });

  it("insert si pas d'id", async () => {
    await useLoreStore.getState().saveObject(null, { name: 'Bouclier' });
    expect(insertObject).toHaveBeenCalledWith({ name: 'Bouclier' }, PROJECT_ID);
  });

  it('update si id fourni', async () => {
    await useLoreStore.getState().saveObject('obj_1', { name: 'Épée +1' });
    expect(updateObject).toHaveBeenCalledWith('obj_1', { name: 'Épée +1' }, PROJECT_ID);
  });
});

// ── reset() ───────────────────────────────────────────────────────────────────

describe('reset()', () => {
  it("restaure l'état initial", async () => {
    vi.mocked(getLoreData).mockResolvedValue(LORE_DATA);
    await useLoreStore.getState().load(PROJECT_ID);
    useLoreStore.getState().reset();
    const s = useLoreStore.getState();
    expect(s.characters).toEqual([]);
    expect(s.locations).toEqual([]);
    expect(s.objects).toEqual([]);
    expect(s.ready).toBe(false);
    expect(s.saving).toBe(false);
    expect(s._projectId).toBeNull();
  });
});
