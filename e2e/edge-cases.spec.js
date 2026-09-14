import { test, expect } from './fixtures.js';
import path from 'path';

test.describe('Phase 10 — Edge cases & robustesse', () => {

  test('Ctrl+K fonctionne depuis /lore', async ({ page }) => {
    await page.goto('/lore');
    await page.waitForLoadState('networkidle');
    await page.keyboard.press('Control+k');
    await expect(page.getByRole('textbox', { name: 'Global search' })).toBeVisible({ timeout: 5_000 });
    await page.keyboard.press('Escape');
  });

  test('Ctrl+K fonctionne depuis /timeline', async ({ page }) => {
    await page.goto('/timeline');
    await page.waitForLoadState('networkidle');
    await page.keyboard.press('Control+k');
    await expect(page.getByRole('textbox', { name: 'Global search' })).toBeVisible({ timeout: 5_000 });
    await page.keyboard.press('Escape');
  });

  test('Ctrl+K fonctionne depuis /map', async ({ page }) => {
    await page.goto('/map');
    await page.waitForLoadState('networkidle');
    await page.keyboard.press('Control+k');
    await expect(page.getByRole('textbox', { name: 'Global search' })).toBeVisible({ timeout: 5_000 });
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
    await page.getByPlaceholder(/My novel|Mon roman/i).fill('E2E Empty Project');
    await page.getByRole('button', { name: /Create project/i }).click();
    // Redirigé vers /dashboard (cold-start guidé du point 8)
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10_000 });
    await page.keyboard.press('Escape'); // dismiss welcome modal

    // Dashboard : le modal de bienvenue ne doit PAS s'afficher sur un projet vide
    await page.goto('/dashboard');
    const welcomeModal = page.getByRole('dialog', { name: /Welcome|Bienvenue/i });
    await expect(welcomeModal).not.toBeVisible({ timeout: 3_000 });

    // Vérifier les empty states sur chaque route
    await page.goto('/lore');
    await expect(page.getByText('◯').first()).toBeVisible({ timeout: 5_000 });

    // Timeline vide : bouton "+ Créer un événement" visible
    await page.goto('/timeline');
    await expect(page.getByText(/No events|Aucun événement|无事件/i).first()).toBeVisible({ timeout: 5_000 });
    const addEventBtn = page.getByRole('button', { name: /Create an event|Créer un événement|创建事件/i });
    await expect(addEventBtn).toBeVisible();

    // Cliquer ouvre l'EventEditor
    await addEventBtn.click();
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5_000 });
    await page.keyboard.press('Escape');

    await page.goto('/plants');
    await expect(page.getByText(/No narrative setups|Aucune amorce narrative|无叙事伏笔/i).first()).toBeVisible({ timeout: 5_000 });

    await page.goto('/threads');
    await expect(page.getByText(/No narrative threads|Aucun fil narratif|无叙事线索/i).first()).toBeVisible({ timeout: 5_000 });

    // Map : pas d'image → état vide avec zone d'upload
    await page.goto('/map');
    await expect(page.getByText(/Add map background|Ajouter un fond de carte|添加地图背景/i)).toBeVisible({ timeout: 5_000 });

    // Upload une image → le MapCanvas s'affiche (pas juste un <img>)
    const fileInput = page.locator('input[type="file"][accept*="image"]');
    await fileInput.setInputFiles(path.resolve('src/assets/ouest_terre_du_milieu.jpg'));
    await expect(page.getByRole('img', { name: /Carte/i })).toBeVisible({ timeout: 10_000 });

    // La zone d'upload de l'état vide doit avoir disparu
    await expect(page.getByText(/Add map background|Ajouter un fond de carte|添加地图背景/i)).not.toBeVisible();

    // Le bouton "Remplacer le fond" doit être visible
    await expect(page.getByText(/Replace background|Remplacer le fond/i)).toBeVisible();

    // Le message d'aide pour voir les trajets doit être visible
    await expect(page.getByText(/To see journeys|Pour voir les trajets|显示旅程/i)).toBeVisible();

    // Cleanup : revenir sur le projet LOTR
    await page.locator('nav').getByRole('button', { name: /Empty Project/i }).click();
    const lotrBtn = page.getByText(/Lord of the Rings/i).first();
    if (await lotrBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await lotrBtn.click();
    }
  });

  test('tour guidé — modal affiché uniquement sur LOTR', async ({ page }) => {
    // Reset le flag "tour vu" pour le projet LOTR
    await page.goto('/dashboard');
    await page.evaluate(() => {
      const projectId = localStorage.getItem('atlas_active_project');
      if (projectId) localStorage.removeItem(`atlas_tour_seen_${projectId}`);
    });

    // Recharger → le modal de bienvenue doit s'afficher (projet LOTR)
    await page.reload();
    const welcomeModal = page.locator('[aria-modal="true"]');
    await expect(welcomeModal).toBeVisible({ timeout: 5_000 });
    await expect(welcomeModal.getByText(/Welcome|Bienvenue/i)).toBeVisible();

    // Le bouton "Démarrer la visite" doit être présent
    await expect(welcomeModal.getByText(/Start guided tour|Démarrer la visite/i)).toBeVisible();

    // Fermer le modal
    await page.keyboard.press('Escape');
    await expect(welcomeModal).not.toBeVisible({ timeout: 3_000 });
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
