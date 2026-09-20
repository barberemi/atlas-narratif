import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { test, expect } from './fixtures.js';

// Vault Obsidian de test (Harry Potter) enrichi de notes NARRATIVES :
//   - `type: scène`    → événements timeline (+ event_entities, pov, lieu, extras)
//   - `type: chapitre` → chapitres Save the Cat
// On vérifie le chemin bout en bout : parse → staging → seed → /timeline + /savethecat.
const VAULT_DIR = fileURLToPath(new URL('./fixtures/hp-vault', import.meta.url));
const NOTES = [
  'Harry Potter.md',
  'Hermione Granger.md',
  'Albus Dumbledore.md',
  'Poudlard.md',
  'Chemin de Traverse.md',
  'Baguette de Sureau.md',
  "Cape d'Invisibilite.md",
  'Gryffondor.md',
  'Serpentard.md',
  'Expelliarmus.md',
  'Wingardium Leviosa.md',
  'Scenes/La lettre de Poudlard.md',
  'Scenes/Le duel de sorciers.md',
  'Chapitres/Le garcon qui a survecu.md',
  'Chapitres/Le Chemin de Traverse.md',
];
const FILES = NOTES.map(n => path.join(VAULT_DIR, n));

test.describe('Import Obsidian — scènes → timeline + chapitres → STC', () => {
  test('parse scènes/chapitres → staging → seed → /timeline + /savethecat', async ({ page }) => {
    // 1. Dépôt du vault
    await page.goto('/import/obsidian');
    await page.locator('input[type="file"]').setInputFiles(FILES);

    // 2. Aperçu de staging : les comptages Scènes/Chapitres apparaissent
    await expect(page.getByText('Aperçu avant import')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('Scènes', { exact: true })).toBeVisible();
    await expect(page.getByText('Chapitres', { exact: true })).toBeVisible();

    // 3. Confirmation → seed → /review
    await page.getByTestId('import-confirm').click();
    await page.waitForURL('**/review', { timeout: 20_000 });

    // 4. La timeline contient les scènes importées…
    await page.goto('/timeline');
    await expect(page.getByText('La lettre de Poudlard').first()).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('Le duel de sorciers').first()).toBeVisible();

    // …et l'en-tête de chapitre reprend le titre de la note « chapitre » (chapterTitle
    // renseigné depuis Chapitres/Le garcon qui a survecu.md pour le chapitre 1).
    await expect(page.getByText('Le garcon qui a survecu').first()).toBeVisible();

    // 5. Save the Cat charge les chapitres narratifs seedés (chip Ch.1 sur son beat).
    await page.goto('/savethecat');
    await expect(page.getByText('Ch.1').first()).toBeVisible({ timeout: 10_000 });
  });
});
