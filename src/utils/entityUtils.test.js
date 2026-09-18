import { describe, it, expect, beforeEach } from 'vitest';
import { initEntityCache, setCustomEntityCache, getEntityMeta } from './entityUtils';

beforeEach(() => {
  initEntityCache({
    characters: [{ id: 'char_a', name: 'Aragorn', color: '#3F51B5' }],
    locations: [{ id: 'loc_a', name: 'Gondor' }],
    objects: [], groups: [],
  });
  setCustomEntityCache(
    [{ id: 'cent_x', name: 'Quenya', typeId: 'ctype_langue' }],
    [{ id: 'ctype_langue', label: 'Langue', color: '#a78bfa' }],
  );
});

describe('getEntityMeta — entités custom (couche 3)', () => {
  it('résout une entité custom avec la couleur de son type', () => {
    const m = getEntityMeta('cent_x', 'custom');
    expect(m).toEqual({ name: 'Quenya', type: 'custom', color: '#a78bfa', icon: 'gem' });
  });

  it('résout sans type explicite (fallback multi-types)', () => {
    expect(getEntityMeta('cent_x').type).toBe('custom');
    expect(getEntityMeta('char_a').type).toBe('character');
  });

  it('initEntityCache (lore) ne détruit pas le cache custom', () => {
    initEntityCache({ characters: [], locations: [], objects: [], groups: [] });
    expect(getEntityMeta('cent_x', 'custom')?.name).toBe('Quenya');
  });
});
