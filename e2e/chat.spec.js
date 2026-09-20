import { test, expect } from './fixtures.js';

test.describe('Chat de requête — niveau 1 (déterministe)', () => {

  test('affiche le disclaimer de confidentialité', async ({ page }) => {
    await page.goto('/chat');
    await expect(page.getByTestId('chat-disclaimer')).toBeVisible({ timeout: 10_000 });
  });

  test('répond « qui est » depuis les données du projet', async ({ page }) => {
    await page.goto('/chat');
    const input = page.getByTestId('chat-input');
    await expect(input).toBeVisible({ timeout: 10_000 });
    await input.fill('qui est Aragorn');
    await page.getByTestId('chat-send').click();
    const answer = page.getByTestId('chat-answer').first();
    await expect(answer).toBeVisible({ timeout: 5_000 });
    await expect(answer).toContainText('Aragorn');
    // Parité avec le mode approfondi : entités citées cliquables (pucettes sources).
    await expect(answer.getByTestId('chat-sources')).toBeVisible();
  });

  test('répond « chapitre N » avec les événements', async ({ page }) => {
    await page.goto('/chat');
    const input = page.getByTestId('chat-input');
    await input.fill('que se passe-t-il au chapitre 1');
    await page.getByTestId('chat-send').click();
    const answer = page.getByTestId('chat-answer').first();
    await expect(answer).toBeVisible({ timeout: 5_000 });
    // La réponse mentionne « chapitre 1 » (événements trouvés ou absence).
    await expect(answer).toContainText(/chapitre 1/i);
  });

  test('multi-discussions : créer, lister, renommer, supprimer', async ({ page }) => {
    await page.goto('/chat');
    // 1er message → crée un thread auto-titré.
    await page.getByTestId('chat-input').fill('qui est Aragorn');
    await page.getByTestId('chat-send').click();
    await expect(page.getByTestId('chat-answer').first()).toBeVisible({ timeout: 5_000 });
    await expect(page.getByTestId('chat-thread')).toHaveCount(1);

    // Nouvelle discussion → 2 threads.
    await page.getByTestId('chat-new-thread').click();
    await page.getByTestId('chat-input').fill('où est Frodo');
    await page.getByTestId('chat-send').click();
    await expect(page.getByTestId('chat-thread')).toHaveCount(2);

    // Persistance après reload.
    await page.goto('/chat');
    await expect(page.getByTestId('chat-thread')).toHaveCount(2);

    // Renommer le 1er thread.
    const first = page.getByTestId('chat-thread').first();
    await first.hover();
    await first.getByTestId('chat-thread-rename').click();
    const nameInput = page.getByTestId('chat-thread-rename-input');
    await nameInput.fill('Mon fil renommé');
    await nameInput.press('Enter');
    await expect(page.getByText('Mon fil renommé').first()).toBeVisible();

    // Supprimer un thread (confirmation en deux temps) → 1 restant.
    const target = page.getByTestId('chat-thread').first();
    await target.hover();
    await target.getByTestId('chat-thread-delete').click();
    await target.getByTestId('chat-thread-delete-confirm').click();
    await expect(page.getByTestId('chat-thread')).toHaveCount(1);
  });

  test('visite guidée : le bouton « ? » lance le tour de la page', async ({ page }) => {
    await page.goto('/chat');
    await expect(page.getByTestId('chat-input')).toBeVisible({ timeout: 10_000 });
    await page.getByRole('button', { name: 'Aide' }).click();
    await expect(page.getByTestId('guided-tour')).toBeVisible({ timeout: 5_000 });
  });
});
