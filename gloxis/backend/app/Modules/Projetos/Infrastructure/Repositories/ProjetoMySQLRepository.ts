import { ProjetoEntity } from '../../Domain/Entities/ProjetoEntity.js'
import Model from '#models/projeto'
import { BaseMySQLRepository } from '../../../Core/Infrastructure/Repositories/BaseMySQLRepository.js'

export class ProjetoMySQLRepository extends BaseMySQLRepository<ProjetoEntity, typeof Model> {
  constructor() {
    super(Model, (data: any) => new ProjetoEntity(data.id, data))
  }
}
