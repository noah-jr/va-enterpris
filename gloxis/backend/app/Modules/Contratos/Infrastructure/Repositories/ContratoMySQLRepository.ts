import { ContratoEntity } from '../../Domain/Entities/ContratoEntity.js'
import Model from '#models/contrato'
import { BaseMySQLRepository } from '../../../Core/Infrastructure/Repositories/BaseMySQLRepository.js'

export class ContratoMySQLRepository extends BaseMySQLRepository<ContratoEntity, typeof Model> {
  constructor() {
    super(Model, (data: any) => new ContratoEntity(data.id, data))
  }
}
