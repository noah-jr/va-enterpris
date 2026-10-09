import { describe, it, expect } from 'vitest';
import { createHash, randomUUID } from 'node:crypto';
import { ApiClient } from './helpers/api-client.js';
import type { ApiErrorBody } from './helpers/api-client.js';
import {
  createInternalUser,
  loginAsAdmin,
  loginAsUser,
  registerAndLoginNewClient,
} from './helpers/auth.js';
import { findLatestTokenForEmail } from './helpers/mailhog.js';
import { SEEDED_ADMIN } from './helpers/constants.js';
import { db } from './helpers/db.js';

const sha256 = (v: string) => createHash('sha256').update(v).digest('hex');

describe('Sessão — cookies e ausência de tokens no corpo', () => {
  it('login não devolve tokens no JSON; sessão vive em cookies httpOnly com paths corretos', async () => {
    const client = new ApiClient();
    const res = await client.post<{ data: Record<string, unknown> }>('/api/v1/auth/user/login', SEEDED_ADMIN);

    expect(res.status).toBe(200);
    expect(res.body.data).not.toHaveProperty('accessToken');
    expect(res.body.data).not.toHaveProperty('refreshToken');

    const setCookies = res.headers.getSetCookie();
    const access = setCookies.find((c) => c.startsWith('access_token='));
    const refresh = setCookies.find((c) => c.startsWith('refresh_token=') && !c.includes('Expires=Thu, 01 Jan 1970'));

    expect(access).toMatch(/HttpOnly/i);
    expect(access).toMatch(/Path=\//);
    expect(access).toMatch(/SameSite=Lax/i);
    // O refresh token só é enviado para os endpoints de auth.
    expect(refresh).toMatch(/Path=\/api\/v1\/auth/);
    expect(refresh).toMatch(/HttpOnly/i);
  });

  it('o header Authorization: Bearer é ignorado (só cookies autenticam)', async () => {
    const admin = new ApiClient();
    const login = await admin.post('/api/v1/auth/user/login', SEEDED_ADMIN);
    const accessCookie = login.headers.getSetCookie().find((c) => c.startsWith('access_token='))!;
    const token = accessCookie.split(';')[0]!.split('=')[1]!;

    const anonymous = new ApiClient();
    const res = await anonymous.get('/api/v1/auth/me', { authorization: `Bearer ${token}` });
    expect(res.status).toBe(401);
  });
});

describe('Refresh token — rotação, revogação e reutilização', () => {
  it('cada refresh roda a sessão: o token antigo deixa de funcionar', async () => {
    const client = new ApiClient();
    await client.post('/api/v1/auth/user/login', SEEDED_ADMIN);
    const firstRefresh = client.getCookie('refresh_token')!.value;

    const r1 = await client.post('/api/v1/auth/refresh');
    expect(r1.status).toBe(200);
    const secondRefresh = client.getCookie('refresh_token')!.value;
    expect(secondRefresh).not.toBe(firstRefresh);

    // Um atacante com o refresh antigo não consegue renovar.
    const attacker = new ApiClient();
    attacker.setCookie('refresh_token', firstRefresh, '/api/v1/auth');
    const replay = await attacker.post('/api/v1/auth/refresh');
    expect(replay.status).toBe(401);

    // Dentro da janela de tolerância, o legítimo continua com sessão válida.
    const me = await client.get('/api/v1/auth/me');
    expect(me.status).toBe(200);
  });

  it('reutilização de refresh token rodado fora da janela revoga TODA a família (roubo detetado)', async () => {
    const victim = new ApiClient();
    await victim.post('/api/v1/auth/user/login', SEEDED_ADMIN);
    const stolen = victim.getCookie('refresh_token')!.value;

    await victim.post('/api/v1/auth/refresh');

    // Simula que a rotação ocorreu há mais de 30s.
    const stolenJti = JSON.parse(Buffer.from(stolen.split('.')[1]!, 'base64url').toString()).jti as string;
    await db.refreshSession.update({
      where: { id: stolenJti },
      data: { revokedAt: new Date(Date.now() - 120_000) },
    });

    const attacker = new ApiClient();
    attacker.setCookie('refresh_token', stolen, '/api/v1/auth');
    expect((await attacker.post('/api/v1/auth/refresh')).status).toBe(401);

    // A sessão legítima também foi terminada — obriga a novo login.
    const victimRefresh = await victim.post('/api/v1/auth/refresh');
    expect(victimRefresh.status).toBe(401);
  });

  it('logout revoga a sessão no servidor (não apenas apaga o cookie)', async () => {
    const client = new ApiClient();
    await client.post('/api/v1/auth/user/login', SEEDED_ADMIN);
    const refresh = client.getCookie('refresh_token')!.value;

    expect((await client.post('/api/v1/auth/logout')).status).toBe(200);
    expect(client.getCookie('access_token')).toBeUndefined();

    const replay = new ApiClient();
    replay.setCookie('refresh_token', refresh, '/api/v1/auth');
    expect((await replay.post('/api/v1/auth/refresh')).status).toBe(401);
  });

  it('refresh sem cookie → 401', async () => {
    const res = await new ApiClient().post<ApiErrorBody>('/api/v1/auth/refresh');
    expect(res.status).toBe(401);
  });

  it('refresh reflete alterações de conta: utilizador desativado não renova', async () => {
    const { email, password, id } = await createInternalUser('SUPPORT');
    const user = await loginAsUser(email, password);

    await db.user.update({ where: { id }, data: { isActive: false } });

    expect((await user.post('/api/v1/auth/refresh')).status).toBe(401);
  });
});

describe('Bloqueio de cliente termina as sessões', () => {
  it('cliente bloqueado não consegue renovar a sessão nem voltar a entrar', async () => {
    const { client, clientId, email, password } = await registerAndLoginNewClient();
    const { client: admin } = await loginAsAdmin();

    const block = await admin.patch(`/api/v1/clients/${clientId}/block`, { reason: 'Teste de integração' });
    expect(block.status).toBe(200);

    expect((await client.post('/api/v1/auth/refresh')).status).toBe(401);

    const relogin = await new ApiClient().post<ApiErrorBody>('/api/v1/auth/client/login', { email, password });
    expect(relogin.status).toBe(401);

    const sessions = await db.refreshSession.findMany({ where: { subjectId: clientId, revokedAt: null } });
    expect(sessions).toHaveLength(0);
  });
});

describe('Login — sem enumeração de contas', () => {
  it('conta por verificar com senha errada recebe o mesmo erro que email inexistente', async () => {
    const email = `pending-${randomUUID()}@example.com`;
    await new ApiClient().post('/api/v1/auth/register', { nip: `P${Date.now()}`.slice(0, 20), name: 'Pendente', email });

    const unverified = await new ApiClient().post<ApiErrorBody>('/api/v1/auth/client/login', {
      email,
      password: 'Errada!2026',
    });
    const unknown = await new ApiClient().post<ApiErrorBody>('/api/v1/auth/client/login', {
      email: `nao-existe-${randomUUID()}@example.com`,
      password: 'Errada!2026',
    });

    expect(unverified.status).toBe(401);
    expect(unknown.status).toBe(401);
    expect(unverified.body.message).toBe(unknown.body.message);
  });
});

describe('Tokens de email — hash em repouso e uso único', () => {
  it('o token de verificação é guardado apenas como SHA-256', async () => {
    const email = `hash-${randomUUID()}@example.com`;
    const reg = await new ApiClient().post<{ data: { clientId: string } }>('/api/v1/auth/register', {
      nip: `H${Date.now()}`.slice(0, 20),
      name: 'Hash Test',
      email,
    });
    const token = await findLatestTokenForEmail(email);

    const rows = await db.emailVerificationToken.findMany({ where: { clientId: reg.body.data.clientId } });
    expect(rows).toHaveLength(1);
    expect(rows[0]!.tokenHash).toBe(sha256(token));
    expect(rows[0]!.tokenHash).not.toBe(token);
  });

  it('VULNERABILIDADE CORRIGIDA: o link de verificação não permite redefinir a senha depois de definida', async () => {
    const { email, password } = await registerAndLoginNewClient();
    const token = await findLatestTokenForEmail(email);

    const hijack = await new ApiClient().post<ApiErrorBody>('/api/v1/auth/set-password', {
      token,
      password: 'Atacante!2026',
      confirmPassword: 'Atacante!2026',
    });
    expect(hijack.status).toBe(401);
    expect(hijack.body.message).toMatch(/já foi definida/);

    // A senha original continua a funcionar e a do "atacante" não.
    expect((await new ApiClient().post('/api/v1/auth/client/login', { email, password })).status).toBe(200);
    expect(
      (await new ApiClient().post('/api/v1/auth/client/login', { email, password: 'Atacante!2026' })).status,
    ).toBe(401);
  });

  it('recuperação de senha: redefine, invalida o token e termina sessões existentes', async () => {
    const { client, email } = await registerAndLoginNewClient();

    // Token do email de verificação — capturado ANTES de pedir o reset.
    const verificationToken = await findLatestTokenForEmail(email);

    const forgot = await new ApiClient().post('/api/v1/auth/forgot-password', { email });
    expect(forgot.status).toBe(200);

    let resetToken: string | undefined;
    const deadline = Date.now() + 10_000;
    while (Date.now() < deadline) {
      const candidate = await findLatestTokenForEmail(email);
      if (candidate !== verificationToken) {
        resetToken = candidate;
        break;
      }
      await new Promise((r) => setTimeout(r, 300));
    }
    expect(resetToken).toBeDefined();

    const newPassword = 'NovaSenha!2027';
    const reset = await new ApiClient().post('/api/v1/auth/reset-password', {
      token: resetToken,
      password: newPassword,
      confirmPassword: newPassword,
    });
    expect(reset.status).toBe(200);

    // Sessão anterior perdeu a capacidade de renovar.
    expect((await client.post('/api/v1/auth/refresh')).status).toBe(401);

    // Token de reset é de uso único.
    const reuse = await new ApiClient().post('/api/v1/auth/reset-password', {
      token: resetToken,
      password: 'Outra!2028',
      confirmPassword: 'Outra!2028',
    });
    expect(reuse.status).toBe(401);

    expect((await new ApiClient().post('/api/v1/auth/client/login', { email, password: newPassword })).status).toBe(200);
  });
});

describe('/auth/me reflete o estado atual (não o token)', () => {
  it('permissões vêm da base de dados', async () => {
    const { client } = await loginAsAdmin();
    const me = await client.get<{ data: { permissions: string[]; roles: string[] } }>('/api/v1/auth/me');
    expect(me.status).toBe(200);
    expect(me.body.data.roles).toContain('ADMINISTRATOR');
    expect(me.body.data.permissions).toContain('users:create');
  });
});
