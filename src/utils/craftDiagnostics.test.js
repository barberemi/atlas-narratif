import { describe, it, expect } from 'vitest';
import { diagnoseArc, diagnoseStc, diagnoseRhythm, diagnosePov, diagnosePresence } from './craftDiagnostics';

// Fabrique une liste de chapitres {number, intensity} à partir d'un tableau d'intensités.
const arc = (intensities) => intensities.map((v, i) => ({ number: i + 1, intensity: v }));
const ids = (findings) => findings.map(f => f.id);

describe('diagnoseArc', () => {
  it('ne diagnostique pas sous le minimum de points', () => {
    expect(diagnoseArc(arc([5, 6]))).toEqual([]);
    expect(diagnoseArc([])).toEqual([]);
  });

  it('ignore les chapitres sans intensité', () => {
    const pts = [{ number: 1, intensity: null }, { number: 2, intensity: null }];
    expect(diagnoseArc(pts)).toEqual([]);
  });

  it('détecte un ventre mou (plage basse consécutive hors ouverture)', () => {
    // ch1 haut, ch2-4 bas, ch5 haut → ventre mou ch.2–4
    const f = diagnoseArc(arc([7, 2, 3, 2, 8]));
    const belly = f.find(x => x.titleKey === 'craft.arc.softBelly.title');
    expect(belly).toBeTruthy();
    expect(belly.from).toBe(2);
    expect(belly.to).toBe(4);
    expect(belly.params.count).toBe(3);
  });

  it('ne signale pas une ouverture calme comme ventre mou', () => {
    // plage basse qui démarre au chapitre 1 → légitime, ignorée
    const f = diagnoseArc(arc([2, 2, 2, 8, 9]));
    expect(f.find(x => x.titleKey === 'craft.arc.softBelly.title')).toBeUndefined();
  });

  it('détecte des pics en rafale', () => {
    const f = diagnoseArc(arc([3, 8, 9, 8, 7, 3]));
    const peaks = f.find(x => x.titleKey === 'craft.arc.peaks.title');
    expect(peaks).toBeTruthy();
    expect(peaks.from).toBe(2);
    expect(peaks.to).toBe(5);
    expect(peaks.params.count).toBe(4);
  });

  it('détecte une courbe plate', () => {
    const f = diagnoseArc(arc([5, 5, 5, 5, 5]));
    expect(ids(f)).toContain('flat');
  });

  it('signale l\'absence de climax quand rien ne dépasse le seuil haut', () => {
    const f = diagnoseArc(arc([3, 5, 6, 5, 4]));
    expect(ids(f)).toContain('noClimax');
  });

  it('salue un climax bien placé dans le dernier tiers', () => {
    // pic à ch.4 (idx 3) sur 5, pas le dernier → climaxGood
    const f = diagnoseArc(arc([2, 4, 6, 9, 5]));
    const good = f.find(x => x.id === 'climaxGood');
    expect(good).toBeTruthy();
    expect(good.severity).toBe('ok');
    expect(good.from).toBe(4);
  });

  it('signale une fin sur le pic (pas de redescente)', () => {
    const f = diagnoseArc(arc([2, 4, 6, 7, 9]));
    expect(ids(f)).toContain('climaxEnd');
  });

  it('signale un climax précoce', () => {
    // pic à ch.2 (idx 1) sur 6 → avant le dernier tiers
    const f = diagnoseArc(arc([5, 9, 5, 4, 5, 6]));
    expect(ids(f)).toContain('climaxEarly');
  });

  it('classe les avertissements avant la note positive', () => {
    // ventre mou (warning) + climax bien placé (ok)
    const f = diagnoseArc(arc([7, 2, 2, 2, 9, 5]));
    expect(f.length).toBeGreaterThanOrEqual(2);
    expect(f[f.length - 1].severity).toBe('ok');
  });
});

