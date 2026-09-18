import { describe, it, expect, beforeEach } from 'vitest';
import { buildGraph } from './buildGraph';
import { initEntityCache, setCustomEntityCache } from './entityUtils';

const EVENTS = [
  { id: 'e1', entities: [{ id: 'char_a', entityType: 'character' }, { id: 'cent_x', entityType: 'custom' }] },
];

beforeEach(() => {
  initEntityCache({
    characters: [{ id: 'char_a', name: 'Aragorn', color: '#3F51B5' }],
    locations: [],
    objects: [],
    groups: [],
  });
  setCustomEntityCache(
    [{ id: 'cent_x', name: 'Quenya', typeId: 'ctype_langue' }],
    [{ id: 'ctype_langue', label: 'Langue', color: '#a78bfa' }],
  );
});

describe('buildGraph — entités custom via co-apparition événementielle', () => {
  it('relie un personnage à une entité custom co-présente dans un événement', () => {
    const g = buildGraph('char_a', EVENTS);
    expect(g).not.toBeNull();
    const custom = g.satellites.find(n => n.id === 'cent_x');
    expect(custom).toBeTruthy();
    expect(custom.entityType).toBe('custom');
    expect(custom.color).toBe('#a78bfa'); // couleur héritée du type
  });

  it('supporte une entité custom comme nœud central', () => {
    const g = buildGraph('cent_x', EVENTS);
    expect(g.central.entityType).toBe('custom');
    expect(g.central.name).toBe('Quenya');
    expect(g.satellites.some(n => n.id === 'char_a')).toBe(true);
  });

  it('sans événements, aucune arête custom (graphe natif inchangé)', () => {
    const g = buildGraph('char_a', []);
    expect(g.satellites.some(n => n.id === 'cent_x')).toBe(false);
  });
});
