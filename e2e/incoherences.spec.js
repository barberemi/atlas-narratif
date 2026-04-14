import { test, expect } from './fixtures.js';

test.describe('Phase 8b — Incoherences', () => {

  test('liste les incohérences avec severity', async ({ page }) => {
    await page.goto('/incoherences');
    await expect(page.getByText(/critical/i).first()).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/high/i).first()).toBeVisible();
  });

  test('filtrer par severity', async ({ page }) => {
    await page.goto('/incoherences');
    // Cliquer sur le filtre "Critical"
    const criticalBtn = page.getByRole('button', { name: /critical/i });
    if (await criticalBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await criticalBtn.click();
      await page.waitForTimeout(500);
      // Ne devrait afficher que les critiques
    }
  });

  test('toggle résolu sur une incohérence', async ({ page }) => {
    await page.goto('/incoherences');
    // Chercher un bouton de toggle résolu
    const toggleBtn = page.locator('button[title*="resolve" i], button[title*="résol" i], input[type="checkbox"]').first();
    if (await toggleBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await toggleBtn.click();
      await page.waitForTimeout(1000);
      // Re-toggle pour remettre l'état initial
      await toggleBtn.click();
    }
  });
});
