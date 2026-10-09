import { describe, it, expect } from 'vitest';
import { randomUUID } from 'node:crypto';
import { ApiClient } from './helpers/api-client.js';
import type { ApiErrorBody } from './helpers/api-client.js';
import { findLatestTokenForEmail } from './helpers/mailhog.js';
import { SEEDED_ADMIN, SEEDED_CLIENT } from './helpers/constants.js';

interface LoginResponse {
  data: {
    userId: string;
    userType: 'client' | 'user';
    roles: string[];
    permissions: string[];
  };
  message: string;
}

interface RegisterResponse {
  data: { id: string; email: string };
  message: string;
}

interface MeResponse {
  data: { id: string; email: string; userType: 'client' | 'user' };
}

describe('Auth — fluxo completo de registo, login e sessão', () => {
  it('regista um novo cliente, verifica email, define password e faz login', async () => {
    const client = new ApiClient();
    const email = `teste-${randomUUID()}@example.com`;

    const registerRes = await client.post<RegisterResponse>('/api/v1/auth/register', {
      nip: `NIP${Date.now()}`.slice(0, 20),
      name: 'Cliente de Teste E2E',
      email,
    });
    expect(registerRes.status).toBe(201);
    expect(registerRes.body.data.email).toBe(email);

    const verifyToken = await findLatestTokenForEmail(email);

    const verifyRes = await client.post('/api/v1/auth/verify-email', { token: verifyToken });
    expect(verifyRes.status).toBe(200);

    const setPasswordRes = await client.post('/api/v1/auth/set-password', {
      token: verifyToken,
      password: 'SenhaForte!2026',
      confirmPassword: 'SenhaForte!2026',
    });
    expect(setPasswordRes.status).toBe(200);

    const loginRes = await client.post<LoginResponse>('/api/v1/auth/client/login', {
      email,
      password: 'SenhaForte!2026',
    });
    expect(loginRes.status).toBe(200);
    expect(loginRes.body.data.userType).toBe('client');
    expect(loginRes.body.data).not.toHaveProperty('accessToken');
  });

  it('faz login como admin seedado e obtém permissões completas', async () => {
    const client = new ApiClient();
    const res = await client.post<LoginResponse>('/api/v1/auth/user/login', SEEDED_ADMIN);

    expect(res.status).toBe(200);
    expect(res.body.data.userType).toBe('user');
    expect(res.body.data.roles).toContain('ADMINISTRATOR');
    expect(res.body.data.permissions).toContain('documents:read');
    expect(res.body.data.permissions).toContain('users:create');
  });

  it('faz login como cliente seedado', async () => {
    const client = new ApiClient();
    const res = await client.post<LoginResponse>('/api/v1/auth/client/login', SEEDED_CLIENT);

    expect(res.status).toBe(200);
    expect(res.body.data.userType).toBe('client');
  });

  it('rejeita credenciais inválidas com 401', async () => {
    const client = new ApiClient();
    const res = await client.post<ApiErrorBody>('/api/v1/auth/user/login', {
      email: SEEDED_ADMIN.email,
      password: 'password-errada',
    });

    expect(res.status).toBe(401);
  });

  it('devolve os dados do utilizador autenticado em /auth/me usando cookies de sessão', async () => {
    const client = new ApiClient();
    const loginRes = await client.post<LoginResponse>('/api/v1/auth/user/login', SEEDED_ADMIN);
    expect(loginRes.status).toBe(200);

    const meRes = await client.get<MeResponse>('/api/v1/auth/me');
    expect(meRes.status).toBe(200);
    expect(meRes.body.data.email).toBe(SEEDED_ADMIN.email);
    expect(meRes.body.data.userType).toBe('user');
  });

  it('rejeita /auth/me sem sessão com 401', async () => {
    const client = new ApiClient();
    const res = await client.get<ApiErrorBody>('/api/v1/auth/me');
    expect(res.status).toBe(401);
  });

  it('renova a sessão via /auth/refresh e depois termina sessão com /auth/logout', async () => {
    const client = new ApiClient();
    const loginRes = await client.post<LoginResponse>('/api/v1/auth/user/login', SEEDED_ADMIN);
    expect(loginRes.status).toBe(200);

    const refreshRes = await client.post('/api/v1/auth/refresh');
    expect(refreshRes.status).toBe(200);

    const logoutRes = await client.post('/api/v1/auth/logout');
    expect(logoutRes.status).toBe(200);

    const meAfterLogout = await client.get<ApiErrorBody>('/api/v1/auth/me');
    expect(meAfterLogout.status).toBe(401);
  });
});
