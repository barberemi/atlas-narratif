import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getCharacters, getObjects, getTimelineEvents,
  insertCharacter, updateCharacter, deleteCharacter,
  insertLocation,  updateLocation,  deleteLocation,
  insertObject,    updateObject,    deleteObject,
  insertTimelineEvent, updateTimelineEvent,
  getCharacterAxes, getAllProjectAxisLabels, getAllCharacterAxes,
  insertCharacterAxis, deleteCharacterAxis,
  upsertCharacterArcPoint, getCharacterArcPoints, getAllCharacterArcPoints,
  getPlants, insertPlant, updatePlant, deletePlant,
  getVolumes, insertVolume, updateVolume, deleteVolume,
} from './queries';

const PID = 'proj_test';

function makeDb(rows = []) {
  return { query: vi.fn().mockResolvedValue({ rows }) };
}

beforeEach(() => vi.clearAllMocks());

// ── parseJsonField — testé via les getters ────────────────────────────────────

describe('parseJsonField (via getCharacters)', () => {
  it('parse un champ JSON string', async () => {
    const db = makeDb([{
      id: 'c1', name: 'Alice',
      aliases: '["Ally"]', extra: '{}',
      origin: null, description: null,
      color: '#fff', journey_key: null, source: 'import',
    }]);
    const [char] = await getCharacters(db, PID);
    expect(char.aliases).toEqual(['Ally']);
  });

  it('accepte un objet JSONB directement (sans re-parser)', async () => {
    const db = makeDb([{
      id: 'c1', name: 'Alice',
      aliases: ['DirectObj'], extra: {},
      origin: null, description: null,
      color: '#fff', journey_key: null, source: 'import',
    }]);
    const [char] = await getCharacters(db, PID);
    expect(char.aliases).toEqual(['DirectObj']);
  });

  it('retourne le fallback pour null', async () => {
    const db = makeDb([{
      id: 'c1', name: 'Alice',
      aliases: null, extra: null,
      origin: null, description: null,
      color: null, journey_key: null, source: null,
    }]);
    const [char] = await getCharacters(db, PID);
    expect(char.aliases).toEqual([]);
  });

  it('retourne le fallback pour un JSON invalide', async () => {
    const db = makeDb([{
      id: 'c1', name: 'Alice',
      aliases: '{invalide json', extra: '{}',
      origin: null, description: null,
      color: null, journey_key: null, source: null,
    }]);
    const [char] = await getCharacters(db, PID);
    expect(char.aliases).toEqual([]);
  });
});

// ── getCharacters — mapping snake_case → camelCase ────────────────────────────

describe('getCharacters — mapping', () => {
  function makeRow(overrides = {}) {
    return {
      id: 'c1', name: 'Alice',
      aliases: '[]',
      extra: '{"deathEventId":"evt_3"}',
      origin: 'Paris',
      description: 'Une héroïne', color: '#f00',
      journey_key: 'alice_key', source: 'import',
      ...overrides,
    };
  }

  it('mappe journey_key → journeyKey', async () => {
    const [char] = await getCharacters(makeDb([makeRow()]), PID);
    expect(char.journeyKey).toBe('alice_key');
  });

  it('extrait deathEventId depuis extra', async () => {
    const [char] = await getCharacters(makeDb([makeRow()]), PID);
    expect(char.deathEventId).toBe('evt_3');
  });

  it('deathEventId = null si absent de extra', async () => {
    const [char] = await getCharacters(makeDb([makeRow({ extra: '{}' })]), PID);
    expect(char.deathEventId).toBeNull();
  });

  it('source par défaut à "import" si null en DB', async () => {
    const [char] = await getCharacters(makeDb([makeRow({ source: null })]), PID);
    expect(char.source).toBe('import');
  });
});

// ── getObjects — extraction depuis extra ──────────────────────────────────────

describe('getObjects — champs extra', () => {
  function makeRow(extra = {}) {
    return {
      id: 'o1', name: 'Épée',
      type: null, description: null, creator: null,
      current_holder: 'Alice', source: 'import',
      extra: JSON.stringify(extra),
    };
  }

  it('mappe current_holder → currentHolder', async () => {
    const [obj] = await getObjects(makeDb([makeRow()]), PID);
    expect(obj.currentHolder).toBe('Alice');
  });

  it('status par défaut à "active"', async () => {
    const [obj] = await getObjects(makeDb([makeRow({})]), PID);
    expect(obj.status).toBe('active');
  });

  it('lit status depuis extra', async () => {
    const [obj] = await getObjects(makeDb([makeRow({ status: 'lost' })]), PID);
    expect(obj.status).toBe('lost');
  });

  it('statusChangedAtChapter par défaut à null', async () => {
    const [obj] = await getObjects(makeDb([makeRow({})]), PID);
    expect(obj.statusChangedAtChapter).toBeNull();
  });
});

