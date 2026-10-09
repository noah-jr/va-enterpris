// ============================================================
// IClientRepository
// ============================================================

export interface ClientEntity {
  id: string;
  nip: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  department: string | null;
  isActive: boolean;
  emailVerified: boolean;
  passwordHash: string | null;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface CreateClientData {
  nip: string;
  name: string;
  email: string;
}

export interface IClientRepository {
  findById(id: string): Promise<ClientEntity | null>;
  findByEmail(email: string): Promise<ClientEntity | null>;
  findByNip(nip: string): Promise<ClientEntity | null>;
  create(data: CreateClientData): Promise<ClientEntity>;
  update(id: string, data: Partial<Omit<ClientEntity, 'id' | 'createdAt'>>): Promise<ClientEntity>;
  /** Define a senha apenas se ainda não existir (atómico). Devolve `false` se já havia senha. */
  setInitialPassword(id: string, passwordHash: string): Promise<boolean>;
  softDelete(id: string): Promise<void>;
  list(params: {
    page: number;
    perPage: number;
    search?: string;
    isActive?: boolean;
  }): Promise<{ items: Array<ClientEntity & { documentsCount?: number }>; total: number }>;
}
