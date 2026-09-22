import { describe, it, expect, beforeEach } from 'vitest';
import { initEntityCache, setCustomEntityCache, getEntityMeta, resolveEntityByName, hrefForEntity, entityHrefById, chatSourceHref, chatSourceMeta } from './entityUtils';

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

describe('resolveEntityByName — résolution des wikilinks', () => {
  beforeEach(() => {
    initEntityCache({
      characters: [{ id: 'char_a', name: 'Aragorn', aliases: ['Grands-Pas'] }],
      locations: [{ id: 'loc_a', name: 'Gondor' }],
      objects: [], groups: [],
    });
    setCustomEntityCache([{ id: 'cent_x', name: 'Quenya', typeId: 'ctype_langue' }],
      [{ id: 'ctype_langue', label: 'Langue', color: '#a78bfa' }]);
  });

  it('résout par nom, insensible à la casse/accents/séparateurs', () => {
    expect(resolveEntityByName('gondor')?.id).toBe('loc_a');
    expect(resolveEntityByName('ARAGORN')?.id).toBe('char_a');
    expect(resolveEntityByName('Grands Pas')?.id).toBe('char_a'); // - → espace
  });

  it('résout un alias et une entité custom', () => {
    expect(resolveEntityByName('Grands-Pas')?.type).toBe('character');
    expect(resolveEntityByName('Quenya')).toMatchObject({ id: 'cent_x', type: 'custom', color: '#a78bfa' });
  });

  it('retourne null si introuvable ou vide', () => {
    expect(resolveEntityByName('Sauron')).toBeNull();
    expect(resolveEntityByName('')).toBeNull();
  });
});

describe('deep-link « aller pile sur l\'élément » (?focus)', () => {
  it('hrefForEntity : entité typée → tab + search + focus=<id>', () => {
    expect(hrefForEntity({ id: 'char_a', name: 'Aragorn', type: 'character' }))
      .toBe('/lore?tab=characters&search=Aragorn&focus=char_a');
  });

  it('hrefForEntity : sans id → pas de focus', () => {
    expect(hrefForEntity({ name: 'Aragorn', type: 'character' }))
      .toBe('/lore?tab=characters&search=Aragorn');
  });

  it('entityHrefById : résout type/nom/focus depuis le cache', () => {
    expect(entityHrefById('loc_a')).toBe('/lore?tab=locations&search=Gondor&focus=loc_a');
  });

  it('chatSourceHref : source entité → fiche (avec focus)', () => {
    expect(chatSourceHref({ id: 'char_a', type: 'character' }))
      .toBe('/lore?tab=characters&search=Aragorn&focus=char_a');
  });

  it('chatSourceHref : type adressable → route?focus=<id>', () => {
    expect(chatSourceHref({ id: 'evt_1', type: 'event' })).toBe('/timeline?focus=evt_1');
    expect(chatSourceHref({ id: 'plant_1', type: 'plant' })).toBe('/plants?focus=plant_1');
    expect(chatSourceHref({ id: 'thr_1', type: 'thread' })).toBe('/threads?focus=thr_1');
    expect(chatSourceHref({ id: 'inc_1', type: 'incoherence' })).toBe('/incoherences?focus=inc_1');
    expect(chatSourceHref({ id: 'hje_1', type: 'hero' })).toBe('/heros?focus=hje_1');
  });

  it('chatSourceHref : beat/note → page seule (pas d\'élément adressable)', () => {
    expect(chatSourceHref({ id: 'ch_1', type: 'beat' })).toBe('/savethecat');
    expect(chatSourceHref({ id: 'note_1', type: 'note' })).toBe('/timeline');
  });

  it('chatSourceHref : type inconnu → null (non cliquable)', () => {
    expect(chatSourceHref({ id: 'x', type: 'zzz' })).toBeNull();
  });
});

describe('chatSourceMeta — couleur + icône par type de tag', () => {
  it('entité : reprend couleur/icône de l\'entité (cache)', () => {
    expect(chatSourceMeta({ id: 'char_a', type: 'character' }))
      .toEqual({ type: 'character', color: '#3F51B5', icon: 'user' });
    expect(chatSourceMeta({ id: 'loc_a' }).icon).toBe('location');
  });

  it('type non-entité : mappé (icône de l\'app)', () => {
    expect(chatSourceMeta({ id: 'evt_1', type: 'event' })).toMatchObject({ type: 'event', icon: 'event' });
    expect(chatSourceMeta({ id: 'plant_1', type: 'plant' }).icon).toBe('plant');
    expect(chatSourceMeta({ id: 'inc_1', type: 'incoherence' }).icon).toBe('warning');
  });

  it('type inconnu : fallback neutre', () => {
    const m = chatSourceMeta({ id: 'z', type: 'zzz' });
    expect(m.type).toBe('zzz');
    expect(m.color).toBe('#5cae8e');
  });
});
