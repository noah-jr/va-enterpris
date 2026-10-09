import { type ContabilidadeEntity } from '../Entities/ContabilidadeEntity.js'
import { type IBaseRepository } from '../../../Core/Infrastructure/Repositories/BaseMySQLRepository.js'
export interface IContabilidadeRepository extends IBaseRepository<ContabilidadeEntity> {}
