export interface DocumentTypeEntity {
  id: string;
  code: string;
  name: string;
  description: string | null;
  category: string;
  required: boolean;
  isActive: boolean;
  sortOrder: number;
  allowedExtensions: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface CreateDocumentTypeData {
  code: string;
  name: string;
  description?: string | null;
  category?: string;
  required?: boolean;
  isActive?: boolean;
  sortOrder?: number;
  allowedExtensions?: string | null;
}

export type UpdateDocumentTypeData = Partial<CreateDocumentTypeData>;

export interface DocumentTypeFilterData {
  search?: string;
  category?: string;
  isActive?: boolean;
}

export interface IDocumentTypeRepository {
  findAllActive(): Promise<DocumentTypeEntity[]>;
  findAll(filter?: DocumentTypeFilterData): Promise<DocumentTypeEntity[]>;
  findById(id: string): Promise<DocumentTypeEntity | null>;
  findByCode(code: string): Promise<DocumentTypeEntity | null>;
  create(data: CreateDocumentTypeData): Promise<DocumentTypeEntity>;
  update(id: string, data: UpdateDocumentTypeData): Promise<DocumentTypeEntity>;
  softDelete(id: string): Promise<void>;
}
