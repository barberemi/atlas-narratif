/**
 * Modèle des trois actes en pourcentage du récit — SOURCE UNIQUE partagée par la
 * frise Save the Cat (positions idéales en %) et la Timeline (colonnes de
 * chapitres). C'est ce qui fait des deux pages des « sœurs visuelles »
 * (chantier 6 de la refonte STC) : mêmes bandes d'acte, même axe chapitres.
 *
 * Couleurs = catégoriel par acte (vert / or / ardoise), cf. viz_palette.
 */
import { VIZ_CATEGORICAL } from '../data/viz_palette';

/** Bandes d'acte sur l'axe 0-100 % du récit. */
export const ACT_BANDS = [
  { key: 'I',   from: 0,  to: 25,  color: VIZ_CATEGORICAL[0] },
  { key: 'II',  from: 25, to: 75,  color: VIZ_CATEGORICAL[1] },
  { key: 'III', from: 75, to: 100, color: VIZ_CATEGORICAL[2] },
];

/** Indice d'acte (0/1/2) pour une position en % du récit. */
export function actIndexForPercent(pct) {
  if (pct < 25) return 0;
  if (pct < 75) return 1;
  return 2;
}

/** Position d'un chapitre sur l'axe 0-100 % — centre de la case (même convention que la frise). */
export function chapterPercent(index, total) {
  if (!total) return 0;
  return ((index + 0.5) / total) * 100;
}

/** Indice d'acte (0/1/2) d'un chapitre selon sa position dans la séquence. */
export function actIndexForChapter(index, total) {
  return actIndexForPercent(chapterPercent(index, total));
}

/** Couleur d'un acte par indice. */
export function actColor(actIndex) {
  return VIZ_CATEGORICAL[actIndex] ?? VIZ_CATEGORICAL[0];
}

/**
 * Découpe une liste de chapitres en segments d'acte contigus — pour peindre une
 * bande d'acte alignée sur des colonnes de largeur égale (Timeline).
 * @param {number} total nombre de chapitres
 * @returns {Array<{ actIndex, key, color, start, count }>} start = index de départ, count = nb de colonnes
 */
export function actSegments(total) {
  const segs = [];
  for (let i = 0; i < total; i++) {
    const actIndex = actIndexForChapter(i, total);
    const last = segs[segs.length - 1];
    if (last && last.actIndex === actIndex) {
      last.count += 1;
    } else {
      segs.push({ actIndex, key: ACT_BANDS[actIndex].key, color: ACT_BANDS[actIndex].color, start: i, count: 1 });
    }
  }
  return segs;
}
