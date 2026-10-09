import type { FastifyRequest, FastifyReply } from 'fastify';
import type { ApiResponse, DocumentTypeDTO } from '@accountable/types';
import {
  createDocumentTypeSchema,
  updateDocumentTypeSchema,
  documentTypeFilterSchema,
} from '@accountable/schemas';
import type {
  ListActiveDocumentTypesUseCase,
  ListAllDocumentTypesUseCase,
  CreateDocumentTypeUseCase,
  UpdateDocumentTypeUseCase,
  DeleteDocumentTypeUseCase,
} from '../../application/use-cases/document-types/index.js';
import { UnauthorizedError } from '../../domain/errors/index.js';

export interface DocumentTypeControllerDependencies {
  listActiveDocumentTypesUseCase: ListActiveDocumentTypesUseCase;
  listAllDocumentTypesUseCase: ListAllDocumentTypesUseCase;
  createDocumentTypeUseCase: CreateDocumentTypeUseCase;
  updateDocumentTypeUseCase: UpdateDocumentTypeUseCase;
  deleteDocumentTypeUseCase: DeleteDocumentTypeUseCase;
}

export class DocumentTypeController {
  constructor(private readonly deps: DocumentTypeControllerDependencies) {}

  private getAuthContext(request: FastifyRequest) {
    if (!request.auth) {
      throw new UnauthorizedError('Autenticação necessária');
    }
    return {
      userId: request.auth.sub,
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
    };
  }

  /**
   * Endpoint público/cliente: retorna apenas tipos de documentos ativos ordenados
   */
  async listActive(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const docTypes = await this.deps.listActiveDocumentTypesUseCase.execute();
    const response: ApiResponse<DocumentTypeDTO[]> = { data: docTypes };
    reply.status(200).send(response);
  }

  /**
   * Endpoint admin: retorna todos os tipos com filtros
   */
  async listAll(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const filter = documentTypeFilterSchema.parse(request.query);
    const docTypes = await this.deps.listAllDocumentTypesUseCase.execute(filter);
    const response: ApiResponse<DocumentTypeDTO[]> = { data: docTypes };
    reply.status(200).send(response);
  }

  async create(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const auth = this.getAuthContext(request);
    const body = createDocumentTypeSchema.parse(request.body);

    const created = await this.deps.createDocumentTypeUseCase.execute(body, {
      userId: auth.userId,
      ipAddress: auth.ipAddress,
      userAgent: auth.userAgent,
    });

    const response: ApiResponse<DocumentTypeDTO> = {
      data: created,
      message: 'Tipo de documento criado com sucesso.',
    };
    reply.status(201).send(response);
  }

  async update(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const auth = this.getAuthContext(request);
    const { id } = request.params as { id: string };
    const body = updateDocumentTypeSchema.parse(request.body);

    const updated = await this.deps.updateDocumentTypeUseCase.execute(id, body, {
      userId: auth.userId,
      ipAddress: auth.ipAddress,
      userAgent: auth.userAgent,
    });

    const response: ApiResponse<DocumentTypeDTO> = {
      data: updated,
      message: 'Tipo de documento atualizado com sucesso.',
    };
    reply.status(200).send(response);
  }

  async remove(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const auth = this.getAuthContext(request);
    const { id } = request.params as { id: string };

    await this.deps.deleteDocumentTypeUseCase.execute(id, {
      userId: auth.userId,
      ipAddress: auth.ipAddress,
      userAgent: auth.userAgent,
    });

    reply.status(204).send();
  }
}
