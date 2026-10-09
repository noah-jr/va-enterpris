/**
 * Testes de integração — Recuperação e Criação de Senha
 *
 * Requerem MySQL + MailHog a correr:
 *   docker compose -f docker/compose.yml up -d mysql mailhog
 *   pnpm --filter api db:migrate && pnpm --filter api db:seed
 *
 * Correr: pnpm test:integration (ou pnpm vitest run --project integration)
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { randomUUID } from 'node:crypto';
import { ApiClient } from './helpers/api-client.js';
import type { ApiErrorBody } from './helpers/api-client.js';
import { countEmailsTo, waitForNewEmail } from './helpers/mailhog.js';
import { SEEDED_ADMIN } from './helpers/constants.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface LoginResponse {
  data: { userId: string; userType: 'client' | 'user'; roles: string[]; permissions: string[] };
  message: string;
}

interface RegisterResponse {
  data: { id: string; email: string };
  message: string;
}

interface VerifyEmailResponse {
  data: { setupToken: string };
  message: string;
}

interface GenericResponse {
  data: null;
  message: string;
}

/** Regista um cliente novo e devolve email + api client com sessão activa. */
async function registerAndActivate(
  email: string,
  password = 'Senha!Forte2026',
): Promise<ApiClient> {
  const client = new ApiClient();
  const nip = `NIP${Date.now()}`.slice(0, 20);

  const reg = await client.post<RegisterResponse>('/api/v1/auth/register', {
    nip,
    name: 'Cliente Integração',
    email,
  });
  expect(reg.status, 'registo deve retornar 201').toBe(201);

  // Aguarda email de activação
  const email0 = await waitForNewEmail(email, 0, 'Ative');
  expect(email0.token, 'email deve conter um token').not.toBeNull();
  const verifyToken = email0.token!;

  const verify = await client.post<VerifyEmailResponse>('/api/v1/auth/verify-email', {
    token: verifyToken,
  });
  expect(verify.status, 'verificação deve retornar 200').toBe(200);
  expect(verify.body.data.setupToken, 'deve devolver setupToken').toBeDefined();

  // Define primeira senha
  const set = await client.post<GenericResponse>('/api/v1/auth/set-password', {
    token: verify.body.data.setupToken,
    password,
    confirmPassword: password,
  });
  expect(set.status, 'set-password deve retornar 200').toBe(200);

  // Login com as credenciais recém-criadas
  const login = await client.post<LoginResponse>('/api/v1/auth/client/login', { email, password });
  expect(login.status, 'login deve retornar 200').toBe(200);
  expect(login.body.data.userType).toBe('client');

  return client;
}

// ---------------------------------------------------------------------------
// Recuperação de senha — Clientes
// ---------------------------------------------------------------------------

