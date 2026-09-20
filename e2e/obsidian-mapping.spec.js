import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { test, expect } from './fixtures.js';

// Écran « Ajuster le mapping » : le vault HP contient des champs custom
// (ex. `patronus` sur Harry) que l'on peut remapper avant le seed.
const VAULT_DIR = fileURLToPath(new URL('./fixtures/hp-vault', import.meta.url));
const FILES = [
  'Harry Potter.md',
  'Hermione Granger.md',
  'Poudlard.md',
].map(n => path.join(VAULT_DIR, n));

test.describe('Import Obsidian — ajustement du mapping des champs', () => {
  test('ouvrir le panneau, remapper un champ, puis importer', async ({ page }) => {
    await page.goto('/import/obsidian');
    await page.locator('input[type="file"]').setInputFiles(FILES);

    await expect(page.getByText('Aperçu avant import')).toBeVisible({ timeout: 10_000 });

    // Panneau replié par défaut → on l'ouvre.
    await page.getByTestId('mapping-toggle').click();

    // Un champ non standard du frontmatter (patronus de Harry) est listé.
    await expect(page.getByText('patronus', { exact: true })).toBeVisible();

    // On le force à « Ignorer » ; le contrôle reflète bien le choix (binding overrideMap).
    const patronus = page.getByLabel('Mapping du champ patronus');
    await patronus.selectOption('__ignore');
    await expect(patronus).toHaveValue('__ignore');
    // puis on importe : le flux doit aboutir au seed.
    await page.getByTestId('import-confirm').click();
    await page.waitForURL('**/review', { timeout: 20_000 });
    await expect(page.getByText('Harry Potter').first()).toBeVisible({ timeout: 10_000 });
  });
});
