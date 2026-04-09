import { describe, it, expect, vi, beforeEach } from 'vitest';
import { importFromBackup } from './importFromBackup';

// ── Helpers ───────────────────────────────────────────────────────────────────

const VALID_PAYLOAD = {
  version: '1.0',
  project: { id: 'proj_original', name: 'Mon Roman', description: 'Desc', mapImage: null },
  characters:         [{ id: 'c1', name: 'Alice', aliases: [], affiliations: [], traits: [], race: null, role: null, death_event_id: null }],
  locations:          [{ id: 'l1', name: 'Paris',  coordinates: null, inhabitants: [], visited_by: [], key_places: [] }],
  objects:            [{ id: 'o1', name: 'Épée',   powers: [], holders: [], status: 'active' }],
  timelineEvents:     [{ id: 'e1', chapter_num: 1, chapter_title: 'Ch1', title: 'Evt', beat_id: null }],
  eventEntities:      [{ event_id: 'e1', entity_id: 'c1', entity_type: 'character' }],
  incoherences:       [],
  incoherenceLinks:   [],
  stcChapters:        [],
  stcChapterBeats:    [],
  stcChapterEntities: [],
  characterJourneys:  [],
};

function makeFile(payload) {
  return { text: () => Promise.resolve(JSON.stringify(payload)) };
}

function makeDb() {
  return {
    query: vi.fn().mockResolvedValue({ rows: [] }),
    exec:  vi.fn().mockResolvedValue(undefined),
  };
}

beforeEach(() => vi.clearAllMocks());

// ── Validation ────────────────────────────────────────────────────────────────

describe('validation', () => {
  it('lève une erreur si le fichier n\'est pas du JSON valide', async () => {
    const file = { text: () => Promise.resolve('pas du json {{{') };
    await expect(importFromBackup(makeDb(), file)).rejects.toThrow('JSON');
  });

  it('lève une erreur si version !== "1.0"', async () => {
    const file = makeFile({ ...VALID_PAYLOAD, version: '2.0' });
    await expect(importFromBackup(makeDb(), file)).rejects.toThrow('Format non reconnu');
  });

  it('lève une erreur si project.name est absent', async () => {
    const file = makeFile({ version: '1.0', project: { id: 'p1' } });
    await expect(importFromBackup(makeDb(), file)).rejects.toThrow('Format non reconnu');
  });

  it('accepte un payload valide sans erreur', async () => {
    const db = makeDb();
    await expect(importFromBackup(db, makeFile(VALID_PAYLOAD))).resolves.toBeDefined();
  });
});

// ── Nouvel ID ─────────────────────────────────────────────────────────────────

describe('génération du nouvel id', () => {
  it('retourne un id différent de l\'original', async () => {
    const newId = await importFromBackup(makeDb(), makeFile(VALID_PAYLOAD));
    expect(newId).not.toBe('proj_original');
  });

  it('le nouvel id contient un slug du nom du projet', async () => {
    const newId = await importFromBackup(makeDb(), makeFile(VALID_PAYLOAD));
    expect(newId).toMatch(/mon_roman/);
  });

  it('normalise les accents dans le slug', async () => {
    const payload = { ...VALID_PAYLOAD, project: { ...VALID_PAYLOAD.project, name: 'Héros Légendaire' } };
    const newId = await importFromBackup(makeDb(), makeFile(payload));
    expect(newId).not.toMatch(/[éèàùî]/);
    expect(newId).toMatch(/heros/);
  });

  it('tronque le slug à 20 caractères max (avant le timestamp)', async () => {
    const payload = { ...VALID_PAYLOAD, project: { ...VALID_PAYLOAD.project, name: 'Un Roman Extraordinairement Long' } };
    const newId = await importFromBackup(makeDb(), makeFile(payload));
    const slug = newId.replace(/_\d+$/, ''); // enlève le timestamp
    expect(slug.length).toBeLessThanOrEqual(20);
  });
});

// ── Transaction ───────────────────────────────────────────────────────────────

describe('transaction', () => {
  it('ouvre un BEGIN avant les insertions', async () => {
    const db = makeDb();
    await importFromBackup(db, makeFile(VALID_PAYLOAD));
    expect(db.exec).toHaveBeenCalledWith('BEGIN');
  });

  it('commet avec COMMIT en cas de succès', async () => {
    const db = makeDb();
    await importFromBackup(db, makeFile(VALID_PAYLOAD));
    expect(db.exec).toHaveBeenCalledWith('COMMIT');
    expect(db.exec).not.toHaveBeenCalledWith('ROLLBACK');
  });

  it('effectue un ROLLBACK en cas d\'erreur SQL', async () => {
    const db = makeDb();
    db.query.mockRejectedValueOnce(new Error('SQL error'));
    await expect(importFromBackup(db, makeFile(VALID_PAYLOAD))).rejects.toThrow('SQL error');
    expect(db.exec).toHaveBeenCalledWith('ROLLBACK');
    expect(db.exec).not.toHaveBeenCalledWith('COMMIT');
  });
});

// ── Insertions ────────────────────────────────────────────────────────────────

