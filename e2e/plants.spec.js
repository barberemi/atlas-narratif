import { test, expect } from './fixtures.js';

test.describe('Phase 5a — CRUD Plants', () => {

  test('créer un plant', async ({ page }) => {
    await page.goto('/plants');
    await page.getByRole('button', { name: '+ Setup' }).click();
    await page.getByPlaceholder(/crystal dagger|Valerian/i).fill('E2E Test Plant');
    await page.getByRole('button', { name: 'Save changes' }).click();
    await page.goto('/plants');
    await expect(page.getByText('E2E Test Plant')).toBeVisible({ timeout: 5_000 });
  });

  test('supprimer un plant', async ({ page }) => {
    // Créer d'abord
    await page.goto('/plants');
    await page.getByRole('button', { name: '+ Setup' }).click();
    await page.getByPlaceholder(/crystal dagger|Valerian/i).fill('To Delete Plant');
    await page.getByRole('button', { name: 'Save changes' }).click();
    await page.goto('/plants');
    await expect(page.getByText('To Delete Plant')).toBeVisible({ timeout: 5_000 });
    // Le bouton supprimer du dernier plant créé (le plus récent = dernier)
    await page.getByRole('button', { name: /Delete|Supprimer|删除/i }).last().click();
    await page.goto('/plants');
    await expect(page.getByText('To Delete Plant')).not.toBeVisible({ timeout: 5_000 });
  });
});
