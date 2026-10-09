import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { randomUUID } from 'node:crypto';
import { ApiClient } from './helpers/api-client.js';
import type { ApiErrorBody } from './helpers/api-client.js';
import {
  createInternalUser,
  loginAsAdmin,
  loginAsSeededClient,
  loginAsUser,
  registerAndLoginNewClient,
} from './helpers/auth.js';
import { waitForNewEmail } from './helpers/mailhog.js';
import { db } from './helpers/db.js';

interface RoleDTO {
  id: string;
  name: string;
  isSystem: boolean;
  permissions: string[];
  usersCount: number;
}

let admin: ApiClient;
beforeAll(async () => {
  admin = (await loginAsAdmin()).client;
});

// ====================================================================
describe('Perfis e permissões', () => {
  it('lista o catálogo de permissões (inclui as novas de configurações/subscrições/relatórios)', async () => {
    const res = await admin.get<{ data: Array<{ name: string }> }>('/api/v1/roles/permissions');
    const names = res.body.data.map((p) => p.name);
    expect(names).toEqual(expect.arrayContaining(['settings:manage', 'subscriptions:manage', 'reports:read', 'roles:manage']));
  });

  it('perfil personalizado restringe o acesso exatamente às permissões escolhidas', async () => {
    const name = `LEITOR_${randomUUID().slice(0, 6).toUpperCase()}`;
    const created = await admin.post<{ data: RoleDTO }>('/api/v1/roles', {
      name,
      description: 'Só leitura de documentos e relatórios',
      permissions: ['documents:read', 'reports:read'],
    });
    expect(created.status).toBe(201);
    expect(created.body.data.isSystem).toBe(false);

    const email = `leitor-${randomUUID()}@accountable.local`;
    await admin.post('/api/v1/users', { name: 'Leitor', email, password: 'Leitor!2026', roleIds: [created.body.data.id] });
    const reader = await loginAsUser(email, 'Leitor!2026');

    expect((await reader.get('/api/v1/documents')).status).toBe(200);
    expect((await reader.get('/api/v1/admin/stats/overview')).status).toBe(200);
    expect((await reader.get('/api/v1/users')).status).toBe(403);
    expect((await reader.get('/api/v1/admin/settings/email')).status).toBe(403);

    // Com utilizadores atribuídos, o perfil não pode ser eliminado.
    const del = await admin.delete<ApiErrorBody>(`/api/v1/roles/${created.body.data.id}`);
    expect(del.status).toBe(422);
  });

  it('ADMINISTRATOR mantém todas as permissões; perfis de sistema não são eliminados', async () => {
    const roles = await admin.get<{ data: RoleDTO[] }>('/api/v1/roles');
    const adminRole = roles.body.data.find((r) => r.name === 'ADMINISTRATOR')!;
    expect(adminRole.isSystem).toBe(true);

    expect((await admin.patch(`/api/v1/roles/${adminRole.id}`, { permissions: ['documents:read'] })).status).toBe(422);
    expect((await admin.delete(`/api/v1/roles/${adminRole.id}`)).status).toBe(422);
  });

  it('nome de perfil inválido → 400; perfil sem utilizadores pode ser eliminado', async () => {
    expect((await admin.post('/api/v1/roles', { name: 'nome inválido', permissions: ['documents:read'] })).status).toBe(400);

    const name = `TEMP_${randomUUID().slice(0, 6).toUpperCase()}`;
    const created = await admin.post<{ data: RoleDTO }>('/api/v1/roles', { name, permissions: ['documents:read'] });
    expect((await admin.delete(`/api/v1/roles/${created.body.data.id}`)).status).toBe(200);
  });
});