describe('Recuperação de senha — Cliente', () => {
  let email: string;
  let password: string;

  beforeAll(async () => {
    email = `reset-cliente-${randomUUID()}@example.com`;
    password = 'SenhaInicial!2026';
    await registerAndActivate(email, password);
  });

  it('forgot-password responde com mensagem genérica sem revelar se o email existe', async () => {
    const client = new ApiClient();

    const knownRes = await client.post<GenericResponse>('/api/v1/auth/forgot-password', { email });
    const unknownRes = await client.post<GenericResponse>('/api/v1/auth/forgot-password', {
      email: `ninguem-${randomUUID()}@nulo.com`,
    });

    // Ambos devem ter status 200 e a mesma mensagem
    expect(knownRes.status).toBe(200);
    expect(unknownRes.status).toBe(200);
    expect(knownRes.body.message).toBe(unknownRes.body.message);
  });

  it('recuperação via link — redefine senha e termina sessões anteriores', async () => {
    const count = await countEmailsTo(email);

    // Pede reset
    const forgot = await new ApiClient().post<GenericResponse>('/api/v1/auth/forgot-password', {
      email,
    });
    expect(forgot.status).toBe(200);

    // Aguarda email de reset
    const resetEmail = await waitForNewEmail(email, count, 'Recuperação');
    expect(resetEmail.token, 'email de reset deve conter token').not.toBeNull();
    const resetToken = resetEmail.token!;

    // Login antes do reset (para garantir que a sessão vai ser terminada)
    const oldSession = new ApiClient();
    const oldLogin = await oldSession.post<LoginResponse>('/api/v1/auth/client/login', {
      email,
      password,
    });
    expect(oldLogin.status).toBe(200);

    const newPassword = 'NovaSenha!2026';

    // Redefine via link
    const reset = await new ApiClient().post<GenericResponse>('/api/v1/auth/reset-password', {
      token: resetToken,
      password: newPassword,
      confirmPassword: newPassword,
    });
    expect(reset.status, 'reset deve retornar 200').toBe(200);

    // A sessão anterior deve ter sido terminada (refresh falha)
    const refreshRes = await oldSession.post('/api/v1/auth/refresh');
    expect(refreshRes.status, 'sessão antiga deve ser inválida após reset').toBe(401);

    // Login com a nova senha funciona
    const newLogin = await new ApiClient().post<LoginResponse>('/api/v1/auth/client/login', {
      email,
      password: newPassword,
    });
    expect(newLogin.status, 'nova senha deve permitir login').toBe(200);

    // Password anterior já não funciona
    const oldAttempt = await new ApiClient().post<ApiErrorBody>('/api/v1/auth/client/login', {
      email,
      password,
    });
    expect(oldAttempt.status, 'senha antiga deve ser rejeitada').toBe(401);

    // Actualiza para os testes seguintes poderem fazer login
    password = newPassword;
  });

  it('o link de reset é de uso único', async () => {
    const count = await countEmailsTo(email);
    await new ApiClient().post('/api/v1/auth/forgot-password', { email });
    const resetEmail = await waitForNewEmail(email, count, 'Recuperação');
    const token = resetEmail.token!;

    // Primeiro uso — OK
    await new ApiClient().post('/api/v1/auth/reset-password', {
      token,
      password: 'Senha2!2026',
      confirmPassword: 'Senha2!2026',
    });
    password = 'Senha2!2026';

    // Segundo uso — deve falhar
    const secondUse = await new ApiClient().post<ApiErrorBody>('/api/v1/auth/reset-password', {
      token,
      password: 'Senha3!2026',
      confirmPassword: 'Senha3!2026',
    });
    expect(secondUse.status, 'reutilização do token deve retornar 401').toBe(401);
  });

  it('recuperação via código OTP — redefine senha sem o link', async () => {
    const count = await countEmailsTo(email);
    await new ApiClient().post('/api/v1/auth/forgot-password', { email });
    const resetEmail = await waitForNewEmail(email, count, 'Recuperação');

    expect(resetEmail.code, 'email deve conter código OTP de 6 dígitos').not.toBeNull();
    expect(resetEmail.code).toMatch(/^\d{6}$/);

    const newPassword = 'SenhaOtp!2026';
    const reset = await new ApiClient().post<GenericResponse>('/api/v1/auth/reset-password', {
      email,
      code: resetEmail.code,
      password: newPassword,
      confirmPassword: newPassword,
    });
    expect(reset.status, 'reset via OTP deve retornar 200').toBe(200);

    // Login com nova senha
    const login = await new ApiClient().post<LoginResponse>('/api/v1/auth/client/login', {
      email,
      password: newPassword,
    });
    expect(login.status).toBe(200);
    password = newPassword;
  });

  it('pedir um novo reset invalida o código anterior', async () => {
    const count = await countEmailsTo(email);
    await new ApiClient().post('/api/v1/auth/forgot-password', { email });
    const first = await waitForNewEmail(email, count, 'Recuperação');

    // Pede novo reset
    await new ApiClient().post('/api/v1/auth/forgot-password', { email });

    // Tenta usar o código anterior — deve falhar
    const stale = await new ApiClient().post<ApiErrorBody>('/api/v1/auth/reset-password', {
      email,
      code: first.code,
      password: 'SenhaVelha!2026',
      confirmPassword: 'SenhaVelha!2026',
    });
    expect(stale.status, 'código antigo deve ser rejeitado').toBe(401);
  });
});

