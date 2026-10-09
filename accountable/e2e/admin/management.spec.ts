import { test, expect } from '@playwright/test';
import { ADMIN_URL, loginAdmin, uniqueSuffix } from '../support/helpers.js';
import { countEmails, waitForEmail } from '../support/mailhog.js';
import { adminApi, roleId } from '../support/api.js';

test.describe('Admin — acesso: recuperação de senha e convites', () => {
  test('esqueci-me da senha → código → nova senha → login', async ({ page }) => {
    const api = await adminApi();
    const email = `e2e-staff-${uniqueSuffix()}@accountable.local`;
    await api.post('/api/v1/users', {
      data: { name: 'Staff E2E', email, password: 'Inicial!2026', roleIds: [await roleId(api, 'CONSULTANT')] },
    });

    await page.goto(`${ADMIN_URL}/login`);
    await page.getByRole('link', { name: 'Esqueceu-se da senha?' }).click();
    await page.getByLabel('Email Profissional').fill(email);
    await page.getByRole('button', { name: 'Enviar instruções' }).click();
    await page.getByRole('button', { name: 'Tenho o código' }).click();

    const mail = await waitForEmail(email);
    await page.getByLabel('Código de verificação').fill(mail.code!);
    await page.getByLabel('Nova senha').fill('Recuperada!2026');
    await page.getByLabel('Confirmar senha').fill('Recuperada!2026');
    await page.getByRole('button', { name: 'Redefinir senha' }).click();
    await expect(page.getByText('A sua senha foi definida com sucesso.')).toBeVisible();

    await page.getByRole('button', { name: 'Iniciar sessão' }).click();
    await page.getByLabel('Email Profissional').fill(email);
    await page.getByLabel('Senha de Acesso').fill('Recuperada!2026');
    await page.getByRole('button', { name: 'Aceder ao Painel' }).click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
  });

  test('criar utilizador por convite (UI) → convidado ativa a conta pelo link', async ({ page, browser }) => {
    await loginAdmin(page);
    await page.goto(`${ADMIN_URL}/users`);

    const email = `e2e-convite-${uniqueSuffix()}@accountable.local`;
    await page.getByRole('button', { name: 'Novo utilizador' }).click();
    const dialog = page.getByRole('dialog', { name: 'Novo utilizador' });
    await dialog.getByLabel('Nome completo').fill('Convidado E2E');
    await dialog.getByLabel('Email profissional').fill(email);
    await dialog.getByText('Suporte', { exact: true }).click();
    await dialog.getByRole('button', { name: 'Criar e enviar convite' }).click();
    await expect(dialog).toBeHidden({ timeout: 10_000 });
    await expect(page.getByTestId(`user-row-${email}`)).toContainText('Convidado E2E');

    const invite = await waitForEmail(email);
    expect(invite.link).toContain('invite=1');

    const guest = await (await browser.newContext()).newPage();
    await guest.goto(invite.link!);
    await expect(guest.getByRole('heading', { name: 'Ative a sua conta' })).toBeVisible();
    await guest.getByLabel('Nova senha').fill('Convidado!2026');
    await guest.getByLabel('Confirmar senha').fill('Convidado!2026');
    await guest.getByRole('button', { name: 'Ativar conta' }).click();
    await expect(guest.getByText('A sua senha foi definida com sucesso.')).toBeVisible();
  });

  test('desativar um utilizador e enviar-lhe redefinição de senha a partir da lista', async ({ page }) => {
    const api = await adminApi();
    const email = `e2e-desativar-${uniqueSuffix()}@accountable.local`;
    await api.post('/api/v1/users', {
      data: { name: 'Para Desativar', email, password: 'Inicial!2026', roleIds: [await roleId(api, 'SUPPORT')] },
    });

    await loginAdmin(page);
    await page.goto(`${ADMIN_URL}/users`);
    await page.getByLabel('Pesquisar utilizadores').fill(email);
    const row = page.getByTestId(`user-row-${email}`);
    await expect(row).toBeVisible();

    const before = await countEmails(email);
    await row.getByRole('button', { name: `Enviar redefinição de senha a ${email}` }).click();
    await expect(page.getByText(`Enviámos um link e um código de redefinição para ${email}.`)).toBeVisible();
    await waitForEmail(email, before);

    await row.getByRole('button', { name: `Desativar ${email}` }).click();
    await expect(row).toContainText('Desativado');
  });
});

test.describe('Admin — perfis e permissões', () => {
  test('criar um perfil personalizado com a matriz de permissões', async ({ page }) => {
    await loginAdmin(page);
    await page.goto(`${ADMIN_URL}/roles`);
    await expect(page.getByTestId('role-card-ADMINISTRATOR')).toContainText('Sistema');

    await page.getByRole('button', { name: 'Novo perfil' }).click();
    const dialog = page.getByRole('dialog', { name: 'Novo perfil' });
    const name = `E2E_${uniqueSuffix().replace(/-/g, '_')}`.toUpperCase();
    await dialog.getByLabel('Nome do perfil').fill(name);
    await dialog.getByLabel('documents:read').check();
    await dialog.getByLabel('reports:read').check();
    await dialog.getByRole('button', { name: 'Criar perfil' }).click();
    await expect(dialog).toBeHidden({ timeout: 10_000 });

    const card = page.getByTestId(`role-card-${name}`);
    await expect(card).toContainText('2 permissões');
    await card.getByRole('button', { name: `Eliminar perfil ${name}` }).click();
    await expect(card).toBeHidden({ timeout: 10_000 });
  });
});

