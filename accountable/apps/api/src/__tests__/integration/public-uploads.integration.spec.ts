import { describe, it, expect, beforeAll } from 'vitest';
import { createHash } from 'node:crypto';
import { ApiClient } from './helpers/api-client.js';
import type { ApiErrorBody } from './helpers/api-client.js';
import { loginAsAdmin, loginAsSeededClient, registerAndLoginNewClient } from './helpers/auth.js';
import { db } from './helpers/db.js';

const sha256 = (v: string) => createHash('sha256').update(v).digest('hex');
const PDF = Buffer.from('%PDF-1.7\n1 0 obj << >> endobj\ntrailer << >>\n%%EOF');
const EXE_AS_PDF = Buffer.concat([Buffer.from('MZ'), Buffer.alloc(64)]);

interface SessionDTO {
  id: string;
  token?: string;
  url?: string;
  expiresAt: string;
  revokedAt: string | null;
}

interface ContextDTO {
  sessionId: string;
  clientName: string;
  expiresAt: string;
  recentUploads: Array<{ id: string; title: string }>;
}

async function createSession(client: ApiClient, clientId: string, body: Record<string, unknown> = {}) {
  return client.post<{ data: SessionDTO }>(`/api/v1/clients/${clientId}/upload-sessions`, {
    month: 9,
    year: 2026,
    label: 'Integração',
    ...body,
  });
}

