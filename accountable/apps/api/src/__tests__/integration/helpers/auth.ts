import { randomUUID } from 'node:crypto';
import { ApiClient } from './api-client.js';
import { SEEDED_ADMIN, SEEDED_CLIENT } from './constants.js';
import { findLatestTokenForEmail } from './mailhog.js';

export interface LoginResponse {
  data: {
    userId: string;
    userType: 'client' | 'user';
    roles: string[];
    permissions: string[];
  };
}

async function login(path: string, credentials: { email: string; password: string }): Promise<{ client: ApiClient; id: string }> {
  const client = new ApiClient();
  const res = await client.post<LoginResponse>(path, credentials);
  if (res.status !== 200) {
    throw new Error(`Login falhou em ${path}: ${res.status} ${JSON.stringify(res.body)}`);
  }
  return { client, id: res.body.data.userId };
}

export async function loginAsAdmin(): Promise<{ client: ApiClient; userId: string }> {
  const { client, id } = await login('/api/v1/auth/user/login', SEEDED_ADMIN);
  return { client, userId: id };
}

export async function loginAsSeededClient(): Promise<{ client: ApiClient; clientId: string }> {
  const { client, id } = await login('/api/v1/auth/client/login', SEEDED_CLIENT);
  return { client, clientId: id };
}

export async function loginAsUser(email: string, password: string): Promise<ApiClient> {
  return (await login('/api/v1/auth/user/login', { email, password })).client;
}

/** Cria um utilizador interno com a role indicada (via admin) e devolve as credenciais. */
export async function createInternalUser(
  roleName: 'ADMINISTRATOR' | 'CONSULTANT' | 'SUPPORT',
): Promise<{ email: string; password: string; id: string }> {
  const { client: admin } = await loginAsAdmin();
  const roles = await admin.get<{ data: Array<{ id: string; name: string }> }>('/api/v1/roles');
  const role = roles.body.data.find((r) => r.name === roleName);
  if (!role) throw new Error(`Role ${roleName} não encontrada no seed.`);

  const email = `it-${roleName.toLowerCase()}-${randomUUID()}@accountable.local`;
  const password = `Senha!${randomUUID().slice(0, 8)}Aa1`;
  const res = await admin.post<{ data: { id: string } }>('/api/v1/users', {
    name: `Utilizador ${roleName}`,
    email,
    password,
    roleIds: [role.id],
  });
  if (res.status !== 201) throw new Error(`Falha ao criar utilizador ${roleName}: ${JSON.stringify(res.body)}`);
  return { email, password, id: res.body.data.id };
}

/**
 * Regista um cliente novo e percorre o fluxo completo (email → verificação → senha → login).
 * Devolve um ApiClient já autenticado.
 */
export async function registerAndLoginNewClient(): Promise<{
  client: ApiClient;
  clientId: string;
  email: string;
  password: string;
}> {
  const client = new ApiClient();
  const email = `it-client-${randomUUID()}@example.com`;
  const password = 'SenhaForte!2026';

  const reg = await client.post<{ data: { clientId: string } }>('/api/v1/auth/register', {
    nip: `${Date.now()}${Math.floor(Math.random() * 1000)}`.slice(0, 14),
    name: 'Cliente Integração',
    email,
  });
  if (reg.status !== 201) throw new Error(`Registo falhou: ${JSON.stringify(reg.body)}`);

  const token = await findLatestTokenForEmail(email);
  const verify = await client.post('/api/v1/auth/verify-email', { token });
  if (verify.status !== 200) throw new Error(`Verificação falhou: ${JSON.stringify(verify.body)}`);

  const setPwd = await client.post('/api/v1/auth/set-password', { token, password, confirmPassword: password });
  if (setPwd.status !== 200) throw new Error(`Definir senha falhou: ${JSON.stringify(setPwd.body)}`);

  const loginRes = await client.post<LoginResponse>('/api/v1/auth/client/login', { email, password });
  if (loginRes.status !== 200) throw new Error(`Login falhou: ${JSON.stringify(loginRes.body)}`);

  return { client, clientId: loginRes.body.data.userId, email, password };
}
