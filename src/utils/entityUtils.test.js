import { describe, it, expect, beforeEach } from 'vitest';
import {
  initEntityCache,
  getEntityMeta,
  getEntityInfo,
  findCharacterByAllyName,
} from './entityUtils';

const CHARACTERS = [
  { id: 'char_frodo',   name: 'Frodo Baggins',  aliases: ['Anneau-porteur'], color: '#10B981' },
  { id: 'char_aragorn', name: 'Aragorn',         aliases: ['Grands-Pas', 'Elessar'], color: '#3F51B5' },
  { id: 'char_legolas', name: 'Legolas',         aliases: [], color: 'var(--color-atlas-soft)' },
];
const LOCATIONS = [
  { id: 'loc_shire',   name: 'La Comté' },
  { id: 'loc_mordor',  name: 'Mordor' },
];
const OBJECTS = [
  { id: 'obj_ring',    name: 'Anneau Unique' },
];

beforeEach(() => {
  initEntityCache({ characters: CHARACTERS, locations: LOCATIONS, objects: OBJECTS });
});

// ── getEntityMeta ─────────────────────────────────────────────────────────────

describe('getEntityMeta', () => {
  it('trouve un personnage par id', () => {
    const meta = getEntityMeta('char_frodo');
    expect(meta).toMatchObject({ name: 'Frodo Baggins', type: 'character', color: '#10B981' });
  });

  it('trouve un lieu par id', () => {
    const meta = getEntityMeta('loc_shire');
    expect(meta).toMatchObject({ name: 'La Comté', type: 'location' });
  });

  it('trouve un objet par id', () => {
    const meta = getEntityMeta('obj_ring');
    expect(meta).toMatchObject({ name: 'Anneau Unique', type: 'object' });
  });

  it('retourne null pour un id inconnu', () => {
    expect(getEntityMeta('char_unknown')).toBeNull();
  });

  it('accélère la recherche avec le type hint', () => {
    const meta = getEntityMeta('char_frodo', 'character');
    expect(meta?.name).toBe('Frodo Baggins');
  });

  it('retourne null quand le type hint ne correspond pas', () => {
    expect(getEntityMeta('char_frodo', 'location')).toBeNull();
  });
});

// ── getEntityInfo ─────────────────────────────────────────────────────────────

describe('getEntityInfo', () => {
  it('ne retourne jamais null pour un id connu', () => {
    expect(getEntityInfo('char_aragorn')).not.toBeNull();
    expect(getEntityInfo('char_aragorn').name).toBe('Aragorn');
  });

  it('retourne un objet fallback pour un id inconnu', () => {
    const info = getEntityInfo('char_unknown');
    expect(info).toMatchObject({ name: 'char_unknown', type: 'unknown', icon: 'help' });
  });
});

// ── findCharacterByAllyName ───────────────────────────────────────────────────

describe('findCharacterByAllyName', () => {
  it('trouve par nom exact', () => {
    expect(findCharacterByAllyName('Legolas')?.id).toBe('char_legolas');
  });

  it('trouve par nom avec parenthèse (format allié de trajet)', () => {
    expect(findCharacterByAllyName('Aragorn (Grands-Pas)')?.id).toBe('char_aragorn');
  });

  it('supprime les articles "le/la/les/l\'" en début', () => {
    // "La Comté" n'est pas un personnage mais le test vérifie la suppression d'article
    // On peut tester avec un personnage dont le nom suit un article
    // → tester directement avec un alias contenant un article
    expect(findCharacterByAllyName("l'Anneau-porteur")?.id).toBe('char_frodo');
  });

  it('trouve par alias', () => {
    expect(findCharacterByAllyName('Grands-Pas')?.id).toBe('char_aragorn');
    expect(findCharacterByAllyName('Elessar')?.id).toBe('char_aragorn');
  });

  it('trouve par correspondance partielle sur le prénom', () => {
    // "Frodo" ⊂ "Frodo Baggins"
    expect(findCharacterByAllyName('Frodo')?.id).toBe('char_frodo');
  });

  it('retourne undefined pour un nom totalement inconnu', () => {
    expect(findCharacterByAllyName('Voldemort')).toBeUndefined();
  });

  it('insensible à la casse', () => {
    expect(findCharacterByAllyName('LEGOLAS')?.id).toBe('char_legolas');
  });
});
