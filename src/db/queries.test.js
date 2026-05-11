import { describe, it, expect } from 'vitest';
import { computeAlerts, computeAlertsFromEvents } from './queries';

// ── Fixtures beats ────────────────────────────────────────────────────────────
// Beats minimal pour les tests — indépendant de beats_config.js

function makeBeat(id, idealPercent, tolerance, alertMessages = {}) {
  return {
    id,
    label: id,
    idealPercent,
    tolerance,
    alertMessages: {
      too_early: alertMessages.too_early ?? null,
      too_late:  alertMessages.too_late  ?? null,
      missing:   alertMessages.missing   ?? null,
    },
  };
}

// Beat attendu à 50% ± 10%
const BEAT_MID = makeBeat('midpoint', 50, 10, { missing: 'Midpoint manquant' });
// Beat attendu à 10% ± 5%
const BEAT_EARLY = makeBeat('setup', 10, 5, { too_late: 'Setup trop tard' });
// Beat attendu à 90% ± 5%
const BEAT_LATE = makeBeat('finale', 90, 5, { too_early: 'Finale trop tôt' });

const BEATS = [BEAT_MID, BEAT_EARLY, BEAT_LATE];

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeChapter(number, title, beats = []) {
  return { number, title, beats };
}

function makeEvent(chapter, title, beatId = null) {
  return { chapter, title, beatId };
}

// ── computeAlerts ─────────────────────────────────────────────────────────────

describe('computeAlerts', () => {
  it('retourne un tableau vide si tous les beats sont bien placés', () => {
    // 10 chapitres, midpoint au ch.5 → actualPct = (5-1+0.5)/10*100 = 45% → diff = -5 → |diff| <= 10
    const chapters = [
      makeChapter(5, 'Midpoint', ['midpoint']),
      makeChapter(1, 'Setup',    ['setup']),    // (1-1+0.5)/10*100 = 5% → diff=-5 → ok
      makeChapter(9, 'Finale',   ['finale']),   // (9-1+0.5)/10*100 = 85% → diff=-5 → ok
    ];
    // Compléter avec des chapitres vides pour avoir 10 au total
    for (let i = 2; i <= 10; i++) {
      if (![1, 5, 9].includes(i)) chapters.push(makeChapter(i, `Ch${i}`));
    }
    const alerts = computeAlerts(chapters, BEATS);
    expect(alerts.filter(a => a.type === 'position')).toHaveLength(0);
  });

  it('génère une alerte "missing" pour un beat absent', () => {
    const chapters = [makeChapter(1, 'Ch1')]; // aucun beat assigné
    const alerts = computeAlerts(chapters, [BEAT_MID]);
    expect(alerts).toHaveLength(1);
    expect(alerts[0].type).toBe('missing');
    expect(alerts[0].severity).toBe('warning');
    expect(alerts[0].message).toBe('Midpoint manquant');
  });

  it('ne génère pas d\'alerte "missing" si alertMessages.missing est null', () => {
    const beat = makeBeat('silent', 50, 10); // missing: null
    const chapters = [makeChapter(1, 'Ch1')];
    const alerts = computeAlerts(chapters, [beat]);
    expect(alerts).toHaveLength(0);
  });

  it('génère une alerte "warning" quand |diff| > tolerance mais <= tolerance*2', () => {
    // 10 chapitres, midpoint au ch.9 → actualPct = (9-1+0.5)/10*100 = 85%
    // diff = 85 - 50 = 35 → |35| > 10 et |35| > 20 → critical
    // Pour warning : placer au ch.7 → (7-1+0.5)/10*100 = 65% → diff = 15 → 10 < 15 <= 20 → warning
    const chapters = Array.from({ length: 10 }, (_, i) =>
      makeChapter(i + 1, `Ch${i + 1}`, i + 1 === 7 ? ['midpoint'] : [])
    );
    const alerts = computeAlerts(chapters, [BEAT_MID]);
    expect(alerts).toHaveLength(1);
    expect(alerts[0].severity).toBe('warning');
    expect(alerts[0].direction).toBe('late');
  });

  it('génère une alerte "critical" quand |diff| > tolerance*2', () => {
    // 10 chapitres, midpoint au ch.9 → actualPct = 85% → diff = 35 > 20 → critical
    const chapters = Array.from({ length: 10 }, (_, i) =>
      makeChapter(i + 1, `Ch${i + 1}`, i + 1 === 9 ? ['midpoint'] : [])
    );
    const alerts = computeAlerts(chapters, [BEAT_MID]);
    expect(alerts).toHaveLength(1);
    expect(alerts[0].severity).toBe('critical');
  });

  it('direction "early" quand le beat est avant l\'idéal', () => {
    // 10 chapitres, midpoint au ch.1 → actualPct = 5% → diff = -45 → direction early
    const chapters = Array.from({ length: 10 }, (_, i) =>
      makeChapter(i + 1, `Ch${i + 1}`, i === 0 ? ['midpoint'] : [])
    );
    const alerts = computeAlerts(chapters, [BEAT_MID]);
    expect(alerts[0].direction).toBe('early');
  });

  it('inclut actualPct, idealPct et diff arrondis', () => {
    const chapters = Array.from({ length: 10 }, (_, i) =>
      makeChapter(i + 1, `Ch${i + 1}`, i + 1 === 9 ? ['midpoint'] : [])
    );
    const alert = computeAlerts(chapters, [BEAT_MID])[0];
    expect(typeof alert.actualPct).toBe('number');
    expect(typeof alert.idealPct).toBe('number');
    expect(typeof alert.diff).toBe('number');
  });
});

