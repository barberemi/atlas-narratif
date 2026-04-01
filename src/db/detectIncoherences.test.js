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

function makeEvent(id, chapter, title, { locationId = null, entities = [], povCharacterId = null, threadIds = [] } = {}) {
  return { id, chapter, chapterTitle: `Chapitre ${chapter}`, title, locationId, entities, povCharacterId, threadIds };
}

function makePlant(id, label, extra = {}) {
  return { id, label, status: 'open', plantChapterNum: null, payoffChapterNum: null, payoffEventId: null, plantVolumeId: null, payoffVolumeId: null, ...extra };
}

function makeThread(id, name) {
  return { id, name };
}

function makeGroup(id, name, members = []) {
  return { id, name, members };
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

const empty = { characters: [], locations: [], objects: [], events: [], plants: [], threads: [], groups: [] };

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

    const orphan = results.filter(r => r.type === 'Entité Orpheline' && r.title.includes('Alice'));
    expect(orphan).toHaveLength(1);
    expect(orphan[0].severity).toBe('low');
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

describe('detectPayoffBeforePlant', () => {
  it('signale un payoff antérieur à l\'amorce', () => {
    const plants = [makePlant('p1', 'L\'Anneau', { plantChapterNum: 5, payoffChapterNum: 2 })];
    const results = runDetection({ ...empty, plants });
    const found = results.filter(r => r.type === 'Payoff Avant Plant');
    expect(found).toHaveLength(1);
    expect(found[0].severity).toBe('high');
  });

  it('ne signale pas un payoff après l\'amorce', () => {
    const plants = [makePlant('p1', 'L\'Anneau', { plantChapterNum: 2, payoffChapterNum: 8 })];
    const results = runDetection({ ...empty, plants });
    expect(results.filter(r => r.type === 'Payoff Avant Plant')).toHaveLength(0);
  });

  it('ne signale pas si payoff ou plant est null', () => {
    const plants = [makePlant('p1', 'L\'Anneau', { plantChapterNum: 5, payoffChapterNum: null })];
    const results = runDetection({ ...empty, plants });
    expect(results.filter(r => r.type === 'Payoff Avant Plant')).toHaveLength(0);
  });
});

describe('detectGhostAffiliations', () => {
  it('signale un groupe dont un membre n\'existe plus', () => {
    const characters = [makeChar('char_a', 'Alice')];
    const groups     = [makeGroup('g1', 'La Guilde', [{ characterId: 'char_deleted' }])];
    const results    = runDetection({ ...empty, characters, groups });
    const found = results.filter(r => r.type === 'Affiliation Fantôme');
    expect(found).toHaveLength(1);
    expect(found[0].title).toContain('La Guilde');
  });

  it('ne signale pas un groupe dont tous les membres existent', () => {
    const characters = [makeChar('char_a', 'Alice')];
    const groups     = [makeGroup('g1', 'La Guilde', [{ characterId: 'char_a' }])];
    const results    = runDetection({ ...empty, characters, groups });
    expect(results.filter(r => r.type === 'Affiliation Fantôme')).toHaveLength(0);
  });
});

describe('detectOpenPlants', () => {
  it('signale une amorce ouverte sans payoff quand des chapitres existent après', () => {
    const plants  = [makePlant('p1', 'Le Médaillon', { plantChapterNum: 2, status: 'open' })];
    const events  = [
      makeEvent('evt1', 1, 'Ch1'),
      makeEvent('evt2', 5, 'Ch5'),
    ];
    const results = runDetection({ ...empty, plants, events });
    const found = results.filter(r => r.type === 'Plant Sans Payoff');
    expect(found).toHaveLength(1);
  });

  it('ne signale pas une amorce avec payoffEventId défini', () => {
    const plants = [makePlant('p1', 'Le Médaillon', { plantChapterNum: 2, payoffEventId: 'evt5' })];
    const events = [makeEvent('evt1', 5, 'Ch5')];
    const results = runDetection({ ...empty, plants, events });
    expect(results.filter(r => r.type === 'Plant Sans Payoff')).toHaveLength(0);
  });

  it('ne signale pas une amorce posée après le dernier chapitre', () => {
    const plants = [makePlant('p1', 'Le Médaillon', { plantChapterNum: 10, status: 'open' })];
    const events = [makeEvent('evt1', 5, 'Ch5')];
    const results = runDetection({ ...empty, plants, events });
    expect(results.filter(r => r.type === 'Plant Sans Payoff')).toHaveLength(0);
  });
});

describe('detectEmptyThreads', () => {
  it('signale un fil narratif sans événement associé', () => {
    const threads = [makeThread('t1', 'La Quête')];
    const events  = [makeEvent('evt1', 1, 'Sc1', { threadIds: [] })];
    const results = runDetection({ ...empty, threads, events });
    const found = results.filter(r => r.type === 'Fil Narratif Vide');
    expect(found).toHaveLength(1);
    expect(found[0].title).toContain('La Quête');
  });

  it('ne signale pas un fil utilisé dans au moins un événement', () => {
    const threads = [makeThread('t1', 'La Quête')];
    const events  = [makeEvent('evt1', 1, 'Sc1', { threadIds: ['t1'] })];
    const results = runDetection({ ...empty, threads, events });
    expect(results.filter(r => r.type === 'Fil Narratif Vide')).toHaveLength(0);
  });
});

describe('detectMissingPovInScene', () => {
  it('signale une scène dont le personnage POV n\'est pas dans les entités', () => {
    const events = [
      makeEvent('evt1', 2, 'Vision', { povCharacterId: 'char_a', entities: [] }),
    ];
    const results = runDetection({ ...empty, events });
    const found = results.filter(r => r.type === 'Personnage POV Absent');
    expect(found).toHaveLength(1);
    expect(found[0].severity).toBe('medium');
  });

  it('ne signale pas si le POV est bien dans les entités', () => {
    const events = [
      makeEvent('evt1', 2, 'Vision', { povCharacterId: 'char_a', entities: [withChar('char_a')] }),
    ];
    const results = runDetection({ ...empty, events });
    expect(results.filter(r => r.type === 'Personnage POV Absent')).toHaveLength(0);
  });

  it('ne signale pas si aucun POV n\'est défini', () => {
    const events = [makeEvent('evt1', 2, 'Scène', { entities: [withChar('char_a')] })];
    const results = runDetection({ ...empty, events });
    expect(results.filter(r => r.type === 'Personnage POV Absent')).toHaveLength(0);
  });
});

describe('detectEmptyScenes', () => {
  it('signale un événement sans entité ni lieu', () => {
    const events  = [makeEvent('evt1', 1, 'Vide')];
    const results = runDetection({ ...empty, events });
    const found = results.filter(r => r.type === 'Scène Vide');
    expect(found).toHaveLength(1);
  });

  it('ne signale pas un événement avec au moins un lieu', () => {
    const events  = [makeEvent('evt1', 1, 'Sc', { locationId: 'loc_a' })];
    const results = runDetection({ ...empty, events });
    expect(results.filter(r => r.type === 'Scène Vide')).toHaveLength(0);
  });

  it('ne signale pas un événement avec au moins une entité', () => {
    const events  = [makeEvent('evt1', 1, 'Sc', { entities: [withChar('char_a')] })];
    const results = runDetection({ ...empty, events });
    expect(results.filter(r => r.type === 'Scène Vide')).toHaveLength(0);
  });
});

// ── Cross-tomes ───────────────────────────────────────────────────────────────

function makeVolume(id, number, title = `Tome ${number}`) {
  return { id, number, title };
}

function makeEventV(id, chapter, title, volumeId, opts = {}) {
  return { ...makeEvent(id, chapter, title, opts), volumeId };
}

describe('detectCrossVolumeDeadCharacter', () => {
  it('signale un personnage mort au T1 réapparaissant au T2', () => {
    const volumes    = [makeVolume('v1', 1), makeVolume('v2', 2)];
    const characters = [makeChar('char_a', 'Alice', { deathEventId: 'evt1' })];
    const events     = [
      makeEventV('evt1', 5, 'Mort d\'Alice', 'v1', { entities: [withChar('char_a')] }),
      makeEventV('evt2', 1, 'Retour d\'Alice', 'v2', { entities: [withChar('char_a')] }),
    ];
    const results = runDetection({ ...empty, characters, events, volumes });
    const found = results.filter(r => r.type === 'Mort Cross-Tomes');
    expect(found).toHaveLength(1);
    expect(found[0].severity).toBe('critical');
    expect(found[0].title).toContain('Alice');
    expect(found[0].title).toContain('T1');
  });

  it('ne signale pas si le personnage mort n\'a pas de volumeId sur l\'événement de mort', () => {
    const volumes    = [makeVolume('v1', 1), makeVolume('v2', 2)];
    const characters = [makeChar('char_a', 'Alice', { deathEventId: 'evt1' })];
    const events     = [
      { ...makeEvent('evt1', 5, 'Mort'), volumeId: null, entities: [withChar('char_a')] },
      makeEventV('evt2', 1, 'Retour', 'v2', { entities: [withChar('char_a')] }),
    ];
    const results = runDetection({ ...empty, characters, events, volumes });
    expect(results.filter(r => r.type === 'Mort Cross-Tomes')).toHaveLength(0);
  });

  it('ne signale pas sans volumes', () => {
    const characters = [makeChar('char_a', 'Alice', { deathEventId: 'evt1' })];
    const events     = [
      makeEventV('evt1', 5, 'Mort', 'v1', { entities: [withChar('char_a')] }),
      makeEventV('evt2', 1, 'Retour', 'v2', { entities: [withChar('char_a')] }),
    ];
    const results = runDetection({ ...empty, characters, events, volumes: [] });
    expect(results.filter(r => r.type === 'Mort Cross-Tomes')).toHaveLength(0);
  });

  it('ne signale pas si l\'événement postérieur est dans le même tome', () => {
    const volumes    = [makeVolume('v1', 1), makeVolume('v2', 2)];
    const characters = [makeChar('char_a', 'Alice', { deathEventId: 'evt1' })];
    const events     = [
      makeEventV('evt1', 5, 'Mort', 'v1', { entities: [withChar('char_a')] }),
      makeEventV('evt2', 8, 'Flash-back', 'v1', { entities: [withChar('char_a')] }),
    ];
    // Même tome → déjà couvert par detectDeadCharacterReappearance, pas cross-tomes
    const results = runDetection({ ...empty, characters, events, volumes });
    expect(results.filter(r => r.type === 'Mort Cross-Tomes')).toHaveLength(0);
  });
});

describe('detectCrossVolumeInactiveObject', () => {
  it('signale un objet perdu au T1 utilisé au T2', () => {
    const volumes = [makeVolume('v1', 1), makeVolume('v2', 2)];
    const objects = [makeObj('obj_1', 'Épée', { status: 'lost', statusChangedAtChapter: 3 })];
    const events  = [
      makeEventV('evt1', 3, 'Perte', 'v1', { entities: [withObj('obj_1')] }),
      makeEventV('evt2', 1, 'Usage', 'v2', { entities: [withObj('obj_1')] }),
    ];
    const results = runDetection({ ...empty, objects, events, volumes });
    const found = results.filter(r => r.type === 'Objet Cross-Tomes');
    expect(found).toHaveLength(1);
    expect(found[0].severity).toBe('high');
    expect(found[0].title).toContain('Épée');
  });

  it('ne signale pas sans volumes', () => {
    const objects = [makeObj('obj_1', 'Épée', { status: 'lost', statusChangedAtChapter: 3 })];
    const events  = [
      makeEventV('evt1', 3, 'Perte', 'v1', { entities: [withObj('obj_1')] }),
      makeEventV('evt2', 1, 'Usage', 'v2', { entities: [withObj('obj_1')] }),
    ];
    const results = runDetection({ ...empty, objects, events, volumes: [] });
    expect(results.filter(r => r.type === 'Objet Cross-Tomes')).toHaveLength(0);
  });

  it('ne signale pas un objet actif', () => {
    const volumes = [makeVolume('v1', 1), makeVolume('v2', 2)];
    const objects = [makeObj('obj_1', 'Épée', { status: 'active', statusChangedAtChapter: null })];
    const events  = [makeEventV('evt1', 1, 'Usage', 'v2', { entities: [withObj('obj_1')] })];
    const results = runDetection({ ...empty, objects, events, volumes });
    expect(results.filter(r => r.type === 'Objet Cross-Tomes')).toHaveLength(0);
  });
});

describe('detectCrossVolumePlantWithoutPayoff', () => {
  it('signale une amorce ouverte sans payoff dans toute la série', () => {
    const volumes = [makeVolume('v1', 1), makeVolume('v2', 2)];
    const plants  = [makePlant('p1', 'Le Médaillon', { status: 'open', plantVolumeId: 'v1' })];
    const results = runDetection({ ...empty, plants, volumes });
    const found = results.filter(r => r.type === 'Plant Cross-Tomes');
    expect(found).toHaveLength(1);
    expect(found[0].severity).toBe('medium');
    expect(found[0].title).toContain('Médaillon');
  });

  it('ne signale pas une amorce avec payoffEventId défini', () => {
    const volumes = [makeVolume('v1', 1), makeVolume('v2', 2)];
    const plants  = [makePlant('p1', 'Le Médaillon', { status: 'open', plantVolumeId: 'v1', payoffEventId: 'evt9' })];
    const results = runDetection({ ...empty, plants, volumes });
    expect(results.filter(r => r.type === 'Plant Cross-Tomes')).toHaveLength(0);
  });

  it('ne signale pas une amorce avec payoffChapterNum défini', () => {
    const volumes = [makeVolume('v1', 1), makeVolume('v2', 2)];
    const plants  = [makePlant('p1', 'Le Médaillon', { status: 'open', plantVolumeId: 'v1', payoffChapterNum: 10 })];
    const results = runDetection({ ...empty, plants, volumes });
    expect(results.filter(r => r.type === 'Plant Cross-Tomes')).toHaveLength(0);
  });

  it('ne signale pas une amorce sans plantVolumeId (projet mono-tome ou non assigné)', () => {
    const volumes = [makeVolume('v1', 1), makeVolume('v2', 2)];
    const plants  = [makePlant('p1', 'Le Médaillon', { status: 'open', plantVolumeId: null })];
    const results = runDetection({ ...empty, plants, volumes });
    expect(results.filter(r => r.type === 'Plant Cross-Tomes')).toHaveLength(0);
  });

  it('ne signale pas sans volumes', () => {
    const plants = [makePlant('p1', 'Le Médaillon', { status: 'open', plantVolumeId: 'v1' })];
    const results = runDetection({ ...empty, plants, volumes: [] });
    expect(results.filter(r => r.type === 'Plant Cross-Tomes')).toHaveLength(0);
  });
});
