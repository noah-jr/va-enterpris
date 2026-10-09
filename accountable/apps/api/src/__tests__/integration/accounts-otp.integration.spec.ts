import { describe, it, expect } from 'vitest';
import { randomUUID } from 'node:crypto';
import { ApiClient } from './helpers/api-client.js';
import type { ApiErrorBody } from './helpers/api-client.js';
import { loginAsAdmin, registerAndLoginNewClient } from './helpers/auth.js';
import { countEmailsTo, waitForNewEmail } from './helpers/mailhog.js';

async function registerClient(): Promise<{ email: string }> {
  const email = `otp-${randomUUID()}@example.com`;
  const res = await new ApiClient().post('/api/v1/auth/register', {
    nip: `O${Date.now()}`.slice(0, 20),
    name: 'Cliente OTP',
    email,
  });
  expect(res.status).toBe(201);
  return { email };
}

describe('Ativação de conta por código OTP', () => {
  it('o email de ativação traz link E código; ativação com o código → definir senha → login', async () => {
    const { email } = await registerClient();
    const mail = await waitForNewEmail(email, 0, 'Ative a sua conta');

    expect(mail.token).toMatch(/^[0-9a-f]{64}$/);
    expect(mail.code).toMatch(/^\d{6}$/);

    const client = new ApiClient();
    const verify = await client.post<{ data: { setupToken: string } }>('/api/v1/auth/verify-email', {
      email,
      code: mail.code,
    });
    expect(verify.status).toBe(200);
    const setupToken = verify.body.data.setupToken;
    expect(setupToken).not.toBe(mail.token);

    // O link do email já não serve depois de ativar por código.
    expect((await new ApiClient().post('/api/v1/auth/verify-email', { token: mail.token })).status).toBe(401);

    const password = 'SenhaOtp!2026';
    expect(
      (await client.post('/api/v1/auth/set-password', { token: setupToken, password, confirmPassword: password })).status,
    ).toBe(200);
    expect((await new ApiClient().post('/api/v1/auth/client/login', { email, password })).status).toBe(200);
  });

  it('5 códigos errados bloqueiam o código; é preciso pedir um novo', async () => {
    const { email } = await registerClient();
    const mail = await waitForNewEmail(email, 0, 'Ative a sua conta');
    const wrong = mail.code === '000000' ? '111111' : '000000';

    const messages: string[] = [];
    for (let i = 0; i < 5; i++) {
      const res = await new ApiClient().post<ApiErrorBody>('/api/v1/auth/verify-email', { email, code: wrong });
      expect(res.status).toBe(401);
      messages.push(res.body.message);
    }
    expect(messages[0]).toMatch(/Restam 4/);
    expect(messages[4]).toMatch(/Demasiadas tentativas/);

    const blocked = await new ApiClient().post<ApiErrorBody>('/api/v1/auth/verify-email', { email, code: mail.code });
    expect(blocked.status).toBe(401);

    // Reenviar gera um código novo que funciona.
    const before = await countEmailsTo(email);
    expect((await new ApiClient().post('/api/v1/auth/resend-verification', { email })).status).toBe(200);
    const fresh = await waitForNewEmail(email, before, 'Ative a sua conta');
    expect((await new ApiClient().post('/api/v1/auth/verify-email', { email, code: fresh.code })).status).toBe(200);
  });

  it('reenviar para email inexistente responde igual (sem enumeração) e não envia nada', async () => {
    const email = `nao-existe-${randomUUID()}@example.com`;
    const res = await new ApiClient().post<{ message: string }>('/api/v1/auth/resend-verification', { email });
    expect(res.status).toBe(200);
    await new Promise((r) => setTimeout(r, 800));
    expect(await countEmailsTo(email)).toBe(0);
  });

  it('código com formato inválido → 400', async () => {
    const res = await new ApiClient().post('/api/v1/auth/verify-email', { email: 'x@example.com', code: '12ab' });
    expect(res.status).toBe(400);
  });
});

describe('Recuperação de senha do cliente por código OTP', () => {
  it('forgot → email com link e código → reset com email + código → login com a nova senha', async () => {
    const { email, password } = await registerAndLoginNewClient();
    const before = await countEmailsTo(email);

    expect((await new ApiClient().post('/api/v1/auth/forgot-password', { email })).status).toBe(200);
    const mail = await waitForNewEmail(email, before, 'Recuperação de senha');
    expect(mail.code).toMatch(/^\d{6}$/);
    expect(mail.body).toContain('15 minutos');

    const newPassword = 'NovaSenhaOtp!2027';
    const reset = await new ApiClient().post('/api/v1/auth/reset-password', {
      email,
      code: mail.code,
      password: newPassword,
      confirmPassword: newPassword,
    });
    expect(reset.status).toBe(200);

    expect((await new ApiClient().post('/api/v1/auth/client/login', { email, password })).status).toBe(401);
    expect((await new ApiClient().post('/api/v1/auth/client/login', { email, password: newPassword })).status).toBe(200);
  });

  it('reset sem token e sem código → 400', async () => {
    const res = await new ApiClient().post('/api/v1/auth/reset-password', {
      email: 'x@example.com',
      password: 'Valida!2026',
      confirmPassword: 'Valida!2026',
    });
    expect(res.status).toBe(400);
  });
});

