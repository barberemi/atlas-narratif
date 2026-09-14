/**
 * Diagnostics de craft narratif — moteur pur, déterministe, testable.
 *
 * Transforme les données d'une vue d'analyse en 1 à 3 constats actionnables
 * (« ventre mou entre ch. 9 et 11 », « 4 pics sans répit »…) plutôt qu'en
 * chiffres muets. Aucune dépendance réseau/IA : mêmes principes que
 * `computeAlerts` et `detectIncoherences` (fonctions pures, sortie i18n-able).
 *
 * Les règles renvoient des clés i18n + params ; la traduction se fait dans le
 * composant d'affichage (testabilité : on assert sur `id`/`severity`/plage).
 *
 * Format d'un constat :
 *   { id, view, severity: 'critical'|'warning'|'ok', titleKey, detailKey, params,
 *     from?, to?, chipKey?, chipParams?, anchor? }
 *   `from`/`to` = numéros de chapitre concernés (null si transverse).
 */

import { BEATS } from '../data/beats_config';
import { extractChapters } from './reviewUtils';

// Chemin de la vue d'où provient un constat (pour naviguer depuis le dashboard).
export const VIEW_PATHS = { arc: '/arc', stc: '/savethecat', rhythm: '/timeline', pov: '/timeline', presence: '/timeline' };

const median = (nums) => {
  if (!nums.length) return 0;
  const s = [...nums].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
};

// Seuils narratifs (intensité sur 1–10). Exportés pour les tests.
export const ARC_THRESHOLDS = {
  LOW: 4,          // ≤ : faible tension
  HIGH: 7,         // ≥ : haute tension (pic)
  MIN_SOFT_RUN: 3, // chapitres bas consécutifs → ventre mou
  MIN_PEAK_RUN: 4, // pics consécutifs → rafale
  FLAT_STDEV: 1.2, // écart-type sous lequel la courbe est « plate »
  MIN_POINTS: 3,   // en dessous : pas assez de matière pour diagnostiquer
};

// Repère les plages maximales d'indices où `pred(valeur)` est vrai.
function findRuns(values, pred) {
  const runs = [];
  let start = -1;
  for (let i = 0; i < values.length; i++) {
    if (pred(values[i])) { if (start === -1) start = i; }
    else if (start !== -1) { runs.push([start, i - 1]); start = -1; }
  }
  if (start !== -1) runs.push([start, values.length - 1]);
  return runs;
}

/**
 * Diagnostique la courbe d'intensité émotionnelle.
 * @param {Array<{number:number, intensity:?number}>} points — chapitres EN ORDRE.
 * @returns {Array} constats (voir format en tête de fichier).
 */
