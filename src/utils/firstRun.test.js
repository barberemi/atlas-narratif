import { describe, it, expect } from 'vitest';
import { computeFirstRun, shouldShowFirstRun, FIRST_RUN_CHAR_TARGET } from './firstRun';

describe('computeFirstRun', () => {
  it('projet totalement vide : aucune étape franchie', () => {
    const r = computeFirstRun({ description: '', charactersCount: 0, eventsCount: 0 });
    expect(r.doneCount).toBe(0);
    expect(r.total).toBe(3);
    expect(r.complete).toBe(false);
    expect(r.steps.map(s => s.done)).toEqual([false, false, false]);
  });

  it('logline renseignée coche la première étape', () => {
    const r = computeFirstRun({ description: 'Un hobbit doit détruire un anneau.', charactersCount: 0, eventsCount: 0 });
    expect(r.steps.find(s => s.id === 'logline').done).toBe(true);
    expect(r.doneCount).toBe(1);
  });

  it('une logline vide ou d\'espaces ne compte pas', () => {
    expect(computeFirstRun({ description: '   ' }).steps[0].done).toBe(false);
    expect(computeFirstRun({ description: null }).steps[0].done).toBe(false);
    expect(computeFirstRun({}).steps[0].done).toBe(false);
  });

  it('l\'étape personnages se coche à partir de la cible', () => {
    expect(computeFirstRun({ charactersCount: FIRST_RUN_CHAR_TARGET - 1 }).steps[1].done).toBe(false);
    const r = computeFirstRun({ charactersCount: FIRST_RUN_CHAR_TARGET });
    expect(r.steps[1].done).toBe(true);
    expect(r.steps[1].count).toBe(FIRST_RUN_CHAR_TARGET);
    expect(r.steps[1].target).toBe(FIRST_RUN_CHAR_TARGET);
  });

  it('l\'étape scène se coche dès le premier événement', () => {
    expect(computeFirstRun({ eventsCount: 0 }).steps[2].done).toBe(false);
    expect(computeFirstRun({ eventsCount: 1 }).steps[2].done).toBe(true);
  });

  it('les trois étapes franchies → complete', () => {
    const r = computeFirstRun({ description: 'Pitch', charactersCount: 3, eventsCount: 2 });
    expect(r.doneCount).toBe(3);
    expect(r.complete).toBe(true);
  });
});

describe('shouldShowFirstRun', () => {
  it('affiche pour un projet vide', () => {
    expect(shouldShowFirstRun({ description: '', charactersCount: 0, eventsCount: 0 })).toBe(true);
  });

  it('affiche tant qu\'il reste une étape sur un projet jeune', () => {
    // logline + 3 persos mais pas encore de scène
    expect(shouldShowFirstRun({ description: 'Pitch', charactersCount: 3, eventsCount: 0 })).toBe(true);
  });

  it('masque une fois les trois étapes franchies', () => {
    expect(shouldShowFirstRun({ description: 'Pitch', charactersCount: 3, eventsCount: 1 })).toBe(false);
  });

  it('masque sur un projet mûr / démo (beaucoup de données)', () => {
    // Beaucoup de personnages et d'événements mais pas de logline → doit rester masqué
    expect(shouldShowFirstRun({ description: '', charactersCount: 40, eventsCount: 80 })).toBe(false);
  });
});
