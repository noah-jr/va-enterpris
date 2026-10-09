import { test, expect } from '@playwright/test';
import { CLIENT_URL, loginClient } from '../support/helpers.js';

test.describe('Link público de envio (portal sem login)', () => {
  test('cliente gera um link real e um visitante anónimo abre o portal da empresa', async ({ page, browser }) => {
    await loginClient(page);
    await page.goto(`${CLIENT_URL}/documents/new`);

    await page.getByRole('button', { name: 'Gerar Link' }).click();
    const urlInput = page.getByTestId('share-link-url');
    await expect(urlInput).toBeVisible({ timeout: 15_000 });

    const url = await urlInput.inputValue();
    expect(url).toMatch(/token=[0-9a-f]{64}/);
    expect(url).not.toContain('companyId');
    await expect(page.getByTestId('share-link-error')).toHaveCount(0);

    // Visitante sem sessão (contexto novo, sem cookies)
    const anonymous = await browser.newContext();
    const visitor = await anonymous.newPage();
    await visitor.goto(url);

    await expect(visitor.getByTestId('upload-link-unavailable')).toHaveCount(0);
    await expect(visitor.getByText('Portal Seguro de Entrega Documental')).toBeVisible({ timeout: 15_000 });
    await anonymous.close();
  });

  test('link inválido mostra estado "indisponível" em vez do formulário', async ({ page }) => {
    await page.goto(`${CLIENT_URL}/publico/documentos/upload?token=${'0'.repeat(64)}`);
    await expect(page.getByTestId('upload-link-unavailable')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText('Link de envio indisponível')).toBeVisible();
    // Nenhum nome de empresa "de exemplo" exposto.
    await expect(page.getByText(/VA TECH ENTERPRISES/i)).toHaveCount(0);
  });

  test('link sem token também mostra o estado indisponível', async ({ page }) => {
    await page.goto(`${CLIENT_URL}/publico/documentos/upload`);
    await expect(page.getByTestId('upload-link-unavailable')).toBeVisible({ timeout: 15_000 });
  });
});
