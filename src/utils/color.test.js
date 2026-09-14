import { describe, it, expect } from 'vitest';
import { hexToRgb, hslToHex, locationColor } from './color';

describe('hexToRgb', () => {
  it('convertit du rouge pur', () => {
    expect(hexToRgb('#FF0000')).toBe('255,0,0');
  });

  it('convertit du noir', () => {
    expect(hexToRgb('#000000')).toBe('0,0,0');
  });

  it('convertit du blanc', () => {
    expect(hexToRgb('#FFFFFF')).toBe('255,255,255');
  });

  it('convertit la couleur principale du projet (#3F51B5)', () => {
    expect(hexToRgb('#3F51B5')).toBe('63,81,181');
  });

  it('utilise le fallback #64748b pour null', () => {
    expect(hexToRgb(null)).toBe('100,116,139');
  });

  it('utilise le fallback #64748b pour une chaîne vide', () => {
    expect(hexToRgb('')).toBe('100,116,139');
  });

  it('fonctionne sans le # en préfixe', () => {
    expect(hexToRgb('FF0000')).toBe('255,0,0');
  });
});

describe('hslToHex', () => {
  it('convertit le blanc (l=100)', () => {
    expect(hslToHex(0, 0, 100)).toBe('#ffffff');
  });
  it('convertit le noir (l=0)', () => {
    expect(hslToHex(0, 0, 0)).toBe('#000000');
  });
  it('convertit le rouge pur (0,100,50)', () => {
    expect(hslToHex(0, 100, 50)).toBe('#ff0000');
  });
  it('retourne un hex à 7 caractères', () => {
    expect(hslToHex(210, 50, 62)).toMatch(/^#[0-9a-f]{6}$/);
  });
});

describe('locationColor', () => {
  it('est déterministe pour un même id', () => {
    expect(locationColor('loc_shire')).toBe(locationColor('loc_shire'));
  });
  it('donne des couleurs différentes pour des ids différents', () => {
    expect(locationColor('loc_shire')).not.toBe(locationColor('loc_mordor'));
  });
  it('retourne toujours un hex valide, même pour null', () => {
    expect(locationColor(null)).toMatch(/^#[0-9a-f]{6}$/);
    expect(locationColor('x')).toMatch(/^#[0-9a-f]{6}$/);
  });
});
