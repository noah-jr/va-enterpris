import type { AuditAction } from '@accountable/types';

// ============================================================
// IAuditRepository
// ============================================================

export interface CreateAuditLogData {
  userId?: string;
  clientId?: string;
  action: AuditAction;
  entity?: string;
  entityId?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

export interface IAuditRepository {
  log(data: CreateAuditLogData): Promise<void>;
  list(params: {
    page: number;
    perPage: number;
    action?: string;
    userId?: string;
    clientId?: string;
    entity?: string;
    from?: Date;
    to?: Date;
  }): Promise<{
    items: Array<{
      id: string;
      userId: string | null;
      clientId: string | null;
      action: string;
      entity: string | null;
      entityId: string | null;
      oldValues: Record<string, unknown> | null;
      newValues: Record<string, unknown> | null;
      ipAddress: string | null;
      userAgent: string | null;
      metadata: Record<string, unknown> | null;
      createdAt: Date;
    }>;
    total: number;
  }>;
}

// ============================================================
// IUserRepository
// ============================================================

export interface UserEntity {
  id: string;
  email: string;
  name: string | null;
  passwordHash: string;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface UserWithRolesEntity extends UserEntity {
  roles: Array<{
    role: {
      id: string;
      name: string;
      permissions: Array<{ permission: { name: string } }>;
    };
  }>;
}

export interface IUserRepository {
  findById(id: string): Promise<UserEntity | null>;
  findByIdWithRoles(id: string): Promise<UserWithRolesEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  create(data: { email: string; name: string | null; passwordHash: string; roleIds: string[] }): Promise<UserEntity>;
  update(id: string, data: Partial<Omit<UserEntity, 'id' | 'createdAt'>>): Promise<UserEntity>;
  /** Substitui os perfis do utilizador. */
  setRoles(id: string, roleIds: string[]): Promise<void>;
  softDelete(id: string): Promise<void>;
  list(params: { page: number; perPage: number; search?: string }): Promise<{ items: UserWithRolesEntity[]; total: number }>;
  /** Nº de utilizadores ativos que têm a permissão (via algum perfil). */
  countActiveWithPermission(permission: string, excludeUserId?: string): Promise<number>;
}

// ============================================================
// IRoleRepository
// ============================================================

export interface RoleEntity {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  permissions: string[];
  usersCount: number;
}

export interface PermissionEntity {
  id: string;
  name: string;
  description: string | null;
}

export interface IRoleRepository {
  list(): Promise<RoleEntity[]>;
  findById(id: string): Promise<RoleEntity | null>;
  findByName(name: string): Promise<RoleEntity | null>;
  findByIds(ids: string[]): Promise<RoleEntity[]>;
  create(data: { name: string; description: string | null; permissions: string[] }): Promise<RoleEntity>;
  update(id: string, data: { name?: string; description?: string | null; permissions?: string[] }): Promise<RoleEntity>;
  delete(id: string): Promise<void>;
  listPermissions(): Promise<PermissionEntity[]>;
}

// ============================================================
// ITokenRepository — tokens enviados por email (link + código OTP)
// ============================================================

export type EmailTokenKind = 'EMAIL_VERIFICATION' | 'CLIENT_PASSWORD_RESET' | 'USER_PASSWORD_RESET';

export interface EmailTokenRecord {
  id: string;
  /** clientId (verificação/reset de cliente) ou userId (reset/convite de utilizador). */
  ownerId: string;
  expiresAt: Date;
  usedAt: Date | null;
  otpHash: string | null;
  otpAttempts: number;
}

export interface ITokenRepository {
  create(
    kind: EmailTokenKind,
    data: { ownerId: string; tokenHash: string; otpHash: string | null; expiresAt: Date },
  ): Promise<EmailTokenRecord>;
  findByTokenHash(kind: EmailTokenKind, tokenHash: string): Promise<EmailTokenRecord | null>;
  /** Token mais recente ainda não usado e não expirado do dono. */
  findLatestActive(kind: EmailTokenKind, ownerId: string): Promise<EmailTokenRecord | null>;
  incrementOtpAttempts(kind: EmailTokenKind, id: string): Promise<void>;
  /** Marca como usado apenas se ainda não estava (atómico). Devolve false se já tinha sido usado. */
  markUsed(kind: EmailTokenKind, id: string): Promise<boolean>;
  /** Substitui o hash do link (usado para emitir um setup token após verificação por OTP). */
  replaceTokenHash(kind: EmailTokenKind, id: string, tokenHash: string): Promise<void>;
  /** Invalida todos os tokens ativos do dono (ao reenviar um novo código). */
  invalidateActive(kind: EmailTokenKind, ownerId: string): Promise<void>;
}
