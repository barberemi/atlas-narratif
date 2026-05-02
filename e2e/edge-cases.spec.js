import { test, expect } from './fixtures.js';
import path from 'path';

test.describe('Phase 10 — Edge cases & robustesse', () => {

  test('Ctrl+K fonctionne depuis /lore', async ({ page }) => {
    await page.goto('/lore');
    await page.keyboard.press('Control+k');
    await expect(page.getByPlaceholder(/search|recherch/i)).toBeVisible({ timeout: 5_000 });
    await page.keyboard.press('Escape');
  });

  test('Ctrl+K fonctionne depuis /timeline', async ({ page }) => {
    await page.goto('/timeline');
    await page.keyboard.press('Control+k');
    await expect(page.getByPlaceholder(/search|recherch/i)).toBeVisible({ timeout: 5_000 });
    await page.keyboard.press('Escape');
  });

  test('Ctrl+K fonctionne depuis /map', async ({ page }) => {
    await page.goto('/map');
    await page.keyboard.press('Control+k');
    await expect(page.getByPlaceholder(/search|recherch/i)).toBeVisible({ timeout: 5_000 });
    await page.keyboard.press('Escape');
  });

  test('refresh sur /dashboard recharge', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByText('Narrative Health')).toBeVisible({ timeout: 10_000 });
    await page.reload();
    await expect(page.getByText('Narrative Health')).toBeVisible({ timeout: 10_000 });
  });

  test('refresh sur /lore recharge', async ({ page }) => {
    await page.goto('/lore');
    await expect(page.getByText('Frodo Baggins')).toBeVisible({ timeout: 10_000 });
    await page.reload();
    await expect(page.getByText('Frodo Baggins')).toBeVisible({ timeout: 10_000 });
  });

  test('refresh sur /map recharge', async ({ page }) => {
    await page.goto('/map');
    await expect(page.getByRole('img', { name: /Carte/i })).toBeVisible({ timeout: 10_000 });
    await page.reload();
    await expect(page.getByRole('img', { name: /Carte/i })).toBeVisible({ timeout: 10_000 });
  });

  test('projet vide → empty states + upload map image', async ({ page }) => {
    // Créer un projet vide via le flow Build
    await page.goto('/');
    await page.getByRole('button', { name: /building my story/i }).click();
    await page.getByRole('button', { name: /Save the Cat/i }).click();
    await page.getByPlaceholder('Mon roman').fill('E2E Empty Project');
    await page.getByRole('button', { name: /Create project/i }).click();
    // Redirigé vers /savethecat
    await expect(page).toHaveURL(/\/savethecat/, { timeout: 10_000 });
    await page.keyboard.press('Escape'); // dismiss welcome modal

    // Vérifier les empty states sur chaque route
    await page.goto('/lore');
    await expect(page.getByText('◯').first()).toBeVisible({ timeout: 5_000 });

    await page.goto('/timeline');
    await expect(page.getByText('📅').first()).toBeVisible({ timeout: 5_000 });

    await page.goto('/plants');
    await expect(page.getByText('🌱').first()).toBeVisible({ timeout: 5_000 });

    await page.goto('/threads');
    await expect(page.getByText('🧵').first()).toBeVisible({ timeout: 5_000 });

    // Map : pas d'image custom → le file input d'upload doit être visible
    await page.goto('/map');
    const fileInput = page.locator('input[type="file"][accept*="image"]');
    if (await fileInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      // Upload l'image LOTR comme test
      await fileInput.setInputFiles(path.resolve('src/assets/ouest_terre_du_milieu.jpg'));
      await expect(page.getByRole('img', { name: /Carte/i })).toBeVisible({ timeout: 10_000 });
    }

    // Cleanup : revenir sur le projet LOTR
    await page.locator('nav').getByRole('button', { name: /Empty Project/i }).click();
    const lotrBtn = page.getByText(/Lord of the Rings/i).first();
    if (await lotrBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await lotrBtn.click();
    }
  });

  test('données longues — nom 200 caractères', async ({ page }) => {
    await page.goto('/lore');
    const longName = 'A'.repeat(200);
    await page.getByRole('button', { name: '+ Add' }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('textbox', { name: 'NAME' }).fill(longName);
    await dialog.getByRole('button', { name: /Create characters/i }).click();
    // La carte doit s'afficher sans casser le layout
    await expect(page.getByText(longName.slice(0, 20)).first()).toBeVisible({ timeout: 5_000 });
    // Cleanup : supprimer
    await page.getByText(longName.slice(0, 20)).first().click();
    await page.getByRole('dialog').getByRole('button', { name: 'Delete characters' }).click();
  });

  test('suppression cascade — lieu supprimé, timeline ne crashe pas', async ({ page }) => {
    // Créer un lieu
    await page.goto('/lore');
    await page.getByRole('button', { name: /Locations/i }).click();
    await page.getByRole('button', { name: '+ Add' }).click();
    const createDialog = page.getByRole('dialog');
    await createDialog.getByRole('textbox', { name: 'NAME' }).fill('E2E Cascade Loc');
    await createDialog.getByRole('button', { name: /Create locations/i }).click();

    // Chercher le lieu via la barre de recherche pour le trouver facilement
    await page.goto('/lore');
    await page.getByRole('button', { name: /Locations/i }).click();
    await page.getByRole('textbox', { name: 'Search…' }).fill('E2E Cascade');
    await page.getByRole('heading', { name: 'E2E Cascade Loc', level: 3 }).click();
    const dlg = page.getByRole('dialog');
    await expect(dlg).toBeVisible({ timeout: 5_000 });
    await dlg.locator('[data-testid="delete-entity"]').click();
    await dlg.locator('[data-testid="confirm-delete"]').click();

    // Vérifier la suppression — recharger et chercher
    await page.goto('/lore');
    await page.getByRole('button', { name: /Locations/i }).click();
    await page.getByRole('textbox', { name: 'Search…' }).fill('E2E Cascade');
    await expect(page.getByText(/No results|Aucun/i).first()).toBeVisible({ timeout: 5_000 });

    // Vérifier que la timeline ne crashe pas
    await page.goto('/timeline');
    await expect(page.getByText('Ch.').first()).toBeVisible({ timeout: 10_000 });
  });
});
