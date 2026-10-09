export type SessionSubjectType = 'CLIENT' | 'USER';

export interface RefreshSessionEntity {
  id: string;
  familyId: string;
  subjectType: SessionSubjectType;
  subjectId: string;
  expiresAt: Date;
  revokedAt: Date | null;
  replacedById: string | null;
  createdAt: Date;
}

export interface CreateRefreshSessionData {
  id: string;
  familyId: string;
  subjectType: SessionSubjectType;
  subjectId: string;
  expiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

export interface IRefreshSessionRepository {
  create(data: CreateRefreshSessionData): Promise<RefreshSessionEntity>;
  findById(id: string): Promise<RefreshSessionEntity | null>;
  /**
   * Revoga a sessão apenas se ainda estiver ativa (compare-and-set).
   * Devolve `false` se outra requisição já a tinha revogado.
   */
  revokeIfActive(id: string, replacedById?: string): Promise<boolean>;
  revokeFamily(familyId: string): Promise<void>;
  revokeAllForSubject(subjectType: SessionSubjectType, subjectId: string): Promise<void>;
}
