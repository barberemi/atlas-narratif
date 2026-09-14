import { test, expect } from './fixtures.js';

test.describe('Livrables — hub d\'export orienté auteur', () => {

  async function openHub(page) {
    await page.goto('/dashboard');
    // Ouvre le sélecteur de projet (bouton portant le nom du projet)
    await page.getByRole('button', { name: /Seigneur|Lord/ }).first().click();
    await page.getByRole('button', { name: /Export|Exporter/i }).click();
    return page.getByRole('dialog', { name: /Deliverables|Livrables/i });
  }

  test('le hub liste les livrables', async ({ page }) => {
    const hub = await openHub(page);
    await expect(hub).toBeVisible({ timeout: 10_000 });
    await expect(hub.getByText(/Character bible|Bible des personnages/i)).toBeVisible();
    await expect(hub.getByText(/Synopsis/i)).toBeVisible();
    await expect(hub.getByText(/checklist/i)).toBeVisible();
    await expect(hub.getByText(/Full bible|Bible complète/i)).toBeVisible();
  });

  test('générer un livrable ouvre un document imprimable', async ({ page, context }) => {
    const hub = await openHub(page);
    await expect(hub).toBeVisible({ timeout: 10_000 });
    // Attend que le payload soit chargé (bouton actif) puis génère
    const generate = hub.getByRole('button', { name: /Generate|Générer/i }).first();
    await expect(generate).toBeEnabled();
    const [doc] = await Promise.all([
      context.waitForEvent('page'),
      generate.click(),
    ]);
    await doc.waitForLoadState('domcontentloaded');
    await expect(doc).toHaveTitle(/bible|personnages|Character/i);
    await doc.close();
  });
});
