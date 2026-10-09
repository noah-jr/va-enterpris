import { api } from '../lib/axios.js';
import type { ApiResponse, ClientDTO, SubscriptionDTO } from '@accountable/types';
import type { RegisterClientInput, LoginInput } from '@accountable/schemas';

type VerifyResult = ApiResponse<{ clientId: string; setupToken: string }>;

export const authService = {
  async register(data: RegisterClientInput): Promise<ApiResponse<{ clientId: string; email: string }>> {
    const res = await api.post('/auth/register', data);
    return res.data;
  },

  /** Ativação pelo link do email. */
  async verifyEmail(token: string): Promise<VerifyResult> {
    const res = await api.post('/auth/verify-email', { token });
    return res.data;
  },

  /** Ativação pelo código de 6 dígitos. */
  async verifyEmailWithCode(email: string, code: string): Promise<VerifyResult> {
    const res = await api.post('/auth/verify-email', { email, code });
    return res.data;
  },

  async resendVerification(email: string): Promise<ApiResponse<null>> {
    const res = await api.post('/auth/resend-verification', { email });
    return res.data;
  },

  async setPassword(data: { token: string; password: string; confirmPassword: string }): Promise<ApiResponse<null>> {
    const res = await api.post('/auth/set-password', data);
    return res.data;
  },

  async login(data: LoginInput): Promise<ApiResponse<{ userId: string; userType: 'client' }>> {
    const res = await api.post('/auth/client/login', data);
    return res.data;
  },

  async forgotPassword(data: { email: string }): Promise<ApiResponse<null>> {
    const res = await api.post('/auth/forgot-password', data);
    return res.data;
  },

  /** Por link (token) ou por email + código. */
  async resetPassword(data: {
    token?: string;
    email?: string;
    code?: string;
    password: string;
    confirmPassword: string;
  }): Promise<ApiResponse<null>> {
    const res = await api.post('/auth/reset-password', data);
    return res.data;
  },

  async changePassword(data: { currentPassword: string; newPassword: string; confirmPassword: string }): Promise<ApiResponse<null>> {
    const res = await api.post('/auth/change-password', data);
    return res.data;
  },

  async logout(): Promise<ApiResponse<null>> {
    const res = await api.post('/auth/logout');
    return res.data;
  },

  async getMe(): Promise<ApiResponse<ClientDTO>> {
    const res = await api.get('/auth/me');
    return res.data;
  },

  async getMySubscription(): Promise<ApiResponse<SubscriptionDTO | null>> {
    const res = await api.get('/subscriptions/me');
    return res.data;
  },
};
