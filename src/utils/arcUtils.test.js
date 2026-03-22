import { describe, it, expect } from 'vitest';
import { CHART_H, PAD, yToSvg, xToSvg, smoothPath, arcColor } from './arcUtils';

// ── yToSvg ────────────────────────────────────────────────────────────────────

describe('yToSvg', () => {
  it('intensité 10 (max) → haut du graphe (PAD.top)', () => {
    expect(yToSvg(10)).toBe(PAD.top);
  });

  it('intensité 1 (min) → bas du graphe (PAD.top + CHART_H)', () => {
    expect(yToSvg(1)).toBe(PAD.top + CHART_H);
  });

  it('intensité 5.5 (milieu exact) → centre vertical', () => {
    const mid = PAD.top + CHART_H / 2;
    expect(yToSvg(5.5)).toBeCloseTo(mid, 5);
  });

  it('retourne une valeur strictement entre top et bottom pour 1 < intensity < 10', () => {
    const y = yToSvg(7);
    expect(y).toBeGreaterThan(PAD.top);
    expect(y).toBeLessThan(PAD.top + CHART_H);
  });

  it('intensité plus haute → Y plus petit (courbe vers le haut)', () => {
    expect(yToSvg(8)).toBeLessThan(yToSvg(4));
  });
});

// ── xToSvg ────────────────────────────────────────────────────────────────────

describe('xToSvg', () => {
  const W = 600;

  it('un seul point → centre horizontal', () => {
    expect(xToSvg(0, 1, W)).toBe(PAD.left + W / 2);
  });

  it('premier point (idx=0) → bord gauche', () => {
    expect(xToSvg(0, 5, W)).toBe(PAD.left);
  });

  it('dernier point (idx=total-1) → bord droit', () => {
    expect(xToSvg(4, 5, W)).toBe(PAD.left + W);
  });

  it('point médian (idx=2, total=5) → milieu horizontal', () => {
    expect(xToSvg(2, 5, W)).toBe(PAD.left + W / 2);
  });

  it('les X sont strictement croissants', () => {
    const xs = [0, 1, 2, 3].map(i => xToSvg(i, 4, W));
    for (let i = 1; i < xs.length; i++) {
      expect(xs[i]).toBeGreaterThan(xs[i - 1]);
    }
  });
});

// ── smoothPath ────────────────────────────────────────────────────────────────

describe('smoothPath', () => {
  it('tableau vide → chaîne vide', () => {
    expect(smoothPath([])).toBe('');
  });

  it('un seul point → commande M uniquement', () => {
    const path = smoothPath([{ x: 10, y: 20 }]);
    expect(path).toBe('M 10 20');
  });

  it('deux points → commence par M et contient C (cubic bezier)', () => {
    const path = smoothPath([{ x: 0, y: 100 }, { x: 200, y: 50 }]);
    expect(path).toMatch(/^M 0 100/);
    expect(path).toContain('C ');
  });

  it('n points → exactement n-1 segments C', () => {
    const pts = [
      { x: 0, y: 100 }, { x: 100, y: 50 }, { x: 200, y: 80 }, { x: 300, y: 30 },
    ];
    const path = smoothPath(pts);
    const cCount = (path.match(/C /g) || []).length;
    expect(cCount).toBe(pts.length - 1);
  });

  it('le point de contrôle X est la moyenne des deux X adjacents', () => {
    const pts = [{ x: 0, y: 100 }, { x: 200, y: 50 }];
    const path = smoothPath(pts);
    // cp = (0 + 200) / 2 = 100
    expect(path).toContain('C 100,');
  });
});

// ── arcColor ──────────────────────────────────────────────────────────────────

describe('arcColor', () => {
  it('null / 0 → couleur neutre indigo', () => {
    expect(arcColor(null)).toBe('#818cf8');
    expect(arcColor(0)).toBe('#818cf8');
  });

  it('avg >= 7 → rouge (intense)', () => {
    expect(arcColor(7)).toBe('#f87171');
    expect(arcColor(10)).toBe('#f87171');
    expect(arcColor(7.5)).toBe('#f87171');
  });

  it('avg >= 5 et < 7 → orange (dramatique)', () => {
    expect(arcColor(5)).toBe('#fb923c');
    expect(arcColor(6.9)).toBe('#fb923c');
  });

  it('avg >= 3 et < 5 → jaune (modéré)', () => {
    expect(arcColor(3)).toBe('#facc15');
    expect(arcColor(4.9)).toBe('#facc15');
  });

  it('avg < 3 → bleu (calme)', () => {
    expect(arcColor(1)).toBe('#60a5fa');
    expect(arcColor(2.9)).toBe('#60a5fa');
  });

  it('frontières exactes : 3, 5, 7 tombent dans le bon palier', () => {
    expect(arcColor(3)).toBe('#facc15'); // >= 3 → jaune
    expect(arcColor(5)).toBe('#fb923c'); // >= 5 → orange
    expect(arcColor(7)).toBe('#f87171'); // >= 7 → rouge
  });
});
