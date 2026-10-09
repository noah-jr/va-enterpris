import { RecursosHumanosEntity } from '../../Domain/Entities/RecursosHumanosEntity.js'
import Model from '#models/funcionario'
import { BaseMySQLRepository } from '../../../Core/Infrastructure/Repositories/BaseMySQLRepository.js'

export class RecursosHumanosMySQLRepository extends BaseMySQLRepository<
  RecursosHumanosEntity,
  typeof Model
> {
  constructor() {
    super(Model, (data: any) => new RecursosHumanosEntity(data.id, data))
  }
}
