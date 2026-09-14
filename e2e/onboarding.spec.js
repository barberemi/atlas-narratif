import { test, expect } from './fixtures.js';

/**
 * Point 8 — cold-start guidé d'un projet vide.
 * Vérifie : atterrissage sur /dashboard, checklist « premières minutes »,
 * saisie de la logline (endpoint updateProject), et absence de la checklist
 * sur la démo LOTR (déjà pleine).
 */
test.describe('Onboarding — checklist premières minutes', () => {

  test('projet vide → checklist + logline se coche', async ({ page }) => {
    // Créer un projet vide via le flow « Je construis »
    await page.goto('/');
    await page.getByRole('button', { name: /building my story/i }).click();
    await page.getByRole('button', { name: /Save the Cat/i }).click();
    await page.getByPlaceholder(/My novel|Mon roman/i).fill('E2E Onboarding');
    await page.getByRole('button', { name: /Create project/i }).click();

    // Atterrissage sur le dashboard (et non /savethecat)
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10_000 });
    await page.keyboard.press('Escape');

    // La checklist « premières minutes » est visible
    const checklist = page.locator('[data-testid="first-run-checklist"]');
    await expect(checklist).toBeVisible({ timeout: 10_000 });
    await expect(checklist.getByText(/Get your story started|Amorcez votre récit/i)).toBeVisible();

    // Aucune logline → 0/3
    const progress = checklist.locator('[data-testid="first-run-progress"]');
    await expect(progress).toHaveText('0/3');

    // Saisir la logline puis enregistrer (teste l'endpoint updateProject)
    await checklist.locator('[data-testid="first-run-logline-input"]')
      .fill('Un héros doit accomplir une quête impossible.');
    await checklist.getByRole('button', { name: /^Save$|Enregistrer/i }).click();

    // La première étape se coche → 1/3
    await expect(progress).toHaveText('1/3', { timeout: 10_000 });

    // Cleanup : basculer sur LOTR puis supprimer le projet de test
    await deleteProjectViaPicker(page, 'E2E Onboarding');
  });

  test('checklist absente sur la démo LOTR', async ({ page }) => {
    await page.goto('/dashboard');
    // Le projet actif par défaut (storageState) est la démo LOTR
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('[data-testid="first-run-checklist"]')).toHaveCount(0);
  });
});

/** Bascule vers LOTR puis supprime le projet nommé via le ProjectPicker. */
async function deleteProjectViaPicker(page, name) {
  const nav = page.locator('nav');
  // Ouvrir le picker et basculer sur LOTR (un projet non actif est supprimable)
  await nav.getByRole('button', { name: new RegExp(name, 'i') }).click().catch(() => {});
  await page.getByText(/Lord of the Rings/i).first().click().catch(() => {});
  // Rouvrir le picker, cibler la ligne du projet de test
  await nav.getByRole('button', { name: /Lord of the Rings/i }).click().catch(() => {});
  const row = page.locator('div.group', { hasText: name }).first();
  await row.hover().catch(() => {});
  await row.getByRole('button', { name: /Delete this project|Supprimer/i }).click().catch(() => {});
  await row.getByRole('button', { name: /^Yes$|Oui/i }).click().catch(() => {});
}
