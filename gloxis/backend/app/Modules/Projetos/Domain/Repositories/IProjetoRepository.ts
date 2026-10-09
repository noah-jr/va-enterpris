import { type ProjetoEntity } from '../Entities/ProjetoEntity.js'
import { type IBaseRepository } from '../../../Core/Infrastructure/Repositories/BaseMySQLRepository.js'
export interface IProjetoRepository extends IBaseRepository<ProjetoEntity> {}