// ── getTimelineEvents — groupement entities ───────────────────────────────────

describe('getTimelineEvents — groupement entities', () => {
  it('attache les entités au bon événement', async () => {
    const db = {
      query: vi.fn()
        .mockResolvedValueOnce({ rows: [
          { id: 'e1', chapter_num: 1, chapter_title: 'Ch1', title: 'T1', description: null, location_id: null, extra: '{}', source: 'import' },
          { id: 'e2', chapter_num: 2, chapter_title: 'Ch2', title: 'T2', description: null, location_id: null, extra: '{}', source: 'import' },
        ]})
        .mockResolvedValueOnce({ rows: [
          { event_id: 'e1', entity_id: 'c1', entity_type: 'character' },
          { event_id: 'e1', entity_id: 'l1', entity_type: 'location'  },
          { event_id: 'e2', entity_id: 'c2', entity_type: 'character' },
        ]}),
    };

    const events = await getTimelineEvents(db, PID);

    expect(events[0].entities).toHaveLength(2);
    expect(events[1].entities).toHaveLength(1);
    expect(events[0].entities[0]).toEqual({ id: 'c1', entityType: 'character' });
  });

  it('entities = [] si aucune entité pour cet événement', async () => {
    const db = {
      query: vi.fn()
        .mockResolvedValueOnce({ rows: [
          { id: 'e1', chapter_num: 1, chapter_title: 'Ch1', title: 'T', description: null, location_id: null, extra: '{}', source: 'import' },
        ]})
        .mockResolvedValueOnce({ rows: [] }),
    };
    const [evt] = await getTimelineEvents(db, PID);
    expect(evt.entities).toEqual([]);
  });

  it('extrait beatId depuis extra', async () => {
    const db = {
      query: vi.fn()
        .mockResolvedValueOnce({ rows: [
          { id: 'e1', chapter_num: 1, chapter_title: 'Ch1', title: 'T', description: null, location_id: null, extra: '{"beatId":"midpoint"}', source: 'import' },
        ]})
        .mockResolvedValueOnce({ rows: [] }),
    };
    const [evt] = await getTimelineEvents(db, PID);
    expect(evt.beatId).toBe('midpoint');
  });
});

// ── insertCharacter ───────────────────────────────────────────────────────────

describe('insertCharacter', () => {
  it('préfixe l\'id avec "char_"', async () => {
    const db = makeDb();
    const id = await insertCharacter(db, { name: 'Alice' }, PID);
    expect(id).toMatch(/^char_/);
  });

  it('utilise source = "manual"', async () => {
    const db = makeDb();
    await insertCharacter(db, { name: 'Alice' }, PID);
    const sql = db.query.mock.calls[0][0];
    expect(sql).toContain("'manual'");
  });

  it('sérialise aliases en JSON string', async () => {
    const db = makeDb();
    await insertCharacter(db, { name: 'Alice', aliases: ['Ally', 'Al'] }, PID);
    const params = db.query.mock.calls[0][1];
    expect(params).toContain(JSON.stringify(['Ally', 'Al']));
  });

  it('utilise [] par défaut pour aliases/affiliation/traits', async () => {
    const db = makeDb();
    await insertCharacter(db, { name: 'Alice' }, PID);
    const params = db.query.mock.calls[0][1];
    expect(params).toContain('[]');
  });

  it('utilise #64748b par défaut pour color', async () => {
    const db = makeDb();
    await insertCharacter(db, { name: 'Alice' }, PID);
    const params = db.query.mock.calls[0][1];
    expect(params).toContain('#64748b');
  });

  it('retourne l\'id généré', async () => {
    const db = makeDb();
    const id = await insertCharacter(db, { name: 'Alice' }, PID);
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
  });
});

// ── updateCharacter — SOURCE_CASE ─────────────────────────────────────────────

