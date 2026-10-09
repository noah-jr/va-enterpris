import { test, expect } from '@playwright/test';
import { CLIENT, CLIENT_URL, loginClient } from '../support/helpers.js';

test.describe('Cliente — autenticação e sessão', () => {
  test('rota protegida sem sessão redireciona para o login', async ({ page }) => {
    await page.goto(`${CLIENT_URL}/documents`);
    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 15_000 });
  });

  test('login válido → dashboard; a sessão sobrevive a um reload', async ({ page }) => {
    await loginClient(page);
    await page.reload();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('credenciais inválidas mostram erro e mantêm-se no login', async ({ page }) => {
    await page.goto(`${CLIENT_URL}/auth/login`);
    await page.getByLabel('Email Corporativo').fill(CLIENT.email);
    await page.locator('input[type="password"]').fill('password-errada');
    await page.getByRole('button', { name: 'Entrar' }).click();

    await expect(page.getByText(/credenciais inválidas/i)).toBeVisible({ timeout: 10_000 });
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('a sessão vive apenas em cookies httpOnly (inacessível ao JavaScript)', async ({ page, context }) => {
    await loginClient(page);

    const cookies = await context.cookies();
    const access = cookies.find((c) => c.name === 'access_token');
    expect(access?.httpOnly).toBe(true);

    // Nenhum token exposto ao JS da página (document.cookie / localStorage).
    const exposed = await page.evaluate(() => ({
      cookie: document.cookie,
      storage: JSON.stringify(window.localStorage),
    }));
    expect(exposed.cookie).not.toContain('access_token');
    expect(exposed.storage).not.toMatch(/eyJ[\w-]+\.[\w-]+\.[\w-]+/);
  });

  test('terminar sessão invalida o acesso às páginas protegidas', async ({ page }) => {
    await loginClient(page);

    await page.getByRole('button', { name: 'Menu do Utilizador' }).click();
    await page.getByText('Terminar Sessão').click();
    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 15_000 });

    await page.goto(`${CLIENT_URL}/documents`);
    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 15_000 });
  });
});
