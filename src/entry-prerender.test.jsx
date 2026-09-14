import { describe, it, expect } from 'vitest';
import { render } from './entry-prerender';

const ROUTES = {
  '/':         { title: 'Atlas Narratif', h1: 'Structure ton roman', schema: 'FAQPage' },
  '/login':    { title: 'Connexion', h1: 'Connexion' },
  '/register': { title: 'Créer un compte', h1: 'Créer un compte' },
  '/privacy':  { title: 'Politique de confidentialité', h1: 'Politique de confidentialité' },
  '/terms':    { title: 'Conditions générales', h1: 'Conditions générales' },
};

describe('entry-prerender', () => {
  for (const [route, expected] of Object.entries(ROUTES)) {
    describe(route, () => {
      const html = render(route);

      it('produit du HTML non vide', () => {
        expect(html.length).toBeGreaterThan(100);
      });

      it(`contient le <title> "${expected.title}"`, () => {
        expect(html).toContain(expected.title);
      });

      it(`contient le <h1> avec "${expected.h1}"`, () => {
        expect(html).toMatch(/<h1[\s>]/);
        expect(html).toContain(expected.h1);
      });

      if (expected.schema) {
        it(`contient le schema ${expected.schema}`, () => {
          expect(html).toContain(expected.schema);
        });
      }

      it('contient un canonical', () => {
        expect(html).toContain('canonical');
      });

      it('contient une meta description', () => {
        expect(html).toContain('name="description"');
      });
    });
  }

  it('retourne une string vide pour une route inconnue', () => {
    expect(render('/unknown')).toBe('');
  });
});
