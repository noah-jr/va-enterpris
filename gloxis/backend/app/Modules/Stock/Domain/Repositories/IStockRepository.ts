import { type StockEntity } from '../Entities/StockEntity.js'
import { type IBaseRepository } from '../../../Core/Infrastructure/Repositories/BaseMySQLRepository.js'
export interface IStockRepository extends IBaseRepository<StockEntity> {}
