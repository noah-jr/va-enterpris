import { api } from '../lib/axios.js';
import type {
  ApiResponse,
  ClientUploadSessionDTO,
  PublicClientUploadSessionContextDTO,
} from '@accountable/types';

export interface UploadSessionFilePayload {
  token: string;
  file: File;
  title?: string;
  type?: string;
  description?: string;
}

export const publicClientUploadSessionService = {
  async createSession(
    clientId: string,
    data: { month: number; year: number; label?: string },
  ): Promise<ApiResponse<ClientUploadSessionDTO>> {
    const res = await api.post<ApiResponse<ClientUploadSessionDTO>>(
      `/clients/${clientId}/upload-sessions`,
      data,
    );
    return res.data;
  },

  async listSessions(clientId: string): Promise<ApiResponse<ClientUploadSessionDTO[]>> {
    const res = await api.get<ApiResponse<ClientUploadSessionDTO[]>>(
      `/clients/${clientId}/upload-sessions`,
    );
    return res.data;
  },

  async getContext(token: string): Promise<ApiResponse<PublicClientUploadSessionContextDTO>> {
    const res = await api.get<ApiResponse<PublicClientUploadSessionContextDTO>>(
      '/public/upload-sessions/context',
      {
        params: { token },
      },
    );
    return res.data;
  },

  async uploadFile(payload: UploadSessionFilePayload): Promise<ApiResponse<{
    documentId: string;
    fileId: string;
    title: string;
    status: string;
    createdAt: string;
  }>> {
    const formData = new FormData();
    formData.append('file', payload.file);
    formData.append('token', payload.token);
    if (payload.title) formData.append('title', payload.title);
    if (payload.type) formData.append('type', payload.type);
    if (payload.description) formData.append('description', payload.description);

    const res = await api.post<ApiResponse<{
      documentId: string;
      fileId: string;
      title: string;
      status: string;
      createdAt: string;
    }>>(
      '/public/upload-sessions/upload',
      formData,
      {
        params: { token: payload.token },
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    return res.data;
  },
};
