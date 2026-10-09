import { type VendaEntity } from '../Entities/VendaEntity.js'
import { type IBaseRepository } from '../../../Core/Infrastructure/Repositories/BaseMySQLRepository.js'
export interface IVendaRepository extends IBaseRepository<VendaEntity> {}
