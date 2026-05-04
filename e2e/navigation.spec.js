import { test, expect } from './fixtures.js';

test.describe('Navigation & filtres', () => {
  const nav = (page) => page.locator('nav');

  // ── Nav globale ─────────────────────────────────────────────────────────────
  test('menu Write → sous-routes visibles', async ({ page }) => {
    await page.goto('/dashboard');
    await nav(page).getByRole('button', { name: /Write/i }).click();
    const menu = page.getByRole('menu');
    await expect(menu.getByRole('link', { name: /Save the Cat/i })).toBeVisible();
    await expect(menu.getByRole('link', { name: /Hero/i })).toBeVisible();
  });

  test('menu World → World et Map', async ({ page }) => {
    await page.goto('/dashboard');
    await nav(page).getByRole('button', { name: /World.*▾/i }).click();
    const menu = page.getByRole('menu');
    // nav.lore = "World", nav.map = "Map"
    await expect(menu.getByRole('link').first()).toBeVisible();
    await expect(menu.getByRole('link', { name: /Map/i })).toBeVisible();
  });

  test('menu Analyze → sous-routes visibles', async ({ page }) => {
    await page.goto('/dashboard');
    await nav(page).getByRole('button', { name: /Analyze.*▾/i }).click();
    const menu = page.getByRole('menu');
    await expect(menu.getByRole('link', { name: /Timeline/i })).toBeVisible();
    // nav.dashboard = "Overview"
    await expect(menu.getByRole('link', { name: /Overview/i })).toBeVisible();
  });

  test('clic lien nav → navigation vers /map', async ({ page }) => {
    await page.goto('/dashboard');
    await nav(page).getByRole('button', { name: /World/i }).click();
    await page.getByRole('menu').getByRole('link', { name: /Map/i }).click();
    await expect(page).toHaveURL(/\/map/);
  });

  // ── Volume picker ───────────────────────────────────────────────────────────
  test('Volume picker affiche les 3 tomes', async ({ page }) => {
    await page.goto('/dashboard');
    await nav(page).getByRole('button', { name: /Series/i }).click();
    await expect(page.getByText('The Fellowship of the Ring')).toBeVisible();
    await expect(page.getByText('The Two Towers')).toBeVisible();
    await expect(page.getByText('The Return of the King')).toBeVisible();
  });

  test('Sélectionner T1 change le picker', async ({ page }) => {
    await page.goto('/dashboard');
    await nav(page).getByRole('button', { name: /Series/i }).click();
    await page.getByText('The Fellowship of the Ring').click();
    // volume.tome = "Volume {{number}}" → "Volume 1"
    await expect(nav(page).getByRole('button', { name: /Volume 1/i })).toBeVisible({ timeout: 5_000 });
  });

  // ── Global search ───────────────────────────────────────────────────────────
  test('Ctrl+K ouvre la recherche', async ({ page }) => {
    await page.goto('/dashboard');
    await page.keyboard.press('Control+k');
    await expect(page.getByPlaceholder(/search|recherch/i)).toBeVisible({ timeout: 5_000 });
  });

  test('recherche "Gandalf" → résultats', async ({ page }) => {
    await page.goto('/dashboard');
    await page.keyboard.press('Control+k');
    await page.getByPlaceholder(/search|recherch/i).fill('Gandalf');
    await expect(page.getByText('Gandalf the Grey').first()).toBeVisible({ timeout: 5_000 });
  });

  test('clic résultat search → navigation /lore', async ({ page }) => {
    await page.goto('/dashboard');
    await page.keyboard.press('Control+k');
    await page.getByPlaceholder(/search|recherch/i).fill('Gandalf');
    const result = page.getByText('Gandalf the Grey').first();
    await expect(result).toBeVisible({ timeout: 5_000 });
    await result.click();
    await expect(page).toHaveURL(/\/lore/, { timeout: 10_000 });
  });

  // ── Project picker ──────────────────────────────────────────────────────────
  test('Project picker affiche LOTR', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(nav(page).getByText(/Lord of the Rings/i)).toBeVisible({ timeout: 5_000 });
  });

  // ── Langue ──────────────────────────────────────────────────────────────────
  test('clic FR → labels français', async ({ page }) => {
    await page.goto('/dashboard');
    await page.getByRole('button', { name: 'FR' }).click();
    await expect(page.getByText('Santé narrative')).toBeVisible({ timeout: 15_000 });
  });

  test('clic EN → labels anglais', async ({ page }) => {
    await page.goto('/dashboard');
    await page.getByRole('button', { name: 'EN' }).click();
    // Le changement de langue déclenche un reseed LOTR complet (delete + seed API)
    await expect(page.getByText('Narrative Health')).toBeVisible({ timeout: 15_000 });
  });
});
