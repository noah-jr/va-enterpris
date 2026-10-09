import { test, expect } from '@playwright/test';
import { CLIENT_URL, FAKE_EXE, SAMPLE_PDF, loginClient, uniqueSuffix } from '../support/helpers.js';

test.describe('Cliente — fecho contabilístico mensal', () => {
  test.beforeEach(async ({ page }) => {
    await loginClient(page);
    await page.goto(`${CLIENT_URL}/documents/new`);
    await expect(page.getByText('Documentos Obrigatórios')).toBeVisible();
  });

  test('anexa um PDF a um slot, submete e vê o processo com o ficheiro', async ({ page }) => {
    const firstSlotInput = page.locator('[data-testid^="slot-input-"]').first();
    await firstSlotInput.setInputFiles(SAMPLE_PDF);

    const firstSlot = page.locator('[data-testid^="slot-"][data-status]').first();
    await expect(firstSlot).toHaveAttribute('data-status', 'READY');
    await expect(page.getByText(SAMPLE_PDF.name)).toBeVisible();

    await page.getByLabel('Instruções ou Notas Adicionais (Opcional)').fill(`Notas E2E ${uniqueSuffix()}`);
    await page.getByRole('button', { name: 'Submeter Fecho Contabilístico' }).click();

    await expect(page).toHaveURL(/\/documents\/[0-9a-f-]{36}$/, { timeout: 20_000 });
    await expect(page.getByText(/Fecho Contabilístico Mensal/).first()).toBeVisible();
    await expect(page.getByText(SAMPLE_PDF.name).first()).toBeVisible();

    // Visualização interna: abre dentro da plataforma (sem novo separador).
    const pagesBefore = page.context().pages().length;
    await page.getByTestId(`open-file-${SAMPLE_PDF.name}`).click();
    const viewer = page.getByTestId('document-viewer');
    await expect(viewer).toBeVisible();
    await expect(viewer.getByTestId('viewer-pdf')).toBeVisible();
    await expect(viewer.getByTestId('viewer-file-name')).toHaveText(SAMPLE_PDF.name);
    expect(page.context().pages().length).toBe(pagesBefore);

    // O download também é interno (blob), com o nome original.
    const downloadLink = viewer.getByRole('link', { name: 'Descarregar' });
    await expect(downloadLink).toHaveAttribute('href', /^blob:/);
    await expect(downloadLink).toHaveAttribute('download', SAMPLE_PDF.name);

    await page.keyboard.press('Escape');
    await expect(viewer).toBeHidden();
  });

  test('ficheiro com formato não permitido é recusado no browser (sem criar processo)', async ({ page }) => {
    let createdDocument = false;
    page.on('request', (req) => {
      if (req.method() === 'POST' && req.url().endsWith('/api/v1/documents')) createdDocument = true;
    });

    await page.locator('[data-testid^="slot-input-"]').first().setInputFiles(FAKE_EXE);

    await expect(page.getByTestId('create-document-error')).toContainText('formato não permitido');
    await expect(page.locator('[data-testid^="slot-"][data-status]').first()).toHaveAttribute('data-status', 'PENDING');
    await expect(page.getByRole('button', { name: 'Submeter Fecho Contabilístico' })).toBeDisabled();
    expect(createdDocument).toBe(false);
  });

  test('dispensar um slot atualiza o estado e os contadores', async ({ page }) => {
    const firstSlot = page.locator('[data-testid^="slot-"][data-status]').first();
    await firstSlot.getByRole('button', { name: 'Dispensar / Não Aplicável' }).click();
    await expect(firstSlot).toHaveAttribute('data-status', 'DISPENSED');
    await expect(page.getByRole('tab', { name: /Dispensados \(1\)/ })).toBeVisible();

    await firstSlot.getByRole('button', { name: 'Marcar como Necessário' }).click();
    await expect(firstSlot).toHaveAttribute('data-status', 'PENDING');
  });

  test('envia uma mensagem na thread do processo criado', async ({ page }) => {
    await page.locator('[data-testid^="slot-input-"]').first().setInputFiles(SAMPLE_PDF);
    await page.getByRole('button', { name: 'Submeter Fecho Contabilístico' }).click();
    await expect(page).toHaveURL(/\/documents\/[0-9a-f-]{36}$/, { timeout: 20_000 });

    const message = `Mensagem E2E ${uniqueSuffix()}`;
    const composer = page.getByPlaceholder('Escreva uma mensagem...');
    await composer.fill(message);
    await composer.press('Enter');
    await expect(page.getByText(message)).toBeVisible({ timeout: 10_000 });
  });
});
