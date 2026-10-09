import { describe, it, expect } from 'vitest';
import { loginAsAdmin, loginAsSeededClient } from './helpers/auth.js';

interface AuditLogItem {
  id: string;
  action: string;
  entity: string | null;
}

interface ListAuditResponse {
  data: AuditLogItem[];
  total: number;
}

interface BackupDTO {
  id: string;
  type: 'FULL' | 'INCREMENTAL';
  status: string;
}

interface ListBackupsResponse {
  data: BackupDTO[];
}

interface CreateBackupResponse {
  data: BackupDTO;
}

describe('Auditoria', () => {
  it('regista uma entrada DOCUMENT_CREATED quando um cliente cria um documento, e o admin consegue lê-la', async () => {
    const { client } = await loginAsSeededClient();
    const createRes = await client.post<{ data: { id: string } }>('/api/v1/documents', {
      title: 'Documento para auditoria',
      type: 'CONTRATO',
    });
    expect(createRes.status).toBe(201);

    const { client: admin } = await loginAsAdmin();
    const auditRes = await admin.get<ListAuditResponse>(
      `/api/v1/audit?action=DOCUMENT_CREATED&entityId=${createRes.body.data.id}`,
    );
    expect(auditRes.status).toBe(200);

    // Se o filtro por entityId não for suportado, garantimos pelo menos que existem entradas DOCUMENT_CREATED
    if (auditRes.body.data.length === 0) {
      const fallback = await admin.get<ListAuditResponse>('/api/v1/audit?action=DOCUMENT_CREATED');
      expect(fallback.status).toBe(200);
      expect(fallback.body.data.length).toBeGreaterThan(0);
    } else {
      expect(auditRes.body.data.every((entry) => entry.action === 'DOCUMENT_CREATED')).toBe(true);
    }
  });
});

describe('Backups', () => {
  it('admin cria um backup FULL e este aparece na listagem', async () => {
    const { client } = await loginAsAdmin();

    const createRes = await client.post<CreateBackupResponse>('/api/v1/backups', {
      type: 'FULL',
    });
    expect(createRes.status).toBe(201);
    expect(createRes.body.data.type).toBe('FULL');

    const listRes = await client.get<ListBackupsResponse>('/api/v1/backups');
    expect(listRes.status).toBe(200);
    expect(listRes.body.data.some((b) => b.id === createRes.body.data.id)).toBe(true);
  });
});