describe('updateCharacter — SOURCE_CASE', () => {
  it('inclut SOURCE_CASE dans le SQL (import → modified)', async () => {
    const db = makeDb();
    await updateCharacter(db, 'c1', { name: 'Alice' }, PID);
    const sql = db.query.mock.calls[0][0];
    expect(sql).toContain("source = CASE WHEN source='import' THEN 'modified' ELSE source END");
  });

  it('passe id et projectId en fin de params', async () => {
    const db = makeDb();
    await updateCharacter(db, 'c1', { name: 'Alice' }, PID);
    const params = db.query.mock.calls[0][1];
    expect(params.at(-2)).toBe('c1');
    expect(params.at(-1)).toBe(PID);
  });
});

// ── deleteCharacter / deleteLocation / deleteObject ───────────────────────────

describe('deleteCharacter', () => {
  it('DELETE sur la table characters avec id et project_id', async () => {
    const db = makeDb();
    await deleteCharacter(db, 'c1', PID);
    const [sql, params] = db.query.mock.calls[0];
    expect(sql).toContain('DELETE FROM characters');
    expect(params).toEqual(['c1', PID]);
  });
});

describe('deleteLocation', () => {
  it('DELETE sur la table locations', async () => {
    const db = makeDb();
    await deleteLocation(db, 'l1', PID);
    const [sql] = db.query.mock.calls[0];
    expect(sql).toContain('DELETE FROM locations');
  });
});

describe('deleteObject', () => {
  it('DELETE sur la table objects', async () => {
    const db = makeDb();
    await deleteObject(db, 'o1', PID);
    const [sql] = db.query.mock.calls[0];
    expect(sql).toContain('DELETE FROM objects');
  });
});

// ── insertLocation ────────────────────────────────────────────────────────────

describe('insertLocation', () => {
  it('préfixe l\'id avec "loc_"', async () => {
    const db = makeDb();
    const id = await insertLocation(db, { name: 'Paris' }, PID);
    expect(id).toMatch(/^loc_/);
  });

  it('sérialise inhabitants/visitedBy/keyPlaces en JSON', async () => {
    const db = makeDb();
    await insertLocation(db, { name: 'Paris', inhabitants: ['Alice'] }, PID);
    const params = db.query.mock.calls[0][1];
    expect(params.some(p => typeof p === 'string' && p.includes('Alice'))).toBe(true);
  });
});

// ── insertObject ──────────────────────────────────────────────────────────────

describe('insertObject', () => {
  it('préfixe l\'id avec "obj_"', async () => {
    const db = makeDb();
    const id = await insertObject(db, { name: 'Épée' }, PID);
    expect(id).toMatch(/^obj_/);
  });

  it('sérialise status et statusChangedAtChapter dans extra', async () => {
    const db = makeDb();
    await insertObject(db, { name: 'Épée', status: 'lost', statusChangedAtChapter: 5 }, PID);
    const params = db.query.mock.calls[0][1];
    const extraParam = params.find(p => typeof p === 'string' && p.includes('lost'));
    expect(JSON.parse(extraParam)).toMatchObject({ status: 'lost', statusChangedAtChapter: 5 });
  });
});

// ── updateLocation / updateObject — SOURCE_CASE ───────────────────────────────

describe('updateLocation — SOURCE_CASE', () => {
  it('inclut SOURCE_CASE dans le SQL', async () => {
    const db = makeDb();
    await updateLocation(db, 'l1', { name: 'Lyon' }, PID);
    expect(db.query.mock.calls[0][0]).toContain("source = CASE WHEN source='import'");
  });
});

describe('updateObject — SOURCE_CASE', () => {
  it('inclut SOURCE_CASE dans le SQL', async () => {
    const db = makeDb();
    await updateObject(db, 'o1', { name: 'Épée+1' }, PID);
    expect(db.query.mock.calls[0][0]).toContain("source = CASE WHEN source='import'");
  });
});

// ── getTimelineEvents — POV + scene_order ─────────────────────────────────────

