import { test, expect } from './fixtures.js';

test.describe('Phase 8a — Dashboard', () => {

  test('stats overview affiche les compteurs', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByText('Overview', { exact: true })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('Characters', { exact: true })).toBeVisible();
    await expect(page.getByText('Locations', { exact: true })).toBeVisible();
    await expect(page.getByText('Objects', { exact: true })).toBeVisible();
    await expect(page.getByText('Events', { exact: true })).toBeVisible();
    await expect(page.getByText('Beats STC', { exact: true })).toBeVisible();
  });

  test('navigation vers Save the Cat via bouton', async ({ page }) => {
    await page.goto('/dashboard');
    const openBtn = page.getByRole('button', { name: /Open|Ouvrir/i }).first();
    await openBtn.click();
    await expect(page).toHaveURL(/\/(savethecat|arc|heros)/, { timeout: 5_000 });
  });

  test('section TO DO NOW affiche des recommandations', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByText(/TO DO NOW/i)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole('button', { name: /Fix|Timeline|Fill/i }).first()).toBeVisible();
  });

  test('section Series View affiche les 3 tomes', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByText('SERIES VIEW')).toBeVisible({ timeout: 10_000 });
    // Les noms sont tronqués dans le tableau → matcher partiellement
    await expect(page.getByText(/Fellowship/i).first()).toBeVisible();
    await expect(page.getByText(/Two Towers/i).first()).toBeVisible();
    await expect(page.getByText(/Return/i).first()).toBeVisible();
  });
});
