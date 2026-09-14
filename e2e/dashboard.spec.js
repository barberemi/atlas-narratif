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

  test('section craft "ce que je remarque" agrège les constats', async ({ page }) => {
    await page.goto('/dashboard');
    // craft.title EN = "What I notice"
    const heading = page.getByText('What I notice', { exact: true });
    await expect(heading).toBeVisible({ timeout: 10_000 });
    // Un constat cliquable navigue vers sa vue (arc ou savethecat)
    const finding = page.getByRole('button').filter({ hasText: /Soft belly|Peaks in a row|Missing beats|Cramped act III/i }).first();
    if (await finding.count()) {
      await finding.click();
      await expect(page).toHaveURL(/\/(arc|savethecat)/, { timeout: 5_000 });
    }
  });

  test('section TO DO NOW affiche des recommandations', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByText(/TO DO NOW/i)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole('button', { name: /Fix|Timeline|Fill/i }).first()).toBeVisible();
  });

  test('le score de santé ouvre le panneau diagnostic et ses leviers', async ({ page }) => {
    await page.goto('/dashboard');
    const scoreBtn = page.getByRole('button', { name: /breakdown and levers|détail et les leviers/i });
    await expect(scoreBtn).toBeVisible({ timeout: 10_000 });
    await scoreBtn.click();
    const panel = page.getByRole('dialog', { name: /A diagnosis, not a grade|Un diagnostic/i });
    await expect(panel).toBeVisible();
    // Composition : les axes pondérés sont listés
    await expect(panel.getByText(/What makes up the score|Ce qui compose/i)).toBeVisible();
    // Un levier navigue vers la vue concernée
    const lever = panel.getByRole('button').filter({ hasText: /\+\d/ }).first();
    if (await lever.count()) {
      await lever.click();
      await expect(page).toHaveURL(/\/(savethecat|arc|heros|timeline|incoherences)/, { timeout: 5_000 });
    }
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