describe('insertions', () => {
  it('insère le projet avec le nouvel id', async () => {
    const db = makeDb();
    const newId = await importFromBackup(db, makeFile(VALID_PAYLOAD));
    const projectInsert = db.query.mock.calls.find(c => c[0].includes('INSERT INTO projects'));
    expect(projectInsert[1][0]).toBe(newId);
    expect(projectInsert[1][1]).toBe('Mon Roman');
  });

  it('utilise le nouvel id (pas l\'original) pour tous les project_id', async () => {
    const db = makeDb();
    const newId = await importFromBackup(db, makeFile(VALID_PAYLOAD));
    // Toutes les insertions (sauf la première qui crée le projet) doivent utiliser newId comme project_id
    const insertCalls = db.query.mock.calls.filter(c => c[0].includes('INSERT INTO'));
    for (const [sql, params] of insertCalls) {
      if (sql.includes('INSERT INTO projects')) continue;
      expect(params).toContain(newId);
      expect(params).not.toContain('proj_original');
    }
  });

  it('insère les personnages avec ON CONFLICT DO NOTHING', async () => {
    const db = makeDb();
    await importFromBackup(db, makeFile(VALID_PAYLOAD));
    const charInsert = db.query.mock.calls.find(c => c[0].includes('INSERT INTO characters'));
    expect(charInsert[0]).toContain('ON CONFLICT DO NOTHING');
  });

  it('insère les event_entities', async () => {
    const db = makeDb();
    await importFromBackup(db, makeFile(VALID_PAYLOAD));
    const entityInsert = db.query.mock.calls.find(c => c[0].includes('INSERT INTO event_entities'));
    expect(entityInsert).toBeDefined();
  });

  it('ne crée aucune query si les tableaux sont vides', async () => {
    const payload = { ...VALID_PAYLOAD, characters: [], locations: [], objects: [] };
    const db = makeDb();
    await importFromBackup(db, makeFile(payload));
    const charInserts = db.query.mock.calls.filter(c => c[0].includes('INSERT INTO characters'));
    expect(charInserts).toHaveLength(0);
  });
});

// ── Volumes ───────────────────────────────────────────────────────────────────

describe('volumes', () => {
  it('insère les volumes quand ils sont présents dans le payload', async () => {
    const payload = {
      ...VALID_PAYLOAD,
      volumes: [
        { id: 'v1', number: 1, title: 'Tome 1', description: null },
        { id: 'v2', number: 2, title: 'Tome 2', description: 'Le retour' },
      ],
    };
    const db = makeDb();
    await importFromBackup(db, makeFile(payload));
    const volInserts = db.query.mock.calls.filter(c => c[0].includes('INSERT INTO volumes'));
    expect(volInserts).toHaveLength(2);
    expect(volInserts[0][1]).toContain('Tome 1');
    expect(volInserts[1][1]).toContain('Tome 2');
  });

  it('ne crée aucune requête volumes si le tableau est vide', async () => {
    const db = makeDb();
    await importFromBackup(db, makeFile(VALID_PAYLOAD));
    const volInserts = db.query.mock.calls.filter(c => c[0].includes('INSERT INTO volumes'));
    expect(volInserts).toHaveLength(0);
  });

  it('restaure volume_id sur les timeline_events', async () => {
    const payload = {
      ...VALID_PAYLOAD,
      volumes: [{ id: 'v1', number: 1, title: 'Tome 1', description: null }],
      timelineEvents: [{ id: 'e1', chapter_num: 1, chapter_title: 'Ch1', title: 'Evt', beat_id: null, volume_id: 'v1' }],
    };
    const db = makeDb();
    const newId = await importFromBackup(db, makeFile(payload));
    const evtInsert = db.query.mock.calls.find(c => c[0].includes('INSERT INTO timeline_events'));
    expect(evtInsert[1]).toContain('v1');
    expect(evtInsert[1]).toContain(newId);
  });

  it('restaure volume_id sur character_arc_points', async () => {
    const payload = {
      ...VALID_PAYLOAD,
      volumes: [{ id: 'v1', number: 1, title: 'Tome 1', description: null }],
      characterArcAxes:   [{ id: 'ax1', character_id: 'c1', label: 'Courage', color: '#818cf8' }],
      characterArcPoints: [{ axis_id: 'ax1', chapter_num: 13, value: 7, note: null, volume_id: 'v1' }],
    };
    const db = makeDb();
    await importFromBackup(db, makeFile(payload));
    const ptInsert = db.query.mock.calls.find(c => c[0].includes('INSERT INTO character_arc_points'));
    expect(ptInsert[1]).toContain('v1');
  });
});

// ── Callbacks onProgress ──────────────────────────────────────────────────────

describe('onProgress', () => {
  it('appelle onProgress à chaque étape clé', async () => {
    const onProgress = vi.fn();
    await importFromBackup(makeDb(), makeFile(VALID_PAYLOAD), { onProgress });
    expect(onProgress).toHaveBeenCalledWith('Lecture du fichier…');
    expect(onProgress).toHaveBeenCalledWith('Création du projet…');
    expect(onProgress).toHaveBeenCalledWith('Import des personnages…');
    expect(onProgress).toHaveBeenCalledWith('Import des lieux…');
    expect(onProgress.mock.calls.length).toBeGreaterThan(4);
  });

  it('fonctionne sans onProgress (optionnel)', async () => {
    await expect(importFromBackup(makeDb(), makeFile(VALID_PAYLOAD))).resolves.toBeDefined();
  });
});
