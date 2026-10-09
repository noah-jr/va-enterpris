import { describe, it, expect } from 'vitest';
import { loginAsAdmin, loginAsSeededClient } from './helpers/auth.js';
import type { ApiErrorBody } from './helpers/api-client.js';

interface ClientListItem {
  id: string;
  email: string;
  isActive: boolean;
}

interface ListClientsResponse {
  data: ClientListItem[];
  total: number;
}

describe('Clientes — gestão por utilizadores internos', () => {
  it('admin lista clientes e consegue bloquear e desbloquear um cliente', async () => {
    const { client: admin } = await loginAsAdmin();

    const listRes = await admin.get<ListClientsResponse>('/api/v1/clients');
    expect(listRes.status).toBe(200);
    expect(listRes.body.data.length).toBeGreaterThan(0);

    const target = listRes.body.data[0];
    if (!target) throw new Error('Nenhum cliente seedado encontrado para o teste.');

    const blockRes = await admin.patch<{ data: ClientListItem }>(
      `/api/v1/clients/${target.id}/block`,
      { reason: 'Teste de integração — bloqueio automático' },
    );
    expect(blockRes.status).toBe(200);
    expect(blockRes.body.data.isActive).toBe(false);

    const unblockRes = await admin.patch<{ data: ClientListItem }>(
      `/api/v1/clients/${target.id}/unblock`,
    );
    expect(unblockRes.status).toBe(200);
    expect(unblockRes.body.data.isActive).toBe(true);
  });

  it('um cliente autenticado não consegue listar outros clientes (403)', async () => {
    const { client } = await loginAsSeededClient();
    const res = await client.get<ApiErrorBody>('/api/v1/clients');
    expect(res.status).toBe(403);
  });
});
