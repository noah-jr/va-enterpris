import { api } from '../lib/axios.js';
import type {
  ApiResponse,
  PaginatedResponse,
  DocumentDTO,
  DocumentFileDTO,
  ClientListItemDTO,
  UserDTO,
  AuditLogDTO,
  BackupDTO,
  PlanDTO,
  ContactRequestDTO,
  DocumentUploadLinkDTO,
  ClientUploadSessionDTO,
  DocumentTypeDTO,
  RoleDTO,
  PermissionDTO,
  EmailSettingsDTO,
  EmailTestType,
  EmailTestResultDTO,
  SubscriptionDTO,
  StatsOverviewDTO,
} from '@accountable/types';
import type {
  LoginInput,
  DocumentFilterInput,
  UpdateDocumentStatusInput,
  CreateUserInput,
  AuditFilterInput,
  CreatePlanInput,
  UpdatePlanInput,
  CreateUploadLinkInput,
  CreateClientUploadSessionInput,
  CreateDocumentTypeInput,
  UpdateDocumentTypeInput,
  DocumentTypeFilterInput,
  RoleInput,
  EmailSettingsInput,
  CreateSubscriptionInput,
  UpdateSubscriptionInput,
} from '@accountable/schemas';

export interface AdminDocumentDetails {
  document: DocumentDTO & {
    client: { id: string; name: string; email: string; nip: string };
    assignments: Array<{ userId: string }>;
  };
  files: Array<
    DocumentFileDTO & {
      downloadUrl: string;
    }
  >;
  statusHistory: Array<{
    id: string;
    fromStatus: string | null;
    toStatus: string;
    changedById: string | null;
    note: string | null;
    createdAt: string;
  }>;
}