// ---------------------------------------------------------------------------
// Recuperação de senha — Utilizadores internos (painel admin)
// ---------------------------------------------------------------------------

describe('Recuperação de senha — Utilizador interno (admin)', () => {
  it('forgot-password de user responde com mensagem genérica', async () => {
    const res = await new ApiClient().post<GenericResponse>('/api/v1/auth/user/forgot-password', {
      email: SEEDED_ADMIN.email,
    });
    expect(res.status).toBe(200);
    expect(res.body.message).toBeTruthy();
  });

  it('email inexistente de user responde com a mesma mensagem (sem enumeração)', async () => {
    const known = await new ApiClient().post<GenericResponse>(
      '/api/v1/auth/user/forgot-password',
      { email: SEEDED_ADMIN.email },
    );
    const unknown = await new ApiClient().post<GenericResponse>(
      '/api/v1/auth/user/forgot-password',
      { email: `ninguem-${randomUUID()}@nulo.com` },
    );
    expect(known.body.message).toBe(unknown.body.message);
  });

  it('recuperação do admin via link redefine senha e revoga sessões', async () => {
    const count = await countEmailsTo(SEEDED_ADMIN.email);
    await new ApiClient().post('/api/v1/auth/user/forgot-password', {
      email: SEEDED_ADMIN.email,
    });

    const resetEmail = await waitForNewEmail(SEEDED_ADMIN.email, count, 'Recuperação');
    expect(resetEmail.token).not.toBeNull();

    const oldSession = new ApiClient();
    await oldSession.post<LoginResponse>('/api/v1/auth/user/login', SEEDED_ADMIN);

    const newPassword = `Admin!${Date.now()}`;
    const reset = await new ApiClient().post<GenericResponse>('/api/v1/auth/user/reset-password', {
      token: resetEmail.token,
      password: newPassword,
      confirmPassword: newPassword,
    });
    expect(reset.status).toBe(200);

    // Sessão anterior inválida
    const refresh = await oldSession.post('/api/v1/auth/refresh');
    expect(refresh.status).toBe(401);

    // Repõe a senha original para não quebrar outros testes
    const count2 = await countEmailsTo(SEEDED_ADMIN.email);
    await new ApiClient().post('/api/v1/auth/user/forgot-password', {
      email: SEEDED_ADMIN.email,
    });
    const restoreEmail = await waitForNewEmail(SEEDED_ADMIN.email, count2, 'Recuperação');

    await new ApiClient().post('/api/v1/auth/user/reset-password', {
      token: restoreEmail.token,
      password: SEEDED_ADMIN.password,
      confirmPassword: SEEDED_ADMIN.password,
    });
  });
});

// ---------------------------------------------------------------------------
// Mudança de senha autenticada (change-password)
// ---------------------------------------------------------------------------