export function diagnoseArc(points = []) {
  const defined = (points ?? []).filter(p => p && p.intensity != null);
  const n = defined.length;
  if (n < ARC_THRESHOLDS.MIN_POINTS) return [];

  const vals = defined.map(p => p.intensity);
  const findings = [];

  // 1 · Ventre mou — une plage basse d'au moins MIN_SOFT_RUN, hors ouverture
  //     (une intro calme est légitime, donc on ignore une plage qui démarre au tout début).
  for (const [s, e] of findRuns(vals, v => v <= ARC_THRESHOLDS.LOW)) {
    if (e - s + 1 >= ARC_THRESHOLDS.MIN_SOFT_RUN && s > 0) {
      findings.push({
        id: `softBelly-${defined[s].number}`, severity: 'warning',
        titleKey: 'craft.arc.softBelly.title', detailKey: 'craft.arc.softBelly.detail',
        params: { count: e - s + 1 }, from: defined[s].number, to: defined[e].number,
      });
    }
  }

  // 2 · Pics en rafale — une plage haute d'au moins MIN_PEAK_RUN
  for (const [s, e] of findRuns(vals, v => v >= ARC_THRESHOLDS.HIGH)) {
    if (e - s + 1 >= ARC_THRESHOLDS.MIN_PEAK_RUN) {
      findings.push({
        id: `peaks-${defined[s].number}`, severity: 'warning',
        titleKey: 'craft.arc.peaks.title', detailKey: 'craft.arc.peaks.detail',
        params: { count: e - s + 1 }, from: defined[s].number, to: defined[e].number,
      });
    }
  }

  // 3 · Courbe plate — variance faible sur un échantillon suffisant
  if (n >= 5) {
    const mean = vals.reduce((a, b) => a + b, 0) / n;
    const stdev = Math.sqrt(vals.reduce((a, b) => a + (b - mean) ** 2, 0) / n);
    if (stdev < ARC_THRESHOLDS.FLAT_STDEV) {
      findings.push({
        id: 'flat', severity: 'warning',
        titleKey: 'craft.arc.flat.title', detailKey: 'craft.arc.flat.detail',
        params: { stdev: stdev.toFixed(1) }, from: null, to: null,
      });
    }
  }

  // 4 · Climax — présence et placement du pic (dernière occurrence du max)
  if (n >= 4) {
    let maxVal = -Infinity, maxIdx = -1;
    vals.forEach((v, i) => { if (v >= maxVal) { maxVal = v; maxIdx = i; } });
    const num = defined[maxIdx].number;
    if (maxVal < ARC_THRESHOLDS.HIGH) {
      findings.push({
        id: 'noClimax', severity: 'warning',
        titleKey: 'craft.arc.noClimax.title', detailKey: 'craft.arc.noClimax.detail',
        params: { max: maxVal, threshold: ARC_THRESHOLDS.HIGH }, from: null, to: null,
      });
    } else if (maxIdx === n - 1) {
      findings.push({
        id: 'climaxEnd', severity: 'warning',
        titleKey: 'craft.arc.climaxEnd.title', detailKey: 'craft.arc.climaxEnd.detail',
        params: {}, from: num, to: num,
      });
    } else if (maxIdx >= Math.floor((2 * n) / 3)) {
      findings.push({
        id: 'climaxGood', severity: 'ok',
        titleKey: 'craft.arc.climaxGood.title', detailKey: 'craft.arc.climaxGood.detail',
        params: {}, from: num, to: num,
      });
    } else {
      findings.push({
        id: 'climaxEarly', severity: 'warning',
        titleKey: 'craft.arc.climaxEarly.title', detailKey: 'craft.arc.climaxEarly.detail',
        params: {}, from: num, to: num,
      });
    }
  }

  // Constats à surveiller d'abord, note positive en dernier.
  const rank = { critical: 0, warning: 1, ok: 2 };
  findings.sort((a, b) => rank[a.severity] - rank[b.severity]);
  return findings.map(f => ({ ...f, view: 'arc' }));
}

// ── Save the Cat ───────────────────────────────────────────────────────────────
// Synthétise le placement des 15 beats en un verdict + jusqu'à 3 notes groupées
// (au lieu du mur d'alertes). Chaque tome est diagnostiqué sur SES propres
// chapitres (index dans le tome), donc mesuré sur son 0–100 % — pas sur la série.
// Entrée : tomes = [{ key, label, placed:[{beatId,number,idealPercent,tolerance,
//                     actualPercent}], missing:[{beatId,number}] }]

const actOfBeat = (n) => (n <= 5 ? 1 : n <= 12 ? 2 : 3);

// Construit la structure d'un tome pour `diagnoseStc` : chaque beat placé est
// positionné par l'INDEX de son chapitre DANS le tome (donc sur son 0–100 %,
// pas sur la série), et les beats absents sont listés comme manquants.
export function buildStcTome(key, label, chapters, beatEventMap) {
  const ordered = [...(chapters ?? [])].sort((a, b) => a.number - b.number);
  const total   = ordered.length;
  const placed = [], missing = [];
  for (const b of BEATS) {
    const evs = beatEventMap?.get(b.id);
    if (!evs) { missing.push({ beatId: b.id, number: b.number }); continue; }
    const ev  = Array.isArray(evs) ? evs[0] : evs;
    const idx = ordered.findIndex(c => c.number === ev.chapter);
    const actualPercent = (total <= 1 || idx < 0) ? b.idealPercent : (idx / (total - 1)) * 100;
    placed.push({ beatId: b.id, number: b.number, idealPercent: b.idealPercent, tolerance: b.tolerance, actualPercent });
  }
  return { key, label, placed, missing };
}

// Dérive les tomes STC depuis les événements timeline : un tome par volume s'il
// y en a plusieurs (labellisés T1/T2/T3), sinon un tome unique.
export function stcTomesFromEvents(events = [], volumes = []) {
  const evs = events ?? [];
  if (!evs.length) return [];
  const beatMapOf = (list) => {
    const m = new Map();
    for (const e of list) if (e.beatId && !m.has(e.beatId)) m.set(e.beatId, e);
    return m;
  };
  const vols = (volumes ?? []).filter(Boolean);
  if (vols.length > 1) {
    return vols
      .map(v => ({ v, ve: evs.filter(e => e.volumeId === v.id) }))
      .filter(x => x.ve.length > 0)
      .map(({ v, ve }) => buildStcTome(v.id, `T${v.number}`, extractChapters(ve), beatMapOf(ve)));
  }
  return [buildStcTome('all', null, extractChapters(evs), beatMapOf(evs))];
}