describe('getTimelineEvents — POV et sceneOrder', () => {
  function makeEvtRow(overrides = {}) {
    return {
      id: 'e1', chapter_num: 1, chapter_title: 'Ch1',
      title: 'T', description: null, location_id: null,
      extra: '{}', source: 'import',
      pov_character_id: null, scene_order: 0,
      ...overrides,
    };
  }

  function makeDb2(evtRows, entRows = []) {
    return {
      query: vi.fn()
        .mockResolvedValueOnce({ rows: evtRows })
        .mockResolvedValueOnce({ rows: entRows }),
    };
  }

  it('expose povCharacterId depuis pov_character_id', async () => {
    const db = makeDb2([makeEvtRow({ pov_character_id: 'char_alice' })]);
    const [evt] = await getTimelineEvents(db, PID);
    expect(evt.povCharacterId).toBe('char_alice');
  });

  it('povCharacterId = null si absent', async () => {
    const db = makeDb2([makeEvtRow()]);
    const [evt] = await getTimelineEvents(db, PID);
    expect(evt.povCharacterId).toBeNull();
  });

  it('expose sceneOrder depuis scene_order', async () => {
    const db = makeDb2([makeEvtRow({ scene_order: 3 })]);
    const [evt] = await getTimelineEvents(db, PID);
    expect(evt.sceneOrder).toBe(3);
  });

  it('sceneOrder = 0 si null en DB', async () => {
    const db = makeDb2([makeEvtRow({ scene_order: null })]);
    const [evt] = await getTimelineEvents(db, PID);
    expect(evt.sceneOrder).toBe(0);
  });
});

// ── insertTimelineEvent — POV + scene_order ───────────────────────────────────

describe('insertTimelineEvent', () => {
  function makeInsertDb(maxOrder = 0) {
    return {
      query: vi.fn()
        .mockResolvedValueOnce({ rows: [{ max_order: maxOrder }] }) // SELECT MAX
        .mockResolvedValue({ rows: [] }),                           // INSERT + entités
    };
  }

  it('préfixe l\'id avec "evt_"', async () => {
    const db = makeInsertDb();
    const id = await insertTimelineEvent(db, { chapter: 1, chapterTitle: 'Ch1', title: 'T' }, PID);
    expect(id).toMatch(/^evt_/);
  });

  it('inclut pov_character_id dans le SQL d\'insertion', async () => {
    const db = makeInsertDb();
    await insertTimelineEvent(db, { chapter: 1, chapterTitle: 'Ch1', title: 'T', povCharacterId: 'char_alice' }, PID);
    const insertCall = db.query.mock.calls[1]; // 2e appel = INSERT
    expect(insertCall[0]).toContain('pov_character_id');
    expect(insertCall[1]).toContain('char_alice');
  });

  it('pov_character_id = null si non fourni', async () => {
    const db = makeInsertDb();
    await insertTimelineEvent(db, { chapter: 1, chapterTitle: 'Ch1', title: 'T' }, PID);
    const insertCall = db.query.mock.calls[1];
    expect(insertCall[1]).toContain(null);
  });

  it('auto-calcule scene_order à MAX + 1 si non fourni', async () => {
    const db = makeInsertDb(4); // MAX = 4 → attendu 5
    await insertTimelineEvent(db, { chapter: 1, chapterTitle: 'Ch1', title: 'T' }, PID);
    const insertCall = db.query.mock.calls[1];
    expect(insertCall[1]).toContain(5);
  });

  it('utilise sceneOrder fourni explicitement', async () => {
    const db = makeInsertDb(4);
    await insertTimelineEvent(db, { chapter: 1, chapterTitle: 'Ch1', title: 'T', sceneOrder: 2 }, PID);
    const insertCall = db.query.mock.calls[1];
    expect(insertCall[1]).toContain(2);
  });
});

// ── updateTimelineEvent — POV + scene_order ───────────────────────────────────

describe('updateTimelineEvent', () => {
  it('inclut pov_character_id dans le SQL de mise à jour', async () => {
    const db = makeDb();
    await updateTimelineEvent(db, 'e1', {
      chapter: 1, chapterTitle: 'Ch1', title: 'T',
      povCharacterId: 'char_bob',
    }, PID);
    const [sql, params] = db.query.mock.calls[0];
    expect(sql).toContain('pov_character_id');
    expect(params).toContain('char_bob');
  });

  it('inclut scene_order dans le SQL de mise à jour', async () => {
    const db = makeDb();
    await updateTimelineEvent(db, 'e1', {
      chapter: 1, chapterTitle: 'Ch1', title: 'T',
      sceneOrder: 3,
    }, PID);
    const [sql, params] = db.query.mock.calls[0];
    expect(sql).toContain('scene_order');
    expect(params).toContain(3);
  });

  it('scene_order = 0 si non fourni', async () => {
    const db = makeDb();
    await updateTimelineEvent(db, 'e1', {
      chapter: 1, chapterTitle: 'Ch1', title: 'T',
    }, PID);
    const params = db.query.mock.calls[0][1];
    expect(params).toContain(0);
  });
});

