import { test, expect } from './fixtures.js';

test.describe('Types & entités custom (couche 3)', () => {

  test('affiche le type et les entités seedés', async ({ page }) => {
    await page.goto('/custom');
    // Type seedé « Langue » (onglet) + entités Quenya / Sindarin.
    await expect(page.getByRole('button', { name: /Langue/ })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole('heading', { name: 'Quenya', level: 3 })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole('heading', { name: 'Sindarin', level: 3 })).toBeVisible();
  });

  test('crée un type puis une entité, et les persiste', async ({ page }) => {
    await page.goto('/custom');

    // 1. Créer un type custom
    await page.getByRole('button', { name: '+ Type' }).click();
    let dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 5_000 });
    await dialog.getByTestId('ctype-label').fill('Véhicule E2E');
    await dialog.getByTestId('ctype-add-field').click();
    await dialog.getByTestId('ctype-field-key-0').fill('vitesse');
    await dialog.getByTestId('ctype-save').click();
    await expect(page.getByRole('button', { name: /Véhicule E2E/ })).toBeVisible({ timeout: 5_000 });

    // 2. Sélectionner le nouveau type puis créer une entité
    await page.getByRole('button', { name: /Véhicule E2E/ }).click();
    await page.getByRole('button', { name: '+ Entity' }).click();
    dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 5_000 });
    await dialog.getByTestId('cent-name').fill('Char de guerre E2E');
    // Champ du schéma du type
    await dialog.getByTestId('cent-field-vitesse').fill('lente');
    await dialog.getByTestId('cent-save').click();
    await expect(page.getByRole('heading', { name: 'Char de guerre E2E', level: 3 })).toBeVisible({ timeout: 5_000 });

    // 3. Recharger : l'entité persiste (champ custom visible sur la carte)
    await page.goto('/custom');
    await page.getByRole('button', { name: /Véhicule E2E/ }).click();
    await expect(page.getByRole('heading', { name: 'Char de guerre E2E', level: 3 })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('lente').first()).toBeVisible();

    // 4. Nettoyage : supprimer le type (cascade sur ses entités)
    await page.getByTestId('edit-active-type').click();
    dialog = page.getByRole('dialog');
    await dialog.getByTestId('ctype-delete').click();
    await dialog.getByTestId('ctype-confirm-delete').click();
    await page.goto('/custom');
    await expect(page.getByRole('button', { name: /Véhicule E2E/ })).not.toBeVisible({ timeout: 5_000 });
  });

  test('visite guidée : le bouton « ? » lance le tour de la page', async ({ page }) => {
    await page.goto('/custom');
    await expect(page.getByRole('button', { name: /Langue/ })).toBeVisible({ timeout: 10_000 });
    await page.getByRole('button', { name: 'Aide' }).click();
    await expect(page.getByTestId('guided-tour')).toBeVisible({ timeout: 5_000 });
  });
});
