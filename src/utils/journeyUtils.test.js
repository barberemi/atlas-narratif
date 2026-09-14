import { describe, it, expect } from 'vitest';
import { computeAutoJourneys } from './journeyUtils';

// ── Fixtures ─────────────────────────────────────────────────────────────────

const LOCATIONS = [
  { id: 'loc_shire',  name: 'La Comté',  coordinates: { x: 10, y: 20 } },
  { id: 'loc_rivendell', name: 'Fondcombe', coordinates: { x: 50, y: 30 } },
  { id: 'loc_noloc',  name: 'Lieu sans coordonnées', coordinates: null },
];

const CHARACTERS = [
  { id: 'char_frodo',   name: 'Frodo',   journeyKey: 'frodo' },
  { id: 'char_sam',     name: 'Sam',     journeyKey: null },
  { id: 'char_gandalf', name: 'Gandalf', journeyKey: 'gandalf' },
];

function makeEvent(id, chapter, chapterTitle, locationId, entityIds) {
  return {
    id,
    chapter,
    chapterTitle,
    locationId,
    title: `Event ${id}`,
    description: `Desc ${id}`,
    entities: entityIds.map(eid => ({ entityType: 'character', id: eid })),
  };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('computeAutoJourneys', () => {
  it('génère les étapes pour un personnage avec des événements', () => {
    const events = [
      makeEvent('evt1', 1, 'Départ', 'loc_shire',    ['char_frodo', 'char_sam']),
      makeEvent('evt2', 2, 'Route',  'loc_rivendell', ['char_frodo']),
    ];

    const { autoJourneys } = computeAutoJourneys(events, LOCATIONS, CHARACTERS);

    expect(autoJourneys['frodo']).toHaveLength(2);
    expect(autoJourneys['frodo'][0]).toMatchObject({
      etape: 1,
      chapterNum: 1,
      lieu: 'La Comté',
      x: 10,
      y: 20,
      isMissing: false,
    });
    expect(autoJourneys['frodo'][1]).toMatchObject({
      etape: 2,
      lieu: 'Fondcombe',
      x: 50,
      y: 30,
    });
  });

  it('utilise char.id comme clé quand journeyKey est null', () => {
    const events = [makeEvent('evt1', 1, 'Ch1', 'loc_shire', ['char_sam'])];
    const { autoJourneys } = computeAutoJourneys(events, LOCATIONS, CHARACTERS);
    expect(autoJourneys['char_sam']).toHaveLength(1);
  });

  it('ignore les personnages sans événements', () => {
    const events = [makeEvent('evt1', 1, 'Ch1', 'loc_shire', ['char_frodo'])];
    const { autoJourneys } = computeAutoJourneys(events, LOCATIONS, CHARACTERS);
    expect(autoJourneys['gandalf']).toBeUndefined();
  });

  it('trie les étapes par chapitre', () => {
    const events = [
      makeEvent('evt3', 3, 'Ch3', 'loc_rivendell', ['char_frodo']),
      makeEvent('evt1', 1, 'Ch1', 'loc_shire',    ['char_frodo']),
    ];
    const { autoJourneys } = computeAutoJourneys(events, LOCATIONS, CHARACTERS);
    const steps = autoJourneys['frodo'];
    expect(steps[0].chapterNum).toBe(1);
    expect(steps[1].chapterNum).toBe(3);
  });

  it('détecte les lieux sans coordonnées comme unlocalized', () => {
    const events = [makeEvent('evt1', 1, 'Ch1', 'loc_noloc', ['char_frodo'])];
    const { autoJourneys, unlocalized } = computeAutoJourneys(events, LOCATIONS, CHARACTERS);

    expect(autoJourneys['frodo'][0].isMissing).toBe(true);
    expect(autoJourneys['frodo'][0].x).toBeNull();
    expect(autoJourneys['frodo'][0].y).toBeNull();

    const unlocalizedIds = unlocalized.map(u => u.id);
    expect(unlocalizedIds).toContain('loc_noloc');
  });

  it('ne duplique pas les lieux dans unlocalized', () => {
    const events = [
      makeEvent('evt1', 1, 'Ch1', 'loc_noloc', ['char_frodo']),
      makeEvent('evt2', 2, 'Ch2', 'loc_noloc', ['char_frodo']),
    ];
    const { unlocalized } = computeAutoJourneys(events, LOCATIONS, CHARACTERS);
    const ids = unlocalized.map(u => u.id);
    expect(ids.filter(id => id === 'loc_noloc')).toHaveLength(1);
  });

  it('extrait les alliés présents dans chaque événement', () => {
    const events = [
      makeEvent('evt1', 1, 'Ch1', 'loc_shire', ['char_frodo', 'char_sam', 'char_gandalf']),
    ];
    const { autoJourneys } = computeAutoJourneys(events, LOCATIONS, CHARACTERS);
    const allies = autoJourneys['frodo'][0].allies;
    expect(allies).toContain('Sam');
    expect(allies).toContain('Gandalf');
    expect(allies).not.toContain('Frodo'); // pas lui-même
  });

  it('expose locationId et isPov par étape (pour la frise de présence)', () => {
    const events = [
      { ...makeEvent('evt1', 1, 'Ch1', 'loc_shire', ['char_frodo', 'char_sam']), povCharacterId: 'char_frodo' },
      { ...makeEvent('evt2', 2, 'Ch2', 'loc_rivendell', ['char_frodo']), povCharacterId: 'char_sam' },
    ];
    const { autoJourneys } = computeAutoJourneys(events, LOCATIONS, CHARACTERS);
    expect(autoJourneys['frodo'][0]).toMatchObject({ locationId: 'loc_shire', isPov: true });
    expect(autoJourneys['frodo'][1]).toMatchObject({ locationId: 'loc_rivendell', isPov: false });
    // Sam présent au ch1 mais pas POV
    expect(autoJourneys['char_sam'][0]).toMatchObject({ locationId: 'loc_shire', isPov: false });
  });

  it('gère un événement sans lieu (locationId null)', () => {
    const events = [{ ...makeEvent('evt1', 1, 'Ch1', null, ['char_frodo']) }];
    const { autoJourneys, unlocalized } = computeAutoJourneys(events, LOCATIONS, CHARACTERS);
    const step = autoJourneys['frodo'][0];
    expect(step.lieu).toBe('Aucun lieu précisé');
    expect(step.isMissing).toBe(false);
    expect(unlocalized).toHaveLength(0);
  });

  it('retourne des structures vides pour des entrées vides', () => {
    const { autoJourneys, unlocalized } = computeAutoJourneys([], [], []);
    expect(autoJourneys).toEqual({});
    expect(unlocalized).toEqual([]);
  });
});
