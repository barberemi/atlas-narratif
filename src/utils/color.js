/** "#RRGGBB" → "R,G,B" (chaîne prête pour rgba()) */
export function hexToRgb(hex) {
  const h = (hex || '#64748b').replace('#', '');
  return `${parseInt(h.slice(0, 2), 16)},${parseInt(h.slice(2, 4), 16)},${parseInt(h.slice(4, 6), 16)}`;
}

/** HSL → "#RRGGBB". h en degrés, s/l en %. */
export function hslToHex(h, s, l) {
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const c = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(255 * c).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

/**
 * Couleur stable d'un lieu, dérivée par hash de son identifiant — teinte répartie
 * sur la roue, saturation/clarté réglées pour la surface carte sombre (#21252c).
 * Sert de « couleur du lieu » pour la frise de présence en attendant les régions
 * (piste 5), qui remplaceront ce hash par une couleur par région.
 */
export function locationColor(id) {
  const s = String(id ?? '');
  let hash = 0;
  for (let i = 0; i < s.length; i++) hash = (hash * 31 + s.charCodeAt(i)) >>> 0;
  return hslToHex(hash % 360, 50, 62);
}
