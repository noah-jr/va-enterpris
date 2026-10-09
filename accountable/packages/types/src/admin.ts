// ============================================================
// User & RBAC types
// ============================================================

export type RoleName = 'ADMINISTRATOR' | 'CONSULTANT' | 'SUPPORT';

export interface UserDTO {
  id: string;
  email: string;
  name: string | null;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  /** Nomes dos roles (os de sistema são RoleName; roles personalizados podem ter outros nomes). */
  roles: string[];
  roleIds: string[];
}

export interface RoleDTO {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  permissions: string[];
  usersCount: number;
}

export interface PermissionDTO {
  id: string;
  name: string;
  description: string | null;
}

// ============================================================
// Notification types
// ============================================================

export interface NotificationDTO {
  id: string;
  recipientId: string;
  recipientType: 'CLIENT' | 'USER';
  type: string;
  title: string;
  body: string;
  readAt: string | null;
  createdAt: string;
  metadata?: Record<string, string | number | boolean>;
}

// ============================================================
// Audit types
// ============================================================

export type AuditAction =
  | 'LOGIN'
  | 'LOGOUT'
  | 'LOGIN_FAILED'
  | 'PASSWORD_CHANGED'
  | 'PASSWORD_RESET'
  | 'EMAIL_VERIFIED'
  | 'DOCUMENT_CREATED'
  | 'DOCUMENT_UPDATED'
  | 'DOCUMENT_DELETED'
  | 'DOCUMENT_STATUS_CHANGED'
  | 'DOCUMENT_ASSIGNED'
  | 'FILE_UPLOADED'
  | 'FILE_DOWNLOADED'
  | 'FILE_DELETED'
  | 'MESSAGE_SENT'
  | 'DOCUMENT_RESPONDED'
  | 'DOCUMENT_REQUESTED'
  | 'CLIENT_CREATED'
  | 'CLIENT_UPDATED'
  | 'CLIENT_BLOCKED'
  | 'CLIENT_UNBLOCKED'
  | 'USER_CREATED'
  | 'USER_UPDATED'
  | 'USER_DELETED'
  | 'PERMISSION_CHANGED'
  | 'BACKUP_CREATED'
  | 'BACKUP_RESTORED'
  | 'BACKUP_DELETED'
  | 'TICKET_CREATED'
  | 'TICKET_STATUS_CHANGED'
  | 'TICKET_REPLIED'
  | 'PLAN_CREATED'
  | 'PLAN_UPDATED'
  | 'PLAN_DELETED'
  | 'CONTACT_REQUEST_SUBMITTED'
  | 'DOCUMENT_UPLOAD_LINK_CREATED'
  | 'DOCUMENT_UPLOAD_LINK_REVOKED'
  | 'DOCUMENT_FILE_UPLOADED_VIA_LINK'
  | 'CLIENT_UPLOAD_SESSION_CREATED'
  | 'CLIENT_UPLOAD_SESSION_REVOKED'
  | 'DOCUMENT_CREATED_VIA_PUBLIC_SESSION'
  | 'DOCUMENT_TYPE_CREATED'
  | 'DOCUMENT_TYPE_UPDATED'
  | 'DOCUMENT_TYPE_DELETED'
  | 'USER_INVITED'
  | 'USER_PASSWORD_RESET_REQUESTED'
  | 'ROLE_CREATED'
  | 'ROLE_UPDATED'
  | 'ROLE_DELETED'
  | 'EMAIL_SETTINGS_UPDATED'
  | 'EMAIL_SETTINGS_TESTED'
  | 'VERIFICATION_RESENT'
  | 'SUBSCRIPTION_CREATED'
  | 'SUBSCRIPTION_UPDATED'
  | 'SUBSCRIPTION_RENEWED'
  | 'SUBSCRIPTION_CANCELLED';

