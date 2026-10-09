import type { FastifyRequest, FastifyReply } from 'fastify';
import type { ApiResponse } from '@accountable/types';
import {
  createDocumentSchema,
  updateDocumentStatusSchema,
  documentFilterSchema,
} from '@accountable/schemas';
import type {
  CreateDocumentUseCase,
  UpdateDocumentStatusUseCase,
  UploadDocumentFileUseCase,
  GetDocumentUseCase,
  ListDocumentsUseCase,
  GetDocumentOcrUseCase,
  DocumentDetailsOutput,
} from '../../application/use-cases/documents/index.js';
import type {
  DocumentEntity,
  DocumentFileEntity,
} from '../../domain/repositories/document.repository.interface.js';
import { UnauthorizedError, ValidationError } from '../../domain/errors/index.js';
import type { DocumentOcrResult } from '@accountable/types';

export interface DocumentControllerDependencies {
  createDocumentUseCase: CreateDocumentUseCase;
  updateDocumentStatusUseCase: UpdateDocumentStatusUseCase;
  uploadDocumentFileUseCase: UploadDocumentFileUseCase;
  getDocumentUseCase: GetDocumentUseCase;
  listDocumentsUseCase: ListDocumentsUseCase;
  getDocumentOcrUseCase: GetDocumentOcrUseCase;
}

export class DocumentController {
  constructor(private readonly deps: DocumentControllerDependencies) {}

  private getAuthContext(request: FastifyRequest) {
    if (!request.auth) {
      throw new UnauthorizedError('Autenticação necessária');
    }
    return {
      actorId: request.auth.sub,
      actorType: request.auth.type,
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
    };
  }

  async create(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const auth = this.getAuthContext(request);
    const body = createDocumentSchema.parse(request.body);

    // Se for CLIENT, o clientId é o próprio sub do token
    // Se for USER, pode vir do body (query/body)
    const rawBody = request.body as Record<string, unknown>;
    const targetClientId =
      auth.actorType === 'client'
        ? auth.actorId
        : (typeof rawBody.clientId === 'string' ? rawBody.clientId : '');

    if (!targetClientId) {
      throw new ValidationError('O campo clientId é obrigatório ao criar documento como colaborador.');
    }

    const document = await this.deps.createDocumentUseCase.execute(
      {
        clientId: targetClientId,
        title: body.title,
        description: body.description,
        type: body.type,
        priority: body.priority,
        submitImmediately: auth.actorType === 'client',
      },
      auth,
    );

    const response: ApiResponse<DocumentEntity> = {
      data: document,
      message: 'Documento criado com sucesso.',
    };

    reply.status(201).send(response);
  }

  async list(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const auth = this.getAuthContext(request);
    const filter = documentFilterSchema.parse(request.query);

    const result = await this.deps.listDocumentsUseCase.execute(
      {
        page: filter.page,
        perPage: filter.perPage,
        status: filter.status,
        priority: filter.priority,
        search: filter.search,
        clientId: filter.clientId,
      },
      auth,
    );

    reply.status(200).send(result);
  }

  async getById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ): Promise<void> {
    const auth = this.getAuthContext(request);
    const { id } = request.params;

    const details = await this.deps.getDocumentUseCase.execute(id, auth);

    const response: ApiResponse<DocumentDetailsOutput> = {
      data: details,
    };

    reply.status(200).send(response);
  }

  async updateStatus(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ): Promise<void> {
    const auth = this.getAuthContext(request);
    const { id } = request.params;
    const body = updateDocumentStatusSchema.parse(request.body);

    const updated = await this.deps.updateDocumentStatusUseCase.execute(
      {
        documentId: id,
        toStatus: body.status,
        note: body.note,
      },
      auth,
    );

    const response: ApiResponse<DocumentEntity> = {
      data: updated,
      message: 'Estado do documento atualizado com sucesso.',
    };

    reply.status(200).send(response);
  }

  async uploadFile(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ): Promise<void> {
    const auth = this.getAuthContext(request);
    const { id } = request.params;

    const fileData = await request.file();
    if (!fileData) {
      throw new ValidationError('Nenhum ficheiro enviado.');
    }

    const buffer = await fileData.toBuffer();
    const originalName = fileData.filename;
    const mimeType = fileData.mimetype;
    const size = buffer.length;

    const uploaded = await this.deps.uploadDocumentFileUseCase.execute(
      {
        documentId: id,
        originalName,
        mimeType,
        buffer,
        size,
      },
      auth,
    );

    const response: ApiResponse<DocumentFileEntity> = {
      data: uploaded,
      message: 'Ficheiro anexado com sucesso.',
    };

    reply.status(201).send(response);
  }

  async getOcr(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ): Promise<void> {
    const auth = this.getAuthContext(request);
    const { id } = request.params;

    const result = await this.deps.getDocumentOcrUseCase.execute(id, {
      actorId: auth.actorId,
      actorType: auth.actorType,
    });

    const response: ApiResponse<DocumentOcrResult> = {
      data: result,
      message: 'Análise OCR e apoio à decisão processados com sucesso.',
    };

    reply.status(200).send(response);
  }
}
