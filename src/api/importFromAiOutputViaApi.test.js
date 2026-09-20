import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./client', () => ({ seedProjectViaApi: vi.fn().mockResolvedValue('harry_potter_tome_1_d_dev') }));

import { seedProjectViaApi } from './client';
import { importFromAiOutputViaApi } from './importFromAiOutputViaApi';

/** Fabrique un File JSON (jsdom) à partir d'un objet. */
function jsonFile(obj) {
  return new File([JSON.stringify(obj)], 'projet.json', { type: 'application/json' });
}

const BASE = {
  volumes: [{ id: 'vol_1', number: 1, title: 'Tome 1' }],
  loreDB: { characters: [{ id: 'char_a', name: 'A' }], locations: [], objects: [] },
  timelineDB: [
    { id: 'evt_1', chapter: 1, chapterTitle: 'C1', title: 'Scène 1', beatId: 'setup', povCharacterId: 'char_a', threadIds: ['thr_1'], sceneGoal: 'but', entities: [{ id: 'char_a', entityType: 'character' }] },
  ],
  chaptersDB: [{ id: 'ch_1', number: 1, title: 'C1', beats: ['setup'] }],
  customTypesDB: [], customEntitiesDB: [], relationsDB: [], threadsDB: [{ id: 'thr_1', name: 'Fil', color: '#fff' }],
};

beforeEach(() => { seedProjectViaApi.mockClear(); });

describe('importFromAiOutputViaApi — construction du payload seed', () => {
  it('mappe volumes → volumesDB et n\'envoie PAS la clé volumes (validateur strict)', async () => {
    await importFromAiOutputViaApi(jsonFile(BASE), { projectName: 'Mon Roman' });
    const [, data] = seedProjectViaApi.mock.calls[0];
    expect(data.volumesDB).toHaveLength(1);
    expect(data).not.toHaveProperty('volumes');
  });

  it('omet meta.description quand elle est vide (null refusé par le validateur)', async () => {
    await importFromAiOutputViaApi(jsonFile(BASE), { projectName: 'Mon Roman' });
    const [meta] = seedProjectViaApi.mock.calls[0];
    expect(meta).not.toHaveProperty('description');
    expect(meta.name).toBe('Mon Roman');
  });

  it('inclut meta.description quand elle est fournie', async () => {
    await importFromAiOutputViaApi(jsonFile(BASE), { projectName: 'Mon Roman', projectDesc: 'Un sous-titre' });
    const [meta] = seedProjectViaApi.mock.calls[0];
    expect(meta.description).toBe('Un sous-titre');
  });

  it('dérive eventExtrasDB depuis les champs inline des événements', async () => {
    await importFromAiOutputViaApi(jsonFile(BASE), { projectName: 'Mon Roman' });
    const [, data] = seedProjectViaApi.mock.calls[0];
    expect(data.eventExtrasDB.evt_1).toMatchObject({ beatId: 'setup', povCharacterId: 'char_a', threadIds: ['thr_1'], sceneGoal: 'but' });
  });

  it('retourne l\'id RÉSOLU par le serveur (avec suffixe device), pas le slug de base', async () => {
    const id = await importFromAiOutputViaApi(jsonFile(BASE), { projectName: 'Mon Roman' });
    expect(id).toBe('harry_potter_tome_1_d_dev');
  });
});
