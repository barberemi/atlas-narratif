import { describe, it, expect } from 'vitest';
import { runDetection } from './detectIncoherences';

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeChar(id, name, extra = {}) {
  return { id, name, ...extra };
}

function makeLoc(id, name) {
  return { id, name };
}

function makeObj(id, name, extra = {}) {
  return { id, name, currentHolder: null, status: 'active', statusChangedAtChapter: null, ...extra };
}

function makeEvent(id, chapter, title, { locationId = null, entities = [] } = {}) {
  return { id, chapter, chapterTitle: `Chapitre ${chapter}`, title, locationId, entities };
}

function withChar(charId) {
  return { entityType: 'character', id: charId };
}
function withLoc(locId) {
  return { entityType: 'location', id: locId };
}
function withObj(objId) {
  return { entityType: 'object', id: objId };
}

const empty = { characters: [], locations: [], objects: [], events: [] };

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('runDetection — entrées vides', () => {
  it('retourne un tableau vide pour des données vides', () => {
    expect(runDetection(empty)).toEqual([]);
  });
});

describe('detectOrphanCharacters', () => {
  it('signale un personnage absent de tous les événements', () => {
    const characters = [makeChar('char_a', 'Alice')];
    const events = [makeEvent('evt1', 1, 'Scène 1', { entities: [] })];
    const results = runDetection({ ...empty, characters, events });

    expect(results).toHaveLength(1);
    expect(results[0].severity).toBe('low');
    expect(results[0].title).toContain('Alice');
  });

  it('ne signale pas un personnage qui apparaît dans au moins un événement', () => {
    const characters = [makeChar('char_a', 'Alice')];
    const events = [makeEvent('evt1', 1, 'Scène 1', { entities: [withChar('char_a')] })];
    const results = runDetection({ ...empty, characters, events });

    expect(results.filter(r => r.type === 'Entité Non Référencée' && r.severity === 'low')).toHaveLength(0);
  });
});

describe('detectOrphanLocations', () => {
  it('signale un lieu jamais visité', () => {
    const locations = [makeLoc('loc_a', 'Forêt Noire')];
    const events = [makeEvent('evt1', 1, 'Scène 1')];
    const results = runDetection({ ...empty, locations, events });

    expect(results.some(r => r.title.includes('Forêt Noire'))).toBe(true);
  });

  it('ne signale pas un lieu utilisé comme locationId', () => {
    const locations = [makeLoc('loc_a', 'Forêt Noire')];
    const events = [makeEvent('evt1', 1, 'Scène 1', { locationId: 'loc_a' })];
    const results = runDetection({ ...empty, locations, events });

    expect(results.filter(r => r.severity === 'low')).toHaveLength(0);
  });
});

describe('detectBrokenHolders', () => {
  it('signale un objet dont le détenteur n\'existe pas dans les personnages', () => {
    const characters = [makeChar('char_a', 'Alice')];
    const objects = [makeObj('obj_1', 'Épée', { currentHolder: 'Bob' })];
    // Alice sera détectée comme orpheline aussi — on filtre par severity
    const results = runDetection({ ...empty, characters, objects });

    const holderResults = results.filter(r => r.severity === 'medium');
    expect(holderResults).toHaveLength(1);
    expect(holderResults[0].title).toContain('Épée');
  });

  it('ne signale pas un objet dont le détenteur existe', () => {
    const characters = [makeChar('char_a', 'Alice')];
    const objects = [makeObj('obj_1', 'Épée', { currentHolder: 'Alice' })];
    const results = runDetection({ ...empty, characters, objects });

    expect(results.filter(r => r.severity === 'medium')).toHaveLength(0);
  });

  it('ne signale pas un objet sans détenteur', () => {
    const objects = [makeObj('obj_1', 'Épée', { currentHolder: null })];
    const results = runDetection({ ...empty, objects });

    expect(results.filter(r => r.severity === 'medium')).toHaveLength(0);
  });
});

describe('detectBrokenReferences', () => {
  it('signale une entité référencée dans un événement mais absente du lore', () => {
    const events = [makeEvent('evt1', 1, 'Scène 1', { entities: [withChar('char_deleted')] })];
    const results = runDetection({ ...empty, events });

    expect(results).toHaveLength(1);
    expect(results[0].severity).toBe('high');
  });

  it('ne duplique pas la même entité manquante référencée dans plusieurs événements', () => {
    const events = [
      makeEvent('evt1', 1, 'Scène 1', { entities: [withChar('char_deleted')] }),
      makeEvent('evt2', 2, 'Scène 2', { entities: [withChar('char_deleted')] }),
    ];
    const results = runDetection({ ...empty, events });

    const broken = results.filter(r => r.id === 'scan_broken_ref_char_deleted');
    expect(broken).toHaveLength(1);
  });

  it('ne signale pas une entité existante', () => {
    const characters = [makeChar('char_a', 'Alice')];
    const events = [makeEvent('evt1', 1, 'Scène 1', { entities: [withChar('char_a')] })];
    const results = runDetection({ ...empty, characters, events });

    expect(results.filter(r => r.severity === 'high')).toHaveLength(0);
  });
});

