import { test, expect } from './fixtures.js';

test.describe('Phase 5b — CRUD Threads', () => {

  test('créer un thread', async ({ page }) => {
    await page.goto('/threads');
    await page.getByRole('button', { name: '+ New thread' }).click();
    await page.getByPlaceholder(/Aragorn.*romance|Saruman/i).fill('E2E Test Thread');
    await page.getByRole('button', { name: 'Create thread' }).click();
    await page.goto('/threads');
    await expect(page.getByText('E2E Test Thread')).toBeVisible({ timeout: 5_000 });
  });

  test('supprimer un thread', async ({ page }) => {
    // Créer d'abord
    await page.goto('/threads');
    await page.getByRole('button', { name: '+ New thread' }).click();
    await page.getByPlaceholder(/Aragorn.*romance|Saruman/i).fill('To Delete Thread');
    await page.getByRole('button', { name: 'Create thread' }).click();
    await page.goto('/threads');
    await expect(page.getByText('To Delete Thread')).toBeVisible({ timeout: 5_000 });
    // Le bouton ✕ est dans la même ligne que le texte du thread
    // Chaque thread a : texte, role, chapitres, description, tagged events, ▼, Edit, ✕
    // On cherche le ✕ qui suit "To Delete Thread"
    const deleteBtn = page.locator('button[title="Delete"], button[aria-label="Delete"]')
      .or(page.getByRole('button', { name: '✕' })).last();
    await deleteBtn.click();
    await page.goto('/threads');
    await expect(page.getByText('To Delete Thread')).not.toBeVisible({ timeout: 5_000 });
  });
});
