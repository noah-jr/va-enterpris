import { describe, it, expect, beforeAll } from 'vitest';
import { randomUUID } from 'node:crypto';
import { ApiClient } from './helpers/api-client.js';
import { createInternalUser, loginAsAdmin, loginAsSeededClient, loginAsUser } from './helpers/auth.js';
import { BASE_URL } from './helpers/constants.js';

interface PlanDTO {
  id: string;
  name: string;
  isActive: boolean;
}

interface DocumentTypeDTO {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
}

// ====================================================================
describe('Planos — público vs. gestão', () => {
  let admin: ApiClient;

  beforeAll(async () => {
    admin = (await loginAsAdmin()).client;
  });

  it('CRUD completo: criar ativo → aparece no público; desativar → desaparece; apagar', async () => {
    const name = `Plano IT ${randomUUID().slice(0, 8)}`;
    const created = await admin.post<{ data: PlanDTO }>('/api/v1/admin/plans', {
      name,
      description: 'Plano criado pelos testes de integração',
      priceMonthly: 10000,
      features: ['Feature A', 'Feature B'],
      ctaText: 'Subscrever',
    });
    expect(created.status).toBe(201);
    const planId = created.body.data.id;

    const publicList = await new ApiClient().get<{ data: PlanDTO[] }>('/api/v1/plans');
    expect(publicList.status).toBe(200);
    expect(publicList.body.data.some((p) => p.id === planId)).toBe(true);

    const updated = await admin.patch<{ data: PlanDTO }>(`/api/v1/admin/plans/${planId}`, { isActive: false });
    expect(updated.status).toBe(200);
    const afterDeactivate = await new ApiClient().get<{ data: PlanDTO[] }>('/api/v1/plans');
    expect(afterDeactivate.body.data.some((p) => p.id === planId)).toBe(false);

    expect((await admin.delete(`/api/v1/admin/plans/${planId}`)).status).toBeLessThan(300);
    const all = await admin.get<{ data: PlanDTO[] }>('/api/v1/admin/plans');
    expect(all.body.data.some((p) => p.id === planId)).toBe(false);
  });

  it('valida entrada (sem features → 400) e bloqueia clientes (403)', async () => {
    const invalid = await admin.post('/api/v1/admin/plans', {
      name: 'X Plano',
      description: 'descrição válida',
      features: [],
      ctaText: 'Ok',
    });
    expect(invalid.status).toBe(400);

    const { client } = await loginAsSeededClient();
    expect((await client.get('/api/v1/admin/plans')).status).toBe(403);
  });
});

// ====================================================================
describe('Contacto e newsletter (landing)', () => {
  it('pedido de contacto público é registado e visível para quem tem contacts:read', async () => {
    const email = `lead-${randomUUID()}@example.com`;
    const submit = await new ApiClient().post('/api/v1/contact', {
      name: 'Lead Integração',
      email,
      company: 'Empresa Lead',
      message: 'Gostaria de saber mais sobre os vossos planos.',
    });
    expect(submit.status).toBeLessThan(300);

    const { client: admin } = await loginAsAdmin();
    const list = await admin.get<{ data: Array<{ email: string }> }>('/api/v1/admin/contact-requests');
    expect(list.status).toBe(200);
    expect(list.body.data.some((r) => r.email === email)).toBe(true);
  });

  it('valida mensagem demasiado curta (400)', async () => {
    const res = await new ApiClient().post('/api/v1/contact', {
      name: 'Lead',
      email: 'lead@example.com',
      message: 'curta',
    });
    expect(res.status).toBe(400);
  });

  it('subscrição de newsletter aceita email válido e rejeita inválido', async () => {
    const ok = await new ApiClient().post('/api/v1/newsletter', { email: `nl-${randomUUID()}@example.com` });
    expect(ok.status).toBeLessThan(300);
    const bad = await new ApiClient().post('/api/v1/newsletter', { email: 'nao-e-email' });
    expect(bad.status).toBe(400);
  });

  it('SUPPORT sem contacts:read não lista leads', async () => {
    const { email, password } = await createInternalUser('SUPPORT');
    const support = await loginAsUser(email, password);
    const me = await support.get<{ data: { permissions: string[] } }>('/api/v1/auth/me');
    const expected = me.body.data.permissions.includes('contacts:read') ? 200 : 403;
    expect((await support.get('/api/v1/admin/contact-requests')).status).toBe(expected);
  });
});

