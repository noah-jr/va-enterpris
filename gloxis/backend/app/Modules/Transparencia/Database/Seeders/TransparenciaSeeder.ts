import { BaseSeeder } from '@adonisjs/lucid/seeders'
import TransparenciaMetrica from '#models/transparencia_metrica'
import TransparenciaDocumento from '#models/transparencia_documento'

export default class extends BaseSeeder {
  async run() {
    const totalMetricas = await TransparenciaMetrica.query().count('* as count')
    const countMetricas = Number((totalMetricas[0] as any).$extras?.count || 0)

    if (countMetricas === 0) {
      await TransparenciaMetrica.createMany([
        { chave: 'volume', label: 'Volume de Microcrédito Concedido', val: '12.4 B Kz', ordem: 1 },
        { chave: 'beneficiados', label: 'Cidadãos & PMEs Beneficiados', val: '45.890+', ordem: 2 },
        { chave: 'taxa_aprovacao', label: 'Taxa Média de Aprovação', val: '94.2%', ordem: 3 },
        { chave: 'registo_bna', label: 'Registo Oficial BNA', val: 'N.º 0048-26', ordem: 4 },
      ])
    }

    const totalDocs = await TransparenciaDocumento.query().count('* as count')
    const countDocs = Number((totalDocs[0] as any).$extras?.count || 0)

    if (countDocs === 0) {
      await TransparenciaDocumento.createMany([
        {
          title: 'Aviso N.º 10/2024 BNA - Regulamento de Microcrédito',
          date: 'Janeiro 2026',
          size: '1.4 MB',
          categoria: 'Regulamento',
          fileUrl: '/uploads/aviso_10_2024_bna.pdf',
          ordem: 1,
          ativo: true,
        },
        {
          title: 'Preçário Oficial e Tabela de Taxas Máximas (Kz)',
          date: 'Fevereiro 2026',
          size: '890 KB',
          categoria: 'Preçário',
          fileUrl: '/uploads/precario_oficial_gloxis.pdf',
          ordem: 2,
          ativo: true,
        },
        {
          title: 'Relatório Institucional de Transparência & Governação 2025',
          date: 'Dezembro 2025',
          size: '3.2 MB',
          categoria: 'Relatório',
          fileUrl: '/uploads/relatorio_transparencia_2025.pdf',
          ordem: 3,
          ativo: true,
        },
        {
          title: 'Código de Conduta e Proteção ao Consumidor Financeiro',
          date: 'Outubro 2025',
          size: '1.1 MB',
          categoria: 'Normativo',
          fileUrl: '/uploads/codigo_conduta_consumidor.pdf',
          ordem: 4,
          ativo: true,
        },
        {
          title: 'Guia de Prevenção do Branqueamento de Capitais (BCFT)',
          date: 'Novembro 2025',
          size: '2.0 MB',
          categoria: 'Compliance',
          fileUrl: '/uploads/guia_bcft_gloxis.pdf',
          ordem: 5,
          ativo: true,
        },
      ])
    }
  }
}
