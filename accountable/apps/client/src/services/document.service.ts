import { api } from '../lib/axios.js';
import type {
  ApiResponse,
  PaginatedResponse,
  DocumentDTO,
  DocumentFileDTO,
} from '@accountable/types';
import type {
  CreateDocumentInput,
  DocumentFilterInput,
  UpdateDocumentStatusInput,
} from '@accountable/schemas';

export interface DocumentDetails {
  document: DocumentDTO;
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

export const documentService = {
  async list(params?: Partial<DocumentFilterInput>): Promise<PaginatedResponse<DocumentDTO>> {
    const res = await api.get<PaginatedResponse<DocumentDTO>>('/documents', {
      params,
    });
    return res.data;
  },

  async getById(id: string): Promise<ApiResponse<DocumentDetails>> {
    const res = await api.get<ApiResponse<DocumentDetails>>(`/documents/${id}`);
    return res.data;
  },

  async create(data: CreateDocumentInput): Promise<ApiResponse<DocumentDTO>> {
    const res = await api.post<ApiResponse<DocumentDTO>>('/documents', data);
    return res.data;
  },

  async updateStatus(
    id: string,
    data: UpdateDocumentStatusInput,
  ): Promise<ApiResponse<DocumentDTO>> {
    const res = await api.patch<ApiResponse<DocumentDTO>>(`/documents/${id}/status`, data);
    return res.data;
  },

  async uploadFile(documentId: string, file: File): Promise<ApiResponse<DocumentFileDTO>> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await api.post<ApiResponse<DocumentFileDTO>>(
      `/documents/${documentId}/files`,
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