export const adminApiService = {
  // Auth
  async login(data: LoginInput): Promise<ApiResponse<{
    userId: string;
    userType: 'user';
    roles: string[];
    permissions: string[];
  }>> {
    const res = await api.post('/auth/user/login', data);
    return res.data;
  },

  async getMe(): Promise<ApiResponse<{
    id: string;
    email: string;
    name?: string | null;
    roles: string[];
    permissions: string[];
    userType: 'user';
  }>> {
    const res = await api.get('/auth/me');
    return res.data;
  },

  async logout(): Promise<ApiResponse<null>> {
    const res = await api.post('/auth/logout');
    return res.data;
  },

  // Documents
  async listDocuments(params?: Partial<DocumentFilterInput>): Promise<PaginatedResponse<DocumentDTO>> {
    const res = await api.get('/documents', { params });
    return res.data;
  },

  async getDocument(id: string): Promise<ApiResponse<AdminDocumentDetails>> {
    const res = await api.get(`/documents/${id}`);
    return res.data;
  },

  async updateDocumentStatus(
    id: string,
    data: UpdateDocumentStatusInput,
  ): Promise<ApiResponse<DocumentDTO>> {
    const res = await api.patch(`/documents/${id}/status`, data);
    return res.data;
  },

  async createDocumentUploadLink(
    id: string,
    data?: CreateUploadLinkInput,
  ): Promise<ApiResponse<DocumentUploadLinkDTO>> {
    const res = await api.post(`/documents/${id}/upload-links`, data ?? {});
    return res.data;
  },

  async revokeDocumentUploadLink(id: string, linkId: string): Promise<ApiResponse<null>> {
    const res = await api.delete(`/documents/${id}/upload-links/${linkId}`);
    return res.data;
  },

  // Client Upload Sessions (bulk period-based upload links like libera.ao)
  async createClientUploadSession(
    clientId: string,
    data?: Partial<CreateClientUploadSessionInput>,
  ): Promise<ApiResponse<ClientUploadSessionDTO>> {
    const res = await api.post(`/clients/${clientId}/upload-sessions`, data ?? {});
    return res.data;
  },

  async listClientUploadSessions(clientId: string): Promise<ApiResponse<ClientUploadSessionDTO[]>> {
    const res = await api.get(`/clients/${clientId}/upload-sessions`);
    return res.data;
  },

  async revokeClientUploadSession(clientId: string, sessionId: string): Promise<ApiResponse<null>> {
    const res = await api.delete(`/clients/${clientId}/upload-sessions/${sessionId}`);
    return res.data;
  },

  // Clients
  async listClients(params?: {
    page?: number;
    perPage?: number;
    search?: string;
    isActive?: boolean;
  }): Promise<PaginatedResponse<ClientListItemDTO>> {
    const res = await api.get('/clients', { params });
    return res.data;
  },

  async blockClient(id: string, data: { reason: string }): Promise<ApiResponse<ClientListItemDTO>> {
    const res = await api.patch(`/clients/${id}/block`, data);
    return res.data;
  },

  async unblockClient(id: string): Promise<ApiResponse<ClientListItemDTO>> {
    const res = await api.patch(`/clients/${id}/unblock`);
    return res.data;
  },

  // Users (RBAC)
  async listUsers(params?: { page?: number; perPage?: number; search?: string }): Promise<PaginatedResponse<UserDTO>> {
    const res = await api.get('/users', { params });
    return res.data;
  },

  async createUser(data: CreateUserInput): Promise<ApiResponse<UserDTO>> {
    const res = await api.post('/users', data);
    return res.data;
  },

  async updateUser(id: string, data: { name?: string; isActive?: boolean; roleIds?: string[] }): Promise<ApiResponse<UserDTO>> {
    const res = await api.patch(`/users/${id}`, data);
    return res.data;
  },

  async sendUserPasswordReset(id: string): Promise<ApiResponse<null>> {
    const res = await api.post(`/users/${id}/send-password-reset`);
    return res.data;
  },

  // Perfis & permissões
  async listRoles(): Promise<ApiResponse<RoleDTO[]>> {
    const res = await api.get('/roles');
    return res.data;
  },

  async listPermissions(): Promise<ApiResponse<PermissionDTO[]>> {
    const res = await api.get('/roles/permissions');
    return res.data;
  },

  async createRole(data: RoleInput): Promise<ApiResponse<RoleDTO>> {
    const res = await api.post('/roles', data);
    return res.data;
  },

  async updateRole(id: string, data: Partial<RoleInput>): Promise<ApiResponse<RoleDTO>> {
    const res = await api.patch(`/roles/${id}`, data);
    return res.data;
  },

  async deleteRole(id: string): Promise<ApiResponse<null>> {
    const res = await api.delete(`/roles/${id}`);
    return res.data;
  },

  // Conta própria
  async changePassword(data: { currentPassword: string; newPassword: string; confirmPassword: string }): Promise<ApiResponse<null>> {
    const res = await api.post('/auth/change-password', data);
    return res.data;
  },

  async forgotPassword(email: string): Promise<ApiResponse<null>> {
    const res = await api.post('/auth/user/forgot-password', { email });
    return res.data;
  },

  async resetPassword(data: {
    token?: string;
    email?: string;
    code?: string;
    password: string;
    confirmPassword: string;
  }): Promise<ApiResponse<null>> {
    const res = await api.post('/auth/user/reset-password', data);
    return res.data;
  },

  // Servidor de email
  async getEmailSettings(): Promise<ApiResponse<EmailSettingsDTO>> {
    const res = await api.get('/admin/settings/email');
    return res.data;
  },

  async updateEmailSettings(data: EmailSettingsInput): Promise<ApiResponse<EmailSettingsDTO>> {
    const res = await api.put('/admin/settings/email', data);
    return res.data;
  },

  async sendTestEmail(
    to: string,
    type: EmailTestType = 'GENERIC',
  ): Promise<ApiResponse<EmailTestResultDTO>> {
    // 502 = o servidor SMTP recusou; o corpo traz o erro para mostrar ao utilizador.
    const res = await api.post(
      '/admin/settings/email/test',
      { to, type },
      { validateStatus: (s) => s === 200 || s === 502 },
    );
    return res.data;
  },

  // Subscrições (AOA)
  async listSubscriptions(params?: { page?: number; perPage?: number; status?: string; clientId?: string }): Promise<
    PaginatedResponse<SubscriptionDTO>
  > {
    const res = await api.get('/admin/subscriptions', { params });
    return res.data;
  },

  async createSubscription(data: CreateSubscriptionInput): Promise<ApiResponse<SubscriptionDTO>> {
    const res = await api.post('/admin/subscriptions', data);
    return res.data;
  },

  async updateSubscription(id: string, data: UpdateSubscriptionInput): Promise<ApiResponse<SubscriptionDTO>> {
    const res = await api.patch(`/admin/subscriptions/${id}`, data);
    return res.data;
  },

  async renewSubscription(id: string): Promise<ApiResponse<SubscriptionDTO>> {
    const res = await api.post(`/admin/subscriptions/${id}/renew`);
    return res.data;
  },

  // Estatísticas
  async getStatsOverview(): Promise<ApiResponse<StatsOverviewDTO>> {
    const res = await api.get('/admin/stats/overview');
    return res.data;
  },

  // Audit
  async listAuditLogs(params?: Partial<AuditFilterInput>): Promise<PaginatedResponse<AuditLogDTO>> {
    const res = await api.get('/audit', { params });
    return res.data;
  },

  // Backups
  async listBackups(): Promise<ApiResponse<BackupDTO[]>> {
    const res = await api.get('/backups');
    return res.data;
  },

  async createBackup(type: 'FULL' | 'INCREMENTAL'): Promise<ApiResponse<BackupDTO>> {
    const res = await api.post('/backups', { type });
    return res.data;
  },

  // Plans
  async listPlans(): Promise<ApiResponse<PlanDTO[]>> {
    const res = await api.get('/admin/plans');
    return res.data;
  },

  async createPlan(data: CreatePlanInput): Promise<ApiResponse<PlanDTO>> {
    const res = await api.post('/admin/plans', data);
    return res.data;
  },

  async updatePlan(id: string, data: UpdatePlanInput): Promise<ApiResponse<PlanDTO>> {
    const res = await api.patch(`/admin/plans/${id}`, data);
    return res.data;
  },

  async deletePlan(id: string): Promise<void> {
    await api.delete(`/admin/plans/${id}`);
  },

  // Contact Requests
  async listContactRequests(params?: {
    page?: number;
    perPage?: number;
  }): Promise<PaginatedResponse<ContactRequestDTO>> {
    const res = await api.get('/admin/contact-requests', { params });
    return res.data;
  },

  // Document Types (Dynamic templates & slots)
  async listDocumentTypes(params?: Partial<DocumentTypeFilterInput>): Promise<ApiResponse<DocumentTypeDTO[]>> {
    const res = await api.get('/admin/document-types', { params });
    return res.data;
  },

  async createDocumentType(data: CreateDocumentTypeInput): Promise<ApiResponse<DocumentTypeDTO>> {
    const res = await api.post('/admin/document-types', data);
    return res.data;
  },

  async updateDocumentType(id: string, data: UpdateDocumentTypeInput): Promise<ApiResponse<DocumentTypeDTO>> {
    const res = await api.patch(`/admin/document-types/${id}`, data);
    return res.data;
  },

  async deleteDocumentType(id: string): Promise<void> {
    await api.delete(`/admin/document-types/${id}`);
  },
};

