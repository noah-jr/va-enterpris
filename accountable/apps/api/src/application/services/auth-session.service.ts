import { randomUUID } from 'node:crypto';
import { UnauthorizedError } from '../../domain/errors/index.js';
import { CLIENT_ROLE, DEFAULT_CLIENT_PERMISSIONS } from '../../domain/auth/client-permissions.js';
import type {
  IClientRepository,
  IUserRepository,
  IRefreshSessionRepository,
  SessionSubjectType,
} from '../../domain/repositories/index.js';
import type {
  AccessTokenPayload,
  ITokenService,
  IUnitOfWork,
  TokenPair,
} from '../contracts/index.js';

export interface SessionRequestContext {
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Janela em que a reutilização de um refresh token já rodado é tratada como
 * corrida entre separadores do mesmo browser (e não como roubo de token).
 */
const ROTATION_GRACE_MS = 30_000;

function toSubjectType(type: AccessTokenPayload['type']): SessionSubjectType {
  return type === 'client' ? 'CLIENT' : 'USER';
}

export class AuthSessionService {
  constructor(
    private readonly tokenService: ITokenService,
    private readonly refreshSessionRepository: IRefreshSessionRepository,
    private readonly clientRepository: IClientRepository,
    private readonly userRepository: IUserRepository,
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  /**
   * Carrega roles/permissões atuais do sujeito. Devolve `null` se a conta
   * já não existir ou não estiver ativa.
   */
  async resolveClaims(
    type: AccessTokenPayload['type'],
    subjectId: string,
  ): Promise<AccessTokenPayload | null> {
    if (type === 'client') {
      const client = await this.clientRepository.findById(subjectId);
      if (!client || !client.isActive || !client.emailVerified || client.deletedAt !== null) {
        return null;
      }
      return {
        sub: client.id,
        email: client.email,
        type: 'client',
        roles: [CLIENT_ROLE],
        permissions: [...DEFAULT_CLIENT_PERMISSIONS],
      };
    }

    const user = await this.userRepository.findByIdWithRoles(subjectId);
    if (!user || !user.isActive || user.deletedAt !== null) {
      return null;
    }
    return {
      sub: user.id,
      email: user.email,
      type: 'user',
      roles: user.roles.map((r) => r.role.name),
      permissions: [
        ...new Set(user.roles.flatMap((r) => r.role.permissions.map((p) => p.permission.name))),
      ],
    };
  }

  /** Cria uma nova sessão (nova família) — usado no login. */
  async issue(claims: AccessTokenPayload, context: SessionRequestContext): Promise<TokenPair> {
    return this.createSession(claims, randomUUID(), context);
  }

  /**
   * Roda o refresh token: revoga a sessão atual e emite uma nova na mesma família.
   * Reutilizar um token já rodado (fora da janela de tolerância) revoga toda a família.
   */
  async refresh(
    rawRefreshToken: string,
    context: SessionRequestContext,
  ): Promise<{ tokens: TokenPair; claims: AccessTokenPayload }> {
    const payload = this.tokenService.verifyRefreshToken(rawRefreshToken);
    const session = await this.refreshSessionRepository.findById(payload.jti);

    if (!session || session.subjectId !== payload.sub || session.subjectType !== toSubjectType(payload.type)) {
      throw new UnauthorizedError('Sessão inválida. Faça login novamente.');
    }

    if (session.revokedAt !== null) {
      const rotatedRecently =
        session.replacedById !== null &&
        Date.now() - session.revokedAt.getTime() < ROTATION_GRACE_MS;
      if (!rotatedRecently) {
        await this.refreshSessionRepository.revokeFamily(session.familyId);
      }
      throw new UnauthorizedError('Sessão expirada. Faça login novamente.');
    }

    if (session.expiresAt.getTime() <= Date.now()) {
      throw new UnauthorizedError('Sessão expirada. Faça login novamente.');
    }

    const claims = await this.resolveClaims(payload.type, payload.sub);
    if (!claims) {
      await this.refreshSessionRepository.revokeFamily(session.familyId);
      throw new UnauthorizedError('Conta inativa ou inexistente.');
    }

    const tokens = await this.unitOfWork.run(async () => {
      const nextId = randomUUID();
      const revoked = await this.refreshSessionRepository.revokeIfActive(session.id, nextId);
      if (!revoked) {
        // Outra requisição concorrente rodou esta sessão primeiro.
        throw new UnauthorizedError('Sessão expirada. Faça login novamente.');
      }
      return this.createSession(claims, session.familyId, context, nextId);
    });

    return { tokens, claims };
  }

  /** Logout: revoga a família inteira do refresh token apresentado (se válido). */
  async revoke(rawRefreshToken: string | undefined): Promise<void> {
    if (!rawRefreshToken) return;
    try {
      const payload = this.tokenService.verifyRefreshToken(rawRefreshToken);
      const session = await this.refreshSessionRepository.findById(payload.jti);
      if (session) {
        await this.refreshSessionRepository.revokeFamily(session.familyId);
      }
    } catch {
      // Token inválido/expirado: não há sessão a revogar.
    }
  }

  /** Termina todas as sessões de um cliente/utilizador (bloqueio, reset de senha). */
  async revokeAllForSubject(type: AccessTokenPayload['type'], subjectId: string): Promise<void> {
    await this.refreshSessionRepository.revokeAllForSubject(toSubjectType(type), subjectId);
  }

  private async createSession(
    claims: AccessTokenPayload,
    familyId: string,
    context: SessionRequestContext,
    sessionId: string = randomUUID(),
  ): Promise<TokenPair> {
    const tokens = this.tokenService.generateTokenPair(claims, sessionId);
    await this.refreshSessionRepository.create({
      id: sessionId,
      familyId,
      subjectType: toSubjectType(claims.type),
      subjectId: claims.sub,
      expiresAt: tokens.refreshExpiresAt,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent?.slice(0, 500),
    });
    return tokens;
  }
}
