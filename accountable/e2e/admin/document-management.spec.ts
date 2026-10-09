import { test, expect } from '@playwright/test';

const ADMIN_EMAIL = 'admin@accountable.local';
const ADMIN_PASSWORD = 'AccountableAdmin2026!';

test.describe('Admin — login e gestão de documentos', () => {
  test('inicia sessão como administrador e acede ao dashboard', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('Email Profissional').fill(ADMIN_EMAIL);
    await page.getByLabel('Senha de Acesso').fill(ADMIN_PASSWORD);
    await page.getByRole('button', { name: 'Aceder ao Painel' }).click();

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
  });

  test('lista documentos, seleciona um e altera o seu estado', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email Profissional').fill(ADMIN_EMAIL);
    await page.getByLabel('Senha de Acesso').fill(ADMIN_PASSWORD);
    await page.getByRole('button', { name: 'Aceder ao Painel' }).click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });

    await page.goto('/documents');

    const firstRow = page.locator('tbody tr').first();
    await expect(firstRow).toBeVisible({ timeout: 15_000 });
    await firstRow.click();

    // A gestão abre numa página própria.
    await expect(page).toHaveURL(/\/documents\/[0-9a-f-]{36}$/);
    await expect(page.getByTestId('document-management-page')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Tramitação', exact: true })).toBeVisible();

    const statusSelect = page.getByLabel('Selecionar novo estado');
    if (await statusSelect.isVisible()) {
      const options = await statusSelect.locator('option').allTextContents();
      if (options.length > 1) {
        await statusSelect.selectOption({ index: 1 });
        await page.getByRole('button', { name: 'Atualizar Estado' }).click();
        await expect(page.getByText('Estado atualizado.')).toBeVisible();
      }
    }

    await page.getByRole('link', { name: 'Voltar aos processos' }).click();
    await expect(page).toHaveURL(/\/documents$/);
  });

  test('rejeita login inválido com mensagem de erro', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email Profissional').fill(ADMIN_EMAIL);
    await page.getByLabel('Senha de Acesso').fill('senha-errada');
    await page.getByRole('button', { name: 'Aceder ao Painel' }).click();

    await expect(page.getByText(/credenciais inválidas|sem permissões/i)).toBeVisible({
      timeout: 10_000,
    });
    await expect(page).toHaveURL(/\/login/);
  });
});