// ── computeAlertsFromEvents ───────────────────────────────────────────────────

describe('computeAlertsFromEvents', () => {
  it('retourne un tableau vide si tous les beats sont bien placés', () => {
    // 10 chapitres, midpoint à ch.5 → 45% → diff=-5 → ok (tolerance=10)
    const map = new Map([
      ['midpoint', makeEvent(5, 'Midpoint')],
      ['setup',    makeEvent(1, 'Setup')],
      ['finale',   makeEvent(9, 'Finale')],
    ]);
    const alerts = computeAlertsFromEvents(map, 10, BEATS);
    expect(alerts.filter(a => a.type === 'position')).toHaveLength(0);
  });

  it('génère une alerte "missing" pour un beat absent de la map', () => {
    const map = new Map(); // aucun beat placé
    const alerts = computeAlertsFromEvents(map, 10, [BEAT_MID]);
    expect(alerts).toHaveLength(1);
    expect(alerts[0].type).toBe('missing');
    expect(alerts[0].message).toBe('Midpoint manquant');
  });

  it('génère "critical" quand |diff| > tolerance*2', () => {
    // midpoint au ch.1 sur 10 → actualPct = 5% → diff = -45 → critical
    const map = new Map([['midpoint', makeEvent(1, 'Event1')]]);
    const alerts = computeAlertsFromEvents(map, 10, [BEAT_MID]);
    expect(alerts[0].severity).toBe('critical');
  });

  it('utilise le chapterTitle de l\'event dans l\'alerte', () => {
    const map = new Map([['midpoint', makeEvent(9, 'Grande bataille')]]);
    const alerts = computeAlertsFromEvents(map, 10, [BEAT_MID]);
    if (alerts.length) {
      expect(alerts[0].chapterTitle).toBe('Grande bataille');
      expect(alerts[0].chapterNumber).toBe(9);
    }
  });

  it('utilise le message customisé si dispo (too_late)', () => {
    // setup au ch.9 sur 10 → actualPct=85% → diff=75 → critical → too_late
    const map = new Map([['setup', makeEvent(9, 'Late setup')]]);
    const alerts = computeAlertsFromEvents(map, 10, [BEAT_EARLY]);
    expect(alerts[0].message).toBe('Setup trop tard');
  });

  it('message est null si alertMessages ne couvre pas le cas (fallback géré côté UI)', () => {
    const beatNoMsg = makeBeat('beat_x', 50, 10); // messages tous null
    const map = new Map([['beat_x', makeEvent(9, 'Event')]]);
    const alerts = computeAlertsFromEvents(map, 10, [beatNoMsg]);
    expect(alerts[0].message).toBeNull();
  });

  it('résultat identique à computeAlerts pour les mêmes données', () => {
    // Construire les mêmes données dans les deux formats
    const totalChapters = 10;
    const beatEventMap = new Map([
      ['midpoint', makeEvent(9, 'Ch9')], // décalé → alerte
    ]);

    // Format chapters (pour computeAlerts)
    const chapters = Array.from({ length: totalChapters }, (_, i) =>
      makeChapter(i + 1, `Ch${i + 1}`, i + 1 === 9 ? ['midpoint'] : [])
    );

    const alertsFromEvents   = computeAlertsFromEvents(beatEventMap, totalChapters, [BEAT_MID]);
    const alertsFromChapters = computeAlerts(chapters, [BEAT_MID]);

    expect(alertsFromEvents).toHaveLength(alertsFromChapters.length);
    expect(alertsFromEvents[0].severity).toBe(alertsFromChapters[0].severity);
    expect(alertsFromEvents[0].actualPct).toBe(alertsFromChapters[0].actualPct);
  });
});
