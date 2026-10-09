import type { FastifyRequest, FastifyReply } from 'fastify';
import type { ApiResponse, BackupDTO, BackupType } from '@accountable/types';
import type {
  ListBackupsUseCase,
  CreateBackupUseCase,
} from '../../application/use-cases/backups/index.js';
import { UnauthorizedError, ValidationError } from '../../domain/errors/index.js';

export interface BackupControllerDependencies {
  listBackupsUseCase: ListBackupsUseCase;
  createBackupUseCase: CreateBackupUseCase;
}

export class BackupController {
  constructor(private readonly deps: BackupControllerDependencies) {}

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

  async list(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const backups = await this.deps.listBackupsUseCase.execute();
    const response: ApiResponse<BackupDTO[]> = {
      data: backups,
    };
    reply.status(200).send(response);
  }

  async create(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const auth = this.getAuthContext(request);
    const body = request.body as { type?: BackupType };

    if (!body?.type || !['FULL', 'INCREMENTAL'].includes(body.type)) {
      throw new ValidationError('Tipo de backup inválido. Use FULL ou INCREMENTAL.');
    }

    const backup = await this.deps.createBackupUseCase.execute(body.type, {
      actorId: auth.actorId,
      ipAddress: auth.ipAddress,
      userAgent: auth.userAgent,
    });

    const response: ApiResponse<BackupDTO> = {
      data: backup,
      message: `Cópia de segurança (${backup.type}) criada com sucesso.`,
    };
    reply.status(201).send(response);
  }
}
