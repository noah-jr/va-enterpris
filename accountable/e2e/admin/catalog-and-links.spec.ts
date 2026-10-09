import { test, expect } from '@playwright/test';
import { ADMIN_URL, CLIENT, loginAdmin, uniqueSuffix } from '../support/helpers.js';

test.describe('Admin — tipos de documento', () => {
  test('cria, pesquisa e elimina um tipo de documento', async ({ page }) => {
    await loginAdmin(page);
    await page.goto(`${ADMIN_URL}/document-types`);

    await page.getByRole('button', { name: /Novo Tipo/ }).click();
    const dialog = page.getByRole('dialog', { name: 'Novo Tipo de Documento' });
    await expect(dialog).toBeVisible();

    const suffix = uniqueSuffix().replace('-', '_');
    const name = `Tipo E2E ${suffix}`;
    await dialog.getByLabel('Nome do Tipo de Documento *').fill(name);
    await dialog.getByLabel('Código Único (Slug) *').fill(`e2e_${suffix}`);
    await dialog.getByRole('button', { name: 'Criar Tipo' }).click();
    await expect(dialog).toBeHidden({ timeout: 10_000 });

    await page.getByPlaceholder('Pesquisar por nome, código ou descrição...').fill(name);
    await expect(page.getByText(name)).toBeVisible();

    await page.getByTitle('Eliminar Tipo').first().click();
    const confirm = page.getByRole('alertdialog');
    await confirm.getByRole('button', { name: 'Confirmar Eliminação' }).click();
    await expect(confirm).toBeHidden({ timeout: 10_000 });
    await expect(page.getByText(name)).toHaveCount(0);
  });

  test('código inválido mostra erro de validação e não fecha o modal', async ({ page }) => {
    await loginAdmin(page);
    await page.goto(`${ADMIN_URL}/document-types`);

    await page.getByRole('button', { name: /Novo Tipo/ }).click();
    const dialog = page.getByRole('dialog', { name: 'Novo Tipo de Documento' });
    await dialog.getByLabel('Nome do Tipo de Documento *').fill('Tipo inválido');
    await dialog.getByLabel('Código Único (Slug) *').fill('com espaços!');
    await dialog.getByRole('button', { name: 'Criar Tipo' }).click();

    await expect(dialog.getByText('Apenas letras, números, hífen e underscore')).toBeVisible();
    await expect(dialog).toBeVisible();
  });
});

test.describe('Admin — links de envio para clientes', () => {
  test('gera link com validade, lista-o como ativo e revoga-o', async ({ page, browser }) => {
    await loginAdmin(page);
    await page.goto(`${ADMIN_URL}/clients?search=${encodeURIComponent(CLIENT.email)}`);

    const row = page.locator('tbody tr', { hasText: CLIENT.email }).first();
    await expect(row).toBeVisible({ timeout: 15_000 });
    await row.getByTitle('Gerar Link de Envio Criptografado para o Cliente').click();

    await page.getByRole('button', { name: 'Gerar Link de Envio Criptografado' }).click();

    const createdUrl = page.locator('input[readonly]').filter({ hasText: '' }).first();
    await expect(createdUrl).toHaveValue(/token=[0-9a-f]{64}/, { timeout: 15_000 });
    const url = await createdUrl.inputValue();

    const session = page.locator('[data-testid^="upload-session-"]').first();
    await expect(session).toContainText('Ativo');
    await expect(session).toContainText('Válido até');

    // O link funciona para um visitante anónimo…
    const anonymous = await browser.newContext();
    const visitor = await anonymous.newPage();
    await visitor.goto(url);
    await expect(visitor.getByText('Portal Seguro de Entrega Documental')).toBeVisible({ timeout: 15_000 });

    // …até ser revogado.
    await session.getByTitle('Revogar Link').click();
    await expect(session).toContainText('Revogado', { timeout: 10_000 });

    await visitor.reload();
    await expect(visitor.getByTestId('upload-link-unavailable')).toBeVisible({ timeout: 15_000 });
    await anonymous.close();
  });
});
