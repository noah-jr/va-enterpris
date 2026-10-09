import { type CompraEntity } from '../Entities/CompraEntity.js'
import { type IBaseRepository } from '../../../Core/Infrastructure/Repositories/BaseMySQLRepository.js'
export interface ICompraRepository extends IBaseRepository<CompraEntity> {}
