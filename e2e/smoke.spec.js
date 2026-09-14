import { test, expect } from './fixtures.js';

test.describe('Smoke — toutes les routes chargent', () => {

  test('/dashboard → Narrative Health visible', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByText('Narrative Health')).toBeVisible({ timeout: 10_000 });
  });

  test('/lore → Frodo Baggins visible', async ({ page }) => {
    await page.goto('/lore');
    await expect(page.getByText('Frodo Baggins')).toBeVisible({ timeout: 10_000 });
  });

  test('/timeline → chapitres affichés', async ({ page }) => {
    await page.goto('/timeline');
    await expect(page.getByText('Ch.').first()).toBeVisible({ timeout: 10_000 });
  });

  test('/map → image carte visible', async ({ page }) => {
    await page.goto('/map');
    await expect(page.getByRole('img', { name: /Carte/i })).toBeVisible({ timeout: 10_000 });
  });

  test('/savethecat → beats affichés', async ({ page }) => {
    await page.goto('/savethecat');
    await expect(page.getByText('Opening Image').first()).toBeVisible({ timeout: 10_000 });
  });

  test('/demo → dépose le visiteur dans la démo (dashboard)', async ({ page }) => {
    await page.goto('/demo');
    await expect(page.getByText('Narrative Health')).toBeVisible({ timeout: 15_000 });
  });

  test('/arc → SVG chart visible', async ({ page }) => {
    await page.goto('/arc');
    await expect(page.locator('svg').first()).toBeVisible({ timeout: 10_000 });
  });

  test('/plants → contenu visible', async ({ page }) => {
    await page.goto('/plants');
    await expect(page.getByText(/pending|total|Setups/i).first()).toBeVisible({ timeout: 10_000 });
  });

  test('/threads → contenu visible', async ({ page }) => {
    await page.goto('/threads');
    await expect(page.getByRole('heading').first()).toBeVisible({ timeout: 10_000 });
  });

  test('/heros → stages visibles', async ({ page }) => {
    await page.goto('/heros');
    await expect(page.getByText('Ordinary World', { exact: true })).toBeVisible({ timeout: 10_000 });
  });

  test('/incoherences → severity visible', async ({ page }) => {
    await page.goto('/incoherences');
    await expect(page.getByText(/critical/i).first()).toBeVisible({ timeout: 10_000 });
  });

  test('/relations → graph visible', async ({ page }) => {
    await page.goto('/relations');
    // Le graph peut être un SVG ou afficher un message si pas d'entité sélectionnée
    const content = page.locator('svg, [class*="graph"], [class*="Graph"]').first();
    await expect(content).toBeVisible({ timeout: 10_000 });
  });

  test('/review → page visible', async ({ page }) => {
    await page.goto('/review');
    await expect(page.getByText(/import/i).first()).toBeVisible({ timeout: 10_000 });
  });
});
