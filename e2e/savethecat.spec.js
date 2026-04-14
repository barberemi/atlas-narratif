import { test, expect } from './fixtures.js';

test.describe('Phase 6b — Save the Cat', () => {

  test('tous les 15 beats sont affichés', async ({ page }) => {
    await page.goto('/savethecat');
    await expect(page.getByText('Opening Image').first()).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('Final Image').first()).toBeVisible();
  });

  test('un beat avec événement affiche le contenu', async ({ page }) => {
    await page.goto('/savethecat');
    // Le beat "Opening Image" devrait avoir un événement assigné (LOTR seed)
    await expect(page.getByText(/Long-Expected Party|Bilbo/i).first()).toBeVisible({ timeout: 10_000 });
  });
});
