import { randomBytes } from 'node:crypto';
import { UnauthorizedError, ValidationError } from '../../../domain/errors/index.js';
import type { IClientRepository } from '../../../domain/repositories/index.js';
import type { IUserRepository } from '../../../domain/repositories/index.js';
import type { IAuditRepository } from '../../../domain/repositories/index.js';
import type { IHasher, TokenPair } from '../../contracts/index.js';
import type { AuthSessionService } from '../../services/auth-session.service.js';

export { DEFAULT_CLIENT_PERMISSIONS } from '../../../domain/auth/client-permissions.js';

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginOutput extends TokenPair {
  userId: string;
  userType: 'client' | 'user';
  roles: string[];
  permissions: string[];
}

interface LoginContext {
  ipAddress?: string;
  userAgent?: string;
}

const INVALID_CREDENTIALS = 'Credenciais inválidas.';

/**
 * Hash de uma senha aleatória, calculado uma vez, para que o bcrypt corra sempre —
 * mesmo quando a conta não existe — e o tempo de resposta não revele que emails existem.
 */
class DummyHash {
  private value: Promise<string> | null = null;

  constructor(private readonly hasher: IHasher) {}

  get(): Promise<string> {
    this.value ??= this.hasher.hash(randomBytes(32).toString('hex'));
    return this.value;
  }
}

// ============================================================
// Client Login
// ============================================================

export class LoginClientUseCase {
  private readonly dummyHash: DummyHash;

  constructor(
    private readonly clientRepository: IClientRepository,
    private readonly hasher: IHasher,
    private readonly sessionService: AuthSessionService,
    private readonly auditRepository: IAuditRepository,
  ) {
    this.dummyHash = new DummyHash(hasher);
  }

  async execute(input: LoginInput, context: LoginContext): Promise<LoginOutput> {
    const client = await this.clientRepository.findByEmail(input.email);

    const passwordHash = client?.passwordHash ?? (await this.dummyHash.get());
    const passwordMatch = await this.hasher.compare(input.password, passwordHash);

    // A senha é validada ANTES de qualquer estado da conta: só quem conhece a senha
    // descobre se o email está por verificar ou a conta suspensa.
    if (!client || client.passwordHash === null || !passwordMatch) {
      await this.auditRepository.log({
        ...(client ? { clientId: client.id, entityId: client.id } : {}),
        action: 'LOGIN_FAILED',
        entity: 'Client',
        metadata: client
          ? { reason: client.passwordHash === null ? 'password_not_set' : 'wrong_password' }
          : { reason: 'not_found', email: input.email },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      });
      throw new UnauthorizedError(INVALID_CREDENTIALS);
    }

    if (!client.emailVerified) {
      throw new ValidationError('Email ainda não verificado. Verifique a sua caixa de correio.');
    }

    const claims = await this.sessionService.resolveClaims('client', client.id);
    if (!claims) {
      throw new UnauthorizedError('Conta inativa ou suspensa. Contacte o suporte.');
    }

    const tokenPair = await this.sessionService.issue(claims, context);

    await this.clientRepository.update(client.id, { lastLoginAt: new Date() });

    await this.auditRepository.log({
      clientId: client.id,
      action: 'LOGIN',
      entity: 'Client',
      entityId: client.id,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });

    return {
      ...tokenPair,
      userId: client.id,
      userType: 'client',
      roles: claims.roles ?? [],
      permissions: claims.permissions ?? [],
    };
  }
}

// ============================================================
// Admin/User Login
// ============================================================

export class LoginUserUseCase {
  private readonly dummyHash: DummyHash;

  constructor(
    private readonly userRepository: IUserRepository,
    private readonly hasher: IHasher,
    private readonly sessionService: AuthSessionService,
    private readonly auditRepository: IAuditRepository,
  ) {
    this.dummyHash = new DummyHash(hasher);
  }

  async execute(input: LoginInput, context: LoginContext): Promise<LoginOutput> {
    const user = await this.userRepository.findByEmail(input.email);

    const passwordHash = user?.passwordHash ?? (await this.dummyHash.get());
    const passwordMatch = await this.hasher.compare(input.password, passwordHash);

    if (!user || !passwordMatch) {
      await this.auditRepository.log({
        ...(user ? { userId: user.id, entityId: user.id } : {}),
        action: 'LOGIN_FAILED',
        entity: 'User',
        metadata: user ? { reason: 'wrong_password' } : { reason: 'not_found', email: input.email },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      });
      throw new UnauthorizedError(INVALID_CREDENTIALS);
    }

    const claims = await this.sessionService.resolveClaims('user', user.id);
    if (!claims) {
      throw new UnauthorizedError('Conta inativa. Contacte o administrador.');
    }

    const tokenPair = await this.sessionService.issue(claims, context);

    await this.userRepository.update(user.id, { lastLoginAt: new Date() });

    await this.auditRepository.log({
      userId: user.id,
      action: 'LOGIN',
      entity: 'User',
      entityId: user.id,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });

    return {
      ...tokenPair,
      userId: user.id,
      userType: 'user',
      roles: claims.roles ?? [],
      permissions: claims.permissions ?? [],
    };
  }
}
