import { test, expect } from './fixtures.js';

test.describe('Phase 3 — CRUD Lore', () => {

  test('créer un personnage', async ({ page }) => {
    await page.goto('/lore');
    await page.getByRole('button', { name: '+ Add' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 5_000 });
    await dialog.getByRole('textbox', { name: 'NAME' }).fill('Test Hero');
    await dialog.getByRole('button', { name: /Create characters/i }).click();
    await expect(page.getByRole('heading', { name: 'Test Hero', level: 3 })).toBeVisible({ timeout: 5_000 });
  });

  test('éditer un personnage', async ({ page }) => {
    await page.goto('/lore');
    await page.getByRole('heading', { name: 'Frodo Baggins', level: 3 }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 5_000 });
    await dialog.getByRole('textbox', { name: 'DESCRIPTION' }).fill('Updated E2E description');
    await dialog.getByRole('button', { name: 'Save changes' }).click();
    // Recharger et vérifier la persistence
    await page.goto('/lore');
    await page.getByRole('heading', { name: 'Frodo Baggins', level: 3 }).click();
    await expect(page.getByRole('dialog').getByRole('textbox', { name: 'DESCRIPTION' })).toHaveValue(/Updated E2E description/, { timeout: 5_000 });
  });

  test('supprimer un personnage', async ({ page }) => {
    // D'abord créer un perso à supprimer
    await page.goto('/lore');
    await page.getByRole('button', { name: '+ Add' }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('textbox', { name: 'NAME' }).fill('To Delete');
    await dialog.getByRole('button', { name: /Create characters/i }).click();
    await expect(page.getByRole('heading', { name: 'To Delete', level: 3 })).toBeVisible({ timeout: 5_000 });
    // Maintenant le supprimer
    await page.getByRole('heading', { name: 'To Delete', level: 3 }).click();
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5_000 });
    await page.getByRole('dialog').getByRole('button', { name: 'Delete characters' }).click();
    // Recharger et vérifier la disparition
    await page.goto('/lore');
    await expect(page.getByRole('heading', { name: 'To Delete', level: 3 })).not.toBeVisible({ timeout: 5_000 });
  });

  test('créer un lieu', async ({ page }) => {
    await page.goto('/lore');
    await page.getByRole('button', { name: /Locations/i }).click();
    await page.getByRole('button', { name: '+ Add' }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('textbox', { name: 'NAME' }).fill('Test Castle');
    await dialog.getByRole('button', { name: /Create locations/i }).click();
    await expect(page.getByRole('heading', { name: 'Test Castle', level: 3 })).toBeVisible({ timeout: 5_000 });
  });

  test('créer un objet', async ({ page }) => {
    await page.goto('/lore');
    await page.getByRole('button', { name: /Objects/i }).click();
    await page.getByRole('button', { name: '+ Add' }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('textbox', { name: 'NAME' }).fill('Test Sword');
    await dialog.getByRole('button', { name: /Create objects/i }).click();
    await expect(page.getByRole('heading', { name: 'Test Sword', level: 3 })).toBeVisible({ timeout: 5_000 });
  });

  test('créer un groupe', async ({ page }) => {
    await page.goto('/lore');
    await page.getByRole('button', { name: /Groups/i }).click();
    await page.getByRole('button', { name: '+ Add' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 5_000 });
    await dialog.getByRole('textbox', { name: 'NAME' }).fill('E2E Test Guild');
    await dialog.getByRole('button', { name: 'Create group' }).click();
    await page.goto('/lore');
    await page.getByRole('button', { name: /Groups/i }).click();
    await expect(page.getByText('E2E Test Guild')).toBeVisible({ timeout: 5_000 });
  });

  test('tags aliases — ajouter et supprimer', async ({ page }) => {
    await page.goto('/lore');
    await page.getByRole('heading', { name: 'Aragorn', level: 3 }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 5_000 });
    const aliasInput = dialog.locator('[data-testid="tag-aliases"]');
    await aliasInput.fill('E2E-Alias');
    await aliasInput.press('Enter');
    // Le chip doit apparaître dans le dialog
    await expect(dialog.getByText('E2E-Alias')).toBeVisible({ timeout: 3_000 });
    // Sauvegarder, recharger, vérifier la persistence
    await dialog.getByRole('button', { name: 'Save changes' }).click();
    await page.goto('/lore');
    await page.getByRole('heading', { name: 'Aragorn', level: 3 }).click();
    await expect(page.getByRole('dialog').getByText('E2E-Alias')).toBeVisible({ timeout: 5_000 });
    // Supprimer le chip : <span>E2E-Alias<button>✕</button></span>
    const dlg = page.getByRole('dialog');
    await dlg.locator('span', { hasText: 'E2E-Alias' }).getByRole('button').click();
    await expect(dlg.getByText('E2E-Alias')).not.toBeVisible({ timeout: 3_000 });
    // Sauvegarder le cleanup
    await page.getByRole('dialog').getByRole('button', { name: 'Save changes' }).click();
  });

  test('recherche filtre les entités', async ({ page }) => {
    await page.goto('/lore');
    await page.getByRole('textbox', { name: 'Search…' }).fill('Gandalf');
    await expect(page.getByRole('heading', { name: 'Gandalf the Grey', level: 3 })).toBeVisible({ timeout: 5_000 });
    await expect(page.getByRole('heading', { name: 'Frodo Baggins', level: 3 })).not.toBeVisible({ timeout: 2_000 });
    await page.getByRole('textbox', { name: 'Search…' }).fill('');
    await expect(page.getByRole('heading', { name: 'Frodo Baggins', level: 3 })).toBeVisible({ timeout: 5_000 });
  });
});
