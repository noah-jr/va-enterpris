import type { IDocumentTypeRepository } from '../../../domain/repositories/document-type.repository.interface.js';
import type { DocumentTypeDTO, DocumentTypeFilterDTO } from '@accountable/types';
import { toDocumentTypeDTO } from './document-type.mapper.js';

export class ListActiveDocumentTypesUseCase {
  constructor(private readonly repository: IDocumentTypeRepository) {}

  async execute(): Promise<DocumentTypeDTO[]> {
    const docTypes = await this.repository.findAllActive();
    return docTypes.map(toDocumentTypeDTO);
  }
}

export class ListAllDocumentTypesUseCase {
  constructor(private readonly repository: IDocumentTypeRepository) {}

  async execute(filter?: DocumentTypeFilterDTO): Promise<DocumentTypeDTO[]> {
    const docTypes = await this.repository.findAll(filter);
    return docTypes.map(toDocumentTypeDTO);
  }
}
