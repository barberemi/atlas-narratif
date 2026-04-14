/**
 * Fixtures Playwright pour Atlas Narratif.
 *
 * Le globalSetup seed LOTR et sauvegarde le storageState (deviceId + tour vu).
 * Tous les tests démarrent avec le projet LOTR chargé, modal dismissed.
 */
import { test as base, expect } from '@playwright/test';

/** Dismiss tout overlay/modal qui bloque les clics */
async function dismissOverlays(page) {
  // WelcomeModal ou GuidedTour — Escape les ferme
  const overlay = page.locator('div.fixed.inset-0[aria-hidden="true"]');
  if (await overlay.isVisible({ timeout: 1500 }).catch(() => false)) {
    await page.keyboard.press('Escape');
    await overlay.waitFor({ state: 'hidden', timeout: 3000 }).catch(() => {});
  }
}

export const test = base.extend({
  /** Override page pour dismiss les overlays automatiquement après navigation */
  page: async ({ page }, use) => {
    const originalGoto = page.goto.bind(page);
    page.goto = async (url, opts) => {
      const resp = await originalGoto(url, opts);
      await dismissOverlays(page);
      return resp;
    };
    await use(page);
  },
});

export { expect };
