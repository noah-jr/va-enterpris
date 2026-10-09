import { type ContratoEntity } from '../Entities/ContratoEntity.js'
import { type IBaseRepository } from '../../../Core/Infrastructure/Repositories/BaseMySQLRepository.js'
export interface IContratoRepository extends IBaseRepository<ContratoEntity> {}
