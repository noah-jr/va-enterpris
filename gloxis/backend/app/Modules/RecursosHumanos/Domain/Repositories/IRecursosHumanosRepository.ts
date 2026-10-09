import { type RecursosHumanosEntity } from '../Entities/RecursosHumanosEntity.js'
import { type IBaseRepository } from '../../../Core/Infrastructure/Repositories/BaseMySQLRepository.js'
export interface IRecursosHumanosRepository extends IBaseRepository<RecursosHumanosEntity> {}