// ── getTimelineEvents — anatomie de scène ─────────────────────────────────────

describe('getTimelineEvents — anatomie de scène', () => {
  function makeEvtRow(overrides = {}) {
    return {
      id: 'e1', chapter_num: 1, chapter_title: 'Ch1',
      title: 'T', description: null, location_id: null,
      extra: '{}', source: 'import',
      pov_character_id: null, scene_order: 0,
      scene_goal: null, scene_conflict: null, scene_outcome: null,
      ...overrides,
    };
  }

  function makeDb2(evtRows) {
    return {
      query: vi.fn()
        .mockResolvedValueOnce({ rows: evtRows })
        .mockResolvedValueOnce({ rows: [] }),
    };
  }

  it('expose sceneGoal', async () => {
    const db = makeDb2([makeEvtRow({ scene_goal: 'Trouver l\'anneau' })]);
    const [evt] = await getTimelineEvents(db, PID);
    expect(evt.sceneGoal).toBe('Trouver l\'anneau');
  });

  it('expose sceneConflict', async () => {
    const db = makeDb2([makeEvtRow({ scene_conflict: 'Les Nazgûl barrent la route' })]);
    const [evt] = await getTimelineEvents(db, PID);
    expect(evt.sceneConflict).toBe('Les Nazgûl barrent la route');
  });

  it('expose sceneOutcome', async () => {
    const db = makeDb2([makeEvtRow({ scene_outcome: 'disaster' })]);
    const [evt] = await getTimelineEvents(db, PID);
    expect(evt.sceneOutcome).toBe('disaster');
  });

  it('sceneGoal / sceneConflict / sceneOutcome = null si absents', async () => {
    const db = makeDb2([makeEvtRow()]);
    const [evt] = await getTimelineEvents(db, PID);
    expect(evt.sceneGoal).toBeNull();
    expect(evt.sceneConflict).toBeNull();
    expect(evt.sceneOutcome).toBeNull();
  });
});

// ── insertTimelineEvent — anatomie de scène ───────────────────────────────────

describe('insertTimelineEvent — anatomie de scène', () => {
  function makeInsertDb() {
    return {
      query: vi.fn()
        .mockResolvedValueOnce({ rows: [{ max_order: 0 }] })
        .mockResolvedValue({ rows: [] }),
    };
  }

  it('inclut scene_goal dans le SQL', async () => {
    const db = makeInsertDb();
    await insertTimelineEvent(db, { chapter: 1, chapterTitle: 'Ch1', title: 'T', sceneGoal: 'Fuir' }, PID);
    const [sql, params] = db.query.mock.calls[1];
    expect(sql).toContain('scene_goal');
    expect(params).toContain('Fuir');
  });

  it('inclut scene_outcome dans le SQL', async () => {
    const db = makeInsertDb();
    await insertTimelineEvent(db, { chapter: 1, chapterTitle: 'Ch1', title: 'T', sceneOutcome: 'disaster' }, PID);
    const [sql, params] = db.query.mock.calls[1];
    expect(sql).toContain('scene_outcome');
    expect(params).toContain('disaster');
  });

  it('scene_goal/conflict/outcome = null si non fournis', async () => {
    const db = makeInsertDb();
    await insertTimelineEvent(db, { chapter: 1, chapterTitle: 'Ch1', title: 'T' }, PID);
    const params = db.query.mock.calls[1][1];
    // Les 3 champs sont null (positions 11, 12, 13 dans le tableau de params)
    expect(params.filter(p => p === null).length).toBeGreaterThanOrEqual(3);
  });
});

// ── updateTimelineEvent — anatomie de scène ───────────────────────────────────

describe('updateTimelineEvent — anatomie de scène', () => {
  it('inclut scene_goal, scene_conflict, scene_outcome dans le SQL', async () => {
    const db = makeDb();
    await updateTimelineEvent(db, 'e1', {
      chapter: 1, chapterTitle: 'Ch1', title: 'T',
      sceneGoal: 'Survivre', sceneConflict: 'L\'ennemi', sceneOutcome: 'failure',
    }, PID);
    const [sql, params] = db.query.mock.calls[0];
    expect(sql).toContain('scene_goal');
    expect(sql).toContain('scene_conflict');
    expect(sql).toContain('scene_outcome');
    expect(params).toContain('Survivre');
    expect(params).toContain('L\'ennemi');
    expect(params).toContain('failure');
  });

  it('scene_goal/conflict/outcome = null si non fournis', async () => {
    const db = makeDb();
    await updateTimelineEvent(db, 'e1', { chapter: 1, chapterTitle: 'Ch1', title: 'T' }, PID);
    const params = db.query.mock.calls[0][1];
    expect(params.filter(p => p === null).length).toBeGreaterThanOrEqual(3);
  });
});

