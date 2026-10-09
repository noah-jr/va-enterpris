import { type BaseModel } from '@adonisjs/lucid/orm'

export interface IBaseRepository<T, CreatePayload = unknown, UpdatePayload = unknown> {
  findAll(page?: number, perPage?: number): Promise<{ meta: Record<string, unknown>; data: T[] }>
  findById(id: number): Promise<T | null>
  create(data: CreatePayload): Promise<T>
  update(id: number, data: UpdatePayload): Promise<T>
  delete(id: number): Promise<void>
}

export abstract class BaseMySQLRepository<
  T,
  CreatePayload = unknown,
  UpdatePayload = unknown,
  M extends typeof BaseModel = typeof BaseModel,
> implements IBaseRepository<T, CreatePayload, UpdatePayload> {
  constructor(
    protected modelClass: M,
    protected entityFactory: (data: Record<string, unknown>) => T
  ) {}

  async findAll(
    page: number = 1,
    perPage: number = 20
  ): Promise<{ meta: Record<string, unknown>; data: T[] }> {
    const paginated = await this.modelClass.query().orderBy('id', 'desc').paginate(page, perPage)
    const json = paginated.toJSON()
    return {
      meta: json.meta as Record<string, unknown>,
      data: (json.data as Record<string, unknown>[]).map((item) => this.entityFactory(item)),
    }
  }

  async findById(id: number): Promise<T | null> {
    const model = await this.modelClass.find(id)
    if (!model) return null
    return this.entityFactory(model.toJSON() as Record<string, unknown>)
  }

  async create(data: CreatePayload): Promise<T> {
    const model = await this.modelClass.create(data as any)
    return this.entityFactory(model.toJSON() as Record<string, unknown>)
  }

  async update(id: number, data: UpdatePayload): Promise<T> {
    const model = await this.modelClass.findOrFail(id)
    model.merge(data as any)
    await model.save()
    return this.entityFactory(model.toJSON() as Record<string, unknown>)
  }

  async delete(id: number): Promise<void> {
    const model = await this.modelClass.findOrFail(id)
    await model.delete()
  }
}
