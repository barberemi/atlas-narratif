import { describe, it, expect } from 'vitest';
import { findDuplicateCandidates } from './dedup';

describe('findDuplicateCandidates', () => {
  it('détecte les noms identiques (accents/casse ignorés) et inclus', () => {
    const data = {
      loreDB: {
        characters: [{ name: 'Aragorn' }, { name: 'aragorn' }, { name: 'Gandalf' }],
        locations: [{ name: 'Minas Tirith' }, { name: 'Minas' }],
        objects: [],
      },
      customEntitiesDB: [],
    };
    const pairs = findDuplicateCandidates(data);
    const chars = pairs.filter(p => p.bucket === 'characters');
    expect(chars).toHaveLength(1);
    expect(pairs.some(p => p.bucket === 'locations')).toBe(true);
  });

  it('ne signale rien quand tout est distinct', () => {
    const data = { loreDB: { characters: [{ name: 'Frodo' }, { name: 'Sam' }], locations: [], objects: [] }, customEntitiesDB: [] };
    expect(findDuplicateCandidates(data)).toEqual([]);
  });

  it('gère un payload vide sans planter', () => {
    expect(findDuplicateCandidates({})).toEqual([]);
    expect(findDuplicateCandidates()).toEqual([]);
  });
});
