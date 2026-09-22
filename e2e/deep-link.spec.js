import { test, expect } from './fixtures.js';

/**
 * Deep-link « aller pile sur un élément » : `?focus=<id>` fait clignoter
 * (classe `.atlas-flash`) et scroller l'élément ciblé sur la page de destination.
 * L'animation dure ~2,5 s → on l'attend dans cette fenêtre.
 */
test.describe('Deep-link ?focus (scroll + flash)', () => {
  test('Lore : flashe la fiche personnage ciblée', async ({ page }) => {
    await page.goto('/lore?focus=char_frodo');
    await expect(page.locator('.atlas-flash')).toBeVisible();
  });

  test('Timeline : flashe l\'événement ciblé', async ({ page }) => {
    await page.goto('/timeline?focus=evt_001');
    await expect(page.locator('.atlas-flash')).toBeVisible();
  });

  test('id inconnu : la page charge sans planter et sans flash', async ({ page }) => {
    await page.goto('/plants?focus=__inexistant__');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('.atlas-flash')).toHaveCount(0);
  });
});
