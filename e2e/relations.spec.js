import { test, expect } from './fixtures.js';

// Relations explicites (Niveau 3) — UI manuelle sur la fiche d'entité.
// Projet e2e = LOTR. On crée une relation Gimli → Legolas puis on la supprime.
test.describe('Relations manuelles (Niveau 3)', () => {
  test('ajoute une relation depuis la fiche puis la supprime', async ({ page }) => {
    await page.goto('/lore?tab=characters&search=Gimli');
    await page.getByRole('heading', { name: 'Gimli', level: 3 }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 5_000 });

    // Ajout : chercher la cible, la sélectionner, saisir un libellé, lier.
    await dialog.getByTestId('relation-target-search').fill('Legolas');
    await dialog.getByTestId('relation-target-option').first().click();
    await dialog.getByTestId('relation-label').fill('ally');
    await dialog.getByTestId('relation-add').click();

    // La relation apparaît dans la liste.
    const list = dialog.getByTestId('relations-list');
    await expect(list.getByText('Legolas')).toBeVisible({ timeout: 5_000 });

    // Persistance : rouvrir la fiche → la relation est toujours là.
    await page.goto('/lore?tab=characters&search=Gimli');
    await page.getByRole('heading', { name: 'Gimli', level: 3 }).click();
    await expect(page.getByRole('dialog').getByTestId('relations-list').getByText('Legolas')).toBeVisible({ timeout: 5_000 });

    // Suppression.
    await page.getByRole('dialog').getByTestId('relation-delete').first().click();
    await expect(page.getByRole('dialog').getByTestId('relations-list').getByText('Legolas')).toHaveCount(0, { timeout: 5_000 });
  });
});
