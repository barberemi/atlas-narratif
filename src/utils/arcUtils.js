// ── Constantes SVG (partagées avec EmotionalArc.jsx) ──────────────────────────

export const CHART_H = 220;
export const PAD     = { top: 24, right: 24, bottom: 52, left: 40 };

// ── Helpers SVG purs ──────────────────────────────────────────────────────────

/** Convertit une intensité (1-10) en coordonnée Y SVG. */
export function yToSvg(intensity) {
  return PAD.top + ((10 - intensity) / 9) * CHART_H;
}

/** Convertit un index de chapitre en coordonnée X SVG. */
export function xToSvg(idx, total, chartW) {
  if (total <= 1) return PAD.left + chartW / 2;
  return PAD.left + (idx / (total - 1)) * chartW;
}

/** Génère un chemin SVG lissé (spline cubique) à partir d'un tableau de points {x, y}. */
export function smoothPath(pts) {
  if (!pts.length) return '';
  if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
  const d = [`M ${pts[0].x} ${pts[0].y}`];
  for (let i = 1; i < pts.length; i++) {
    const cp = (pts[i - 1].x + pts[i].x) / 2;
    d.push(`C ${cp},${pts[i - 1].y} ${cp},${pts[i].y} ${pts[i].x},${pts[i].y}`);
  }
  return d.join(' ');
}

/** Retourne la couleur de la courbe selon l'intensité moyenne. */
export function arcColor(avg) {
  if (!avg) return '#818cf8';
  if (avg >= 7) return '#f87171';
  if (avg >= 5) return '#fb923c';
  if (avg >= 3) return '#facc15';
  return '#60a5fa';
}
