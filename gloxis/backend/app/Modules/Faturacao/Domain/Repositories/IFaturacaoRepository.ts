import { type FaturacaoEntity } from '../Entities/FaturacaoEntity.js'
import { type IBaseRepository } from '../../../Core/Infrastructure/Repositories/BaseMySQLRepository.js'
export interface IFaturacaoRepository extends IBaseRepository<FaturacaoEntity> {}
