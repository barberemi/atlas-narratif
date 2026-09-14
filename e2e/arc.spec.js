import { test, expect } from './fixtures.js';

test.describe('Phase 7 — Arc émotionnel & Character Arc', () => {

  test('arc global — SVG avec points affichés', async ({ page }) => {
    await page.goto('/arc');
    await expect(page.locator('svg').first()).toBeVisible({ timeout: 10_000 });
    // Avec les données LOTR, des points d'arc doivent exister
    await expect(page.locator('svg circle, svg rect').first()).toBeVisible({ timeout: 5_000 });
  });

  test('clic point chapitre → slider intensité → valeur change', async ({ page }) => {
    await page.goto('/arc');
    // Cliquer sur le point du chapitre 1 (intensité 3)
    const ch1Btn = page.getByRole('button', { name: '3 Ch.1' });
    await expect(ch1Btn).toBeVisible({ timeout: 10_000 });
    await ch1Btn.click();
    // Le slider d'intensité doit apparaître
    const slider = page.getByRole('slider');
    await expect(slider).toBeVisible({ timeout: 5_000 });
    // Changer l'intensité via le slider (3 → 7)
    await slider.fill('7');
    await page.waitForTimeout(500);
    // Le bouton doit refléter la nouvelle valeur
    await expect(page.getByRole('button', { name: '7 Ch.1', exact: true })).toBeVisible({ timeout: 3_000 });
    // Remettre la valeur originale
    await slider.fill('3');
    await page.waitForTimeout(500);
  });

  test('diagnostics de craft — bandeau "ce que je remarque"', async ({ page }) => {
    await page.goto('/arc');
    const panel = page.locator('[data-tour="arc-diagnostics"]');
    await expect(panel).toBeVisible({ timeout: 10_000 });
    // craft.title EN = "What I notice"
    await expect(panel.getByText(/What I notice/i)).toBeVisible();
    // Au moins un constat cliquable → met un chapitre en surbrillance (slider apparaît)
    const finding = panel.getByRole('button').first();
    await expect(finding).toBeVisible();
    await finding.click();
    await expect(page.getByRole('slider')).toBeVisible({ timeout: 5_000 });
  });

  test('tab personnages accessible', async ({ page }) => {
    await page.goto('/arc');
    await page.getByRole('button', { name: 'Character arcs' }).click();
    // Devrait changer la vue
    await page.waitForTimeout(1000);
    // Revenir sur global
    await page.getByRole('button', { name: 'Global arc' }).click();
  });
});
