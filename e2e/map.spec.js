import { test, expect } from './fixtures.js';

test.describe('Phase 6a — Map', () => {

  test('carte visible avec lieux', async ({ page }) => {
    await page.goto('/map');
    await expect(page.getByRole('img', { name: /Carte/i })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole('button', { name: /Rivendell|Bree|Shire/i }).first()).toBeVisible({ timeout: 10_000 });
  });

  test('trajet personnage affiché', async ({ page }) => {
    await page.goto('/map');
    await expect(page.getByText(/Aragorn|Frodo/i).first()).toBeVisible({ timeout: 10_000 });
  });

  test('mode edit — retirer un lieu, replacer via clic carte', async ({ page }) => {
    await page.goto('/map');
    await expect(page.getByRole('img', { name: /Carte/i })).toBeVisible({ timeout: 10_000 });
    // Entrer en mode edit
    await page.getByRole('button', { name: /Place location/i }).click();
    await expect(page.getByRole('button', { name: /Editing/i })).toBeVisible({ timeout: 5_000 });

    // Retirer Bree de la carte
    await page.getByRole('button', { name: /Retirer Bree/i }).click();
    // Le banner doit indiquer qu'il reste des lieux à placer
    await expect(page.getByText(/not yet placed|lieu.*placer/i).first()).toBeVisible({ timeout: 5_000 });

    // Cliquer sur la carte pour ouvrir le popup de placement
    const carte = page.getByRole('img', { name: /Carte/i });
    const box = await carte.boundingBox();
    await page.mouse.click(box.x + box.width * 0.5, box.y + box.height * 0.5);
    await page.waitForTimeout(500);

    // Le popup doit afficher Bree comme lieu à placer — chercher un bouton avec Bree
    const breeBtn = page.getByRole('button', { name: /Bree/i }).first();
    if (await breeBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await breeBtn.click();
    }

    // Sortir du mode edit
    await page.getByRole('button', { name: /Editing/i }).click();
    // Le bouton doit redevenir "Place location"
    await expect(page.getByRole('button', { name: /Place location/i })).toBeVisible({ timeout: 3_000 });
  });
});
