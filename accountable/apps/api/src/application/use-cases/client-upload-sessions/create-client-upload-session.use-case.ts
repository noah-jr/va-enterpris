import { NotFoundError, BusinessRuleError } from '../../../domain/errors/index.js';
import type { IClientRepository } from '../../../domain/repositories/client.repository.interface.js';
import type { IAuditRepository } from '../../../domain/repositories/user.repository.interface.js';
import type {
  IClientUploadSessionRepository,
  ClientUploadSessionEntity,
} from '../../../domain/repositories/client-upload-session.repository.interface.js';
import type { ISecretCipher, ITokenService, IUnitOfWork } from '../../contracts/index.js';
import {
  buildUploadSessionUrl,
  DEFAULT_UPLOAD_SESSION_TTL_DAYS,
  MAX_UPLOAD_SESSION_TTL_DAYS,
} from './upload-session-url.js';

export interface CreateClientUploadSessionInput {
  clientId: string;
  month?: number | null;
  year?: number | null;
  label?: string | null;
  expiresInDays?: number;
}

export interface ClientUploadSessionResult extends ClientUploadSessionEntity {
  /** Token em claro — devolvido apenas no momento da criação. */
  token: string;
  url: string;
  clientName: string;
  companyName: string | null;
}

export class CreateClientUploadSessionUseCase {
  constructor(
    private readonly clientRepository: IClientRepository,
    private readonly clientUploadSessionRepository: IClientUploadSessionRepository,
    private readonly auditRepository: IAuditRepository,
    private readonly tokenService: ITokenService,
    private readonly secretCipher: ISecretCipher,
    private readonly unitOfWork: IUnitOfWork,
    private readonly clientPortalUrl: string,
    private readonly defaultTtlDays: number = DEFAULT_UPLOAD_SESSION_TTL_DAYS,
  ) {}

  async execute(
    input: CreateClientUploadSessionInput,
    context: {
      actorId: string;
      actorType: 'client' | 'user';
      ipAddress?: string;
      userAgent?: string;
    },
  ): Promise<ClientUploadSessionResult> {
    const client = await this.clientRepository.findById(input.clientId);
    if (!client) {
      throw new NotFoundError('Cliente', input.clientId);
    }

    if (!client.isActive) {
      throw new BusinessRuleError('Não é possível criar link de envio para um cliente inativo ou bloqueado.');
    }

    const token = this.tokenService.generateSecureToken();
    const ttlDays = Math.min(input.expiresInDays ?? this.defaultTtlDays, MAX_UPLOAD_SESSION_TTL_DAYS);
    const expiresAt = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000);

    const session = await this.unitOfWork.run(async () => {
      const created = await this.clientUploadSessionRepository.create({
        clientId: client.id,
        createdByUserId: context.actorType === 'user' ? context.actorId : null,
        label: input.label ?? null,
        month: input.month ?? null,
        year: input.year ?? null,
        tokenHash: this.tokenService.hashToken(token),
        tokenEncrypted: this.secretCipher.encrypt(token),
        expiresAt,
      });

      await this.auditRepository.log({
        ...(context.actorType === 'user' ? { userId: context.actorId } : {}),
        clientId: client.id,
        action: 'CLIENT_UPLOAD_SESSION_CREATED',
        entity: 'ClientUploadSession',
        entityId: created.id,
        newValues: {
          clientId: client.id,
          month: input.month ?? null,
          year: input.year ?? null,
          label: input.label ?? null,
          expiresAt: expiresAt.toISOString(),
          createdBy: context.actorType,
        },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      });

      return created;
    });

    const url = buildUploadSessionUrl(this.clientPortalUrl, token, {
      month: session.month,
      year: session.year,
      companyName: client.company || client.name,
    });

    return {
      ...session,
      token,
      url,
      clientName: client.name,
      companyName: client.company,
    };
  }
}