// ====================================================================
describe('Gestão de utilizadores', () => {
  it('editar nome e perfis; desativar impede o login e termina as sessões', async () => {
    const { email, password, id } = await createInternalUser('SUPPORT');
    const session = await loginAsUser(email, password);

    const roles = await admin.get<{ data: RoleDTO[] }>('/api/v1/roles');
    const consultant = roles.body.data.find((r) => r.name === 'CONSULTANT')!;

    const updated = await admin.patch<{ data: { name: string; roles: string[] } }>(`/api/v1/users/${id}`, {
      name: 'Nome Atualizado',
      roleIds: [consultant.id],
    });
    expect(updated.status).toBe(200);
    expect(updated.body.data).toMatchObject({ name: 'Nome Atualizado', roles: ['CONSULTANT'] });

    // Mudança de perfis termina as sessões existentes.
    expect((await session.post('/api/v1/auth/refresh')).status).toBe(401);

    expect((await admin.patch(`/api/v1/users/${id}`, { isActive: false })).status).toBe(200);
    expect((await new ApiClient().post('/api/v1/auth/user/login', { email, password })).status).toBe(401);
  });

  it('o administrador não se pode desativar a si próprio', async () => {
    const me = await admin.get<{ data: { id: string } }>('/api/v1/auth/me');
    const res = await admin.patch<ApiErrorBody>(`/api/v1/users/${me.body.data.id}`, { isActive: false });
    expect(res.status).toBe(403);
  });

  it('pesquisa por nome/email e senha fraca é recusada', async () => {
    const { email } = await createInternalUser('SUPPORT');
    const search = await admin.get<{ data: Array<{ email: string }> }>(`/api/v1/users?search=${encodeURIComponent(email)}`);
    expect(search.body.data.map((u) => u.email)).toEqual([email]);

    const weak = await admin.post('/api/v1/users', {
      name: 'Fraca',
      email: `fraca-${randomUUID()}@accountable.local`,
      password: 'fraca',
      roleIds: [(await admin.get<{ data: RoleDTO[] }>('/api/v1/roles')).body.data[0]!.id],
    });
    expect(weak.status).toBe(400);
  });
});

