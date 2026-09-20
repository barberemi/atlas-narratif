import { describe, it, expect } from 'vitest';
import { scoreText } from './GlobalSearch';

describe('scoreText — pertinence de la recherche globale', () => {
  it('classe le match de nom AU-DESSUS du match de description', () => {
    // « harry » : Harry Potter (nom) doit battre Albus (nom sans, desc avec « Harry »).
    const harry = scoreText('harry', 'Harry Potter', ['Le Survivant'], 'Un sorcier.');
    const albus = scoreText('harry', 'Albus Dumbledore', [], 'Il veille sur Harry de loin.');
    expect(harry).toBeGreaterThan(albus);
    expect(albus).toBeGreaterThan(0); // matche quand même (via description)
  });

  it('ordonne exact > début de nom > début de mot > inclus', () => {
    expect(scoreText('harry potter', 'Harry Potter')).toBe(100);
    expect(scoreText('harry', 'Harry Potter')).toBe(85);
    expect(scoreText('potter', 'Harry Potter')).toBe(70); // début du 2e mot
    expect(scoreText('arry', 'Harry Potter')).toBe(60);   // inclus au milieu
  });

  it('gère les alias sous le nom mais au-dessus de la description', () => {
    const alias = scoreText('survivant', 'Harry Potter', ['Le Survivant'], '');
    const desc  = scoreText('sorcier', 'Harry Potter', [], 'un sorcier célèbre');
    expect(alias).toBeGreaterThan(desc);
  });

  it('retourne 0 sans correspondance', () => {
    expect(scoreText('voldemort', 'Harry Potter', ['Le Survivant'], 'un sorcier')).toBe(0);
  });

  it('est insensible aux accents (requête et cible)', () => {
    expect(scoreText('eowyn', 'Éowyn')).toBe(100);        // requête sans accent → cible accentuée
    expect(scoreText('éowyn', 'Eowyn')).toBe(100);        // requête accentuée → cible sans accent
    expect(scoreText('fee', 'Fée Clochette')).toBe(85);   // début de nom accentué
    expect(scoreText('alheim', 'Vålheim', [], '')).toBe(60); // inclus, accent au milieu
  });
});