// ====================================================================
describe('Sessões públicas de upload (portal sem login)', () => {
  let admin: ApiClient;
  let seededClientId: string;

  beforeAll(async () => {
    admin = (await loginAsAdmin()).client;
    seededClientId = (await loginAsSeededClient()).clientId;
  });

  it('admin cria sessão: token só em hash + cifrado na BD, nunca na auditoria', async () => {
    const res = await createSession(admin, seededClientId);
    expect(res.status).toBe(201);
    const { id, token, url, expiresAt } = res.body.data;

    expect(token).toMatch(/^[0-9a-f]{64}$/);
    expect(url).toContain(`token=${token}`);
    expect(url).not.toContain('companyId');
    expect(new Date(expiresAt).getTime()).toBeGreaterThan(Date.now() + 29 * 86_400_000);

    const row = await db.clientUploadSession.findUniqueOrThrow({ where: { id } });
    expect(row.tokenHash).toBe(sha256(token!));
    expect(row.tokenEncrypted).toBeTruthy();
    expect(row.tokenEncrypted).not.toContain(token!);

    const audit = await db.auditLog.findFirst({ where: { entityId: id, action: 'CLIENT_UPLOAD_SESSION_CREATED' } });
    expect(JSON.stringify(audit?.newValues)).not.toContain(token!);
  });

  it('fluxo completo: contexto público → upload de PDF → documento SUBMITTED visível ao admin', async () => {
    const { token } = (await createSession(admin, seededClientId)).body.data;
    const anonymous = new ApiClient();

    const ctx = await anonymous.get<{ data: ContextDTO }>(`/api/v1/public/upload-sessions/context?token=${token}`);
    expect(ctx.status).toBe(200);
    expect(ctx.body.data).not.toHaveProperty('clientId');
    expect(ctx.body.data).not.toHaveProperty('token');

    const upload = await anonymous.uploadFile<{ data: { documentId: string; status: string } }>(
      `/api/v1/public/upload-sessions/upload?token=${token}`,
      { filename: 'balancete.pdf', mimeType: 'application/pdf', content: PDF },
      { title: 'Balancete Setembro', type: 'BALANCETE' },
    );
    expect(upload.status).toBe(201);
    expect(upload.body.data.status).toBe('SUBMITTED');

    const doc = await admin.get<{ data: { document: { clientId: string; title: string }; files: unknown[] } }>(
      `/api/v1/documents/${upload.body.data.documentId}`,
    );
    expect(doc.status).toBe(200);
    expect(doc.body.data.document.clientId).toBe(seededClientId);
    expect(doc.body.data.files).toHaveLength(1);
  });

  it('BUG CORRIGIDO: ficheiro inválido não deixa documento órfão', async () => {
    const created = (await createSession(admin, seededClientId)).body.data;
    const before = await db.document.count({ where: { uploadSessionId: created.id } });

    const anonymous = new ApiClient();
    const badType = await anonymous.uploadFile(
      `/api/v1/public/upload-sessions/upload?token=${created.token}`,
      { filename: 'virus.exe', mimeType: 'application/x-msdownload', content: 'x' },
    );
    const disguised = await anonymous.uploadFile(
      `/api/v1/public/upload-sessions/upload?token=${created.token}`,
      { filename: 'fatura.pdf', mimeType: 'application/pdf', content: EXE_AS_PDF },
    );

    expect(badType.status).toBe(400);
    expect(disguised.status).toBe(400);
    expect(await db.document.count({ where: { uploadSessionId: created.id } })).toBe(before);
  });

  it('token inválido, sessão revogada e sessão expirada respondem 404 com a mesma mensagem', async () => {
    const anonymous = new ApiClient();
    const invalid = await anonymous.get<ApiErrorBody>(`/api/v1/public/upload-sessions/context?token=${'0'.repeat(64)}`);

    const revokedSession = (await createSession(admin, seededClientId)).body.data;
    await admin.delete(`/api/v1/clients/${seededClientId}/upload-sessions/${revokedSession.id}`);
    const revoked = await anonymous.get<ApiErrorBody>(
      `/api/v1/public/upload-sessions/context?token=${revokedSession.token}`,
    );

    const expiredSession = (await createSession(admin, seededClientId)).body.data;
    await db.clientUploadSession.update({
      where: { id: expiredSession.id },
      data: { expiresAt: new Date(Date.now() - 1000) },
    });
    const expired = await anonymous.get<ApiErrorBody>(
      `/api/v1/public/upload-sessions/context?token=${expiredSession.token}`,
    );
    const expiredUpload = await anonymous.uploadFile(
      `/api/v1/public/upload-sessions/upload?token=${expiredSession.token}`,
      { filename: 'a.pdf', mimeType: 'application/pdf', content: PDF },
    );

    for (const res of [invalid, revoked, expired]) {
      expect(res.status).toBe(404);
      expect(res.body.message).toBe(invalid.body.message);
    }
    expect(expiredUpload.status).toBe(404);
  });

  it('links de um cliente bloqueado deixam de funcionar', async () => {
    const { clientId } = await registerAndLoginNewClient();
    const { token } = (await createSession(admin, clientId)).body.data;

    await admin.patch(`/api/v1/clients/${clientId}/block`, { reason: 'Teste de bloqueio' });

    const ctx = await new ApiClient().get(`/api/v1/public/upload-sessions/context?token=${token}`);
    expect(ctx.status).toBe(404);
  });

  it('listagem: URL recopiável só em sessões ativas; token nunca listado', async () => {
    const active = (await createSession(admin, seededClientId)).body.data;
    const toRevoke = (await createSession(admin, seededClientId)).body.data;
    await admin.delete(`/api/v1/clients/${seededClientId}/upload-sessions/${toRevoke.id}`);

    const list = await admin.get<{ data: SessionDTO[] }>(`/api/v1/clients/${seededClientId}/upload-sessions`);
    expect(list.status).toBe(200);

    const listedActive = list.body.data.find((s) => s.id === active.id)!;
    const listedRevoked = list.body.data.find((s) => s.id === toRevoke.id)!;
    expect(listedActive.url).toContain(`token=${active.token}`);
    expect(listedRevoked.url).toBeUndefined();
    expect(list.body.data.every((s) => s.token === undefined)).toBe(true);
  });

  it('BUG CORRIGIDO: o próprio cliente consegue gerar o seu link (antes: erro 500 de FK)', async () => {
    const { client, clientId } = await registerAndLoginNewClient();
    const res = await createSession(client, clientId);
    expect(res.status).toBe(201);

    const row = await db.clientUploadSession.findUniqueOrThrow({ where: { id: res.body.data.id } });
    expect(row.createdByUserId).toBeNull();
  });

  it('cliente não pode criar nem listar sessões de outro cliente', async () => {
    const { client } = await registerAndLoginNewClient();
    expect((await createSession(client, seededClientId)).status).toBe(403);
    expect((await client.get(`/api/v1/clients/${seededClientId}/upload-sessions`)).status).toBe(403);
  });

  it('IDOR CORRIGIDO: cliente não consegue revogar a sessão de outro cliente usando o próprio id na rota', async () => {
    const victimSession = (await createSession(admin, seededClientId)).body.data;
    const { client: attacker, clientId: attackerId } = await registerAndLoginNewClient();

    const res = await attacker.delete(`/api/v1/clients/${attackerId}/upload-sessions/${victimSession.id}`);
    expect(res.status).toBe(404);

    const row = await db.clientUploadSession.findUniqueOrThrow({ where: { id: victimSession.id } });
    expect(row.revokedAt).toBeNull();
  });

  it('valida metadados do upload público (título demasiado longo → 400)', async () => {
    const { token } = (await createSession(admin, seededClientId)).body.data;
    const res = await new ApiClient().uploadFile(
      `/api/v1/public/upload-sessions/upload?token=${token}`,
      { filename: 'a.pdf', mimeType: 'application/pdf', content: PDF },
      { title: 'x'.repeat(300) },
    );
    expect(res.status).toBe(400);
  });
});

