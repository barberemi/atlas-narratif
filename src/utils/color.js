/** "#RRGGBB" → "R,G,B" (chaîne prête pour rgba()) */
export function hexToRgb(hex) {
  const h = (hex || '#64748b').replace('#', '');
  return `${parseInt(h.slice(0, 2), 16)},${parseInt(h.slice(2, 4), 16)},${parseInt(h.slice(4, 6), 16)}`;
}
