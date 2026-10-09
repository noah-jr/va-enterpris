import { StockEntity } from '../../Domain/Entities/StockEntity.js'
import Model from '#models/stock_item'
import { BaseMySQLRepository } from '../../../Core/Infrastructure/Repositories/BaseMySQLRepository.js'

export class StockMySQLRepository extends BaseMySQLRepository<StockEntity, typeof Model> {
  constructor() {
    super(Model, (data: any) => new StockEntity(data.id, data))
  }
}
