import type { ITransparenciaMetricaRepository } from '../../Domain/Repositories/ITransparenciaMetricaRepository.js'
import { MetricaDomain } from '../../Domain/Entities/MetricaDomain.js'

export interface MetricaInputDTO {
  id?: number
  chave: string
  label: string
  val: string
  ordem?: number
}

export class AtualizarMetricasUseCase {
  constructor(private metricaRepo: ITransparenciaMetricaRepository) {}

  public async execute(inputs: MetricaInputDTO[]): Promise<MetricaDomain[]> {
    const updated: MetricaDomain[] = []

    for (const item of inputs) {
      let existing: MetricaDomain | null = null
      if (item.chave) {
        existing = await this.metricaRepo.findByChave(item.chave)
      }

      if (existing) {
        existing.updateValue(item.val, item.label, item.ordem)
        const saved = await this.metricaRepo.save(existing)
        updated.push(saved)
      } else {
        const newDomain = new MetricaDomain(
          item.id,
          item.chave,
          item.label,
          item.val,
          item.ordem ?? 0
        )
        const saved = await this.metricaRepo.save(newDomain)
        updated.push(saved)
      }
    }

    return updated
  }
}
