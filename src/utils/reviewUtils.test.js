import { describe, it, expect } from 'vitest';
import { filterBySource, computeStats, extractChapters } from './reviewUtils';

// ── filterBySource ────────────────────────────────────────────────────────────

describe('filterBySource', () => {
  const items = [
    { id: 1, source: 'import'   },
    { id: 2, source: 'manual'   },
    { id: 3, source: 'modified' },
    { id: 4, source: 'import'   },
    { id: 5                     }, // source absente → 'import' implicite
  ];

  it('filtre "all" retourne tout', () => {
    expect(filterBySource(items, 'all')).toHaveLength(5);
  });

  it('filtre "import" retourne les importés + ceux sans source', () => {
    const result = filterBySource(items, 'import');
    expect(result.map(i => i.id)).toEqual([1, 4, 5]);
  });

  it('filtre "manual" retourne seulement les manuels', () => {
    const result = filterBySource(items, 'manual');
    expect(result.map(i => i.id)).toEqual([2]);
  });

  it('filtre "modified" retourne seulement les modifiés', () => {
    const result = filterBySource(items, 'modified');
    expect(result.map(i => i.id)).toEqual([3]);
  });

  it('retourne un tableau vide si aucun élément correspond', () => {
    expect(filterBySource([], 'import')).toHaveLength(0);
    expect(filterBySource(items, 'manual').filter(i => i.source === 'import')).toHaveLength(0);
  });
});

// ── computeStats ─────────────────────────────────────────────────────────────

describe('computeStats', () => {
  it('compte correctement chaque type', () => {
    const chars  = [{ id: 1 }, { id: 2 }];
    const locs   = [{ id: 3 }];
    const objs   = [{ id: 4 }, { id: 5 }, { id: 6 }];
    const events = [{ id: 7 }, { id: 8 }];

    const stats = computeStats(chars, locs, objs, events);
    expect(stats.characters).toBe(2);
    expect(stats.locations).toBe(1);
    expect(stats.objects).toBe(3);
    expect(stats.events).toBe(2);
  });

  it('compte "modified" et "manual" dans le total modifiés', () => {
    const chars  = [{ source: 'modified' }, { source: 'import' }];
    const locs   = [{ source: 'manual' }];
    const objs   = [];
    const events = [{ source: 'import' }];

    const stats = computeStats(chars, locs, objs, events);
    expect(stats.modified).toBe(2); // 1 modified + 1 manual
  });

  it('modified = 0 si tout est "import"', () => {
    const chars = [{ source: 'import' }, { source: 'import' }];
    const stats = computeStats(chars, [], [], []);
    expect(stats.modified).toBe(0);
  });

  it('fonctionne avec des tableaux vides', () => {
    const stats = computeStats([], [], [], []);
    expect(stats).toEqual({ characters: 0, locations: 0, objects: 0, events: 0, modified: 0 });
  });
});

// ── extractChapters ───────────────────────────────────────────────────────────

describe('extractChapters', () => {
  it('extrait des chapitres uniques triés par numéro', () => {
    const events = [
      { chapter: 3, chapterTitle: 'La quête' },
      { chapter: 1, chapterTitle: 'Le départ' },
      { chapter: 2, chapterTitle: 'La route' },
    ];
    const result = extractChapters(events);
    expect(result).toEqual([
      { number: 1, title: 'Le départ' },
      { number: 2, title: 'La route'  },
      { number: 3, title: 'La quête'  },
    ]);
  });

  it('déduplique les chapitres (plusieurs événements par chapitre)', () => {
    const events = [
      { chapter: 1, chapterTitle: 'Ch1' },
      { chapter: 1, chapterTitle: 'Ch1' },
      { chapter: 2, chapterTitle: 'Ch2' },
    ];
    const result = extractChapters(events);
    expect(result).toHaveLength(2);
  });

  it('retourne un fallback "Chapitre N" si chapterTitle est absent', () => {
    const events = [{ chapter: 5 }]; // pas de chapterTitle
    const result = extractChapters(events);
    expect(result[0].title).toBe('Chapitre 5');
  });

  it('retourne un tableau vide pour des events vides', () => {
    expect(extractChapters([])).toEqual([]);
  });

  it('retourne un tableau vide pour null/undefined', () => {
    expect(extractChapters(null)).toEqual([]);
    expect(extractChapters(undefined)).toEqual([]);
  });

  it('conserve le premier titre rencontré pour un chapitre dupliqué', () => {
    const events = [
      { chapter: 1, chapterTitle: 'Premier titre' },
      { chapter: 1, chapterTitle: 'Deuxième titre' },
    ];
    const result = extractChapters(events);
    expect(result[0].title).toBe('Premier titre');
  });
});
