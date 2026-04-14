import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import * as v from './validators.js';

function ok(schema, data) {
  const r = schema.safeParse(data);
  assert.ok(r.success, `Expected success but got errors: ${JSON.stringify(r.error?.issues)}`);
  return r.data;
}

function fail(schema, data) {
  const r = schema.safeParse(data);
  assert.ok(!r.success, `Expected failure but got success: ${JSON.stringify(r.data)}`);
  return r.error;
}

// ── Projects ─────────────────────────────────────────────────────────────────

describe('createProject', () => {
  it('accepts valid project', () => {
    ok(v.createProject, { name: 'Mon roman' });
    ok(v.createProject, { name: 'Mon roman', description: 'Un super roman' });
  });

  it('rejects empty name', () => {
    fail(v.createProject, { name: '' });
  });

  it('rejects missing name', () => {
    fail(v.createProject, {});
  });

  it('rejects extra fields (strict)', () => {
    fail(v.createProject, { name: 'Test', evil: 'DROP TABLE' });
  });
});

// ── mapImage ─────────────────────────────────────────────────────────────────

describe('mapImage', () => {
  it('accepts valid base64 image', () => {
    ok(v.mapImage, { image: 'data:image/png;base64,abc123' });
  });

  it('rejects missing image', () => {
    fail(v.mapImage, {});
  });
});

// ── Volumes ──────────────────────────────────────────────────────────────────

describe('volume', () => {
  it('accepts valid volume', () => {
    ok(v.volume, { number: 1, title: 'Tome 1' });
    ok(v.volume, { number: 2, title: 'Tome 2', description: 'Suite' });
  });

  it('rejects missing title', () => {
    fail(v.volume, { number: 1 });
  });

  it('rejects missing number', () => {
    fail(v.volume, { title: 'Tome 1' });
  });
});

// ── Characters ───────────────────────────────────────────────────────────────

describe('character', () => {
  it('accepts minimal character', () => {
    ok(v.character, { name: 'Frodo' });
  });

  it('accepts full character', () => {
    ok(v.character, {
      name: 'Aragorn',
      aliases: ['Grands-Pas', 'Elessar'],
      race: 'Humain',
      role: 'Roi',
      affiliations: ['Communauté'],
      traits: ['Courageux'],
      origin: 'Arnor',
      description: 'Héritier du trône',
      color: '#3F51B5',
    });
  });

  it('rejects empty name', () => {
    fail(v.character, { name: '' });
  });

  it('strips unknown fields', () => {
    const data = ok(v.character, { name: 'Test', unknownField: 'value' });
    assert.equal(data.unknownField, undefined);
  });
});

describe('characterGroups', () => {
  it('accepts group ids array', () => {
    ok(v.characterGroups, { groupIds: ['grp_1', 'grp_2'] });
  });

  it('accepts empty array', () => {
    ok(v.characterGroups, { groupIds: [] });
  });
});

// ── Locations ────────────────────────────────────────────────────────────────

describe('location', () => {
  it('accepts minimal location', () => {
    ok(v.location, { name: 'Fondcombe' });
  });

  it('rejects missing name', () => {
    fail(v.location, { type: 'cité' });
  });
});

describe('locationCoordinates', () => {
  it('accepts coordinates', () => {
    ok(v.locationCoordinates, { coordinates: { x: 10, y: 20 } });
  });

  it('accepts null coordinates', () => {
    ok(v.locationCoordinates, { coordinates: null });
  });
});

// ── Objects ──────────────────────────────────────────────────────────────────

describe('object', () => {
  it('accepts minimal object', () => {
    ok(v.object, { name: "L'Anneau Unique" });
  });

  it('accepts full object', () => {
    ok(v.object, {
      name: "L'Anneau Unique",
      type: 'artefact',
      description: 'Un anneau pour les gouverner tous',
      powers: ['invisibilité', 'domination'],
      holders: ['Sauron', 'Bilbo', 'Frodo'],
    });
  });
});

// ── Groups ───────────────────────────────────────────────────────────────────

describe('group', () => {
  it('accepts valid group', () => {
    ok(v.group, { name: 'Communauté de lAnneau' });
  });
});

// ── Timeline Events ─────────────────────────────────────────────────────────

describe('timelineEvent', () => {
  it('accepts minimal event', () => {
    ok(v.timelineEvent, { title: 'Le Conseil' });
  });

  it('accepts full event', () => {
    ok(v.timelineEvent, {
      title: 'Le Conseil',
      chapter: 3,
      chapterTitle: 'Le Conseil dElrond',
      description: 'Formation de la communauté',
      locationId: 'loc_fondcombe',
      volumeId: 'vol_1',
      isFlashback: false,
    });
  });
});

// ── STC Chapters ─────────────────────────────────────────────────────────────

describe('stcChapter', () => {
  it('accepts valid chapter', () => {
    ok(v.stcChapter, { number: 1, title: 'Ouverture' });
  });

  it('rejects missing number', () => {
    fail(v.stcChapter, { title: 'Ouverture' });
  });
});

// ── Incoherences ─────────────────────────────────────────────────────────────

describe('scanIncoherences', () => {
  it('accepts valid scan results', () => {
    ok(v.scanIncoherences, {
      incoherences: [
        { id: 'inc_1', title: 'Incohérence test', type: 'chronologie', severity: 'medium' },
      ],
    });
  });

  it('accepts empty array', () => {
    ok(v.scanIncoherences, { incoherences: [] });
  });

  it('rejects incoherence without title', () => {
    fail(v.scanIncoherences, {
      incoherences: [{ id: 'inc_1', type: 'chronologie' }],
    });
  });
});

