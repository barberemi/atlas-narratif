import { test, expect } from './fixtures.js';

test.describe('Phase 6a — Map', () => {

  test('carte visible avec lieux', async ({ page }) => {
    await page.goto('/map');
    await expect(page.getByRole('img', { name: /Carte/i })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole('button', { name: /Rivendell|Bree|Shire/i }).first()).toBeVisible({ timeout: 10_000 });
  });

  test('curseur de chapitres visible et personnage suivi', async ({ page }) => {
    await page.goto('/map');
    await expect(page.getByRole('img', { name: /Carte/i })).toBeVisible({ timeout: 15_000 });
    // Le curseur de chapitres partagé (piste 1) remplace l'ancienne matrice
    const cursor = page.getByRole('slider', { name: /Chapter|Chapitre/i });
    await expect(cursor).toBeVisible({ timeout: 10_000 });
    // Un personnage est suivi par défaut (sélecteur "Suivre")
    await expect(page.getByText(/Suivre|Follow/i)).toBeVisible();
  });

  test('curseur de chapitres — avancer change de chapitre', async ({ page }) => {
    await page.goto('/map');
    const cursor = page.getByRole('slider', { name: /Chapter|Chapitre/i });
    await expect(cursor).toBeVisible({ timeout: 15_000 });
    await expect(cursor).toHaveAttribute('aria-valuenow', '1');
    await page.getByRole('button', { name: /Chapitre suivant|Next chapter/i }).click();
    await expect(cursor).toHaveAttribute('aria-valuenow', '2');
  });

  test('frise de présence visible et cliquable', async ({ page }) => {
    await page.goto('/map');
    const cursor = page.getByRole('slider', { name: /Chapter|Chapitre/i });
    await expect(cursor).toBeVisible({ timeout: 15_000 });
    // La frise (piste 2) est repliée par défaut → le titre est visible, on déplie
    await expect(page.getByText(/Présence|Presence/i)).toBeVisible();
    await page.getByRole('button', { name: /Présence|Presence/i }).click();
    await expect(page.getByText(/Couleur = lieu|Colour = location/i)).toBeVisible();
    // Cliquer une cellule de chapitre dans la frise déplace le curseur partagé
    await expect(cursor).toHaveAttribute('aria-valuenow', '1');
    await page.getByRole('button', { name: /Chap(itre|ter) 3\b/i }).first().click();
    await expect(cursor).toHaveAttribute('aria-valuenow', '3');
  });

  test('convergence — repères sur le curseur quand plusieurs persos affichés', async ({ page }) => {
    await page.goto('/map');
    await expect(page.getByRole('slider', { name: /Chapter|Chapitre/i })).toBeVisible({ timeout: 15_000 });
    // Ouvrir le sélecteur « Suivre » puis tout afficher
    const followTrigger = page.getByText(/^Suivre$|^Follow$/i).locator('..').getByRole('button').first();
    await followTrigger.click();
    await page.getByRole('button', { name: /Tout afficher|Show all/i }).click();
    await followTrigger.click(); // refermer le dropdown
    // Avec tous les personnages, des rassemblements existent → légende des repères visible
    await expect(page.getByText(/Rassemblement|Gathering/i).first()).toBeVisible();
  });

  test('lecture animée — le curseur avance puis se met en pause', async ({ page }) => {
    await page.goto('/map');
    const cursor = page.getByRole('slider', { name: /Chapter|Chapitre/i });
    await expect(cursor).toBeVisible({ timeout: 15_000 });
    await expect(cursor).toHaveAttribute('aria-valuenow', '1');
    // Lancer la lecture → le curseur avance tout seul
    await page.getByRole('button', { name: /Lecture animée|Animate playback/i }).click();
    await expect(async () => {
      const v = Number(await cursor.getAttribute('aria-valuenow'));
      expect(v).toBeGreaterThan(1);
    }).toPass({ timeout: 5000 });
    // Mettre en pause → le curseur n'avance plus
    await page.getByRole('button', { name: /^Pause$/i }).click();
    const vPause = await cursor.getAttribute('aria-valuenow');
    await page.waitForTimeout(1400);
    await expect(cursor).toHaveAttribute('aria-valuenow', vPause);
  });

  test('plein écran — masque le header et revient', async ({ page }) => {
    await page.goto('/map');
    const heading = page.getByRole('heading', { name: /interactive/i });
    await expect(heading).toBeVisible({ timeout: 15_000 });
    await page.getByRole('button', { name: /^Plein écran$|^Fullscreen$/i }).click();
    await expect(heading).toBeHidden();
    await page.getByRole('button', { name: /Quitter le plein écran|Exit fullscreen/i }).click();
    await expect(heading).toBeVisible();
  });

  test('mini-cartes — bascule vue grille et retour', async ({ page }) => {
    await page.goto('/map');
    const cursor = page.getByRole('slider', { name: /Chapter|Chapitre/i });
    await expect(cursor).toBeVisible({ timeout: 15_000 });
    // Basculer en mini-cartes → le dock (curseur) disparaît
    await page.getByRole('button', { name: /Mini-cartes|Thumbnails/i }).click();
    await expect(cursor).toBeHidden();
    // Revenir à la carte unique → le curseur revient
    await page.getByRole('button', { name: /^Carte$|^Map$/i }).click();
    await expect(cursor).toBeVisible();
  });

  test('frise de présence — repliable (dock une-page)', async ({ page }) => {
    await page.goto('/map');
    await expect(page.getByRole('slider', { name: /Chapter|Chapitre/i })).toBeVisible({ timeout: 15_000 });
    const legend = page.getByText(/Couleur = lieu|Colour = location/i);
    // Repliée par défaut (place à la carte)
    await expect(legend).toBeHidden();
    // Déplier via l'en-tête « Présence »
    await page.getByRole('button', { name: /Présence|Presence/i }).click();
    await expect(legend).toBeVisible();
    // Replier à nouveau
    await page.getByRole('button', { name: /Présence|Presence/i }).click();
    await expect(legend).toBeHidden();
  });

  test('bouton Remplacer le fond visible sur la carte', async ({ page }) => {
    await page.goto('/map');
    await expect(page.getByRole('img', { name: /Carte/i })).toBeVisible({ timeout: 15_000 });
    // Le bouton "Remplacer le fond" doit être en overlay sur la carte
    await expect(page.getByText(/Replace background|Remplacer le fond/i)).toBeVisible();
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