// Dérive les points d'arc ordonnés (pour `diagnoseArc`) depuis le store arc.
export function arcPointsOrdered(points = []) {
  return [...(points ?? [])]
    .filter(p => p && p.chapterNumber != null)
    .sort((a, b) => a.chapterNumber - b.chapterNumber)
    .map(p => ({ number: p.chapterNumber, intensity: p.intensity }));
}

// ── C · Rythme ─────────────────────────────────────────────────────────────────
// chapters : [{ num, events, chars }] (déjà agrégé par le dashboard).
export function diagnoseRhythm(chapters = []) {
  const list = (chapters ?? []).filter(c => c && c.num != null);
  if (list.length < 4) return [];
  const findings = [];

  const medEv = median(list.map(c => c.events ?? 0));
  const overloaded = list.filter(c => (c.events ?? 0) >= Math.max(medEv * 2, medEv + 3) && (c.events ?? 0) >= 5);
  if (overloaded.length) {
    const w = overloaded.sort((a, b) => b.events - a.events)[0];
    findings.push({ id: `rhythmOverload-${w.num}`, view: 'rhythm', severity: 'warning',
      titleKey: 'craft.rhythm.overloaded.title', detailKey: 'craft.rhythm.overloaded.detail',
      params: { n: w.num, count: w.events }, from: w.num, to: w.num });
  }

  const medCh = median(list.map(c => c.chars ?? 0));
  const crowded = list.filter(c => (c.chars ?? 0) >= Math.max(medCh * 2, medCh + 4) && (c.chars ?? 0) >= 7);
  if (crowded.length) {
    const w = crowded.sort((a, b) => b.chars - a.chars)[0];
    findings.push({ id: `rhythmCrowd-${w.num}`, view: 'rhythm', severity: 'warning',
      titleKey: 'craft.rhythm.crowded.title', detailKey: 'craft.rhythm.crowded.detail',
      params: { n: w.num, count: w.chars }, from: w.num, to: w.num });
  }
  return findings;
}

// ── D · Points de vue ──────────────────────────────────────────────────────────
// events : timeline events { chapter, povCharacterId } ; nameOf : id → nom.
export function diagnosePov(events = [], nameOf = (id) => id) {
  const evs = (events ?? []).filter(e => e && e.chapter != null);
  if (evs.length < 6) return [];
  const findings = [];

  const allChapters = new Set(evs.map(e => e.chapter));
  const povByChapter = new Map();  // chapitre → Map(povId → occurrences)
  for (const e of evs) {
    if (!e.povCharacterId) continue;
    if (!povByChapter.has(e.chapter)) povByChapter.set(e.chapter, new Map());
    const m = povByChapter.get(e.chapter);
    m.set(e.povCharacterId, (m.get(e.povCharacterId) ?? 0) + 1);
  }

  // POV dominant par chapitre → répartition
  const povChapters = new Map();
  for (const [, m] of povByChapter) {
    const dom = [...m.entries()].sort((a, b) => b[1] - a[1])[0][0];
    povChapters.set(dom, (povChapters.get(dom) ?? 0) + 1);
  }
  const totalPov = [...povChapters.values()].reduce((a, b) => a + b, 0);
  if (totalPov >= 5 && povChapters.size >= 2) {
    const [topId, topCount] = [...povChapters.entries()].sort((a, b) => b[1] - a[1])[0];
    const share = topCount / totalPov;
    if (share >= 0.8) {
      findings.push({ id: 'povMonopoly', view: 'pov', severity: 'warning',
        titleKey: 'craft.pov.monopoly.title', detailKey: 'craft.pov.monopoly.detail',
        params: { name: nameOf(topId), pct: Math.round(share * 100) } });
    }
  }

  const missing = [...allChapters].filter(ch => !povByChapter.has(ch));
  if (allChapters.size >= 6 && missing.length >= 3) {
    findings.push({ id: 'povMissing', view: 'pov', severity: 'warning',
      titleKey: 'craft.pov.missing.title', detailKey: 'craft.pov.missing.detail',
      params: { count: missing.length } });
  }
  return findings;
}

