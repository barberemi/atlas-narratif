import { test, expect } from './fixtures.js';

test.describe('Phase 6b — Save the Cat', () => {

  test('tous les 15 beats sont affichés', async ({ page }) => {
    await page.goto('/savethecat');
    await expect(page.getByText('Opening Image').first()).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('Final Image').first()).toBeVisible();
  });

  test('cliquer un beat ouvre son détail dans le tiroir', async ({ page }) => {
    await page.goto('/savethecat');
    // Cliquer le beat 1 sur la frise (chantier 4 : liste fondue en tiroir contextuel)
    await page.locator('[title^="1. "]').first().click();
    const drawer = page.getByTestId('beat-drawer');
    await expect(drawer).toBeVisible({ timeout: 10_000 });
    // Le tiroir montre les scènes qui portent ce beat (LOTR seed)
    await expect(drawer.getByText(/Long-Expected Party|Bilbo/i).first()).toBeVisible();
  });

  test('diagnostic de craft — verdict au lieu de la liste d\'alertes', async ({ page }) => {
    await page.goto('/savethecat');
    const panel = page.locator('[data-tour="stc-diagnostics"]');
    await expect(panel).toBeVisible({ timeout: 10_000 });
    // craft.title EN = "What I notice" ; verdict = "Backbone in place" / "Solid structure"
    await expect(panel.getByText(/What I notice/i)).toBeVisible();
    await expect(panel.getByText(/Backbone in place|Solid structure/i)).toBeVisible();
  });

  test('la frise affiche les zones de tolérance des beats', async ({ page }) => {
    await page.goto('/savethecat');
    // Légende de la bande de tolérance (chantier 3)
    await expect(page.getByText(/Tolerance zone|Zone de tolérance|容差区间/i).first()).toBeVisible({ timeout: 10_000 });
  });

  test('mode série : bascule de tome via le sélecteur', async ({ page }) => {
    await page.goto('/savethecat');
    const tabs = page.getByRole('tab');
    await expect(tabs).toHaveCount(3, { timeout: 10_000 });
    // T1 sélectionné par défaut (chantier 5 : une frise à la fois)
    await expect(tabs.nth(0)).toHaveAttribute('aria-selected', 'true');
    // Basculer sur T2
    await tabs.nth(1).click();
    await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
    await expect(tabs.nth(0)).toHaveAttribute('aria-selected', 'false');
  });
});
