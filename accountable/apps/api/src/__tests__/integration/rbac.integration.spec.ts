import { describe, it, expect, beforeAll } from 'vitest';
import { randomUUID } from 'node:crypto';
import { ApiClient } from './helpers/api-client.js';
import type { ApiErrorBody } from './helpers/api-client.js';
import { loginAsAdmin } from './helpers/auth.js';

interface RoleDTO {
  id: string;
  name: string;
}

interface LoginResponse {
  data: { permissions: string[] };
}

let consultantEmail: string;
let consultantPassword: string;

beforeAll(async () => {
  const { client: admin } = await loginAsAdmin();
  const rolesRes = await admin.get<{ data: RoleDTO[] }>('/api/v1/roles');
  const consultantRole = rolesRes.body.data.find((r) => r.name === 'CONSULTANT');
  if (!consultantRole) throw new Error('Role CONSULTANT não encontrada no seed.');

  consultantEmail = `rbac-consultant-${randomUUID()}@accountable.local`;
  consultantPassword = 'SenhaConsultorRbac!2026';

  const createRes = await admin.post('/api/v1/users', {
    name: 'Consultor RBAC',
    email: consultantEmail,
    password: consultantPassword,
    roleIds: [consultantRole.id],
  });
  if (createRes.status !== 201) {
    throw new Error(`Falha ao criar utilizador CONSULTANT de teste: ${JSON.stringify(createRes.body)}`);
  }
});

async function loginAsConsultant(): Promise<ApiClient> {
  const client = new ApiClient();
  const res = await client.post<LoginResponse>('/api/v1/auth/user/login', {
    email: consultantEmail,
    password: consultantPassword,
  });
  if (res.status !== 200) {
    throw new Error(`Login consultor falhou: ${JSON.stringify(res.body)}`);
  }
  return client;
}

describe('RBAC — enforcement de permissões granulares por rota', () => {
  it('CONSULTANT (sem users:read) recebe 403 ao listar utilizadores internos', async () => {
    const consultant = await loginAsConsultant();
    const res = await consultant.get<ApiErrorBody>('/api/v1/users');
    expect(res.status).toBe(403);
  });

  it('CONSULTANT (sem backups:read) recebe 403 ao listar backups', async () => {
    const consultant = await loginAsConsultant();
    const res = await consultant.get<ApiErrorBody>('/api/v1/backups');
    expect(res.status).toBe(403);
  });

  it('CONSULTANT (sem audit:read) recebe 403 ao ler o log de auditoria', async () => {
    const consultant = await loginAsConsultant();
    const res = await consultant.get<ApiErrorBody>('/api/v1/audit');
    expect(res.status).toBe(403);
  });

  it('CONSULTANT (sem clients:block) recebe 403 ao tentar bloquear um cliente', async () => {
    const consultant = await loginAsConsultant();
    const { client: admin } = await loginAsAdmin();
    const clientsRes = await admin.get<{ data: Array<{ id: string }> }>('/api/v1/clients');
    const target = clientsRes.body.data[0];
    if (!target) throw new Error('Nenhum cliente seedado encontrado para o teste.');
    const targetId = target.id;

    const res = await consultant.patch<ApiErrorBody>(`/api/v1/clients/${targetId}/block`, {
      reason: 'Tentativa não autorizada em teste RBAC',
    });
    expect(res.status).toBe(403);
  });

  it('CONSULTANT (com documents:read) consegue listar documentos normalmente', async () => {
    const consultant = await loginAsConsultant();
    const res = await consultant.get('/api/v1/documents');
    expect(res.status).toBe(200);
  });

  it('ADMINISTRATOR continua a aceder a todas as rotas protegidas por permissão', async () => {
    const { client: admin } = await loginAsAdmin();
    const [users, backups, audit] = await Promise.all([
      admin.get('/api/v1/users'),
      admin.get('/api/v1/backups'),
      admin.get('/api/v1/audit'),
    ]);
    expect(users.status).toBe(200);
    expect(backups.status).toBe(200);
    expect(audit.status).toBe(200);
  });
});
