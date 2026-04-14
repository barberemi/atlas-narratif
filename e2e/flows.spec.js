import { test, expect } from './fixtures.js';

test.describe('Phase 9 — Flux complets cross-routes', () => {

  test('dashboard → STC → vérifier les beats', async ({ page }) => {
    await page.goto('/dashboard');
    const stcOpen = page.locator('button:has-text("Open")').first();
    await stcOpen.click();
    await expect(page).toHaveURL(/\/(savethecat|arc|heros)/, { timeout: 5_000 });
  });

  test('créer perso dans /lore → retrouver dans /lore après navigation', async ({ page }) => {
    // Créer un personnage
    await page.goto('/lore');
    await page.getByRole('button', { name: '+ Add' }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('textbox', { name: 'NAME' }).fill('E2E CrossRoute Hero');
    await dialog.getByRole('button', { name: /Create characters/i }).click();
    await expect(page.getByRole('heading', { name: 'E2E CrossRoute Hero', level: 3 })).toBeVisible({ timeout: 5_000 });

    // Naviguer vers timeline puis revenir sur lore — le perso doit persister
    await page.goto('/timeline');
    await expect(page.getByText('Ch.').first()).toBeVisible({ timeout: 10_000 });
    await page.goto('/lore');
    await expect(page.getByRole('heading', { name: 'E2E CrossRoute Hero', level: 3 })).toBeVisible({ timeout: 5_000 });

    // Cleanup
    await page.getByRole('heading', { name: 'E2E CrossRoute Hero', level: 3 }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Delete characters' }).click();
  });

  test('changer de volume filtre le dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    // Sélectionner T1
    await page.locator('nav').getByRole('button', { name: /Series/i }).click();
    await page.getByText('The Fellowship of the Ring').click();
    await expect(page.locator('nav').getByRole('button', { name: /Volume 1/i })).toBeVisible({ timeout: 5_000 });

    // Le dashboard doit maintenant montrer les stats T1 uniquement (9 chapitres)
    await expect(page.getByText('9', { exact: true }).first()).toBeVisible({ timeout: 5_000 });

    // Remettre "All volumes"
    await page.locator('nav').getByRole('button', { name: /Volume 1/i }).click();
    await page.getByText(/All volumes|Series/i).first().click();
  });

  test('refresh page (F5) recharge les données', async ({ page }) => {
    await page.goto('/timeline');
    await expect(page.getByText('Ch.').first()).toBeVisible({ timeout: 10_000 });
    await page.reload();
    await expect(page.getByText('Ch.').first()).toBeVisible({ timeout: 10_000 });
  });
});