describe('Mudança de senha autenticada — Cliente', () => {
  let email: string;
  let password: string;

  beforeAll(async () => {
    email = `change-pwd-${randomUUID()}@example.com`;
    password = 'SenhaActual!2026';
    await registerAndActivate(email, password);
  });

  it('muda a senha com sucesso e renova a sessão activa', async () => {
    const client = new ApiClient();
    await client.post<LoginResponse>('/api/v1/auth/client/login', { email, password });

    const newPassword = 'SenhaNova!2026';
    const change = await client.post<GenericResponse>('/api/v1/auth/change-password', {
      currentPassword: password,
      newPassword,
      confirmPassword: newPassword,
    });
    expect(change.status).toBe(200);
    password = newPassword;

    // Sessão actual continua válida (foi renovada pelo change-password)
    const me = await client.get('/api/v1/auth/me');
    expect(me.status).toBe(200);
  });

  it('rejeita se a senha actual estiver errada', async () => {
    const client = new ApiClient();
    await client.post<LoginResponse>('/api/v1/auth/client/login', { email, password });

    const res = await client.post<ApiErrorBody>('/api/v1/auth/change-password', {
      currentPassword: 'senha-errada',
      newPassword: 'OutraSenha!2026',
      confirmPassword: 'OutraSenha!2026',
    });
    expect(res.status).toBe(401);
  });

  it('rejeita se a nova senha for igual à actual', async () => {
    const client = new ApiClient();
    await client.post<LoginResponse>('/api/v1/auth/client/login', { email, password });

    const res = await client.post<ApiErrorBody>('/api/v1/auth/change-password', {
      currentPassword: password,
      newPassword: password,
      confirmPassword: password,
    });
    expect(res.status).toBe(400);
  });

  it('rejeita sem sessão com 401', async () => {
    const res = await new ApiClient().post<ApiErrorBody>('/api/v1/auth/change-password', {
      currentPassword: 'qualquer',
      newPassword: 'OutraSenha!2026',
      confirmPassword: 'OutraSenha!2026',
    });
    expect(res.status).toBe(401);
  });
});

// ---------------------------------------------------------------------------
// Registo — validações de negócio
// ---------------------------------------------------------------------------

describe('Registo — validações de negócio', () => {
  it('rejeita registo com email duplicado com 409', async () => {
    const email = `dup-${randomUUID()}@example.com`;
    const client = new ApiClient();

    const first = await client.post<RegisterResponse>('/api/v1/auth/register', {
      nip: `NIP${Date.now()}`.slice(0, 20),
      name: 'Primeiro',
      email,
    });
    expect(first.status).toBe(201);

    const second = await client.post<ApiErrorBody>('/api/v1/auth/register', {
      nip: `NIP${Date.now() + 1}`.slice(0, 20),
      name: 'Segundo',
      email,
    });
    expect(second.status).toBe(409);
  });

  it('rejeita registo com NIP duplicado com 409', async () => {
    const nip = `NIPDUP${Date.now()}`.slice(0, 20);
    const client = new ApiClient();

    await client.post<RegisterResponse>('/api/v1/auth/register', {
      nip,
      name: 'Primeiro',
      email: `nip-dup1-${randomUUID()}@example.com`,
    });

    const second = await client.post<ApiErrorBody>('/api/v1/auth/register', {
      nip,
      name: 'Segundo',
      email: `nip-dup2-${randomUUID()}@example.com`,
    });
    expect(second.status).toBe(409);
  });

  it('rejeita campos em falta com 400', async () => {
    const res = await new ApiClient().post<ApiErrorBody>('/api/v1/auth/register', {
      email: 'incompleto@example.com',
    });
    expect(res.status).toBe(400);
  });

  it('rejeita email com formato inválido com 400', async () => {
    const res = await new ApiClient().post<ApiErrorBody>('/api/v1/auth/register', {
      nip: 'NIP999',
      name: 'Teste',
      email: 'nao-e-email',
    });
    expect(res.status).toBe(400);
  });

  it('reenvio de verificação para email já ativo não envia email', async () => {
    const email = `active-resend-${randomUUID()}@example.com`;
    await registerAndActivate(email);

    const countBefore = await countEmailsTo(email);

    const res = await new ApiClient().post<GenericResponse>('/api/v1/auth/resend-verification', {
      email,
    });
    expect(res.status).toBe(200);

    // Nenhum novo email deve ter chegado
    await new Promise((r) => setTimeout(r, 500));
    const countAfter = await countEmailsTo(email);
    expect(countAfter).toBe(countBefore);
  });
});
