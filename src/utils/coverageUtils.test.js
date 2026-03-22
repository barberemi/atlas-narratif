import { describe, it, expect } from 'vitest';
import { buildCoverageMap } from './coverageUtils';

function makeEvent(chapter, chapterTitle, entities) {
  return { chapter, chapterTitle, entities };
}
function charEntity(id) { return { entityType: 'character', id }; }
function locEntity(id)  { return { entityType: 'location',  id }; }
function objEntity(id)  { return { entityType: 'object',    id }; }

describe('buildCoverageMap', () => {
  it('retourne un objet vide pour des events vides', () => {
    expect(buildCoverageMap([])).toEqual({});
    expect(buildCoverageMap(null)).toEqual({});
  });

  it('crée une clé "entityType:id" pour chaque entité', () => {
    const events = [makeEvent(1, 'Ch1', [charEntity('char_frodo'), locEntity('loc_shire')])];
    const map = buildCoverageMap(events);
    expect(Object.keys(map)).toContain('character:char_frodo');
    expect(Object.keys(map)).toContain('location:loc_shire');
  });

  it('associe les bons chapitres à chaque entité', () => {
    const events = [
      makeEvent(1, 'Ch1', [charEntity('char_frodo')]),
      makeEvent(3, 'Ch3', [charEntity('char_frodo')]),
    ];
    const map = buildCoverageMap(events);
    const chapters = map['character:char_frodo'];
    expect(chapters.map(c => c.number)).toEqual([1, 3]);
  });

  it('déduplique les chapitres (même entité dans plusieurs events du même chapitre)', () => {
    const events = [
      makeEvent(2, 'Ch2', [charEntity('char_sam')]),
      makeEvent(2, 'Ch2', [charEntity('char_sam')]),
    ];
    const map = buildCoverageMap(events);
    expect(map['character:char_sam']).toHaveLength(1);
  });

  it('trie les chapitres par numéro croissant', () => {
    const events = [
      makeEvent(5, 'Ch5', [charEntity('char_a')]),
      makeEvent(1, 'Ch1', [charEntity('char_a')]),
      makeEvent(3, 'Ch3', [charEntity('char_a')]),
    ];
    const map = buildCoverageMap(events);
    const nums = map['character:char_a'].map(c => c.number);
    expect(nums).toEqual([1, 3, 5]);
  });

  it('gère plusieurs types d\'entités dans le même événement', () => {
    const events = [makeEvent(1, 'Ch1', [
      charEntity('char_a'),
      locEntity('loc_b'),
      objEntity('obj_c'),
    ])];
    const map = buildCoverageMap(events);
    expect(map['character:char_a']).toHaveLength(1);
    expect(map['location:loc_b']).toHaveLength(1);
    expect(map['object:obj_c']).toHaveLength(1);
  });

  it('utilise le fallback "Chapitre N" si chapterTitle absent', () => {
    const events = [{ chapter: 7, entities: [charEntity('char_a')] }];
    const map = buildCoverageMap(events);
    expect(map['character:char_a'][0].title).toBe('Chapitre 7');
  });

  it('une entité non présente dans les events n\'a pas de clé', () => {
    const events = [makeEvent(1, 'Ch1', [charEntity('char_a')])];
    const map = buildCoverageMap(events);
    expect(map['character:char_absent']).toBeUndefined();
  });

  it('compte correctement le nombre d\'entités couvertes', () => {
    const events = [
      makeEvent(1, 'Ch1', [charEntity('char_frodo'), charEntity('char_sam')]),
      makeEvent(2, 'Ch2', [charEntity('char_frodo')]),
    ];
    const map = buildCoverageMap(events);
    expect(Object.keys(map)).toHaveLength(2); // frodo + sam
    expect(map['character:char_frodo']).toHaveLength(2); // ch1 + ch2
    expect(map['character:char_sam']).toHaveLength(1);   // ch1 seulement
  });
});
