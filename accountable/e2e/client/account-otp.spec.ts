import { test, expect } from '@playwright/test';
import { CLIENT_URL, loginClient, uniqueSuffix } from '../support/helpers.js';
import { countEmails, waitForEmail } from '../support/mailhog.js';
import { adminApi } from '../support/api.js';

const PASSWORD = 'SenhaPortal!2026';

/** Regista uma empresa pela UI e devolve o email usado. */
async function registerViaUi(page: import('@playwright/test').Page): Promise<string> {
  const email = `e2e-otp-${uniqueSuffix()}@example.com`;
  await page.goto(`${CLIENT_URL}/auth/register`);
  await page.getByLabel('NIP / NIF da Empresa').fill(`E${Date.now()}`.slice(0, 14));
  await page.getByLabel('Nome / Denominação Social').fill('Empresa E2E OTP Lda');
  await page.getByLabel('Email Institucional').fill(email);
  await page.getByRole('button', { name: 'Criar conta' }).click();
  await expect(page).toHaveURL(/\/auth\/verify-email\?email=/, { timeout: 15_000 });
  return email;
}

test.describe('Cliente — ativação de conta por código (OTP)', () => {
  test('registo → código do email → definir senha → login', async ({ page }) => {
    const email = await registerViaUi(page);
    await expect(page.getByText('Conta criada.')).toBeVisible();

    const mail = await waitForEmail(email);
    expect(mail.code).toMatch(/^\d{6}$/);

    await page.getByLabel('Código de verificação').fill(mail.code!);
    await page.getByRole('button', { name: 'Ativar conta' }).click();

    await expect(page).toHaveURL(/\/auth\/set-password\?token=/, { timeout: 15_000 });
    await page.getByLabel('Nova Senha').fill(PASSWORD);
    await page.getByLabel('Confirmar Senha').fill(PASSWORD);
    await page.getByRole('button', { name: 'Definir senha' }).click();
    await expect(page.getByText('Conta ativada com sucesso.')).toBeVisible();

    await loginClient(page, { email, password: PASSWORD });
  });

  test('ativação pelo link do email também funciona', async ({ page }) => {
    const email = await registerViaUi(page);
    const mail = await waitForEmail(email);
    expect(mail.link).toContain('/auth/verify-email?token=');

    await page.goto(mail.link!);
    await expect(page).toHaveURL(/\/auth\/set-password\?token=/, { timeout: 15_000 });
  });

  test('código errado mostra tentativas restantes; reenviar gera novo código', async ({ page }) => {
    const email = await registerViaUi(page);
    const first = await waitForEmail(email);

    await page.getByLabel('Código de verificação').fill(first.code === '000000' ? '111111' : '000000');
    await page.getByRole('button', { name: 'Ativar conta' }).click();
    await expect(page.getByText(/Restam 4 tentativa/)).toBeVisible();

    const before = await countEmails(email);
    await page.getByRole('button', { name: 'Reenviar código' }).click();
    await expect(page.getByText(/enviámos um novo link e um novo código/)).toBeVisible();
    const second = await waitForEmail(email, before);

    await page.getByLabel('Código de verificação').fill(second.code!);
    await page.getByRole('button', { name: 'Ativar conta' }).click();
    await expect(page).toHaveURL(/\/auth\/set-password/, { timeout: 15_000 });
  });
});

test.describe('Cliente — recuperação de senha por código', () => {
  test('esqueci-me → código → nova senha → login com a nova senha', async ({ page }) => {
    // Conta ativa criada pelo fluxo completo.
    const email = await registerViaUi(page);
    const activation = await waitForEmail(email);
    await page.getByLabel('Código de verificação').fill(activation.code!);
    await page.getByRole('button', { name: 'Ativar conta' }).click();
    await page.getByLabel('Nova Senha').fill(PASSWORD);
    await page.getByLabel('Confirmar Senha').fill(PASSWORD);
    await page.getByRole('button', { name: 'Definir senha' }).click();
    await expect(page.getByText('Conta ativada com sucesso.')).toBeVisible();

    const before = await countEmails(email);
    await page.goto(`${CLIENT_URL}/auth/forgot-password`);
    await page.getByLabel('Email').fill(email);
    await page.getByRole('button', { name: 'Enviar instruções' }).click();
    await page.getByRole('button', { name: 'Introduzir o código' }).click();
    await expect(page).toHaveURL(/\/auth\/reset-password\?email=/);

    const reset = await waitForEmail(email, before);
    const newPassword = 'Recuperada!2027';
    await page.getByLabel('Código de verificação').fill(reset.code!);
    await page.getByLabel(/^Nova senha/).fill(newPassword);
    await page.getByLabel('Confirmar nova senha').fill(newPassword);
    await page.getByRole('button', { name: 'Redefinir senha' }).click();
    await expect(page.getByText('A sua senha foi alterada com sucesso.')).toBeVisible();

    await loginClient(page, { email, password: newPassword });
  });
});

test.describe('Cliente — definições', () => {
  test('mostra a subscrição em AOA criada pelo administrador', async ({ page }) => {
    const api = await adminApi();
    const me = await (async () => {
      await loginClient(page);
      const res = await page.request.get(`${CLIENT_URL}/api/v1/auth/me`);
      return (await res.json()).data as { id: string };
    })();

    // Garante uma subscrição ativa para o cliente seed.
    const existing = await api.get(`/api/v1/admin/subscriptions?clientId=${me.id}&status=ACTIVE`);
    if (((await existing.json()).data as unknown[]).length === 0) {
      const plans = (await (await api.get('/api/v1/admin/plans')).json()).data as Array<{ id: string; name: string }>;
      const open = (await (await api.get(`/api/v1/admin/subscriptions?clientId=${me.id}`)).json()).data as Array<{
        id: string;
        status: string;
      }>;
      for (const s of open.filter((x) => x.status !== 'CANCELLED')) {
        await api.patch(`/api/v1/admin/subscriptions/${s.id}`, { data: { status: 'CANCELLED' } });
      }
      await api.post('/api/v1/admin/subscriptions', {
        data: { clientId: me.id, planId: plans.find((p) => p.name === 'Starter')!.id, billingCycle: 'MONTHLY' },
      });
    }

    await page.goto(`${CLIENT_URL}/settings`);
    const card = page.getByTestId('my-subscription');
    await expect(card).toBeVisible();
    await expect(card).toContainText('Kz');
    await expect(card).toContainText('Ativa');
  });

  test('alterar senha exige a senha atual correta', async ({ page }) => {
    await loginClient(page);
    await page.goto(`${CLIENT_URL}/settings`);
    await page.getByLabel('Senha atual').fill('errada');
    await page.getByLabel(/^Nova senha/).fill('Qualquer!2026');
    await page.getByLabel('Confirmar nova senha').fill('Qualquer!2026');
    await page.getByRole('button', { name: 'Alterar senha' }).click();
    await expect(page.getByText('A senha atual está incorreta.')).toBeVisible();
  });
});
