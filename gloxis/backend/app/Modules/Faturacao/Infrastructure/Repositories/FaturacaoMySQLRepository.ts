import { FaturacaoEntity } from '../../Domain/Entities/FaturacaoEntity.js'
import Model from '#models/fatura'
import { BaseMySQLRepository } from '../../../Core/Infrastructure/Repositories/BaseMySQLRepository.js'

export class FaturacaoMySQLRepository extends BaseMySQLRepository<FaturacaoEntity, typeof Model> {
  constructor() {
    super(Model, (data: any) => new FaturacaoEntity(data.id, data))
  }
}
