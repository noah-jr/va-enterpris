import type { ITransparenciaMetricaRepository } from '../../Domain/Repositories/ITransparenciaMetricaRepository.js'
import { MetricaDomain } from '../../Domain/Entities/MetricaDomain.js'
import TransparenciaMetricaModel from '#models/transparencia_metrica'

export class TransparenciaMetricaRepositoryImpl implements ITransparenciaMetricaRepository {
  public async findAll(): Promise<MetricaDomain[]> {
    const models = await TransparenciaMetricaModel.query().orderBy('ordem', 'asc')
    return models.map(this.toDomain)
  }

  public async findByChave(chave: string): Promise<MetricaDomain | null> {
    const model = await TransparenciaMetricaModel.findBy('chave', chave)
    return model ? this.toDomain(model) : null
  }

  public async save(metrica: MetricaDomain): Promise<MetricaDomain> {
    let model: TransparenciaMetricaModel | null = null

    if (metrica.id) {
      model = await TransparenciaMetricaModel.find(metrica.id)
    }

    if (!model) {
      model = await TransparenciaMetricaModel.findBy('chave', metrica.chave)
    }

    if (model) {
      model.merge({
        label: metrica.label,
        val: metrica.val,
        ordem: metrica.ordem,
      })
      await model.save()
    } else {
      model = await TransparenciaMetricaModel.create({
        chave: metrica.chave,
        label: metrica.label,
        val: metrica.val,
        ordem: metrica.ordem,
      })
    }

    return this.toDomain(model)
  }

  public async saveMany(metricas: MetricaDomain[]): Promise<MetricaDomain[]> {
    const result: MetricaDomain[] = []
    for (const m of metricas) {
      const saved = await this.save(m)
      result.push(saved)
    }
    return result
  }

  private toDomain(model: TransparenciaMetricaModel): MetricaDomain {
    return new MetricaDomain(model.id, model.chave, model.label, model.val, model.ordem)
  }
}