test.describe('Admin — servidor de email', () => {
  test.afterAll(async () => {
    // Repõe as variáveis de ambiente como fonte da configuração.
    const api = await adminApi();
    const current = (await (await api.get('/api/v1/admin/settings/email')).json()).data;
    await api.put('/api/v1/admin/settings/email', { data: { ...current, password: undefined, isEnabled: false } });
  });

  test('guardar SMTP e enviar email de teste', async ({ page }) => {
    await loginAdmin(page);
    await page.goto(`${ADMIN_URL}/settings`);
    await page.getByRole('tab', { name: 'Servidor de Email' }).click();

    await page.getByTestId('email-provider-SMTP').click();
    await page.getByLabel('Servidor (host)').fill('127.0.0.1');
    await page.getByLabel('Porta').fill('1025');
    await page.getByLabel('Nome do remetente').fill('VA OneGest E2E');
    await page.getByLabel('Email do remetente').fill('no-reply@accountable.local');
    await page.getByRole('button', { name: 'Guardar configuração' }).click();
    await expect(page.getByText('Configuração guardada.', { exact: true })).toBeVisible();
    await expect(page.getByText('Definida no painel')).toBeVisible();

    const to = `e2e-smtp-${uniqueSuffix()}@example.com`;
    await page.getByLabel('Destinatário').fill(to);
    await page.getByRole('button', { name: 'Enviar teste' }).click();
    await expect(page.getByTestId('email-test-result')).toContainText(`Email de teste enviado para ${to}`);
    const mail = await waitForEmail(to);
    expect(mail.subject).toContain('Teste');
  });

  test('Gmail mostra as instruções da palavra-passe de aplicação', async ({ page }) => {
    await loginAdmin(page);
    await page.goto(`${ADMIN_URL}/settings`);
    await page.getByRole('tab', { name: 'Servidor de Email' }).click();
    await page.getByTestId('email-provider-GMAIL').click();
    await expect(page.getByText(/palavra-passe de aplicação/).first()).toBeVisible();
    await expect(page.getByLabel('Conta Gmail')).toBeVisible();
    await expect(page.getByLabel('Servidor (host)')).toHaveCount(0);
  });
});

test.describe('Admin — subscrições (AOA) e dashboard', () => {
  test('criar subscrição para um cliente e cancelá-la', async ({ page }) => {
    const api = await adminApi();
    // Cliente novo e ativo, criado pela API pública + ativação por código.
    const email = `e2e-sub-${uniqueSuffix()}@example.com`;
    await api.post('/api/v1/auth/register', { data: { nip: `S${Date.now()}`.slice(0, 14), name: 'Cliente Subscrição E2E', email } });
    const activation = await waitForEmail(email);
    await api.post('/api/v1/auth/verify-email', { data: { email, code: activation.code } });

    await loginAdmin(page);
    await page.goto(`${ADMIN_URL}/subscriptions`);
    await expect(page.getByTestId('kpi-mrr')).toContainText('Kz');

    await page.getByRole('button', { name: 'Nova subscrição' }).click();
    const dialog = page.getByRole('dialog', { name: 'Nova subscrição' });
    await dialog.getByLabel('Pesquisar cliente').fill(email);
    await dialog.getByLabel('Cliente', { exact: true }).selectOption({ label: `Cliente Subscrição E2E — ${email}` });
    await dialog.getByLabel('Plano').selectOption({ label: 'Profissional' });
    await dialog.getByLabel('Ciclo de faturação').selectOption('ANNUAL');
    await expect(dialog.getByTestId('subscription-total')).toContainText('1 200 000');
    await dialog.getByRole('button', { name: 'Criar subscrição' }).click();
    await expect(dialog).toBeHidden({ timeout: 10_000 });

    const row = page.getByTestId(`subscription-row-${email}`);
    await expect(row).toContainText('Ativa');
    await expect(row).toContainText('Kz');

    await row.getByRole('button', { name: `Cancelar ${email}` }).click();
    await page.getByRole('alertdialog').getByRole('button', { name: 'Confirmar cancelamento' }).click();
    await expect(row).toContainText('Cancelada');
  });

  test('dashboard mostra indicadores e gráficos com dados reais (e vista de tabela)', async ({ page }) => {
    await loginAdmin(page);
    await expect(page.getByTestId('kpi-clients')).toBeVisible();
    await expect(page.getByTestId('kpi-documents')).toBeVisible();

    const clientsChart = page.getByTestId('chart-clients');
    await expect(clientsChart.locator('svg[role="img"]')).toBeVisible();
    await expect(clientsChart.locator('[data-testid="chart-hit"]')).toHaveCount(12);

    // Hover mostra tooltip com o mês e o valor.
    await clientsChart.locator('[data-testid="chart-hit"]').last().hover();
    await expect(clientsChart.getByRole('tooltip')).toContainText('Clientes');

    // Alternativa acessível: tabela com os 12 meses.
    await clientsChart.getByRole('button', { name: 'Ver tabela' }).click();
    await expect(clientsChart.locator('tbody tr')).toHaveCount(12);

    await expect(page.getByTestId('chart-documents')).toContainText('Criados');
    await expect(page.getByTestId('chart-documents')).toContainText('Concluídos');
    await expect(page.getByTestId('chart-status')).toBeVisible();
  });
});