// ── E · Présence des personnages ───────────────────────────────────────────────
// events : timeline events { chapter, entities:[{id,entityType}] } ;
// topChars : [{ id, name }] personnages principaux.
export function diagnosePresence(events = [], topChars = []) {
  const evs = (events ?? []).filter(e => e && e.chapter != null);
  if (!evs.length || !topChars?.length) return [];

  const chaptersOf = (id) => {
    const s = new Set();
    for (const e of evs) {
      if ((e.entities ?? []).some(x => x.entityType === 'character' && x.id === id)) s.add(e.chapter);
    }
    return [...s].sort((a, b) => a - b);
  };

  let worst = null;
  for (const c of topChars.slice(0, 3)) {
    const chs = chaptersOf(c.id);
    if (chs.length < 2) continue;
    let maxGap = 0, at = null;
    for (let i = 1; i < chs.length; i++) {
      const g = chs[i] - chs[i - 1];
      if (g > maxGap) { maxGap = g; at = [chs[i - 1], chs[i]]; }
    }
    if (maxGap >= 6 && (!worst || maxGap > worst.gap)) worst = { name: c.name, gap: maxGap, from: at[0], to: at[1] };
  }
  if (!worst) return [];
  return [{ id: 'presenceGap', view: 'presence', severity: 'warning',
    titleKey: 'craft.presence.gap.title', detailKey: 'craft.presence.gap.detail',
    params: { name: worst.name, count: worst.gap - 1 }, from: worst.from, to: worst.to }];
}

export function diagnoseStc(tomes = []) {
  const list = (tomes ?? []).filter(t => t && ((t.placed?.length ?? 0) + (t.missing?.length ?? 0) > 0));
  if (!list.length) return [];

  let totalPlaced = 0, totalBeats = 0, totalIssues = 0;
  const candidates = [];

  for (const tome of list) {
    const placed  = tome.placed  ?? [];
    const missing = tome.missing ?? [];
    totalPlaced += placed.length;
    totalBeats  += placed.length + missing.length;

    const late  = placed.filter(b => b.actualPercent - b.idealPercent > b.tolerance);
    const early = placed.filter(b => b.idealPercent - b.actualPercent > b.tolerance);
    totalIssues += late.length + early.length + missing.length;

    const chip = tome.label ? { chipKey: 'craft.tomeChip', chipParams: { label: tome.label } } : {};
    const note = (prio, extra) => candidates.push({ prio, view: 'stc', severity: 'warning', ...chip, ...extra });

    if (missing.length) {
      note(1, { id: `stcMissing-${tome.key}`, anchor: missing[0].beatId,
        titleKey: 'craft.stc.missing.title', detailKey: 'craft.stc.missing.detail', params: { count: missing.length } });
    }
    const lateIII = late.filter(b => actOfBeat(b.number) === 3);
    if (lateIII.length) {
      note(2, { id: `stcActIII-${tome.key}`, anchor: lateIII[0].beatId,
        titleKey: 'craft.stc.actIII.title', detailKey: 'craft.stc.actIII.detail', params: { count: lateIII.length } });
    }
    const mid = [...late, ...early].find(b => b.number === 9);
    if (mid) {
      const dir = mid.actualPercent > mid.idealPercent ? 'late' : 'early';
      note(3, { id: `stcMid-${tome.key}`, anchor: mid.beatId,
        titleKey: 'craft.stc.midpoint.title',
        detailKey: dir === 'late' ? 'craft.stc.midpoint.detailLate' : 'craft.stc.midpoint.detailEarly', params: {} });
    }
    const lateI = late.filter(b => actOfBeat(b.number) === 1);
    if (lateI.length >= 2) {
      note(4, { id: `stcSlow-${tome.key}`, anchor: lateI[0].beatId,
        titleKey: 'craft.stc.slowStart.title', detailKey: 'craft.stc.slowStart.detail', params: { count: lateI.length } });
    }
  }

  const notes = candidates.sort((a, b) => a.prio - b.prio).slice(0, 3).map(({ prio: _prio, ...rest }) => rest);

  const verdict = totalIssues === 0
    ? { id: 'stcVerdict', view: 'stc', severity: 'ok',
        titleKey: 'craft.stc.solid.title', detailKey: 'craft.stc.solid.detail', params: {} }
    : { id: 'stcVerdict', view: 'stc', severity: 'warning',
        titleKey: 'craft.stc.verdict.title', detailKey: 'craft.stc.verdict.detail',
        params: { placed: totalPlaced, total: totalBeats, count: notes.length } };

  return [verdict, ...notes];
}
