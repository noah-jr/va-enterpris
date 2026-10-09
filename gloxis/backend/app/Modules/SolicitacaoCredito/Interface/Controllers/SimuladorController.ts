import type { HttpContext } from '@adonisjs/core/http'
import { SimuladorCreditoService } from '../../Domain/Services/SimuladorCreditoService.js'
import { GeradorCotacaoPdfService } from '../../Domain/Services/GeradorCotacaoPdfService.js'
import app from '@adonisjs/core/services/app'
import { ProdutoCreditoRepositoryImpl } from '../../../ProdutoFinanceiro/Infrastructure/Repositories/ProdutoCreditoRepositoryImpl.js'

export default class SimuladorController {
  public async simular({ request, response }: HttpContext) {
    const valor = request.input('valor')
    const parcelas = request.input('parcelas')
    const produtoId = request.input('produtoId')
    const gerarPdf = request.input('gerarPdf', false)

    if (!valor || !parcelas || !produtoId) {
      return response.badRequest({
        message: 'Os campos "valor", "parcelas" e "produtoId" são obrigatórios',
      })
    }

    try {
      const repo = new ProdutoCreditoRepositoryImpl()
      const produto = await repo.findById(Number(produtoId))
      if (!produto) {
        return response.notFound({ message: 'Produto de crédito não encontrado' })
      }

      const simuladorService = new SimuladorCreditoService()

      // Busca a melhor campanha ativa (maior desconto)
      const Campanha = (await import('#models/campanha')).default
      const { DateTime } = await import('luxon')
      const campanha = await Campanha.query()
        .where('ativo', true)
        .where('dataInicio', '<=', DateTime.now().toSQL()!)
        .where('dataFim', '>=', DateTime.now().toSQL()!)
        .orderBy('descontoTaxaJuros', 'desc')
        .first()

      const descontoTaxa = campanha ? campanha.descontoTaxaJuros : 0
      const resultado = simuladorService.simular(
        produto,
        Number(valor),
        Number(parcelas),
        descontoTaxa
      )

      if (gerarPdf) {
        const pdfService = new GeradorCotacaoPdfService()
        // Garante que o diretório tmp/uploads exista
        const fs = await import('node:fs')
        const uploadsDir = app.tmpPath('uploads')
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true })
        }

        const pdfPath = await pdfService.gerarPdf(resultado, app.tmpPath())

        // Retornar o arquivo diretamente ou enviar a URL
        return response.download(pdfPath)
      }

      return response.ok(resultado)
    } catch (error) {
      return response.badRequest({ error: (error as Error).message })
    }
  }
}
