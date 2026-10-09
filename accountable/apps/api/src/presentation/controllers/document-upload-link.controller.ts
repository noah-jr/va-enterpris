import type { FastifyRequest, FastifyReply } from 'fastify';
import type { ApiResponse, DocumentUploadLinkDTO, PublicUploadContextDTO, DocumentFileDTO } from '@accountable/types';
import { createUploadLinkSchema } from '@accountable/schemas';
import type {
  CreateDocumentUploadLinkUseCase,
  RevokeDocumentUploadLinkUseCase,
  GetUploadLinkContextUseCase,
  UploadViaPublicLinkUseCase,
} from '../../application/use-cases/document-upload-links/index.js';
import type { DocumentFileEntity } from '../../domain/repositories/document.repository.interface.js';
import { UnauthorizedError, ValidationError } from '../../domain/errors/index.js';

export interface DocumentUploadLinkControllerDependencies {
  createDocumentUploadLinkUseCase: CreateDocumentUploadLinkUseCase;
  revokeDocumentUploadLinkUseCase: RevokeDocumentUploadLinkUseCase;
  getUploadLinkContextUseCase: GetUploadLinkContextUseCase;
  uploadViaPublicLinkUseCase: UploadViaPublicLinkUseCase;
  clientAppUrl: string;
}

export class DocumentUploadLinkController {
  constructor(private readonly deps: DocumentUploadLinkControllerDependencies) {}

  async create(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ): Promise<void> {
    if (!request.auth) {
      throw new UnauthorizedError('Autenticação necessária');
    }
    const { id } = request.params;
    const body = createUploadLinkSchema.parse(request.body ?? {});

    const link = await this.deps.createDocumentUploadLinkUseCase.execute(
      { documentId: id, expiresInHours: body.expiresInHours },
      {
        actorId: request.auth.sub,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
      },
    );

    const response: ApiResponse<DocumentUploadLinkDTO> = {
      data: {
        id: link.id,
        token: link.token,
        url: `${this.deps.clientAppUrl.replace(/\/+$/, '')}/upload/${link.token}`,
        expiresAt: link.expiresAt.toISOString(),
        createdAt: link.createdAt.toISOString(),
        revokedAt: link.revokedAt ? link.revokedAt.toISOString() : null,
      },
      message: 'Link de envio gerado com sucesso.',
    };

    reply.status(201).send(response);
  }

  async revoke(
    request: FastifyRequest<{ Params: { id: string; linkId: string } }>,
    reply: FastifyReply,
  ): Promise<void> {
    if (!request.auth) {
      throw new UnauthorizedError('Autenticação necessária');
    }
    const { id, linkId } = request.params;

    await this.deps.revokeDocumentUploadLinkUseCase.execute(
      { documentId: id, linkId },
      {
        actorId: request.auth.sub,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
      },
    );

    const response: ApiResponse<null> = {
      data: null,
      message: 'Link de envio revogado com sucesso.',
    };

    reply.status(200).send(response);
  }

  async getPublicContext(
    request: FastifyRequest<{ Params: { token: string } }>,
    reply: FastifyReply,
  ): Promise<void> {
    const { token } = request.params;

    const context = await this.deps.getUploadLinkContextUseCase.execute(token);

    const response: ApiResponse<PublicUploadContextDTO> = {
      data: {
        documentTitle: context.documentTitle,
        documentType: context.documentType,
        documentStatus: context.documentStatus as PublicUploadContextDTO['documentStatus'],
        clientName: context.clientName,
        existingFiles: context.existingFiles.map((file) => ({
          originalName: file.originalName,
          createdAt: file.createdAt.toISOString(),
        })),
      },
    };

    reply.status(200).send(response);
  }

  async uploadPublicFile(
    request: FastifyRequest<{ Params: { token: string } }>,
    reply: FastifyReply,
  ): Promise<void> {
    const { token } = request.params;

    const fileData = await request.file();
    if (!fileData) {
      throw new ValidationError('Nenhum ficheiro enviado.');
    }

    const buffer = await fileData.toBuffer();
    const originalName = fileData.filename;
    const mimeType = fileData.mimetype;
    const size = buffer.length;

    const uploaded: DocumentFileEntity = await this.deps.uploadViaPublicLinkUseCase.execute(
      { token, originalName, mimeType, buffer, size },
      { ipAddress: request.ip, userAgent: request.headers['user-agent'] },
    );

    const response: ApiResponse<DocumentFileDTO> = {
      data: {
        id: uploaded.id,
        documentId: uploaded.documentId,
        originalName: uploaded.originalName,
        mimeType: uploaded.mimeType,
        size: uploaded.size,
        uploaderType: uploaded.uploaderType,
        createdAt: uploaded.createdAt.toISOString(),
      },
      message: 'Ficheiro enviado com sucesso.',
    };

    reply.status(201).send(response);
  }
}