// ====================================================================
describe('Tipos de documento', () => {
  it('CRUD admin + público só vê os ativos + código duplicado → 409', async () => {
    const { client: admin } = await loginAsAdmin();
    const code = `it_${randomUUID().slice(0, 8)}`;

    const created = await admin.post<{ data: DocumentTypeDTO }>('/api/v1/admin/document-types', {
      code,
      name: 'Tipo de Integração',
      category: 'Testes',
    });
    expect(created.status).toBe(201);
    const id = created.body.data.id;

    const dup = await admin.post('/api/v1/admin/document-types', { code, name: 'Duplicado', category: 'Testes' });
    expect(dup.status).toBe(409);

    const pub = await new ApiClient().get<{ data: DocumentTypeDTO[] }>('/api/v1/document-types');
    expect(pub.body.data.some((t) => t.id === id)).toBe(true);

    await admin.patch(`/api/v1/admin/document-types/${id}`, { isActive: false });
    const pubAfter = await new ApiClient().get<{ data: DocumentTypeDTO[] }>('/api/v1/document-types');
    expect(pubAfter.body.data.some((t) => t.id === id)).toBe(false);

    expect((await admin.delete(`/api/v1/admin/document-types/${id}`)).status).toBeLessThan(300);
  });

  it('código com caracteres inválidos → 400; cliente não gere tipos → 403', async () => {
    const { client: admin } = await loginAsAdmin();
    const bad = await admin.post('/api/v1/admin/document-types', { code: 'com espaço!', name: 'X', category: 'Y' });
    expect(bad.status).toBe(400);

    const { client } = await loginAsSeededClient();
    expect((await client.post('/api/v1/admin/document-types', { code: 'x_y', name: 'Xy', category: 'Y' })).status).toBe(403);
  });
});

// ====================================================================
describe('Endurecimento HTTP', () => {
  it('headers de segurança (helmet) presentes', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/health`);
    expect(res.headers.get('x-content-type-options')).toBe('nosniff');
    expect(res.headers.get('x-frame-options')).toBeTruthy();
    expect(res.headers.get('strict-transport-security')).toBeTruthy();
  });

  it('rate limiting global ativo (cabeçalhos x-ratelimit-*)', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/plans`);
    expect(res.headers.get('x-ratelimit-limit')).toBeTruthy();
  });

  it('CORS: origem desconhecida não recebe Access-Control-Allow-Origin', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/plans`, {
      method: 'OPTIONS',
      headers: { origin: 'https://site-malicioso.example', 'access-control-request-method': 'GET' },
    });
    expect(res.headers.get('access-control-allow-origin')).toBeNull();
  });

  it('CORS: origem localhost em dev/test é aceite com credenciais', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/plans`, {
      method: 'OPTIONS',
      headers: { origin: 'http://localhost:5173', 'access-control-request-method': 'GET' },
    });
    expect(res.headers.get('access-control-allow-origin')).toBe('http://localhost:5173');
    expect(res.headers.get('access-control-allow-credentials')).toBe('true');
  });

  it('erros de validação têm formato consistente { code, message }', async () => {
    const res = await new ApiClient().post<{ code: string; message: string }>('/api/v1/auth/user/login', {
      email: 'nao-e-email',
    });
    expect(res.status).toBe(400);
    expect(res.body.code).toBeTruthy();
    expect(res.body.message).toBeTruthy();
  });

  it('rotas inexistentes devolvem 404', async () => {
    expect((await new ApiClient().get('/api/v1/nao-existe')).status).toBe(404);
  });
});