// ── Arc des personnages ────────────────────────────────────────────────────────

describe('getCharacterAxes', () => {
  it('retourne les axes mappés correctement', async () => {
    const db = { query: vi.fn().mockResolvedValue({ rows: [
      { id: 'ax1', character_id: 'char1', label: 'Courage', color: '#f00' },
    ]}) };
    const axes = await getCharacterAxes(db, 'char1', PID);
    expect(axes).toHaveLength(1);
    expect(axes[0]).toEqual({ id: 'ax1', characterId: 'char1', label: 'Courage', color: '#f00' });
    expect(db.query.mock.calls[0][1]).toContain(PID);
    expect(db.query.mock.calls[0][1]).toContain('char1');
  });
});

describe('getAllProjectAxisLabels', () => {
  it('retourne les labels distincts', async () => {
    const db = { query: vi.fn().mockResolvedValue({ rows: [{ label: 'Courage' }, { label: 'Sagesse' }] }) };
    const labels = await getAllProjectAxisLabels(db, PID);
    expect(labels).toEqual(['Courage', 'Sagesse']);
  });
});

describe('getAllCharacterAxes', () => {
  it('retourne tous les axes du projet', async () => {
    const db = { query: vi.fn().mockResolvedValue({ rows: [
      { id: 'ax1', character_id: 'c1', label: 'Courage', color: '#f00' },
      { id: 'ax2', character_id: 'c2', label: 'Sagesse', color: '#0f0' },
    ]}) };
    const axes = await getAllCharacterAxes(db, PID);
    expect(axes).toHaveLength(2);
    expect(axes[0].characterId).toBe('c1');
    expect(axes[1].characterId).toBe('c2');
  });
});

describe('insertCharacterAxis', () => {
  it('insère avec les bons paramètres', async () => {
    const db = { query: vi.fn().mockResolvedValue({ rows: [] }) };
    const id = await insertCharacterAxis(db, { characterId: 'c1', label: 'Force', color: '#a00' }, PID);
    expect(typeof id).toBe('string');
    expect(id).toMatch(/^cax_/);
    const [sql, params] = db.query.mock.calls[0];
    expect(sql).toContain('character_arc_axes');
    expect(params).toContain('c1');
    expect(params).toContain('Force');
    expect(params).toContain('#a00');
  });

  it('utilise la couleur par défaut si non fournie', async () => {
    const db = { query: vi.fn().mockResolvedValue({ rows: [] }) };
    await insertCharacterAxis(db, { characterId: 'c1', label: 'Force' }, PID);
    const params = db.query.mock.calls[0][1];
    expect(params).toContain('#64748b');
  });
});

describe('deleteCharacterAxis', () => {
  it('supprime les points puis l\'axe', async () => {
    const db = { query: vi.fn().mockResolvedValue({ rows: [] }) };
    await deleteCharacterAxis(db, 'ax1', PID);
    expect(db.query).toHaveBeenCalledTimes(2);
    expect(db.query.mock.calls[0][0]).toContain('character_arc_points');
    expect(db.query.mock.calls[1][0]).toContain('character_arc_axes');
  });
});

describe('upsertCharacterArcPoint', () => {
  it('upsert avec les bons paramètres', async () => {
    const db = { query: vi.fn().mockResolvedValue({ rows: [] }) };
    await upsertCharacterArcPoint(db, PID, 'ax1', 3, 7, 'bon chapitre');
    const [sql, params] = db.query.mock.calls[0];
    expect(sql).toContain('ON CONFLICT');
    expect(params).toContain(PID);
    expect(params).toContain('ax1');
    expect(params).toContain(3);
    expect(params).toContain(7);
    expect(params).toContain('bon chapitre');
  });

  it('note = null si non fournie', async () => {
    const db = { query: vi.fn().mockResolvedValue({ rows: [] }) };
    await upsertCharacterArcPoint(db, PID, 'ax1', 3, 7);
    const params = db.query.mock.calls[0][1];
    expect(params).toContain(null);
  });

  it('stocke volume_id quand fourni', async () => {
    const db = { query: vi.fn().mockResolvedValue({ rows: [] }) };
    await upsertCharacterArcPoint(db, PID, 'ax1', 13, 8, null, 'v2');
    const [sql, params] = db.query.mock.calls[0];
    expect(sql).toContain('volume_id');
    expect(params).toContain('v2');
  });

  it('volume_id = null si non fourni', async () => {
    const db = { query: vi.fn().mockResolvedValue({ rows: [] }) };
    await upsertCharacterArcPoint(db, PID, 'ax1', 3, 7);
    const params = db.query.mock.calls[0][1];
    // le dernier param est volume_id = null
    expect(params[params.length - 1]).toBe(null);
  });
});