describe('detectDeadCharacterReappearance', () => {
  it('signale un personnage mort réapparaissant après son événement de mort', () => {
    const characters = [makeChar('char_a', 'Alice', { deathEventId: 'evt1' })];
    const events = [
      makeEvent('evt1', 1, 'Mort d\'Alice', { entities: [withChar('char_a')] }),
      makeEvent('evt2', 2, 'Après la mort', { entities: [withChar('char_a')] }),
    ];
    const results = runDetection({ ...empty, characters, events });

    expect(results).toHaveLength(1);
    expect(results[0].severity).toBe('critical');
    expect(results[0].title).toContain('Alice');
  });

  it('ne signale pas un personnage mort qui n\'apparaît plus après sa mort', () => {
    const characters = [makeChar('char_a', 'Alice', { deathEventId: 'evt2' })];
    const events = [
      makeEvent('evt1', 1, 'Vie d\'Alice', { entities: [withChar('char_a')] }),
      makeEvent('evt2', 2, 'Mort d\'Alice', { entities: [withChar('char_a')] }),
    ];
    const results = runDetection({ ...empty, characters, events });

    expect(results.filter(r => r.severity === 'critical')).toHaveLength(0);
  });

  it('ignore si l\'événement de mort a été supprimé', () => {
    const characters = [makeChar('char_a', 'Alice', { deathEventId: 'evt_nonexistent' })];
    const events = [makeEvent('evt1', 1, 'Scène', { entities: [withChar('char_a')] })];
    const results = runDetection({ ...empty, characters, events });

    expect(results.filter(r => r.severity === 'critical')).toHaveLength(0);
  });

  it('ne signale pas un personnage vivant (deathEventId null)', () => {
    const characters = [makeChar('char_a', 'Alice', { deathEventId: null })];
    const events = [
      makeEvent('evt1', 1, 'Scène 1', { entities: [withChar('char_a')] }),
      makeEvent('evt2', 2, 'Scène 2', { entities: [withChar('char_a')] }),
    ];
    const results = runDetection({ ...empty, characters, events });

    expect(results.filter(r => r.severity === 'critical')).toHaveLength(0);
  });
});

describe('detectUsedInactiveObject', () => {
  it('signale un objet perdu encore utilisé après son changement de statut', () => {
    const objects = [makeObj('obj_1', 'Anneau', { status: 'lost', statusChangedAtChapter: 2 })];
    const events = [
      makeEvent('evt1', 1, 'Ch1', { entities: [withObj('obj_1')] }),
      makeEvent('evt2', 3, 'Ch3', { entities: [withObj('obj_1')] }), // après ch.2
    ];
    const results = runDetection({ ...empty, objects, events });

    expect(results).toHaveLength(1);
    expect(results[0].severity).toBe('high');
    expect(results[0].title).toContain('perdu');
  });

  it('signale un objet détruit', () => {
    const objects = [makeObj('obj_1', 'Anneau', { status: 'destroyed', statusChangedAtChapter: 3 })];
    const events = [makeEvent('evt1', 5, 'Ch5', { entities: [withObj('obj_1')] })];
    const results = runDetection({ ...empty, objects, events });

    expect(results[0].title).toContain('détruit');
  });

  it('ne signale pas un objet perdu utilisé AVANT son changement de statut', () => {
    const objects = [makeObj('obj_1', 'Anneau', { status: 'lost', statusChangedAtChapter: 5 })];
    const events = [makeEvent('evt1', 3, 'Ch3', { entities: [withObj('obj_1')] })];
    const results = runDetection({ ...empty, objects, events });

    expect(results.filter(r => r.severity === 'high')).toHaveLength(0);
  });

  it('ne signale pas un objet actif', () => {
    const objects = [makeObj('obj_1', 'Épée', { status: 'active' })];
    const events = [makeEvent('evt1', 1, 'Ch1', { entities: [withObj('obj_1')] })];
    const results = runDetection({ ...empty, objects, events });

    expect(results.filter(r => r.severity === 'high')).toHaveLength(0);
  });
});