// ====================================================================
describe('Servidor de email (Gmail / SMTP)', () => {
  afterAll(async () => {
    // Repõe o comportamento por omissão (variáveis de ambiente) para não afetar outros testes.
    await db.emailSettings.deleteMany();
  });

  it('guarda SMTP, nunca devolve a senha e o email de teste chega com o remetente configurado', async () => {
    const fromEmail = `remetente-${randomUUID().slice(0, 8)}@accountable.local`;
    const saved = await admin.put<{ data: Record<string, unknown> }>('/api/v1/admin/settings/email', {
      provider: 'SMTP',
      host: '127.0.0.1',
      port: 1025,
      secure: false,
      username: 'utilizador-smtp',
      password: 'senha-super-secreta',
      fromName: 'Contabilidade VA',
      fromEmail,
      isEnabled: true,
    });
    expect(saved.status).toBe(200);
    expect(saved.body.data).toMatchObject({ source: 'database', hasPassword: true, fromEmail });
    expect(JSON.stringify(saved.body)).not.toContain('senha-super-secreta');

    const row = await db.emailSettings.findUniqueOrThrow({ where: { id: 'default' } });
    expect(row.passwordEncrypted).not.toContain('senha-super-secreta');

    const to = `teste-smtp-${randomUUID()}@example.com`;
    const test = await admin.post<{ data: { success: boolean } }>('/api/v1/admin/settings/email/test', { to });
    expect(test.status).toBe(200);
    expect(test.body.data.success).toBe(true);

    const mail = await waitForNewEmail(to, 0, 'Teste de configuração');
    expect(mail.from).toContain(fromEmail);
  });

  it('servidor inacessível: o teste devolve 502 com a mensagem de erro, sem derrubar a API', async () => {
    await admin.put('/api/v1/admin/settings/email', {
      provider: 'SMTP',
      host: '127.0.0.1',
      port: 1,
      secure: false,
      fromName: 'X',
      fromEmail: 'x@accountable.local',
      isEnabled: true,
    });
    const res = await admin.post<{ data: { success: boolean; error: string } }>('/api/v1/admin/settings/email/test', {
      to: 'dest@example.com',
    });
    expect(res.status).toBe(502);
    expect(res.body.data.success).toBe(false);
    expect(res.body.data.error).toBeTruthy();
  });

  it('Gmail exige utilizador; consultor não acede às configurações', async () => {
    const gmail = await admin.put('/api/v1/admin/settings/email', {
      provider: 'GMAIL',
      host: 'x',
      port: 1,
      secure: false,
      fromName: 'X',
      fromEmail: 'x@gmail.com',
      isEnabled: true,
    });
    expect(gmail.status).toBe(400);

    const { email, password } = await createInternalUser('CONSULTANT');
    const consultant = await loginAsUser(email, password);
    expect((await consultant.get('/api/v1/admin/settings/email')).status).toBe(403);
  });

  it('permite configurar políticas de OTP (ativação e expirações) e valida limites no schema', async () => {
    const updateRes = await admin.put<{ data: Record<string, unknown> }>('/api/v1/admin/settings/email', {
      provider: 'SMTP',
      host: '127.0.0.1',
      port: 1025,
      secure: false,
      fromName: 'Contabilidade VA OTP',
      fromEmail: 'noreply-otp@accountable.local',
      isEnabled: true,
      otpEnabled: false,
      verificationExpiresHours: 48,
      passwordResetExpiresMinutes: 30,
    });
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data).toMatchObject({
      otpEnabled: false,
      verificationExpiresHours: 48,
      passwordResetExpiresMinutes: 30,
    });

    const getRes = await admin.get<{ data: Record<string, unknown> }>('/api/v1/admin/settings/email');
    expect(getRes.status).toBe(200);
    expect(getRes.body.data).toMatchObject({
      otpEnabled: false,
      verificationExpiresHours: 48,
      passwordResetExpiresMinutes: 30,
    });

    // Validações de limites inválidos
    const invalidHours = await admin.put('/api/v1/admin/settings/email', {
      provider: 'SMTP',
      host: '127.0.0.1',
      port: 1025,
      secure: false,
      fromName: 'X',
      fromEmail: 'x@x.ao',
      verificationExpiresHours: 0,
    });
    expect(invalidHours.status).toBe(400);

    const invalidMinutes = await admin.put('/api/v1/admin/settings/email', {
      provider: 'SMTP',
      host: '127.0.0.1',
      port: 1025,
      secure: false,
      fromName: 'X',
      fromEmail: 'x@x.ao',
      passwordResetExpiresMinutes: 200,
    });
    expect(invalidMinutes.status).toBe(400);
  });

  it('dispara emails de teste simulados (ativação e recuperação) com códigos OTP de 6 dígitos que chegam ao MailHog', async () => {
    // Configura o SMTP ativo para o MailHog
    await admin.put('/api/v1/admin/settings/email', {
      provider: 'SMTP',
      host: '127.0.0.1',
      port: 1025,
      secure: false,
      fromName: 'VA OneGest Testes',
      fromEmail: 'admin-otp-tests@accountable.local',
      isEnabled: true,
      otpEnabled: true,
      verificationExpiresHours: 24,
      passwordResetExpiresMinutes: 15,
    });

    // 1. Simulação de Ativação de Conta com OTP
    const toAct = `sim-ativacao-${randomUUID().slice(0, 8)}@example.com`;
    const testAct = await admin.post<{ data: { success: boolean; code?: string } }>(
      '/api/v1/admin/settings/email/test',
      { to: toAct, type: 'ACCOUNT_VERIFICATION' },
    );
    expect(testAct.status).toBe(200);
    expect(testAct.body.data.success).toBe(true);
    expect(testAct.body.data.code).toMatch(/^\d{6}$/);

    const mailAct = await waitForNewEmail(toAct, 0, 'Ative a sua conta');
    expect(mailAct.code).toBe(testAct.body.data.code);
    expect(mailAct.body).toContain('Código de verificação');

    // 2. Simulação de Recuperação de Senha com OTP
    const toRec = `sim-recuperacao-${randomUUID().slice(0, 8)}@example.com`;
    const testRec = await admin.post<{ data: { success: boolean; code?: string } }>(
      '/api/v1/admin/settings/email/test',
      { to: toRec, type: 'PASSWORD_RESET' },
    );
    expect(testRec.status).toBe(200);
    expect(testRec.body.data.success).toBe(true);
    expect(testRec.body.data.code).toMatch(/^\d{6}$/);

    const mailRec = await waitForNewEmail(toRec, 0, 'Recuperação de senha');
    expect(mailRec.code).toBe(testRec.body.data.code);
    expect(mailRec.body).toContain('Código de verificação');

    // 3. Rejeita tipo de teste inválido
    const invalidType = await admin.post('/api/v1/admin/settings/email/test', {
      to: toRec,
      type: 'TIPO_INEXISTENTE',
    });
    expect(invalidType.status).toBe(400);
  });
});