export interface AuditLogDTO {
  id: string;
  userId: string | null;
  clientId: string | null;
  action: AuditAction;
  entity: string | null;
  entityId: string | null;
  oldValues: Record<string, unknown> | null;
  newValues: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

// ============================================================
// Backup types
// ============================================================

export type BackupType = 'FULL' | 'INCREMENTAL';
export type BackupStatus = 'PENDING' | 'IN_PROGRESS' | 'SUCCESS' | 'FAILED';

export interface BackupDTO {
  id: string;
  type: BackupType;
  status: BackupStatus;
  size: number | null;
  checksum: string | null;
  createdById: string | null;
  createdAt: string;
  completedAt: string | null;
}

// ============================================================
// Pagination query params
// ============================================================

export interface PaginationParams {
  page?: number;
  perPage?: number;
}

export interface DocumentFilterParams extends PaginationParams {
  status?: string;
  priority?: string;
  clientId?: string;
  search?: string;
}

export interface ClientFilterParams extends PaginationParams {
  search?: string;
  isActive?: boolean;
}

// ============================================================
// Plan types
// ============================================================

export interface PlanDTO {
  id: string;
  name: string;
  badge: string | null;
  description: string;
  priceMonthly: number | null;
  priceAnnual: number | null;
  currency: string;
  features: string[];
  ctaText: string;
  isPopular: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// Contact & Newsletter types
// ============================================================

export type ContactRequestStatus = 'NEW' | 'CONTACTED' | 'CLOSED';

export interface ContactRequestDTO {
  id: string;
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  message: string;
  status: ContactRequestStatus;
  createdAt: string;
}

export interface NewsletterSubscriberDTO {
  id: string;
  email: string;
  createdAt: string;
  unsubscribedAt: string | null;
}

// ============================================================
// Subscription types (valores em AOA — kwanzas inteiros)
// ============================================================

export type SubscriptionStatus = 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'SUSPENDED' | 'CANCELLED';
export type BillingCycle = 'MONTHLY' | 'ANNUAL';

export interface SubscriptionDTO {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  planId: string;
  planName: string;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  /** Valor por ciclo, em kwanzas. */
  amount: number;
  currency: string;
  startDate: string;
  currentPeriodEnd: string;
  cancelledAt: string | null;
  notes: string | null;
  createdAt: string;
}

// ============================================================
// Email server settings
// ============================================================

export type EmailProvider = 'GMAIL' | 'SMTP';

export interface EmailSettingsDTO {
  provider: EmailProvider;
  host: string;
  port: number;
  secure: boolean;
  username: string | null;
  /** A senha nunca é devolvida — apenas se está definida. */
  hasPassword: boolean;
  fromName: string;
  fromEmail: string;
  isEnabled: boolean;
  /** Ativação de códigos OTP nos emails de autenticação (ativação e recuperação de senha). */
  otpEnabled: boolean;
  /** Validade em horas do código OTP de ativação de conta (padrão 24h). */
  verificationExpiresHours: number;
  /** Validade em minutos do código OTP de recuperação de senha (padrão 15m). */
  passwordResetExpiresMinutes: number;
  /** 'database' quando configurado no painel; 'environment' quando usa as variáveis SMTP_*. */
  source: 'database' | 'environment';
  updatedAt: string | null;
}

export type EmailTestType = 'GENERIC' | 'ACCOUNT_VERIFICATION' | 'PASSWORD_RESET';

export interface EmailTestResultDTO {
  success: boolean;
  error?: string;
  code?: string;
}

// ============================================================
// Dashboard statistics
// ============================================================

export interface MonthlyCountDTO {
  /** YYYY-MM */
  month: string;
  count: number;
}

export interface MonthlyDocumentsDTO {
  month: string;
  created: number;
  completed: number;
}

export interface StatsOverviewDTO {
  totals: {
    clients: number;
    activeClients: number;
    newClientsThisMonth: number;
    documents: number;
    documentsInProgress: number;
    documentsCompleted: number;
    openTickets: number;
    activeSubscriptions: number;
    /** Receita recorrente mensal em AOA (anuais / 12). */
    monthlyRecurringRevenue: number;
  };
  clientsPerMonth: MonthlyCountDTO[];
  documentsPerMonth: MonthlyDocumentsDTO[];
  documentsByStatus: Array<{ status: string; count: number }>;
  subscriptionsByStatus: Array<{ status: SubscriptionStatus; count: number }>;
}
