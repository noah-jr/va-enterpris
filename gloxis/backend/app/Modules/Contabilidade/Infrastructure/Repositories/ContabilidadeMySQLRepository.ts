import { ContabilidadeEntity } from '../../Domain/Entities/ContabilidadeEntity.js'
import Model from '#models/lancamento_contabil'
import { BaseMySQLRepository } from '../../../Core/Infrastructure/Repositories/BaseMySQLRepository.js'

export class ContabilidadeMySQLRepository extends BaseMySQLRepository<
  ContabilidadeEntity,
  typeof Model
> {
  constructor() {
    super(Model, (data: any) => new ContabilidadeEntity(data.id, data))
  }
}