// ====================================================================
describe('Subscrições em AOA', () => {
  interface SubscriptionDTO {
    id: string;
    status: string;
    amount: number;
    currency: string;
    billingCycle: string;
    currentPeriodEnd: string;
    planName: string;
  }

  async function planId(name: string): Promise<string> {
    const plans = await admin.get<{ data: Array<{ id: string; name: string; currency: string }> }>('/api/v1/admin/plans');
    const plan = plans.body.data.find((p) => p.name === name)!;
    expect(plan.currency).toBe('AOA');
    return plan.id;
  }

  it('ciclo completo: criar (AOA) → cliente vê a sua → duplicado 409 → renovar → cancelar', async () => {
    const { client, clientId } = await registerAndLoginNewClient();
    const proId = await planId('Profissional');

    const created = await admin.post<{ data: SubscriptionDTO }>('/api/v1/admin/subscriptions', {
      clientId,
      planId: proId,
      billingCycle: 'MONTHLY',
    });
    expect(created.status).toBe(201);
    expect(created.body.data).toMatchObject({ amount: 125000, currency: 'AOA', status: 'ACTIVE', planName: 'Profissional' });

    const mine = await client.get<{ data: SubscriptionDTO }>('/api/v1/subscriptions/me');
    expect(mine.body.data.id).toBe(created.body.data.id);

    const dup = await admin.post('/api/v1/admin/subscriptions', { clientId, planId: proId });
    expect(dup.status).toBe(409);

    const renewed = await admin.post<{ data: SubscriptionDTO }>(`/api/v1/admin/subscriptions/${created.body.data.id}/renew`);
    expect(new Date(renewed.body.data.currentPeriodEnd).getTime()).toBeGreaterThan(
      new Date(created.body.data.currentPeriodEnd).getTime(),
    );

    const annual = await admin.patch<{ data: SubscriptionDTO }>(`/api/v1/admin/subscriptions/${created.body.data.id}`, {
      billingCycle: 'ANNUAL',
    });
    expect(annual.body.data.amount).toBe(1_200_000);

    const cancelled = await admin.patch<{ data: SubscriptionDTO }>(`/api/v1/admin/subscriptions/${created.body.data.id}`, {
      status: 'CANCELLED',
    });
    expect(cancelled.body.data.status).toBe('CANCELLED');
    expect((await client.get<{ data: null }>('/api/v1/subscriptions/me')).body.data).toBeNull();

    const listed = await admin.get<{ data: SubscriptionDTO[] }>(`/api/v1/admin/subscriptions?clientId=${clientId}`);
    expect(listed.body.data).toHaveLength(1);
  });

  it('Enterprise (sem preço) exige valor acordado', async () => {
    const { clientId } = await registerAndLoginNewClient();
    const entId = await planId('Enterprise');

    expect((await admin.post('/api/v1/admin/subscriptions', { clientId, planId: entId })).status).toBe(400);
    const ok = await admin.post<{ data: SubscriptionDTO }>('/api/v1/admin/subscriptions', {
      clientId,
      planId: entId,
      customAmount: 950000,
    });
    expect(ok.body.data.amount).toBe(950000);
  });

  it('permissões: consultor lê mas não gere; cliente não acede ao admin', async () => {
    const { email, password } = await createInternalUser('CONSULTANT');
    const consultant = await loginAsUser(email, password);
    expect((await consultant.get('/api/v1/admin/subscriptions')).status).toBe(200);
    expect((await consultant.post('/api/v1/admin/subscriptions', {})).status).toBe(403);

    const { client } = await loginAsSeededClient();
    expect((await client.get('/api/v1/admin/subscriptions')).status).toBe(403);
  });
});

// ====================================================================
describe('Estatísticas do painel', () => {
  it('séries de 12 meses calculadas na BD, refletindo novos registos', async () => {
    const before = await admin.get<{ data: { totals: { clients: number }; clientsPerMonth: Array<{ month: string; count: number }> } }>(
      '/api/v1/admin/stats/overview',
    );
    await registerAndLoginNewClient();
    const after = await admin.get<{
      data: {
        totals: { clients: number; monthlyRecurringRevenue: number };
        clientsPerMonth: Array<{ month: string; count: number }>;
        documentsPerMonth: Array<{ month: string; created: number; completed: number }>;
      };
    }>('/api/v1/admin/stats/overview');

    expect(after.status).toBe(200);
    expect(after.body.data.clientsPerMonth).toHaveLength(12);
    expect(after.body.data.documentsPerMonth).toHaveLength(12);
    expect(after.body.data.totals.clients).toBe(before.body.data.totals.clients + 1);
    expect(after.body.data.clientsPerMonth.at(-1)!.count).toBe(before.body.data.clientsPerMonth.at(-1)!.count + 1);
    expect(after.body.data.totals.monthlyRecurringRevenue).toBeGreaterThanOrEqual(0);
  });

  it('SUPPORT (sem reports:read) → 403', async () => {
    const { email, password } = await createInternalUser('SUPPORT');
    expect((await (await loginAsUser(email, password)).get('/api/v1/admin/stats/overview')).status).toBe(403);
  });
});
