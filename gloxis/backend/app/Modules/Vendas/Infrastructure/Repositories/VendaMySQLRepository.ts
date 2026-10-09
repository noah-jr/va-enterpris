import { VendaEntity } from '../../Domain/Entities/VendaEntity.js'
import Model from '#models/venda'
import { BaseMySQLRepository } from '../../../Core/Infrastructure/Repositories/BaseMySQLRepository.js'

export class VendaMySQLRepository extends BaseMySQLRepository<VendaEntity, typeof Model> {
  constructor() {
    super(Model, (data: any) => new VendaEntity(data.id, data))
  }
}
