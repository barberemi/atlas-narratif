import { test, expect } from './fixtures.js';

const banner = (page) => page.getByTestId('cookie-banner');

test.describe('Cookie Consent Banner', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
    await page.evaluate(() => localStorage.removeItem('atlas_cookie_consent'));
    await page.reload();
  });

  test('banner appears on first visit', async ({ page }) => {
    await expect(banner(page)).toHaveCSS('opacity', '1', { timeout: 5000 });
    await expect(page.getByRole('button', { name: /sounds good/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /no thanks/i })).toBeVisible();
  });

  test('refusing hides the banner and shows Cookies in footer', async ({ page }) => {
    await expect(banner(page)).toHaveCSS('opacity', '1', { timeout: 5000 });
    await page.getByRole('button', { name: /no thanks/i }).click();
    await expect(banner(page)).toHaveCSS('opacity', '0', { timeout: 3000 });

    const consent = await page.evaluate(() => JSON.parse(localStorage.getItem('atlas_cookie_consent')));
    expect(consent.accepted).toBe(false);

    await expect(page.getByRole('button', { name: 'Cookies' })).toBeVisible();
  });

  test('Cookies footer link reopens the banner', async ({ page }) => {
    await expect(banner(page)).toHaveCSS('opacity', '1', { timeout: 5000 });
    await page.getByRole('button', { name: /no thanks/i }).click();
    await expect(banner(page)).toHaveCSS('opacity', '0', { timeout: 3000 });

    // Cliquer le bouton Cookies dans le footer via evaluate (le bouton
    // peut être recouvert par le bandeau auth fixed)
    await page.evaluate(() => {
      document.querySelectorAll('button').forEach(b => {
        if (b.textContent.trim() === 'Cookies') b.click();
      });
    });
    await expect(banner(page)).toHaveCSS('opacity', '1', { timeout: 3000 });
  });

  test('accepting stores consent', async ({ page }) => {
    await expect(banner(page)).toHaveCSS('opacity', '1', { timeout: 5000 });
    await page.getByRole('button', { name: /sounds good/i }).click();
    await expect(banner(page)).toHaveCSS('opacity', '0', { timeout: 3000 });

    const consent = await page.evaluate(() => JSON.parse(localStorage.getItem('atlas_cookie_consent')));
    expect(consent.accepted).toBe(true);
  });

  test('banner hidden when consent already given', async ({ page }) => {
    await page.evaluate(() =>
      localStorage.setItem('atlas_cookie_consent', JSON.stringify({ accepted: true, timestamp: Date.now() }))
    );
    await page.reload();
    await expect(banner(page)).toHaveCSS('opacity', '0', { timeout: 3000 });
  });
});
