import type { MetricaDomain } from '../Entities/MetricaDomain.js'

export interface ITransparenciaMetricaRepository {
  findAll(): Promise<MetricaDomain[]>
  findByChave(chave: string): Promise<MetricaDomain | null>
  save(metrica: MetricaDomain): Promise<MetricaDomain>
  saveMany(metricas: MetricaDomain[]): Promise<MetricaDomain[]>
}