describe('diagnoseStc', () => {
  // Beat placé à sa position idéale (aucune déviation).
  const ok = (number, idealPercent) => ({ beatId: `b${number}`, number, idealPercent, tolerance: 5, actualPercent: idealPercent });
  // Beat en retard de `by` points.
  const late = (number, idealPercent, by = 20) => ({ beatId: `b${number}`, number, idealPercent, tolerance: 5, actualPercent: idealPercent + by });

  it('ne diagnostique rien sans tome exploitable', () => {
    expect(diagnoseStc([])).toEqual([]);
    expect(diagnoseStc([{ key: 't', label: 'T1', placed: [], missing: [] }])).toEqual([]);
  });

  it('rend un verdict « solide » quand tout est bien placé', () => {
    const tome = { key: 't1', label: 'T1', placed: [ok(1, 1), ok(9, 50), ok(15, 99)], missing: [] };
    const f = diagnoseStc([tome]);
    expect(f).toHaveLength(1);
    expect(f[0].id).toBe('stcVerdict');
    expect(f[0].severity).toBe('ok');
  });

  it('signale les beats manquants', () => {
    const tome = { key: 't1', label: 'T1', placed: [ok(1, 1)], missing: [{ beatId: 'b9', number: 9 }, { beatId: 'b15', number: 15 }] };
    const f = diagnoseStc([tome]);
    const note = f.find(x => x.titleKey === 'craft.stc.missing.title');
    expect(note).toBeTruthy();
    expect(note.params.count).toBe(2);
    expect(note.anchor).toBe('b9');
  });

  it('signale un acte III comprimé (beats de fin en retard)', () => {
    const tome = { key: 't1', label: 'T1', placed: [ok(1, 1), late(14, 90), late(15, 99)], missing: [] };
    const f = diagnoseStc([tome]);
    expect(f.map(x => x.titleKey)).toContain('craft.stc.actIII.title');
  });

  it('détecte un milieu tardif', () => {
    const tome = { key: 't1', label: 'T1', placed: [ok(1, 1), late(9, 50)], missing: [] };
    const f = diagnoseStc([tome]);
    const mid = f.find(x => x.titleKey === 'craft.stc.midpoint.title');
    expect(mid).toBeTruthy();
    expect(mid.detailKey).toBe('craft.stc.midpoint.detailLate');
  });

  it('limite à un verdict + 3 notes maximum', () => {
    const tome = {
      key: 't1', label: 'T1',
      placed: [late(3, 7), late(4, 10), late(9, 50), late(14, 90), late(15, 99)],
      missing: [{ beatId: 'b2', number: 2 }],
    };
    const f = diagnoseStc([tome]);
    expect(f[0].id).toBe('stcVerdict');
    expect(f.length).toBeLessThanOrEqual(4);
  });

  it('agrège plusieurs tomes avec une puce de tome', () => {
    const t1 = { key: 't1', label: 'T1', placed: [ok(1, 1)], missing: [{ beatId: 'b9', number: 9 }] };
    const t2 = { key: 't2', label: 'T2', placed: [late(9, 50)], missing: [] };
    const f = diagnoseStc([t1, t2]);
    const withChip = f.filter(x => x.chipKey === 'craft.tomeChip');
    expect(withChip.length).toBeGreaterThan(0);
  });
});

describe('diagnoseRhythm', () => {
  it('signale un chapitre surchargé en événements', () => {
    const chapters = [
      { num: 1, events: 2, chars: 3 }, { num: 2, events: 2, chars: 3 },
      { num: 3, events: 2, chars: 3 }, { num: 4, events: 12, chars: 3 },
    ];
    const f = diagnoseRhythm(chapters);
    const o = f.find(x => x.titleKey === 'craft.rhythm.overloaded.title');
    expect(o).toBeTruthy();
    expect(o.params).toMatchObject({ n: 4, count: 12 });
  });

  it('signale une distribution chargée (trop de personnages)', () => {
    const chapters = [
      { num: 1, events: 3, chars: 2 }, { num: 2, events: 3, chars: 2 },
      { num: 3, events: 3, chars: 2 }, { num: 4, events: 3, chars: 11 },
    ];
    const f = diagnoseRhythm(chapters);
    expect(f.map(x => x.titleKey)).toContain('craft.rhythm.crowded.title');
  });

  it('ne signale rien sur un rythme régulier', () => {
    const chapters = Array.from({ length: 6 }, (_, i) => ({ num: i + 1, events: 3, chars: 3 }));
    expect(diagnoseRhythm(chapters)).toEqual([]);
  });
});

describe('diagnosePov', () => {
  const ev = (chapter, pov) => ({ chapter, povCharacterId: pov });

  it('détecte un POV monopolisé', () => {
    const events = [ev(1, 'a'), ev(2, 'a'), ev(3, 'a'), ev(4, 'a'), ev(5, 'a'), ev(6, 'b')];
    const f = diagnosePov(events, id => (id === 'a' ? 'Frodo' : id));
    const m = f.find(x => x.titleKey === 'craft.pov.monopoly.title');
    expect(m).toBeTruthy();
    expect(m.params.name).toBe('Frodo');
  });

  it('détecte des chapitres sans POV', () => {
    const events = [ev(1, 'a'), ev(2, null), ev(3, null), ev(4, null), ev(5, 'b'), ev(6, 'c')];
    const f = diagnosePov(events, id => id);
    expect(f.map(x => x.titleKey)).toContain('craft.pov.missing.title');
  });
});

describe('diagnosePresence', () => {
  const ev = (chapter, ...charIds) => ({ chapter, entities: charIds.map(id => ({ id, entityType: 'character' })) });

  it('signale un personnage central éclipsé sur une longue plage', () => {
    // Frodo présent ch.1 puis absent jusqu'au ch.10
    const events = [ev(1, 'frodo'), ev(2, 'x'), ev(5, 'x'), ev(10, 'frodo')];
    const f = diagnosePresence(events, [{ id: 'frodo', name: 'Frodo' }]);
    expect(f).toHaveLength(1);
    expect(f[0].params.name).toBe('Frodo');
    expect(f[0].from).toBe(1);
    expect(f[0].to).toBe(10);
  });

  it('ne signale rien pour une présence régulière', () => {
    const events = [ev(1, 'frodo'), ev(2, 'frodo'), ev(3, 'frodo')];
    expect(diagnosePresence(events, [{ id: 'frodo', name: 'Frodo' }])).toEqual([]);
  });
});
