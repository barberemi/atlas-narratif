import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../api/client', () => ({
  getCustomTypes:     vi.fn(),
  insertCustomType:   vi.fn(),
  updateCustomType:   vi.fn(),
  deleteCustomType:   vi.fn(),
  getCustomEntities:  vi.fn(),
  insertCustomEntity: vi.fn(),
  updateCustomEntity: vi.fn(),
  deleteCustomEntity: vi.fn(),
}));

import { useCustomEntityStore } from './useCustomEntityStore';
import {
  getCustomTypes, insertCustomType, updateCustomType, deleteCustomType,
  getCustomEntities, insertCustomEntity, deleteCustomEntity,
} from '../api/client';

const PROJECT_ID = 'proj_test';
const TYPES = [{ id: 'ctype_1', label: 'Langue', fieldSchema: [] }];
const ENTITIES = [{ id: 'cent_1', typeId: 'ctype_1', name: 'Quenya', customFields: {} }];

beforeEach(() => {
  vi.clearAllMocks();
  useCustomEntityStore.getState().reset();
  vi.mocked(getCustomTypes).mockResolvedValue(TYPES);
  vi.mocked(getCustomEntities).mockResolvedValue(ENTITIES);
});

describe('load()', () => {
  it('charge types et entities et passe ready à true', async () => {
    await useCustomEntityStore.getState().load(PROJECT_ID);
    const s = useCustomEntityStore.getState();
    expect(s.types).toEqual(TYPES);
    expect(s.entities).toEqual(ENTITIES);
    expect(s.ready).toBe(true);
  });

  it('ne recharge pas si déjà chargé pour le même projet', async () => {
    await useCustomEntityStore.getState().load(PROJECT_ID);
    await useCustomEntityStore.getState().load(PROJECT_ID);
    expect(getCustomTypes).toHaveBeenCalledTimes(1);
  });
});

describe('saveType()', () => {
  it('insère un nouveau type puis recharge', async () => {
    await useCustomEntityStore.getState().load(PROJECT_ID);
    vi.mocked(insertCustomType).mockResolvedValue('ctype_2');
    await useCustomEntityStore.getState().saveType(null, { label: 'Véhicule' });
    expect(insertCustomType).toHaveBeenCalledWith({ label: 'Véhicule' }, PROJECT_ID);
    expect(getCustomTypes).toHaveBeenCalledTimes(2); // load + reload
  });

  it('met à jour un type existant', async () => {
    await useCustomEntityStore.getState().load(PROJECT_ID);
    await useCustomEntityStore.getState().saveType('ctype_1', { label: 'Idiome' });
    expect(updateCustomType).toHaveBeenCalledWith('ctype_1', { label: 'Idiome' }, PROJECT_ID);
  });
});

describe('saveEntity() / removeEntity()', () => {
  it('insère une entité', async () => {
    await useCustomEntityStore.getState().load(PROJECT_ID);
    vi.mocked(insertCustomEntity).mockResolvedValue('cent_2');
    await useCustomEntityStore.getState().saveEntity(null, { typeId: 'ctype_1', name: 'Sindarin' });
    expect(insertCustomEntity).toHaveBeenCalledWith({ typeId: 'ctype_1', name: 'Sindarin' }, PROJECT_ID);
  });

  it('supprime une entité et renvoie le snapshot', async () => {
    await useCustomEntityStore.getState().load(PROJECT_ID);
    vi.mocked(deleteCustomEntity).mockResolvedValue({ entity: { id: 'cent_1' } });
    const snap = await useCustomEntityStore.getState().removeEntity('cent_1');
    expect(deleteCustomEntity).toHaveBeenCalledWith('cent_1', PROJECT_ID);
    expect(snap).toEqual({ entity: { id: 'cent_1' } });
  });
});

describe('removeType()', () => {
  it('supprime un type', async () => {
    await useCustomEntityStore.getState().load(PROJECT_ID);
    vi.mocked(deleteCustomType).mockResolvedValue({ entity: { id: 'ctype_1' }, entities: [] });
    await useCustomEntityStore.getState().removeType('ctype_1');
    expect(deleteCustomType).toHaveBeenCalledWith('ctype_1', PROJECT_ID);
  });
});

describe('reset()', () => {
  it('vide les collections', async () => {
    await useCustomEntityStore.getState().load(PROJECT_ID);
    useCustomEntityStore.getState().reset();
    const s = useCustomEntityStore.getState();
    expect(s.types).toEqual([]);
    expect(s.entities).toEqual([]);
    expect(s.ready).toBe(false);
  });
});
