import { AtivoEntity } from '../../Domain/Entities/AtivoEntity.js'
import Model from '#models/ativo'
import { BaseMySQLRepository } from '../../../Core/Infrastructure/Repositories/BaseMySQLRepository.js'

export class AtivoMySQLRepository extends BaseMySQLRepository<
  AtivoEntity,
  Record<string, unknown>,
  Record<string, unknown>,
  typeof Model
> {
  constructor() {
    super(Model, (data: Record<string, unknown>) => new AtivoEntity(Number(data.id || 0), data))
  }
}
