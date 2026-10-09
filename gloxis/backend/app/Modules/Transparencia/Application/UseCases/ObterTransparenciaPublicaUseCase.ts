import type { ITransparenciaMetricaRepository } from '../../Domain/Repositories/ITransparenciaMetricaRepository.js'
import type { ITransparenciaDocumentoRepository } from '../../Domain/Repositories/ITransparenciaDocumentoRepository.js'
import { MetricaDomain } from '../../Domain/Entities/MetricaDomain.js'
import { DocumentoDomain } from '../../Domain/Entities/DocumentoDomain.js'

export class ObterTransparenciaPublicaUseCase {
  constructor(
    private metricaRepo: ITransparenciaMetricaRepository,
    private documentoRepo: ITransparenciaDocumentoRepository
  ) {}

  public async execute() {
    let metricas = await this.metricaRepo.findAll()
    let documentos = await this.documentoRepo.findActivos()

    // Seeds de fallback em memória se a BD ainda não tiver registos
    if (metricas.length === 0) {
      const initialMetricas = [
        new MetricaDomain(undefined, 'volume', 'Volume de Microcrédito Concedido', '12.4 B Kz', 1),
        new MetricaDomain(undefined, 'beneficiados', 'Cidadãos & PMEs Beneficiados', '45.890+', 2),
        new MetricaDomain(undefined, 'taxa_aprovacao', 'Taxa Média de Aprovação', '94.2%', 3),
        new MetricaDomain(undefined, 'registo_bna', 'Registo Oficial BNA', 'N.º 0048-26', 4),
      ]
      metricas = await this.metricaRepo.saveMany(initialMetricas)
    }

    if (documentos.length === 0) {
      const initialDocumentos = [
        new DocumentoDomain(
          undefined,
          'Aviso N.º 10/2024 BNA - Regulamento de Microcrédito',
          'Janeiro 2026',
          '1.4 MB',
          'Regulamento',
          '/uploads/aviso_10_2024_bna.pdf',
          1,
          true
        ),
        new DocumentoDomain(
          undefined,
          'Preçário Oficial e Tabela de Taxas Máximas (Kz)',
          'Fevereiro 2026',
          '890 KB',
          'Preçário',
          '/uploads/precario_oficial_gloxis.pdf',
          2,
          true
        ),
        new DocumentoDomain(
          undefined,
          'Relatório Institucional de Transparência & Governação 2025',
          'Dezembro 2025',
          '3.2 MB',
          'Relatório',
          '/uploads/relatorio_transparencia_2025.pdf',
          3,
          true
        ),
        new DocumentoDomain(
          undefined,
          'Código de Conduta e Proteção ao Consumidor Financeiro',
          'Outubro 2025',
          '1.1 MB',
          'Normativo',
          '/uploads/codigo_conduta_consumidor.pdf',
          4,
          true
        ),
        new DocumentoDomain(
          undefined,
          'Guia de Prevenção do Branqueamento de Capitais (BCFT)',
          'Novembro 2025',
          '2.0 MB',
          'Compliance',
          '/uploads/guia_bcft_gloxis.pdf',
          5,
          true
        ),
      ]
      documentos = await this.documentoRepo.saveMany(initialDocumentos)
    }

    return {
      metricas,
      documentos,
    }
  }
}
