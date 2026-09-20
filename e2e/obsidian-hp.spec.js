import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { test, expect } from './fixtures.js';

// Vault Obsidian de test (univers Harry Potter) : fichiers .md réels avec
// frontmatter — personnages, lieux, objets + deux types custom (Maison, Sortilège).
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
];
const FILES = NOTES.map(n => path.join(VAULT_DIR, n));

test.describe('Import vault Obsidian Harry Potter (bout en bout)', () => {
  test('parse .md → aperçu de staging → seed → /review + /custom', async ({ page }) => {
    // 1. Dépôt du vault sur la route d'import
    await page.goto('/import/obsidian');
    await page.locator('input[type="file"]').setInputFiles(FILES);

    // 2. Aperçu de staging (ImportPreview, en mémoire, rien n'est encore écrit)
    await expect(page.getByText('Aperçu avant import')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('Personnages')).toBeVisible();
    await expect(page.getByText('Entités custom')).toBeVisible();
    // Le rapport de liens cassés remonte les wikilinks non résolus (ex. [[Voldemort]]).
    await expect(page.getByText(/Voldemort/)).toBeVisible();

    // 3. Confirmation → seed → redirection vers /review
    await page.getByTestId('import-confirm').click();
    await page.waitForURL('**/review', { timeout: 20_000 });

    // 4. Les entités natives apparaissent dans /review avec la source Obsidian
    await expect(page.getByText('Harry Potter').first()).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('Poudlard').first()).toBeVisible();
    await expect(page.getByText('Baguette de Sureau').first()).toBeVisible();
    // La source 'obsidian' doit être portée par les 3 entités natives (3 perso + 2 lieux
    // + 2 objets = 7 badges), pas seulement les personnages.
    await expect(page.getByText('Obsidian', { exact: true })).toHaveCount(7);

    // 5. Les types & entités custom (couche 3) apparaissent dans /custom
    await page.goto('/custom');
    await expect(page.getByRole('button', { name: /Maison/ })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole('button', { name: /Sortilège/ })).toBeVisible();

    // Onglet Maison → entités
    await page.getByRole('button', { name: /Maison/ }).click();
    await expect(page.getByText('Gryffondor').first()).toBeVisible();
    await expect(page.getByText('Serpentard').first()).toBeVisible();

    // Le champ interne __links (wikilinks résolus) ne doit JAMAIS être visible.
    await expect(page.getByText('__links')).toHaveCount(0);
    // Aucun markup [[...]] brut résiduel dans les descriptions.
    await expect(page.getByText('[[Poudlard]]')).toHaveCount(0);

    // 6. Wikilink cliquable dans la description (Niveau 1) → ouvre la FICHE de l'entité
    // (même convention que la recherche globale : /lore?tab=…&search=…), pas le graphe.
    await page.getByRole('button', { name: 'Poudlard', exact: true }).first().click();
    await expect(page).toHaveURL(/\/lore\?tab=locations/);
    await expect(page.getByText('Poudlard').first()).toBeVisible({ timeout: 10_000 });

    // 7. Le graphe expose les arêtes wikilink (Niveau 2). Poudlard n'a AUCUNE relation
    // native/événement vers Gryffondor (entité custom) → si Gryffondor apparaît comme
    // nœud sur le graphe de Poudlard, c'est forcément via l'arête wikilink.
    await page.goto('/relations?entity=loc_poudlard');
    await expect(page.getByText('Gryffondor').first()).toBeVisible({ timeout: 10_000 });

    // 8. Wikilink vers une entité CUSTOM → deep-link /custom?type=…&entity=… : la fiche
    // de Harry cite [[Expelliarmus]] (un Sortilège). Le cache custom est chargé partout.
    await page.goto('/lore?tab=characters&search=Harry');
    await page.getByRole('button', { name: 'Expelliarmus', exact: true }).first().click();
    await expect(page).toHaveURL(/\/custom\?type=.+&entity=.+/);
    await expect(page.getByText('Expelliarmus').first()).toBeVisible({ timeout: 10_000 });

    // Onglet Sortilège → entités (retour sur /custom)
    await page.goto('/custom');
    await page.getByRole('button', { name: /Sortilège/ }).click();
    await expect(page.getByText('Expelliarmus').first()).toBeVisible();
    await expect(page.getByText('Wingardium Leviosa').first()).toBeVisible();
  });
});
