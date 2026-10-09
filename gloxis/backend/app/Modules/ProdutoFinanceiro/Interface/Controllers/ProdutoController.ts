import type { HttpContext } from '@adonisjs/core/http'
import { ProdutoCreditoRepositoryImpl } from '../../Infrastructure/Repositories/ProdutoCreditoRepositoryImpl.js'
import { ProdutoCredito } from '../../Domain/Entities/ProdutoCredito.js'

export default class ProdutoController {
  /**
   * GET /api/v1/produtos
   * Lista todos os produtos de crédito ativos com cláusulas contratuais (público)
   */
  async index({ response }: HttpContext) {
    const repo = new ProdutoCreditoRepositoryImpl()
    let produtos = await repo.findAllAtivos()

    // Auto-seed de produtos de crédito regulamentados se a BD estiver limpa
    if (produtos.length === 0) {
      const defaultProducts = [
        new ProdutoCredito(
          null,
          'Microcrédito Pessoal Direto',
          'Financiamento individual para necessidades imediatas de tesouraria pessoal ou familiar.',
          0.035,
          3,
          36,
          100000,
          3000000,
          true
        ),
        new ProdutoCredito(
          null,
          'Microcrédito Express PME',
          'Solução flexível para capital de giro e tesouraria de micro e pequenas empresas.',
          0.04,
          6,
          60,
          500000,
          10000000,
          true
        ),
        new ProdutoCredito(
          null,
          'Apoio à Habitação & Obras',
          'Crédito bonificado para obras de beneficiação habitacional e compra de materiais.',
          0.028,
          12,
          72,
          1000000,
          15000000,
          true
        ),
        new ProdutoCredito(
          null,
          'Linha Mulher Empreendedora',
          'Linha de financiamento inclusivo para fomento de negócios geridos por mulheres.',
          0.025,
          6,
          48,
          200000,
          5000000,
          true
        ),
      ]

      for (const p of defaultProducts) {
        await repo.create(p)
      }
      produtos = await repo.findAllAtivos()
    }

    const data = produtos.map((p) => ({
      id: p.id,
      nome: p.nome,
      descricao: p.descricao,
      taxaJurosMensal: Number(p.taxaJurosMensal),
      prazoMinimoMeses: p.prazoMinimoMeses,
      prazoMaximoMeses: p.prazoMaximoMeses,
      valorMinimo: Number(p.valorMinimo),
      valorMaximo: Number(p.valorMaximo),
      clausula: `Contrato de Microcrédito N.º ${p.id}/GLX. Em conformidade com o Aviso N.º 10/2024 do Banco Nacional de Angola (BNA). Taxa de juros fixa de ${(Number(p.taxaJurosMensal) * 100).toFixed(1)}% ao mês calculada sob a Tabela Price. Isento de comissões oculta nos termos da Lei de Proteção ao Consumidor Financeiro.`,
    }))

    return response.ok({ data })
  }

  /**
   * GET /api/v1/produtos/:id
   */
  async show({ params, response }: HttpContext) {
    const repo = new ProdutoCreditoRepositoryImpl()
    const produto = await repo.findById(Number(params.id))
    if (!produto) {
      return response.notFound({ error: 'Produto não encontrado' })
    }

    return response.ok({
      data: {
        id: produto.id,
        nome: produto.nome,
        descricao: produto.descricao,
        taxaJurosMensal: Number(produto.taxaJurosMensal),
        prazoMinimoMeses: produto.prazoMinimoMeses,
        prazoMaximoMeses: produto.prazoMaximoMeses,
        valorMinimo: Number(produto.valorMinimo),
        valorMaximo: Number(produto.valorMaximo),
        clausula: `Contrato de Microcrédito N.º ${produto.id}/GLX. Regulamentado pelo Banco Nacional de Angola (BNA). Taxa fixa de ${(Number(produto.taxaJurosMensal) * 100).toFixed(1)}% a.m.`,
      },
    })
  }
}
