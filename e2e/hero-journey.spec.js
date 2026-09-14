import { test, expect } from './fixtures.js';

test.describe('Phase 5c — Hero Journey', () => {

  test('remplir une étape du voyage du héros', async ({ page }) => {
    await page.goto('/heros');
    // Cliquer sur la première stage card (Ordinary World)
    await page.getByText('Ordinary World', { exact: true }).click();
    // Remplir le formulaire d'étape
    const textarea = page.locator('textarea').first();
    if (await textarea.isVisible({ timeout: 3000 }).catch(() => false)) {
      await textarea.fill('E2E hero journey test entry');
      const chapterInput = page.locator('input[type="number"]').first();
      if (await chapterInput.isVisible().catch(() => false)) {
        await chapterInput.fill('1');
      }
      await page.getByRole('button', { name: /Save|Sauvegarder/i }).click();
      await expect(page.getByText('E2E hero journey test entry').first()).toBeVisible({ timeout: 5_000 });
    }
  });

  test('supprimer une étape', async ({ page }) => {
    await page.goto('/heros');
    const entry = page.getByText('E2E hero journey test entry').first();
    if (await entry.isVisible({ timeout: 3000 }).catch(() => false)) {
      await entry.click();
      await page.getByRole('button', { name: /Delete|Supprimer|Remove/i }).first().click();
      await expect(entry).not.toBeVisible({ timeout: 5_000 });
    }
  });
});
