import { type DocumentoEntity } from '../Entities/DocumentoEntity.js'
import { type IBaseRepository } from '../../../Core/Infrastructure/Repositories/BaseMySQLRepository.js'
export interface IDocumentoRepository extends IBaseRepository<DocumentoEntity> {}
