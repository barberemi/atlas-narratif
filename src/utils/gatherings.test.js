import { describe, it, expect } from 'vitest';
import { detectGatherings } from './gatherings';

const CHAPTERS = [{ number: 1 }, { number: 2 }, { number: 3 }];

// step minimal utilisé par detectGatherings : chapterNum, locationId, lieu
const s = (chapterNum, locId, lieu) => ({ chapterNum, locationId: locId, lieu });

describe('detectGatherings', () => {
  it('détecte un rassemblement initial (2 persos au même lieu au ch1)', () => {
    const chars = [
      { key: 'frodo', label: 'Frodo', journey: [s(1, 'shire', 'Comté'), s(3, 'mordor', 'Mordor')] },
      { key: 'sam',   label: 'Sam',   journey: [s(1, 'shire', 'Comté'), s(3, 'mordor', 'Mordor')] },
    ];
    const r = detectGatherings(chars, CHAPTERS);
    expect(r[0].together).toHaveLength(1);
    expect(r[0].together[0].members.sort()).toEqual(['Frodo', 'Sam']);
    expect(r[0].gatherings).toHaveLength(1); // se forme au ch1
  });

  it('détecte l\'agrandissement d\'un groupe (un 3e perso rejoint)', () => {
    const chars = [
      { key: 'frodo',   label: 'Frodo',   journey: [s(1, 'shire', 'Comté'), s(2, 'shire', 'Comté')] },
      { key: 'sam',     label: 'Sam',     journey: [s(1, 'shire', 'Comté'), s(2, 'shire', 'Comté')] },
      { key: 'gandalf', label: 'Gandalf', journey: [s(1, 'isengard', 'Isengard'), s(2, 'shire', 'Comté')] },
    ];
    const r = detectGatherings(chars, CHAPTERS);
    // ch2 : Gandalf rejoint Frodo+Sam à la Comté
    expect(r[1].gatherings).toHaveLength(1);
    expect(r[1].gatherings[0].members.sort()).toEqual(['Frodo', 'Gandalf', 'Sam']);
  });

  it('détecte une scission (le groupe se rompt)', () => {
    const chars = [
      { key: 'frodo',   label: 'Frodo',   journey: [s(1, 'shire', 'Comté'), s(2, 'mordor', 'Mordor')] },
      { key: 'sam',     label: 'Sam',     journey: [s(1, 'shire', 'Comté'), s(2, 'mordor', 'Mordor')] },
      { key: 'gandalf', label: 'Gandalf', journey: [s(1, 'shire', 'Comté'), s(2, 'isengard', 'Isengard')] },
    ];
    const r = detectGatherings(chars, CHAPTERS);
    // ch1 : les trois ensemble à la Comté
    expect(r[0].together[0].members).toHaveLength(3);
    // ch2 : Gandalf part → scission du groupe de la Comté
    expect(r[1].splits).toHaveLength(1);
    expect(r[1].splits[0].lieu).toBe('Comté');
  });

  it('reporte le dernier lieu connu entre deux apparitions', () => {
    const chars = [
      { key: 'a', label: 'A', journey: [s(1, 'x', 'X'), s(3, 'x', 'X')] }, // absent au ch2 → reporté à X
      { key: 'b', label: 'B', journey: [s(2, 'x', 'X')] },
    ];
    const r = detectGatherings(chars, CHAPTERS);
    // ch2 : A reporté à X, B à X → ensemble
    expect(r[1].together).toHaveLength(1);
    expect(r[1].together[0].members.sort()).toEqual(['A', 'B']);
  });

  it('ignore les lieux inconnus (locationId null)', () => {
    const chars = [
      { key: 'a', label: 'A', journey: [s(1, null, 'Aucun lieu')] },
      { key: 'b', label: 'B', journey: [s(1, null, 'Aucun lieu')] },
    ];
    const r = detectGatherings(chars, CHAPTERS);
    expect(r[0].together).toHaveLength(0);
  });

  it('un seul personnage ne crée jamais de convergence', () => {
    const chars = [{ key: 'a', label: 'A', journey: [s(1, 'x', 'X'), s(2, 'x', 'X')] }];
    const r = detectGatherings(chars, CHAPTERS);
    expect(r.every(c => c.together.length === 0 && c.gatherings.length === 0)).toBe(true);
  });

  it('gère des entrées vides', () => {
    expect(detectGatherings([], CHAPTERS)).toHaveLength(3);
    expect(detectGatherings([], [])).toEqual([]);
  });
});
