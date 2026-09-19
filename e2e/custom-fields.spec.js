import { test, expect } from './fixtures.js';

test.describe('Champs custom (couche 2)', () => {

  test('affiche les champs custom seedés sur une fiche personnage', async ({ page }) => {
    await page.goto('/lore');
    // Frodo a un champ custom seedé : « Âge au départ » = « 50 ans ».
    await expect(page.getByText('50 ans').first()).toBeVisible({ timeout: 10_000 });
  });

  test('ajoute un champ custom à un personnage et le persiste', async ({ page }) => {
    await page.goto('/lore');

    // 1. Créer un personnage dédié au test
    await page.getByRole('button', { name: '+ Add' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 5_000 });
    await dialog.getByRole('textbox', { name: 'NAME' }).fill('Custom Hero E2E');

    // 2. Ajouter un champ custom via la section dédiée
    await dialog.getByTestId('custom-new-key').fill('Guilde');
    await dialog.getByTestId('custom-new-value').fill('Rôdeurs');
    await dialog.getByTestId('custom-add').click();

    // La valeur est éditable et pré-remplie
    await expect(dialog.getByTestId('custom-value-Guilde')).toHaveValue('Rôdeurs');

    // 3. Enregistrer
    await dialog.getByRole('button', { name: /Create characters/i }).click();
    await expect(page.getByRole('heading', { name: 'Custom Hero E2E', level: 3 })).toBeVisible({ timeout: 5_000 });

    // 4. Recharger : la puce custom apparaît sur la carte
    await page.goto('/lore');
    await expect(page.getByText('Rôdeurs').first()).toBeVisible({ timeout: 10_000 });

    // 5. Rouvrir l'éditeur : la valeur est bien persistée
    await page.getByRole('heading', { name: 'Custom Hero E2E', level: 3 }).click();
    const editDialog = page.getByRole('dialog');
    await expect(editDialog.getByTestId('custom-value-Guilde')).toHaveValue('Rôdeurs', { timeout: 5_000 });

    // 6. Nettoyage : suppression du personnage de test
    await editDialog.getByTestId('delete-entity').click();
    await editDialog.getByTestId('confirm-delete').click();
    await page.goto('/lore');
    await expect(page.getByRole('heading', { name: 'Custom Hero E2E', level: 3 })).not.toBeVisible({ timeout: 5_000 });
  });
});
