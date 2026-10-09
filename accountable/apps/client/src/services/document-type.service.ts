import { api } from '../lib/axios.js';
import type { ApiResponse, DocumentTypeDTO } from '@accountable/types';

export const documentTypeService = {
  /**
   * Obtém os tipos de documentos e slots dinâmicos ativos a partir da base de dados
   */
  async listActive(): Promise<ApiResponse<DocumentTypeDTO[]>> {
    const res = await api.get<ApiResponse<DocumentTypeDTO[]>>('/document-types');
    return res.data;
  },
};
