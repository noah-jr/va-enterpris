import { describe, it, expect } from 'vitest';
import { loginAsAdmin, loginAsSeededClient } from './helpers/auth.js';
import { ApiClient } from './helpers/api-client.js';
import type { ApiErrorBody } from './helpers/api-client.js';

interface MessageDTO {
  id: string;
  content: string;
  isInternal: boolean;
  senderType: 'CLIENT' | 'USER' | 'SYSTEM';
}

interface ListMessagesResponse {
  data: MessageDTO[];
}

interface TicketDTO {
  id: string;
  subject: string;
  status: string;
  clientId: string;
}

interface CreateTicketResponse {
  data: TicketDTO;
}

interface ListTicketsResponse {
  data: TicketDTO[];
}

interface NotificationDTO {
  id: string;
  readAt: string | null;
}

interface TicketDetailsDTO {
  ticket: TicketDTO;
}

interface ListNotificationsResponse {
  data: NotificationDTO[];
}

describe('Mensagens — thread num documento', () => {
  it('cliente envia mensagem, admin envia nota interna, e o cliente nunca vê notas internas', async () => {
    const { client } = await loginAsSeededClient();
    const createDocRes = await client.post<{ data: { id: string } }>('/api/v1/documents', {
      title: 'Documento com mensagens',
      type: 'CONTRATO',
    });
    const documentId = createDocRes.body.data.id;

    const clientMsgRes = await client.post<{ data: MessageDTO }>(
      `/api/v1/documents/${documentId}/messages`,
      { content: 'Olá, gostaria de saber o estado do meu processo.' },
    );
    expect(clientMsgRes.status).toBe(201);
    expect(clientMsgRes.body.data.senderType).toBe('CLIENT');

    const { client: admin } = await loginAsAdmin();
    const internalNoteRes = await admin.post<{ data: MessageDTO }>(
      `/api/v1/documents/${documentId}/messages`,
      { content: 'Nota interna: aguardar validação do consultor.', isInternal: true },
    );
    expect(internalNoteRes.status).toBe(201);
    expect(internalNoteRes.body.data.isInternal).toBe(true);

    const adminListRes = await admin.get<ListMessagesResponse>(
      `/api/v1/documents/${documentId}/messages`,
    );
    expect(adminListRes.status).toBe(200);
    expect(adminListRes.body.data.length).toBeGreaterThanOrEqual(2);
    expect(adminListRes.body.data.some((m) => m.isInternal)).toBe(true);

    const clientListRes = await client.get<ListMessagesResponse>(
      `/api/v1/documents/${documentId}/messages`,
    );
    expect(clientListRes.status).toBe(200);
    expect(clientListRes.body.data.every((m) => m.isInternal === false)).toBe(true);
  });

  it('rejeita envio de mensagem por cliente sem sessão', async () => {
    const { client } = await loginAsSeededClient();
    const createDocRes = await client.post<{ data: { id: string } }>('/api/v1/documents', {
      title: 'Documento para teste de auth',
      type: 'CONTRATO',
    });
    const documentId = createDocRes.body.data.id;

    const anon = new ApiClient();
    const res = await anon.post<ApiErrorBody>(`/api/v1/documents/${documentId}/messages`, {
      content: 'não autenticado',
    });
    expect(res.status).toBe(401);
  });
});

describe('Tickets — criação, resposta e mudança de estado', () => {
  it('cliente cria ticket, admin responde e avança o estado, cliente não pode alterar estado', async () => {
    const { client } = await loginAsSeededClient();

    const createRes = await client.post<CreateTicketResponse>('/api/v1/tickets', {
      subject: 'Problema ao aceder à plataforma',
      category: 'SUPORTE_TECNICO',
      description: 'Não consigo submeter o meu processo há duas horas, por favor ajudem.',
    });
    expect(createRes.status).toBe(201);
    expect(createRes.body.data.status).toBe('OPEN');
    const ticketId = createRes.body.data.id;

    const listRes = await client.get<ListTicketsResponse>('/api/v1/tickets');
    expect(listRes.status).toBe(200);
    expect(listRes.body.data.some((t) => t.id === ticketId)).toBe(true);

    const { client: admin } = await loginAsAdmin();

    const replyRes = await admin.post(`/api/v1/tickets/${ticketId}/messages`, {
      content: 'Estamos a analisar o seu pedido, obrigado pela paciência.',
    });
    expect(replyRes.status).toBe(201);

    const clientStatusAttempt = await client.patch<ApiErrorBody>(
      `/api/v1/tickets/${ticketId}/status`,
      { status: 'IN_PROGRESS' },
    );
    expect(clientStatusAttempt.status).toBe(403);

    const adminStatusRes = await admin.patch<{ data: TicketDTO }>(
      `/api/v1/tickets/${ticketId}/status`,
      { status: 'IN_PROGRESS' },
    );
    expect(adminStatusRes.status).toBe(200);
    expect(adminStatusRes.body.data.status).toBe('IN_PROGRESS');

    const detailsRes = await admin.get<{ data: TicketDetailsDTO }>(`/api/v1/tickets/${ticketId}`);
    expect(detailsRes.status).toBe(200);
    expect(detailsRes.body.data.ticket.status).toBe('IN_PROGRESS');
  });
});

describe('Notificações', () => {
  it('cliente recebe notificação quando admin responde a um ticket, e consegue marcá-la como lida', async () => {
    const { client } = await loginAsSeededClient();
    const createRes = await client.post<CreateTicketResponse>('/api/v1/tickets', {
      subject: 'Pedido de esclarecimento sobre faturação',
      category: 'FATURACAO',
      description: 'Gostaria de esclarecer um valor cobrado no último processo submetido.',
    });
    const ticketId = createRes.body.data.id;

    const { client: admin } = await loginAsAdmin();
    await admin.post(`/api/v1/tickets/${ticketId}/messages`, {
      content: 'Vamos verificar a faturação e responder em breve.',
    });

    const notifRes = await client.get<ListNotificationsResponse>('/api/v1/notifications');
    expect(notifRes.status).toBe(200);
    expect(notifRes.body.data.length).toBeGreaterThan(0);

    const unread = notifRes.body.data.find((n) => n.readAt === null);
    expect(unread).toBeDefined();

    const markReadRes = await client.patch<{ data: NotificationDTO }>(
      `/api/v1/notifications/${unread!.id}/read`,
    );
    expect(markReadRes.status).toBe(200);
    expect(markReadRes.body.data.readAt).not.toBeNull();
  });
});
