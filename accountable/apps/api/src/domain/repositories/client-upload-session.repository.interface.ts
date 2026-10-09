export interface ClientUploadSessionEntity {
  id: string;
  clientId: string;
  /** Nulo quando a sessão foi criada pelo próprio cliente. */
  createdByUserId: string | null;
  label: string | null;
  month: number | null;
  year: number | null;
  tokenHash: string;
  tokenEncrypted: string | null;
  expiresAt: Date;
  revokedAt: Date | null;
  createdAt: Date;
}

export interface ClientUploadSessionWithRelationsEntity extends ClientUploadSessionEntity {
  client: {
    id: string;
    name: string;
    email: string;
    nip: string;
    company: string | null;
  };
  createdByUser?: {
    id: string;
    email: string;
  } | null;
  documents?: Array<{
    id: string;
    title: string;
    type: string;
    status: string;
    createdAt: Date;
    files?: Array<{
      id: string;
      originalName: string;
      createdAt: Date;
    }>;
    _count?: {
      files: number;
    };
  }>;
  _count?: {
    documents: number;
  };
}

export interface CreateClientUploadSessionData {
  clientId: string;
  createdByUserId: string | null;
  label?: string | null;
  month?: number | null;
  year?: number | null;
  tokenHash: string;
  tokenEncrypted: string;
  expiresAt: Date;
}

export interface IClientUploadSessionRepository {
  create(data: CreateClientUploadSessionData): Promise<ClientUploadSessionEntity>;
  findById(id: string): Promise<ClientUploadSessionWithRelationsEntity | null>;
  findByTokenHash(tokenHash: string): Promise<ClientUploadSessionWithRelationsEntity | null>;
  listByClientId(clientId: string): Promise<ClientUploadSessionWithRelationsEntity[]>;
  revoke(id: string): Promise<void>;
}
