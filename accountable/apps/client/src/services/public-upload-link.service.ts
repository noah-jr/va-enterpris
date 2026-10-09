import { api } from '../lib/axios.js';
import type { ApiResponse, PublicUploadContextDTO, DocumentFileDTO } from '@accountable/types';

export const publicUploadLinkService = {
  async getContext(token: string): Promise<ApiResponse<PublicUploadContextDTO>> {
    const res = await api.get<ApiResponse<PublicUploadContextDTO>>(
      `/public/upload-links/${token}`,
    );
    return res.data;
  },

  async uploadFile(token: string, file: File): Promise<ApiResponse<DocumentFileDTO>> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await api.post<ApiResponse<DocumentFileDTO>>(
      `/public/upload-links/${token}/files`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    return res.data;
  },
};
