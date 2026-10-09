import { type AtivoEntity } from '../Entities/AtivoEntity.js'
import { type IBaseRepository } from '../../../Core/Infrastructure/Repositories/BaseMySQLRepository.js'
export interface IAtivoRepository extends IBaseRepository<AtivoEntity> {}
