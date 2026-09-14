import { describe, it, expect } from 'vitest';
import { ACT_BANDS, actIndexForPercent, chapterPercent, actIndexForChapter, actColor, actSegments } from './acts';

describe('ACT_BANDS', () => {
  it('couvre 0-100 % en trois actes contigus', () => {
    expect(ACT_BANDS.map(a => [a.from, a.to])).toEqual([[0, 25], [25, 75], [75, 100]]);
  });
});

describe('actIndexForPercent', () => {
  it('borne les trois actes aux 25 % / 75 %', () => {
    expect(actIndexForPercent(0)).toBe(0);
    expect(actIndexForPercent(24.9)).toBe(0);
    expect(actIndexForPercent(25)).toBe(1);
    expect(actIndexForPercent(50)).toBe(1);
    expect(actIndexForPercent(74.9)).toBe(1);
    expect(actIndexForPercent(75)).toBe(2);
    expect(actIndexForPercent(100)).toBe(2);
  });
});

describe('chapterPercent', () => {
  it('place le chapitre au centre de sa case', () => {
    expect(chapterPercent(0, 4)).toBe(12.5);
    expect(chapterPercent(3, 4)).toBe(87.5);
  });
  it('renvoie 0 sans chapitres', () => {
    expect(chapterPercent(0, 0)).toBe(0);
  });
});

describe('actIndexForChapter', () => {
  it('classe les chapitres par acte selon leur position', () => {
    // 8 chapitres → centres 6.25, 18.75, 31.25, 43.75, 56.25, 68.75, 81.25, 93.75
    const acts = Array.from({ length: 8 }, (_, i) => actIndexForChapter(i, 8));
    expect(acts).toEqual([0, 0, 1, 1, 1, 1, 2, 2]);
  });
});

describe('actColor', () => {
  it('mappe chaque acte à sa couleur, repli sur acte I', () => {
    expect(actColor(0)).toBe(ACT_BANDS[0].color);
    expect(actColor(2)).toBe(ACT_BANDS[2].color);
    expect(actColor(9)).toBe(ACT_BANDS[0].color);
  });
});

describe('actSegments', () => {
  it('regroupe les chapitres contigus d\'un même acte', () => {
    const segs = actSegments(8);
    expect(segs.map(s => [s.key, s.start, s.count])).toEqual([
      ['I', 0, 2], ['II', 2, 4], ['III', 6, 2],
    ]);
  });
  it('gère une liste vide', () => {
    expect(actSegments(0)).toEqual([]);
  });
});
