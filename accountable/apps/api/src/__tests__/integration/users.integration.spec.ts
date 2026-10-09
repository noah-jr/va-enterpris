import { describe, it, expect } from 'vitest';
import { randomUUID } from 'node:crypto';
import { loginAsAdmin } from './helpers/auth.js';

interface RoleDTO {
  id: string;
  name: string;
}

interface ListRolesResponse {
  data: RoleDTO[];
}

interface UserDTO {
  id: string;
  email: string;
}

interface CreateUserResponse {
  data: UserDTO;
}

interface ListUsersResponse {
  data: UserDTO[];
  total: number;
}

describe('Utilizadores internos e Roles', () => {
  it('admin lista as roles seedadas (ADMINISTRATOR, CONSULTANT, SUPPORT)', async () => {
    const { client } = await loginAsAdmin();
    const res = await client.get<ListRolesResponse>('/api/v1/roles');
    expect(res.status).toBe(200);

    const roleNames = res.body.data.map((r) => r.name);
    expect(roleNames).toEqual(expect.arrayContaining(['ADMINISTRATOR', 'CONSULTANT', 'SUPPORT']));
  });

  it('admin cria um novo utilizador interno com uma role e ele aparece na listagem', async () => {
    const { client } = await loginAsAdmin();

    const rolesRes = await client.get<ListRolesResponse>('/api/v1/roles');
    const consultantRole = rolesRes.body.data.find((r) => r.name === 'CONSULTANT');
    expect(consultantRole).toBeDefined();

    const email = `consultor-${randomUUID()}@accountable.local`;
    const createRes = await client.post<CreateUserResponse>('/api/v1/users', {
      name: 'Consultor Integração',
      email,
      password: 'SenhaConsultor!2026',
      roleIds: [consultantRole!.id],
    });
    expect(createRes.status).toBe(201);
    expect(createRes.body.data.email).toBe(email);

    const listRes = await client.get<ListUsersResponse>('/api/v1/users');
    expect(listRes.status).toBe(200);
    expect(listRes.body.data.some((u) => u.email === email)).toBe(true);
  });
});