describe('getCharacterArcPoints', () => {
  it('retourne les points mappés correctement avec volumeId', async () => {
    const db = { query: vi.fn().mockResolvedValue({ rows: [
      { chapter_num: 1, value: 5, note: null, volume_id: null },
      { chapter_num: 13, value: 8, note: 'pic', volume_id: 'v2' },
    ]}) };
    const pts = await getCharacterArcPoints(db, 'ax1', PID);
    expect(pts).toHaveLength(2);
    expect(pts[0]).toEqual({ chapterNum: 1, value: 5, note: null, volumeId: null });
    expect(pts[1]).toEqual({ chapterNum: 13, value: 8, note: 'pic', volumeId: 'v2' });
  });
});

describe('getAllCharacterArcPoints', () => {
  it('retourne tous les points du projet avec axisId et volumeId', async () => {
    const db = { query: vi.fn().mockResolvedValue({ rows: [
      { axis_id: 'ax1', chapter_num: 1, value: 5, note: null, volume_id: 'v1' },
      { axis_id: 'ax2', chapter_num: 13, value: 3, note: 'note', volume_id: 'v2' },
    ]}) };
    const pts = await getAllCharacterArcPoints(db, PID);
    expect(pts).toHaveLength(2);
    expect(pts[0].axisId).toBe('ax1');
    expect(pts[0].volumeId).toBe('v1');
    expect(pts[1].axisId).toBe('ax2');
    expect(pts[1].volumeId).toBe('v2');
  });

  it('volumeId = null quand volume_id absent (données anciennes)', async () => {
    const db = { query: vi.fn().mockResolvedValue({ rows: [
      { axis_id: 'ax1', chapter_num: 2, value: 4, note: null, volume_id: null },
    ]}) };
    const pts = await getAllCharacterArcPoints(db, PID);
    expect(pts[0].volumeId).toBe(null);
  });
});

// ── Plant / Payoff ────────────────────────────────────────────────────────────

describe('getPlants', () => {
  it('mappe correctement les champs', async () => {
    const db = { query: vi.fn().mockResolvedValue({ rows: [{
      id: 'plant1', label: 'La dague', type: 'object',
      plant_chapter_num: 2, plant_event_id: 'e1', plant_volume_id: 'vol1',
      payoff_chapter_num: 8, payoff_event_id: 'e2', payoff_volume_id: 'vol2',
      entity_id: 'c1', entity_type: 'character',
      status: 'open', notes: 'important',
    }]}) };
    const result = await getPlants(db, PID);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: 'plant1', label: 'La dague', type: 'object',
      plantChapterNum: 2, plantEventId: 'e1', plantVolumeId: 'vol1',
      payoffChapterNum: 8, payoffEventId: 'e2', payoffVolumeId: 'vol2',
      entityId: 'c1', entityType: 'character',
      status: 'open', notes: 'important',
    });
  });

  it('gère les champs null (dont volumes)', async () => {
    const db = { query: vi.fn().mockResolvedValue({ rows: [{
      id: 'p2', label: 'Secret', type: 'information',
      plant_chapter_num: null, plant_event_id: null, plant_volume_id: null,
      payoff_chapter_num: null, payoff_event_id: null, payoff_volume_id: null,
      entity_id: null, entity_type: null,
      status: 'open', notes: null,
    }]}) };
    const [p] = await getPlants(db, PID);
    expect(p.plantChapterNum).toBeNull();
    expect(p.plantVolumeId).toBeNull();
    expect(p.payoffVolumeId).toBeNull();
    expect(p.notes).toBeNull();
  });
});

