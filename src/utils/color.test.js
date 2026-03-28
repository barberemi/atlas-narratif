import { describe, it, expect } from 'vitest';
import { hexToRgb } from './color';

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
