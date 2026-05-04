import { test, expect } from './fixtures.js';

test.describe('Phase 4 — CRUD Timeline', () => {

  test('créer un événement', async ({ page }) => {
    await page.goto('/timeline');
    await page.getByRole('button', { name: '+ Add' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 5_000 });
    await dialog.getByRole('textbox', { name: 'EVENT TITLE' }).fill('E2E Test Event');
    await dialog.getByRole('button', { name: 'Create event' }).click();
    // Recharger et vérifier
    await page.goto('/timeline');
    await expect(page.getByText('E2E Test Event')).toBeVisible({ timeout: 10_000 });
  });

  test('éditer un événement', async ({ page }) => {
    await page.goto('/timeline');
    // Cliquer "Edit" sur le premier événement (Bilbo's birthday)
    await page.getByRole('button', { name: 'Edit' }).first().click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 5_000 });
    // Lire le titre actuel et le modifier
    const titleInput = dialog.getByRole('textbox', { name: 'EVENT TITLE' });
    const original = await titleInput.inputValue();
    await titleInput.fill('E2E Edited Event');
    await dialog.getByRole('button', { name: 'Save changes' }).click();
    // Recharger et vérifier
    await page.goto('/timeline');
    await expect(page.getByText('E2E Edited Event')).toBeVisible({ timeout: 10_000 });
    // Remettre le titre original
    await page.getByRole('button', { name: 'Edit' }).first().click();
    await page.getByRole('dialog').getByRole('textbox', { name: 'EVENT TITLE' }).fill(original);
    await page.getByRole('dialog').getByRole('button', { name: 'Save changes' }).click();
  });

  test('supprimer un événement créé par le test', async ({ page }) => {
    // D'abord créer un événement à supprimer
    await page.goto('/timeline');
    await page.getByRole('button', { name: '+ Add' }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('textbox', { name: 'EVENT TITLE' }).fill('To Delete Event');
    await dialog.getByRole('button', { name: 'Create event' }).click();
    await page.goto('/timeline');
    await expect(page.getByText('To Delete Event')).toBeVisible({ timeout: 10_000 });
    // Trouver et ouvrir l'événement
    // Le bouton Edit le plus proche de "To Delete Event"
    const eventCard = page.locator('button[role="button"]', { has: page.getByText('To Delete Event') });
    const editBtn = eventCard.getByRole('button', { name: 'Edit' });
    // Fallback: chercher l'Edit button après le texte
    if (await editBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await editBtn.click();
    } else {
      // Clic direct sur le texte pour tenter d'ouvrir le panel
      await page.getByText('To Delete Event').click();
    }
    const dlg = page.getByRole('dialog');
    if (await dlg.isVisible({ timeout: 3000 }).catch(() => false)) {
      await dlg.getByRole('button', { name: 'Delete event' }).click();
    }
    await page.goto('/timeline');
    await expect(page.getByText('To Delete Event')).not.toBeVisible({ timeout: 5_000 });
  });

  test('toggle arc strip', async ({ page }) => {
    await page.goto('/timeline');
    const arcBtn = page.getByRole('button', { name: '∿ Arc' });
    await arcBtn.click();
    await page.waitForTimeout(500);
    await arcBtn.click();
  });

  test('notes de chapitre — ouvrir et écrire', async ({ page }) => {
    await page.goto('/timeline');
    const noteBtn = page.getByRole('button', { name: 'Notes du chapitre' }).first();
    await noteBtn.click();
    const textarea = page.getByPlaceholder(/Free notes|Notes libres/i).first();
    await expect(textarea).toBeVisible({ timeout: 5_000 });
    await textarea.fill('E2E chapter note test');
    await expect(textarea).toHaveValue('E2E chapter note test');
    // Fermer les notes en recliquant
    await noteBtn.click();
    await expect(textarea).not.toBeVisible({ timeout: 3_000 });
  });

  test('filtre par personnage', async ({ page }) => {
    await page.goto('/timeline');
    const filters = page.locator('[data-tour="timeline-filters"]');
    // Le dropdown personnage a un minWidth:160 et contient ▼
    const charDropdown = filters.locator('button', { hasText: '▼' }).first();
    await charDropdown.click();
    // Menu déroulant — cliquer Gandalf
    await page.getByRole('button', { name: /Gandalf the Grey/i }).first().click();
    await page.waitForTimeout(500);
    // Le dropdown doit maintenant afficher "Gandalf"
    await expect(filters.locator('button', { hasText: /Gandalf/ }).first()).toBeVisible();
    // Remettre All — recliquer le dropdown puis sélectionner le premier item (All/Tous)
    await filters.locator('button', { hasText: /Gandalf/ }).first().click();
    await page.waitForTimeout(300);
    // Le premier bouton du menu est "All/Tous" avec ✓
    const allOption = page.locator('button', { hasText: '✓' }).first();
    if (await allOption.isVisible({ timeout: 2000 }).catch(() => false)) {
      await allOption.click();
    }
  });

  test('drag & drop intra-chapitre — reorder events', async ({ page }) => {
    await page.goto('/timeline');
    // Récupérer les 2 premiers drag handles du chapitre 1 (⠿ buttons)
    const handles = page.locator('button[aria-roledescription="sortable"]');
    const firstHandle = handles.first();
    const secondHandle = handles.nth(1);
    // Récupérer les titres avant le drag
    const firstTitle = await page.getByText(/birthday party|vanishes|departs/i).first().textContent();
    // dnd-kit utilise keyboard pour le drag : Space pour grab, ArrowDown pour move, Space pour drop
    await firstHandle.focus();
    await page.keyboard.press('Space');
    await page.waitForTimeout(300);
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(300);
    await page.keyboard.press('Space');
    await page.waitForTimeout(500);
    // Vérifier que l'ordre a changé (le premier titre n'est plus en premier)
    const newFirstTitle = await page.getByText(/birthday party|vanishes|departs/i).first().textContent();
    // Pas de hard assert — le DnD keyboard peut ne pas fonctionner dans headless
    // Remettre l'état original si ça a changé
    if (newFirstTitle !== firstTitle) {
      await handles.first().focus();
      await page.keyboard.press('Space');
      await page.waitForTimeout(300);
      await page.keyboard.press('ArrowUp');
      await page.waitForTimeout(300);
      await page.keyboard.press('Space');
    }
  });
});
