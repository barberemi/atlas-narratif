/**
 * Détection des convergences / divergences de personnages (piste 4 de la refonte
 * carte). « Qui se retrouve, où, quand » — et qui se sépare. Fonction pure,
 * calculée depuis les trajets auto (steps avec `chapterNum`, `locationId`, `lieu`).
 *
 * Un personnage est « présent » à un lieu à un chapitre donné selon le report du
 * dernier lieu connu entre deux apparitions (même convention que la carte et la
 * frise de présence : le marqueur « reste » sur place). Hors de sa fenêtre
 * [1re apparition, dernière apparition], il est absent.
 */

/** Lieu de chaque personnage à chaque chapitre (report du dernier connu, sinon null). */
function locationByChapter(journey, chapters) {
  const steps = journey ?? [];
  if (!steps.length) return chapters.map(() => null);
  const firstCh = steps[0].chapterNum;
  const lastCh  = steps[steps.length - 1].chapterNum;
  const byChapter = new Map();
  for (const s of steps) byChapter.set(s.chapterNum, { locId: s.locationId ?? null, lieu: s.lieu });

  return chapters.map(ch => {
    if (ch.number < firstCh || ch.number > lastCh) return null;
    const exact = byChapter.get(ch.number);
    if (exact) return exact;
    let carried = null;
    for (const s of steps) { if (s.chapterNum <= ch.number) carried = s; else break; }
    return carried ? { locId: carried.locationId ?? null, lieu: carried.lieu } : null;
  });
}

/** Groupes (≥2 personnages au même lieu) à un chapitre donné → Map(locId → members[]). */
function groupsAt(perChar, i) {
  const map = new Map(); // locId -> { lieu, members: [labels] }
  for (const c of perChar) {
    const cell = c.locs[i];
    if (!cell || cell.locId == null) continue; // lieu inconnu → pas de convergence fiable
    if (!map.has(cell.locId)) map.set(cell.locId, { lieu: cell.lieu, members: [] });
    map.get(cell.locId).members.push(c.label);
  }
  return map;
}

/**
 * @param {Array<{key:string,label:string,journey:Array}>} characters personnages affichés
 * @param {Array<{number:number,title:string}>} chapters chapitres triés
 * @returns {Array<{
 *   together: Array<{locId,lieu,members:string[]}>,  // groupes ≥2 présents à ce chapitre
 *   gatherings: Array<{locId,lieu,members:string[]}>, // groupes qui se forment / s'agrandissent ici
 *   splits: Array<{locId,lieu,members:string[]}>,     // groupes qui rétrécissent / se rompent ici
 * }>} un élément par chapitre (même index que `chapters`)
 */
export function detectGatherings(characters, chapters) {
  const perChar = (characters ?? []).map(c => ({
    key: c.key, label: c.label, locs: locationByChapter(c.journey, chapters),
  }));

  return chapters.map((ch, i) => {
    const curr = groupsAt(perChar, i);
    const prev = i > 0 ? groupsAt(perChar, i - 1) : new Map();

    const together = [...curr.entries()]
      .filter(([, g]) => g.members.length >= 2)
      .map(([locId, g]) => ({ locId, lieu: g.lieu, members: g.members }));

    // Rassemblement : un groupe ≥2 au lieu L plus grand qu'au chapitre précédent
    const gatherings = [];
    for (const [locId, g] of curr) {
      if (g.members.length < 2) continue;
      const before = prev.get(locId)?.members.length ?? 0;
      if (g.members.length > before) gatherings.push({ locId, lieu: g.lieu, members: g.members });
    }

    // Scission : un groupe ≥2 au chapitre précédent qui rétrécit au lieu L
    const splits = [];
    for (const [locId, g] of prev) {
      if (g.members.length < 2) continue;
      const now = curr.get(locId)?.members.length ?? 0;
      if (now < g.members.length) splits.push({ locId, lieu: g.lieu, members: g.members });
    }

    return { together, gatherings, splits };
  });
}