// ====================================================================
describe('Links públicos de upload por documento', () => {
  let admin: ApiClient;
  let documentId: string;

  beforeAll(async () => {
    admin = (await loginAsAdmin()).client;
    const { client } = await loginAsSeededClient();
    const doc = await client.post<{ data: { id: string } }>('/api/v1/documents', {
      title: 'Documento com link de upload',
      type: 'CONTRATO',
    });
    documentId = doc.body.data.id;
  });

  async function createLink(hours?: number) {
    return admin.post<{ data: { id: string; token: string; url: string; expiresAt: string } }>(
      `/api/v1/documents/${documentId}/upload-links`,
      hours ? { expiresInHours: hours } : {},
    );
  }

  it('cria link (só hash na BD), mostra contexto e aceita upload anónimo', async () => {
    const res = await createLink(2);
    expect(res.status).toBe(201);
    const { id, token, url } = res.body.data;
    expect(url).toMatch(new RegExp(`/upload/${token}$`));

    const row = await db.documentUploadLink.findUniqueOrThrow({ where: { id } });
    expect(row.tokenHash).toBe(sha256(token));

    const anonymous = new ApiClient();
    const ctx = await anonymous.get<{ data: { documentTitle: string } }>(`/api/v1/public/upload-links/${token}`);
    expect(ctx.status).toBe(200);
    expect(ctx.body.data.documentTitle).toBe('Documento com link de upload');

    const upload = await anonymous.uploadFile(`/api/v1/public/upload-links/${token}/files`, {
      filename: 'comprovativo.pdf',
      mimeType: 'application/pdf',
      content: PDF,
    });
    expect(upload.status).toBe(201);
  });

  it('link revogado ou expirado deixa de aceitar uploads', async () => {
    const revokedLink = (await createLink()).body.data;
    expect((await admin.delete(`/api/v1/documents/${documentId}/upload-links/${revokedLink.id}`)).status).toBe(200);

    const expiredLink = (await createLink()).body.data;
    await db.documentUploadLink.update({ where: { id: expiredLink.id }, data: { expiresAt: new Date(Date.now() - 1000) } });

    const anonymous = new ApiClient();
    for (const token of [revokedLink.token, expiredLink.token]) {
      expect((await anonymous.get(`/api/v1/public/upload-links/${token}`)).status).toBe(404);
      const up = await anonymous.uploadFile(`/api/v1/public/upload-links/${token}/files`, {
        filename: 'a.pdf',
        mimeType: 'application/pdf',
        content: PDF,
      });
      expect(up.status).toBe(404);
    }
  });

  it('cliente não pode criar links de upload (permissão interna)', async () => {
    const { client } = await loginAsSeededClient();
    const res = await client.post(`/api/v1/documents/${documentId}/upload-links`, {});
    expect(res.status).toBe(403);
  });

  it('token inexistente devolve 404 (nunca 500)', async () => {
    const res = await new ApiClient().get(`/api/v1/public/upload-links/${'f'.repeat(64)}`);
    expect(res.status).toBe(404);
  });
});
