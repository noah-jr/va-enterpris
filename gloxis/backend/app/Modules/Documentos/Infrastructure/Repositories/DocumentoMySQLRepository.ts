import { DocumentoEntity } from '../../Domain/Entities/DocumentoEntity.js'
import Model from '#models/documento'
import { BaseMySQLRepository } from '../../../Core/Infrastructure/Repositories/BaseMySQLRepository.js'

export class DocumentoMySQLRepository extends BaseMySQLRepository<DocumentoEntity, typeof Model> {
  constructor() {
    super(Model, (data: any) => new DocumentoEntity(data.id, data))
  }
}
