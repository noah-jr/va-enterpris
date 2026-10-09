import { request, type APIRequestContext } from '@playwright/test';
import { ADMIN } from './helpers.js';

export const API_URL = 'http://localhost:3001/api/v1';

/** Contexto HTTP autenticado como administrador (cookies de sessão). */
export async function adminApi(): Promise<APIRequestContext> {
  const ctx = await request.newContext({ baseURL: 'http://localhost:3001' });
  const res = await ctx.post('/api/v1/auth/user/login', { data: ADMIN });
  if (!res.ok()) throw new Error(`Login admin falhou: ${res.status()}`);
  return ctx;
}

export async function roleId(api: APIRequestContext, name: string): Promise<string> {
  const res = await api.get('/api/v1/roles');
  const roles = (await res.json()).data as Array<{ id: string; name: string }>;
  return roles.find((r) => r.name === name)!.id;
}
