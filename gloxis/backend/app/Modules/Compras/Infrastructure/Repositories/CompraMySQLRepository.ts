import { CompraEntity } from '../../Domain/Entities/CompraEntity.js'
import Model from '#models/compra'
import { BaseMySQLRepository } from '../../../Core/Infrastructure/Repositories/BaseMySQLRepository.js'

export class CompraMySQLRepository extends BaseMySQLRepository<
  CompraEntity,
  Record<string, unknown>,
  Record<string, unknown>,
  typeof Model
> {
  constructor() {
    super(Model, (data: Record<string, unknown>) => new CompraEntity(Number(data.id || 0), data))
  }
}
