// ============================================================
// Client types
// ============================================================

export interface ClientDTO {
  id: string;
  nip: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  department: string | null;
  isActive: boolean;
  emailVerified: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  userType?: 'client';
  roles?: string[];
  permissions?: string[];
}

export interface ClientProfileDTO extends ClientDTO {
  documentsCount: number;
  ticketsCount: number;
}

export interface UpdateClientProfileDTO {
  name?: string;
  phone?: string;
  company?: string;
  department?: string;
}

// ============================================================
// Admin client management DTOs
// ============================================================

export interface ClientListItemDTO {
  id: string;
  nip: string;
  name: string;
  email: string;
  company: string | null;
  isActive: boolean;
  emailVerified: boolean;
  documentsCount: number;
  createdAt: string;
}

export interface BlockClientDTO {
  reason: string;
}
