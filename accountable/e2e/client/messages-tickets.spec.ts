import { test, expect } from '@playwright/test';
import { CLIENT_URL, loginClient, uniqueSuffix } from '../support/helpers.js';

test.describe('Cliente — tickets de suporte', () => {
  test('cria um ticket e vê-o nos detalhes e na listagem', async ({ page }) => {
    await loginClient(page);
    await page.goto(`${CLIENT_URL}/tickets/new`);

    await page.getByRole('button', { name: /Fiscalidade/ }).click();
    const subject = `Pedido de suporte E2E ${uniqueSuffix()}`;
    await page.getByLabel('3. Assunto Resumido').fill(subject);
    await page
      .getByPlaceholder(/Descreva com o máximo de detalhe/)
      .fill('Descrição de teste automatizado com mais de vinte caracteres para validação.');
    await page.getByRole('button', { name: 'Submeter Ticket de Suporte' }).click();

    await expect(page).toHaveURL(/\/tickets\/[0-9a-f-]{36}$/, { timeout: 15_000 });
    await expect(page.getByText(subject).first()).toBeVisible();

    await page.goto(`${CLIENT_URL}/tickets`);
    await expect(page.getByText(subject)).toBeVisible();
  });

  test('não submete ticket sem assunto (validação no formulário)', async ({ page }) => {
    await loginClient(page);
    await page.goto(`${CLIENT_URL}/tickets/new`);

    await page.getByRole('button', { name: 'Submeter Ticket de Suporte' }).click();
    await expect(page).toHaveURL(/\/tickets\/new/);
  });
});
