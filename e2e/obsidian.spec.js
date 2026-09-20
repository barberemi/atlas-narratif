import { test, expect } from './fixtures.js';

const FILES = [
  {
    name: 'Kael.md',
    mimeType: 'text/markdown',
    buffer: Buffer.from('---\ntype: personnage\nrace: Elfe\naliases: [Le Sylvain]\n---\nArcher de la forêt. Ami de [[Bral]].'),
  },
  {
    name: 'Bral.md',
    mimeType: 'text/markdown',
    buffer: Buffer.from('---\ntype: personnage\nrace: Nain\n---\nForgeron bourru.'),
  },
  {
    name: 'Aldebaran.md',
    mimeType: 'text/markdown',
    buffer: Buffer.from('---\ntype: langue\nfamille: Ancienne\n---\nLangue oubliée des étoiles.'),
  },
];

test.describe('Import Obsidian (bout en bout)', () => {
  test('importe des .md → aperçu → confirmation → /review', async ({ page }) => {
    await page.goto('/import/obsidian');

    // Dépose les fichiers .md (input caché)
    await page.locator('input[type="file"]').setInputFiles(FILES);

    // Aperçu de staging (ImportPreview) : personnages détectés
    await expect(page.getByText('Aperçu avant import')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('Personnages').first()).toBeVisible();

    // Confirmer → seed → /review
    await page.getByTestId('import-confirm').click();
    await page.waitForURL('**/review', { timeout: 20_000 });

    // Les entités importées apparaissent avec la source Obsidian
    await expect(page.getByText('Kael').first()).toBeVisible({ timeout: 10_000 });
  });
});