describe('Alteração da própria senha', () => {
  it('exige a senha atual; a sessão atual continua ativa e a senha antiga deixa de funcionar', async () => {
    const { client, email, password } = await registerAndLoginNewClient();

    const wrong = await client.post('/api/v1/auth/change-password', {
      currentPassword: 'errada',
      newPassword: 'Alterada!2026',
      confirmPassword: 'Alterada!2026',
    });
    expect(wrong.status).toBe(401);

    const ok = await client.post('/api/v1/auth/change-password', {
      currentPassword: password,
      newPassword: 'Alterada!2026',
      confirmPassword: 'Alterada!2026',
    });
    expect(ok.status).toBe(200);

    expect((await client.get('/api/v1/auth/me')).status).toBe(200);
    expect((await client.post('/api/v1/auth/refresh')).status).toBe(200);
    expect((await new ApiClient().post('/api/v1/auth/client/login', { email, password })).status).toBe(401);
  });
});

describe('Utilizadores internos — convite e recuperação de senha', () => {
  async function consultantRoleId(admin: ApiClient): Promise<string> {
    const roles = await admin.get<{ data: Array<{ id: string; name: string }> }>('/api/v1/roles');
    return roles.body.data.find((r) => r.name === 'CONSULTANT')!.id;
  }

  it('criar sem senha envia convite; o convidado define a senha pelo link e entra no painel', async () => {
    const { client: admin } = await loginAsAdmin();
    const email = `convite-${randomUUID()}@accountable.local`;

    const created = await admin.post<{ data: { id: string; name: string } }>('/api/v1/users', {
      name: 'Convidado Integração',
      email,
      roleIds: [await consultantRoleId(admin)],
    });
    expect(created.status).toBe(201);
    expect(created.body.data.name).toBe('Convidado Integração');

    const invite = await waitForNewEmail(email, 0, 'Convite');
    expect(invite.body).toContain('invite=1');
    expect(invite.code).toMatch(/^\d{6}$/);

    const password = 'Convidado!2026';
    const reset = await new ApiClient().post('/api/v1/auth/user/reset-password', {
      token: invite.token,
      password,
      confirmPassword: password,
    });
    expect(reset.status).toBe(200);

    const login = await new ApiClient().post<{ data: { roles: string[] } }>('/api/v1/auth/user/login', { email, password });
    expect(login.status).toBe(200);
    expect(login.body.data.roles).toEqual(['CONSULTANT']);
  });

  it('esqueci-me da senha (painel) por código OTP', async () => {
    const { client: admin } = await loginAsAdmin();
    const email = `staff-${randomUUID()}@accountable.local`;
    await admin.post('/api/v1/users', {
      name: 'Staff',
      email,
      password: 'Inicial!2026',
      roleIds: [await consultantRoleId(admin)],
    });

    expect((await new ApiClient().post('/api/v1/auth/user/forgot-password', { email })).status).toBe(200);
    const mail = await waitForNewEmail(email, 0, 'Recuperação de senha');
    expect(mail.body).toContain('5174/reset-password');

    const reset = await new ApiClient().post('/api/v1/auth/user/reset-password', {
      email,
      code: mail.code,
      password: 'Recuperada!2026',
      confirmPassword: 'Recuperada!2026',
    });
    expect(reset.status).toBe(200);
    expect(
      (await new ApiClient().post('/api/v1/auth/user/login', { email, password: 'Recuperada!2026' })).status,
    ).toBe(200);
  });

  it('o administrador pode enviar um link de redefinição a um utilizador', async () => {
    const { client: admin } = await loginAsAdmin();
    const email = `reset-by-admin-${randomUUID()}@accountable.local`;
    const created = await admin.post<{ data: { id: string } }>('/api/v1/users', {
      name: 'Precisa Reset',
      email,
      password: 'Inicial!2026',
      roleIds: [await consultantRoleId(admin)],
    });

    const res = await admin.post(`/api/v1/users/${created.body.data.id}/send-password-reset`);
    expect(res.status).toBe(200);
    await waitForNewEmail(email, 0, 'Recuperação de senha');
  });
});
