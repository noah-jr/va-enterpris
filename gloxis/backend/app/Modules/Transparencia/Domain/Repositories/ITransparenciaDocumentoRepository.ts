import type { DocumentoDomain } from '../Entities/DocumentoDomain.js'

export interface ITransparenciaDocumentoRepository {
  findAll(): Promise<DocumentoDomain[]>
  findActivos(): Promise<DocumentoDomain[]>
  findById(id: number): Promise<DocumentoDomain | null>
  save(documento: DocumentoDomain): Promise<DocumentoDomain>
  saveMany(documentos: DocumentoDomain[]): Promise<DocumentoDomain[]>
  delete(id: number): Promise<void>
}