describe('insertPlant', () => {
  it('insère avec les bons paramètres', async () => {
    const db = { query: vi.fn().mockResolvedValue({ rows: [] }) };
    const id = await insertPlant(db, {
      label: 'La dague', type: 'object',
      plantChapterNum: 2, status: 'open',
    }, PID);
    expect(id).toMatch(/^plant_/);
    const [sql, params] = db.query.mock.calls[0];
    expect(sql).toContain('plant_payoffs');
    expect(params).toContain('La dague');
    expect(params).toContain('object');
    expect(params).toContain(2);
  });

  it('utilise les defaults si champs non fournis', async () => {
    const db = { query: vi.fn().mockResolvedValue({ rows: [] }) };
    await insertPlant(db, { label: 'X' }, PID);
    const params = db.query.mock.calls[0][1];
    expect(params).toContain('information'); // type par défaut
    expect(params).toContain('open');        // status par défaut
  });
});

describe('updatePlant', () => {
  it('met à jour tous les champs', async () => {
    const db = { query: vi.fn().mockResolvedValue({ rows: [] }) };
    await updatePlant(db, 'p1', {
      label: 'Modifié', type: 'dialogue',
      plantChapterNum: 3, payoffChapterNum: 10, status: 'resolved',
    }, PID);
    const [sql, params] = db.query.mock.calls[0];
    expect(sql).toContain('UPDATE plant_payoffs');
    expect(params).toContain('Modifié');
    expect(params).toContain('dialogue');
    expect(params).toContain('resolved');
    expect(params).toContain('p1');
    expect(params).toContain(PID);
  });
});

describe('deletePlant', () => {
  it('supprime avec les bons paramètres', async () => {
    const db = { query: vi.fn().mockResolvedValue({ rows: [] }) };
    await deletePlant(db, 'p1', PID);
    const [sql, params] = db.query.mock.calls[0];
    expect(sql).toContain('DELETE FROM plant_payoffs');
    expect(params).toContain('p1');
    expect(params).toContain(PID);
  });
});

// ── Volumes ───────────────────────────────────────────────────────────────────

describe('getVolumes', () => {
  it('mappe correctement les champs', async () => {
    const db = { query: vi.fn().mockResolvedValue({ rows: [
      { id: 'vol1', number: 1, title: 'Tome 1', description: 'Premier tome' },
      { id: 'vol2', number: 2, title: 'Tome 2', description: null },
    ]}) };
    const volumes = await getVolumes(db, PID);
    expect(volumes).toHaveLength(2);
    expect(volumes[0]).toEqual({ id: 'vol1', number: 1, title: 'Tome 1', description: 'Premier tome' });
    expect(volumes[1].description).toBeNull();
  });

  it('retourne un tableau vide si aucun volume', async () => {
    const db = { query: vi.fn().mockResolvedValue({ rows: [] }) };
    expect(await getVolumes(db, PID)).toEqual([]);
  });
});

describe('insertVolume', () => {
  it('insère avec les bons paramètres et retourne un id vol_', async () => {
    const db = { query: vi.fn().mockResolvedValue({ rows: [] }) };
    const id = await insertVolume(db, { number: 1, title: 'Tome 1', description: 'Desc' }, PID);
    expect(id).toMatch(/^vol_/);
    const [sql, params] = db.query.mock.calls[0];
    expect(sql).toContain('INSERT INTO volumes');
    expect(params).toContain(1);
    expect(params).toContain('Tome 1');
    expect(params).toContain('Desc');
    expect(params).toContain(PID);
  });

  it('description null si non fournie', async () => {
    const db = { query: vi.fn().mockResolvedValue({ rows: [] }) };
    await insertVolume(db, { number: 2, title: 'Tome 2' }, PID);
    const params = db.query.mock.calls[0][1];
    expect(params).toContain(null);
  });
});

describe('updateVolume', () => {
  it('met à jour avec les bons paramètres', async () => {
    const db = { query: vi.fn().mockResolvedValue({ rows: [] }) };
    await updateVolume(db, 'vol1', { number: 1, title: 'Modifié', description: null }, PID);
    const [sql, params] = db.query.mock.calls[0];
    expect(sql).toContain('UPDATE volumes');
    expect(params).toContain('Modifié');
    expect(params).toContain('vol1');
    expect(params).toContain(PID);
  });
});

describe('deleteVolume', () => {
  it('supprime avec les bons paramètres', async () => {
    const db = { query: vi.fn().mockResolvedValue({ rows: [] }) };
    await deleteVolume(db, 'vol1', PID);
    const [sql, params] = db.query.mock.calls[0];
    expect(sql).toContain('DELETE FROM volumes');
    expect(params).toContain('vol1');
    expect(params).toContain(PID);
  });
});
