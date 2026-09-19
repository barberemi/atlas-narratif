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
});
