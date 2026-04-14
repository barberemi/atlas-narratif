import { chromium } from '@playwright/test';

const STORAGE_PATH = 'e2e/.auth/storage.json';

/**
 * Setup global : seed le projet LOTR une seule fois,
 * dismiss le WelcomeModal, sauvegarde le storageState.
 */
async function globalSetup() {
  const browser = await chromium.launch();
  const context = await browser.newContext({ locale: 'en-US' });
  const page    = await context.newPage();

  const baseURL = process.env.BASE_URL || 'http://localhost:5173';
  await page.goto(`${baseURL}/`);
  await page.waitForLoadState('networkidle');

  // Si "Load" est visible → seed LOTR (locale forcée en-US → bouton "Load →")
  const loadBtn = page.locator('button:has-text("Load")');
  if (await loadBtn.isVisible({ timeout: 15_000 }).catch(() => false)) {
    console.log('[e2e setup] Seeding LOTR demo...');
    await loadBtn.click();
    await page.waitForURL('**/dashboard', { timeout: 30_000 });
    console.log('[e2e setup] LOTR seeded.');
  } else {
    console.log('[e2e setup] LOTR already present, going to dashboard...');
    await page.goto(`${baseURL}/dashboard`);
  }

  // Dismiss le WelcomeModal (Escape) et marquer vu pour tous les projets LOTR
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);

  // Marquer le tour comme vu dans localStorage pour le projectId actif
  await page.evaluate(() => {
    const keys = Object.keys(localStorage);
    const projectKey = keys.find(k => k === 'atlas_active_project');
    const projectId = projectKey ? localStorage.getItem(projectKey) : null;
    if (projectId) {
      localStorage.setItem(`atlas_tour_seen_${projectId}`, '1');
    }
    // Marquer tous les projets LOTR comme vus
    keys.filter(k => k.startsWith('atlas_tour_seen_')).length || (() => {
      // Si on n'a pas de clé tour, on set pour tout projectId commençant par lotr
      if (projectId?.startsWith('lotr')) {
        localStorage.setItem(`atlas_tour_seen_${projectId}`, '1');
      }
    })();
  });

  await context.storageState({ path: STORAGE_PATH });
  await browser.close();
  console.log('[e2e setup] Storage state saved.');
}

export default globalSetup;
