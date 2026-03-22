import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./seed.generic', () => ({
  seedProject: vi.fn().mockResolvedValue(undefined),
}));

import { createEmptyProject } from './createEmptyProject';
import { seedProject } from './seed.generic';

const DB = { __mock: 'db' };

beforeEach(() => vi.clearAllMocks());

describe('createEmptyProject', () => {
  it('retourne un UUID valide', async () => {
    const id = await createEmptyProject(DB, { name: 'Mon roman' });
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
  });

  it('appelle seedProject avec le bon nom et des données vides', async () => {
    const id = await createEmptyProject(DB, { name: 'Mon roman', description: 'Desc' });

    expect(seedProject).toHaveBeenCalledOnce();
    const [dbArg, projectArg, dataArg] = seedProject.mock.calls[0];

    expect(dbArg).toBe(DB);
    expect(projectArg.name).toBe('Mon roman');
    expect(projectArg.description).toBe('Desc');
    expect(projectArg.id).toBe(id);              // même id que retourné
    expect(dataArg.loreDB.characters).toEqual([]);
    expect(dataArg.loreDB.locations).toEqual([]);
    expect(dataArg.loreDB.objects).toEqual([]);
    expect(dataArg.timelineDB).toEqual([]);
    expect(dataArg.chaptersDB).toEqual([]);
  });

  it('utilise une description vide par défaut', async () => {
    await createEmptyProject(DB, { name: 'Sans description' });
    const [, projectArg] = seedProject.mock.calls[0];
    expect(projectArg.description).toBe('');
  });

  it('chaque appel génère un id unique', async () => {
    const id1 = await createEmptyProject(DB, { name: 'Projet A' });
    const id2 = await createEmptyProject(DB, { name: 'Projet B' });
    expect(id1).not.toBe(id2);
  });
});
