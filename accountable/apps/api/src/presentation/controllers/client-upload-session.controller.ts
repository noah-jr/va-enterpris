import type { FastifyRequest, FastifyReply } from 'fastify';
import type {
  ApiResponse,
  ClientUploadSessionDTO,
  PublicClientUploadSessionContextDTO,
} from '@accountable/types';
import { createClientUploadSessionSchema, publicClientSessionUploadSchema } from '@accountable/schemas';
import type { CreateClientUploadSessionUseCase } from '../../application/use-cases/client-upload-sessions/create-client-upload-session.use-case.js';
import type { GetClientUploadSessionContextUseCase } from '../../application/use-cases/client-upload-sessions/get-client-upload-session-context.use-case.js';
import type { UploadDocumentViaSessionUseCase } from '../../application/use-cases/client-upload-sessions/upload-document-via-session.use-case.js';
import type { ListClientUploadSessionsUseCase } from '../../application/use-cases/client-upload-sessions/list-client-upload-sessions.use-case.js';
import type { RevokeClientUploadSessionUseCase } from '../../application/use-cases/client-upload-sessions/revoke-client-upload-session.use-case.js';
import { UnauthorizedError, ValidationError } from '../../domain/errors/index.js';

export interface ClientUploadSessionControllerDependencies {
  createClientUploadSessionUseCase: CreateClientUploadSessionUseCase;
  getClientUploadSessionContextUseCase: GetClientUploadSessionContextUseCase;
  uploadDocumentViaSessionUseCase: UploadDocumentViaSessionUseCase;
  listClientUploadSessionsUseCase: ListClientUploadSessionsUseCase;
  revokeClientUploadSessionUseCase: RevokeClientUploadSessionUseCase;
}

export class ClientUploadSessionController {
  constructor(private readonly deps: ClientUploadSessionControllerDependencies) {}

  async create(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ): Promise<void> {
    if (!request.auth) {
      throw new UnauthorizedError('Autenticação necessária');
    }
    const { id } = request.params;
    const rawBody = (request.body as Record<string, unknown>) ?? {};
    const body = createClientUploadSessionSchema.parse({
      ...rawBody,
      clientId: id,
    });

    const session = await this.deps.createClientUploadSessionUseCase.execute(
      {
        clientId: id,
        month: body.month,
        year: body.year,
        label: body.label,
        expiresInDays: body.expiresInDays,
      },
      {
        actorId: request.auth.sub,
        actorType: request.auth.type,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
      },
    );

    const response: ApiResponse<ClientUploadSessionDTO> = {
      data: {
        id: session.id,
        clientId: session.clientId,
        clientName: session.clientName,
        companyName: session.companyName ?? undefined,
        month: session.month,
        year: session.year,
        label: session.label,
        token: session.token,
        url: session.url,
        createdAt: session.createdAt.toISOString(),
        expiresAt: session.expiresAt.toISOString(),
        revokedAt: session.revokedAt ? session.revokedAt.toISOString() : null,
      },
      message: 'Link de envio gerado com sucesso.',
    };

    reply.status(201).send(response);
  }

  async list(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ): Promise<void> {
    if (!request.auth) {
      throw new UnauthorizedError('Autenticação necessária');
    }
    const { id } = request.params;

    const sessions = await this.deps.listClientUploadSessionsUseCase.execute(id);

    const response: ApiResponse<ClientUploadSessionDTO[]> = {
      data: sessions,
    };

    reply.status(200).send(response);
  }

  async revoke(
    request: FastifyRequest<{ Params: { id: string; sessionId: string } }>,
    reply: FastifyReply,
  ): Promise<void> {
    if (!request.auth) {
      throw new UnauthorizedError('Autenticação necessária');
    }
    const { id, sessionId } = request.params;

    await this.deps.revokeClientUploadSessionUseCase.execute({ clientId: id, sessionId }, {
      actorId: request.auth.sub,
      actorType: request.auth.type,
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
    });

    const response: ApiResponse<null> = {
      data: null,
      message: 'Link de envio revogado com sucesso.',
    };

    reply.status(200).send(response);
  }

  async getPublicContext(
    request: FastifyRequest<{
      Querystring: { token?: string };
    }>,
    reply: FastifyReply,
  ): Promise<void> {
    const { token } = request.query;
    if (!token) {
      throw new ValidationError('Parâmetro token é obrigatório.');
    }

    const context = await this.deps.getClientUploadSessionContextUseCase.execute(token);

    const response: ApiResponse<PublicClientUploadSessionContextDTO> = {
      data: context,
    };

    reply.status(200).send(response);
  }

  async uploadPublicFile(
    request: FastifyRequest<{
      Querystring: { token?: string };
    }>,
    reply: FastifyReply,
  ): Promise<void> {
    const fileData = await request.file();
    if (!fileData) {
      throw new ValidationError('Nenhum ficheiro foi enviado.');
    }

    let token = request.query.token;
    let title: string | undefined;
    let type: string | undefined;
    let description: string | undefined;

    // Fastify multipart fields
    const fields = fileData.fields as Record<string, { value?: unknown } | undefined> | undefined;
    if (fields) {
      if (fields.token?.value && typeof fields.token.value === 'string') {
        token = fields.token.value;
      }
      if (fields.title?.value && typeof fields.title.value === 'string') {
        title = fields.title.value;
      }
      if (fields.type?.value && typeof fields.type.value === 'string') {
        type = fields.type.value;
      }
      if (fields.description?.value && typeof fields.description.value === 'string') {
        description = fields.description.value;
      }
    }

    if (!token) {
      throw new ValidationError('Token de sessão é obrigatório.');
    }

    const metadata = publicClientSessionUploadSchema.parse({ title, type, description });

    const buffer = await fileData.toBuffer();
    const originalName = fileData.filename;
    const mimeType = fileData.mimetype;
    const size = buffer.length;

    const result = await this.deps.uploadDocumentViaSessionUseCase.execute(
      {
        token,
        title: metadata.title,
        type: metadata.type,
        description: metadata.description,
        originalName,
        mimeType,
        buffer,
        size,
      },
      {
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
      },
    );

    const response: ApiResponse<{
      documentId: string;
      fileId: string;
      title: string;
      status: string;
      createdAt: string;
    }> = {
      data: {
        documentId: result.document.id,
        fileId: result.file.id,
        title: result.document.title,
        status: result.document.status,
        createdAt: result.document.createdAt.toISOString(),
      },
      message: 'Documento enviado e processado com sucesso.',
    };

    reply.status(201).send(response);
  }
}