describe('resolved', () => {
  it('accepts boolean', () => {
    ok(v.resolved, { resolved: true });
    ok(v.resolved, { resolved: false });
  });

  it('rejects non-boolean', () => {
    fail(v.resolved, { resolved: 'yes' });
  });
});

describe('resolutionNote', () => {
  it('accepts note', () => {
    ok(v.resolutionNote, { note: 'Corrigé au chapitre 5' });
  });

  it('accepts null note', () => {
    ok(v.resolutionNote, { note: null });
  });
});

// ── Arc émotionnel ───────────────────────────────────────────────────────────

describe('arcPoint', () => {
  it('accepts intensity', () => {
    ok(v.arcPoint, { intensity: 7 });
  });

  it('rejects missing intensity', () => {
    fail(v.arcPoint, {});
  });
});

// ── Notes ────────────────────────────────────────────────────────────────────

describe('chapterNote', () => {
  it('accepts content', () => {
    ok(v.chapterNote, { content: 'Notes sur le chapitre' });
  });
});

// ── Plants ───────────────────────────────────────────────────────────────────

describe('plant', () => {
  it('accepts minimal plant', () => {
    ok(v.plant, { label: 'Anneau de Barahir' });
  });

  it('accepts full plant', () => {
    ok(v.plant, {
      label: 'Anneau de Barahir',
      type: 'objet',
      plantChapterNum: 3,
      payoffChapterNum: 15,
      status: 'resolved',
    });
  });
});

// ── Threads ──────────────────────────────────────────────────────────────────

describe('thread', () => {
  it('accepts valid thread', () => {
    ok(v.thread, { name: 'Quête de lAnneau' });
  });

  it('rejects missing name', () => {
    fail(v.thread, { color: '#3F51B5' });
  });
});

// ── Journeys ─────────────────────────────────────────────────────────────────

describe('journey', () => {
  it('accepts steps array', () => {
    ok(v.journey, { steps: [{ lat: 1, lng: 2 }] });
  });

  it('accepts empty steps', () => {
    ok(v.journey, { steps: [] });
  });
});

// ── Character Arcs ───────────────────────────────────────────────────────────

describe('characterAxis', () => {
  it('accepts valid axis', () => {
    ok(v.characterAxis, { characterId: 'char_frodo', label: 'Courage' });
  });

  it('rejects missing characterId', () => {
    fail(v.characterAxis, { label: 'Courage' });
  });
});

describe('characterArcPoint', () => {
  it('accepts valid point', () => {
    ok(v.characterArcPoint, { value: 5 });
    ok(v.characterArcPoint, { value: 8, note: 'Après la bataille', volumeId: 'vol_1' });
  });

  it('rejects missing value', () => {
    fail(v.characterArcPoint, { note: 'test' });
  });
});

// ── Hero Journey ─────────────────────────────────────────────────────────────

describe('heroJourneyEntry', () => {
  it('accepts valid entry', () => {
    ok(v.heroJourneyEntry, { stageKey: 'ordinary_world' });
    ok(v.heroJourneyEntry, {
      stageKey: 'call_to_adventure',
      characterId: 'char_frodo',
      chapterNum: 2,
      summary: 'Gandalf révèle la nature de lAnneau',
      volumeId: 'vol_1',
    });
  });

  it('rejects missing stageKey', () => {
    fail(v.heroJourneyEntry, { characterId: 'char_frodo' });
  });
});

// ── Seed ─────────────────────────────────────────────────────────────────────

describe('seed', () => {
  it('accepts valid seed payload', () => {
    ok(v.seed, {
      meta: { name: 'LOTR' },
      data: { loreDB: { characters: [] }, heroJourneyDB: [] },
    });
  });

  it('accepts seed with optional id', () => {
    ok(v.seed, {
      meta: { id: 'lotr_123', name: 'LOTR', description: 'Trilogie' },
      data: {},
    });
  });

  it('rejects missing meta.name', () => {
    fail(v.seed, { meta: {}, data: {} });
  });

  it('rejects missing data', () => {
    fail(v.seed, { meta: { name: 'Test' } });
  });
});

// ── Import backup ────────────────────────────────────────────────────────────

describe('importBackup', () => {
  it('accepts valid backup', () => {
    ok(v.importBackup, {
      version: '1.0',
      project: { name: 'Mon projet' },
      characters: [],
    });
  });

  it('rejects wrong version', () => {
    fail(v.importBackup, { version: '2.0', project: { name: 'Test' } });
  });

  it('rejects missing project name', () => {
    fail(v.importBackup, { version: '1.0', project: {} });
  });
});

// ── Sécurité : injection / dépassement ───────────────────────────────────────

describe('security', () => {
  it('rejects strings exceeding max length (1000)', () => {
    fail(v.character, { name: 'A'.repeat(1001) });
  });

  it('rejects descriptions exceeding max length (10000)', () => {
    fail(v.character, { name: 'Test', description: 'A'.repeat(10001) });
  });

  it('rejects map image exceeding 10MB', () => {
    fail(v.mapImage, { image: 'A'.repeat(10_000_001) });
  });

  it('strict schemas reject SQL injection in extra fields', () => {
    fail(v.createProject, { name: 'Test', evil: "'; DROP TABLE projects; --" });
  });
});
