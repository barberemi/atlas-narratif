import { describe, it, expect, beforeEach } from 'vitest';
import { buildGraph } from './buildGraph';
import { initEntityCache, setCustomEntityCache, setRelationCache } from './entityUtils';

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

describe('buildGraph — arêtes de relations explicites (Niveau 3)', () => {
  beforeEach(() => {
    initEntityCache({
      characters: [{ id: 'char_a', name: 'Harry' }],
      locations: [{ id: 'loc_p', name: 'Poudlard' }],
      objects: [],
      groups: [],
    });
    setCustomEntityCache(
      [{ id: 'cent_g', name: 'Gryffondor', typeId: 'ctype_maison' }],
      [{ id: 'ctype_maison', label: 'Maison', color: '#a78bfa' }],
    );
    setRelationCache([
      { id: 'r1', sourceId: 'char_a', sourceType: 'character', targetId: 'loc_p', targetType: 'location', label: 'réside à', directed: true },
      { id: 'r2', sourceId: 'cent_g', sourceType: 'custom', targetId: 'loc_p', targetType: 'location', label: null, directed: false },
    ]);
  });

  it('crée une arête depuis une relation de l\'entité centrale (libellé → relType)', () => {
    const g = buildGraph('char_a', []);
    expect(g.satellites.some(n => n.id === 'loc_p')).toBe(true);
    expect(g.edges.some(e => e.toId === 'loc_p' && e.relType === 'réside à')).toBe(true);
  });

  it('crée une arête inverse (entités qui pointent vers le central)', () => {
    // Poudlard central : Harry (natif) et Gryffondor (custom) le référencent.
    const g = buildGraph('loc_p', []);
    expect(g.satellites.some(n => n.id === 'char_a')).toBe(true);
    expect(g.satellites.some(n => n.id === 'cent_g')).toBe(true);
    const custom = g.satellites.find(n => n.id === 'cent_g');
    expect(custom.entityType).toBe('custom');
    expect(custom.color).toBe('#a78bfa');
  });

  it('relation sans libellé → relType \'wikilink\'', () => {
    const g = buildGraph('cent_g', []);
    expect(g.edges.some(e => e.toId === 'loc_p' && e.relType === 'wikilink')).toBe(true);
  });

  it('ignore une relation dont la cible n\'existe pas', () => {
    setRelationCache([{ id: 'r3', sourceId: 'char_a', sourceType: 'character', targetId: 'loc_absent', targetType: 'location', label: 'x', directed: true }]);
    const g = buildGraph('char_a', []);
    expect(g.satellites.length).toBe(0);
  });
});
