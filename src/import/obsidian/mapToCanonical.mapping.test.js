import { describe, it, expect } from 'vitest';
import { parseVault } from './parseVault';
import { mapToCanonical, collectFields, CANONICAL_FIELDS } from './mapToCanonical';

const VAULT = [
  {
    path: 'Personnages/Harry.md',
    content: `---\ntype: personnage\nrace: Sorcier\npatronus: Cerf\nmaison: Gryffondor\n---\nLe survivant.`,
  },
  {
    path: 'Personnages/Ron.md',
    content: `---\ntype: personnage\nrace: Sorcier\npatronus: Jack Russell\n---\nL'ami fidèle.`,
  },
  {
    // Note narrative : ses champs ne doivent PAS remonter dans collectFields.
    path: 'Scenes/Duel.md',
    content: `---\ntype: scène\nchapitre: 1\npov: Harry\n---\nUn duel.`,
  },
];

const notes = parseVault(VAULT);

describe('collectFields', () => {
  const fields = collectFields(notes);
  const byKey = Object.fromEntries(fields.map(f => [f.normKey, f]));

  it('recense les champs de lore avec compteur et devinette, hors champs narratifs', () => {
    expect(byKey.race).toMatchObject({ count: 2, guess: 'race' });
    expect(byKey.patronus).toMatchObject({ count: 2, guess: null });
    expect(byKey.maison).toMatchObject({ count: 1, guess: null });
    // Champs de la scène (chapitre/pov) absents.
    expect(byKey.pov).toBeUndefined();
    expect(byKey.chapitre).toBeUndefined();
  });

  it('expose un exemple de valeur', () => {
    expect(byKey.race.sample).toBe('Sorcier');
  });

  it('CANONICAL_FIELDS liste les champs proposables sans `name`', () => {
    expect(CANONICAL_FIELDS).toContain('race');
    expect(CANONICAL_FIELDS).toContain('affiliations');
    expect(CANONICAL_FIELDS).not.toContain('name');
  });
});

describe('mapToCanonical — unicité des ids (anti-collision)', () => {
  const V = [
    { path: 'A/Alice.md', content: '---\ntype: personnage\n---\nUne Alice.' },
    { path: 'B/Alice.md', content: '---\ntype: personnage\n---\nUne autre Alice.' },
    { path: 'Chapitres/Un.md', content: '---\ntype: chapitre\nnumero: 1\n---\nCh un.' },
    { path: 'Chapitres/Autre.md', content: '---\ntype: chapitre\nnumero: 1\n---\nCh un bis.' },
    { path: 'Scenes/S.md', content: '---\ntype: scène\nchapitre: 1\n---\nScène A.' },
    { path: 'Scenes/S2.md', content: '---\ntype: scène\ntitre: S\nchapitre: 1\n---\nScène B.' },
  ];
  const { data } = mapToCanonical(parseVault(V));

  it('dédoublonne les entités homonymes', () => {
    const ids = data.loreDB.characters.map(c => c.id);
    expect(ids).toHaveLength(2);
    expect(new Set(ids).size).toBe(2);
  });
  it('dédoublonne les chapitres de même numéro', () => {
    const ids = data.chaptersDB.map(c => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
  it('dédoublonne les scènes de même titre', () => {
    const ids = data.timelineDB.map(e => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('mapToCanonical — overrideMap', () => {
  const harry = (data) => data.loreDB.characters.find(c => c.name === 'Harry');

  it('par défaut : champ inconnu → customFields', () => {
    const { data } = mapToCanonical(notes);
    const h = harry(data);
    expect(h.race).toBe('Sorcier');
    expect(h.customFields).toMatchObject({ patronus: 'Cerf', maison: 'Gryffondor' });
  });

  it('force un champ inconnu vers un champ du noyau', () => {
    const { data } = mapToCanonical(notes, { overrideMap: { patronus: 'origin' } });
    const h = harry(data);
    expect(h.origin).toBe('Cerf');
    expect(h.customFields).not.toHaveProperty('patronus');
  });

  it('force un champ du noyau vers un champ custom', () => {
    const { data } = mapToCanonical(notes, { overrideMap: { race: '__custom' } });
    const h = harry(data);
    expect(h.race).toBeNull();
    expect(h.customFields.race).toBe('Sorcier');
  });

  it('ignore complètement un champ', () => {
    const { data } = mapToCanonical(notes, { overrideMap: { patronus: '__ignore' } });
    const h = harry(data);
    expect(h.customFields).not.toHaveProperty('patronus');
    expect(h.customFields).toMatchObject({ maison: 'Gryffondor' });
  });
});
