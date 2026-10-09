import PDFDocument from 'pdfkit'
import fs from 'node:fs'
import path from 'node:path'
import { EmpresaService } from '../../../../Services/EmpresaService.js'
import { type ItemCronograma, type SimulacaoCreditoResult } from './SimuladorCreditoService.js'

export class GeradorCotacaoPdfService {
  /**
   * Gera um PDF com a simulação do crédito e salva localmente
   * @param simulacao O objeto retornado pelo SimuladorCreditoService
   * @param appTmpPath O diretório tmp root da aplicação Adonis
   * @returns file path string
   */
  public async gerarPdf(simulacao: SimulacaoCreditoResult, appTmpPath: string): Promise<string> {
    const empresa = await EmpresaService.getDadosEmpresa()

    return new Promise((resolve, reject) => {
      const fileName = `cotacao_simulacao_${Date.now()}.pdf`
      const pdfPath = path.join(appTmpPath, 'uploads', fileName)

      const doc = new PDFDocument({ margin: 50 })
      const stream = fs.createWriteStream(pdfPath)

      doc.pipe(stream)

      // Header
      doc.fontSize(18).font('Helvetica-Bold').text(empresa.nome.toUpperCase(), { align: 'center' })
      doc
        .fontSize(9)
        .font('Helvetica')
        .text(`${empresa.denominacao} | NIF: ${empresa.nif} | BNA nº ${empresa.bnaRegistro}`, {
          align: 'center',
        })
      doc.moveDown()
      doc
        .fontSize(13)
        .font('Helvetica-Bold')
        .text('COTAÇÃO / SIMULAÇÃO DE EMPRÉSTIMO', { align: 'center' })
      doc.moveDown(1.5)

      // Info
      doc.fontSize(12).font('Helvetica-Bold').text('Resumo da Simulação:')
      doc.font('Helvetica').moveDown(0.5)

      doc.text(`Valor Solicitado: Kz ${simulacao.valorSolicitado.toLocaleString('pt-AO')}`)
      doc.text(`Prazo: ${simulacao.numeroParcelas} meses`)
      doc.text(`Taxa de Juros Mensal: ${(simulacao.taxaJurosMensal * 100).toFixed(2)}%`)
      doc.text(
        `Valor da Parcela (Fixa): Kz ${simulacao.valorParcelaMensal.toLocaleString('pt-AO')}`
      )
      doc.moveDown()

      doc.text(`Total de Juros a Pagar: Kz ${simulacao.jurosTotalPagar.toLocaleString('pt-AO')}`)
      doc
        .font('Helvetica-Bold')
        .text(`Custo Total Efetivo: Kz ${simulacao.totalGeralPagar.toLocaleString('pt-AO')}`)
      doc.moveDown(2)

      // Cronograma
      doc.font('Helvetica-Bold').text('Cronograma de Pagamentos:')
      doc.moveDown(0.5)

      const tableTop = doc.y
      doc.fontSize(10)
      doc.text('Mês', 50, tableTop)
      doc.text('Parcela', 100, tableTop)
      doc.text('Amortização', 200, tableTop)
      doc.text('Juros', 300, tableTop)
      doc.text('Saldo Devedor', 400, tableTop)

      doc
        .moveTo(50, tableTop + 15)
        .lineTo(500, tableTop + 15)
        .stroke()

      let y = tableTop + 20

      simulacao.cronograma.forEach((item: ItemCronograma) => {
        if (y > 700) {
          doc.addPage()
          y = 50
        }

        doc.font('Helvetica').text(item.mes.toString(), 50, y)
        doc.text(`Kz ${item.valorParcela.toLocaleString('pt-AO')}`, 100, y)
        doc.text(`Kz ${item.amortizacao.toLocaleString('pt-AO')}`, 200, y)
        doc.text(`Kz ${item.juros.toLocaleString('pt-AO')}`, 300, y)
        doc.text(`Kz ${item.saldoDevedor.toLocaleString('pt-AO')}`, 400, y)

        y += 15
      })

      doc.moveDown(3)
      doc
        .fontSize(9)
        .font('Helvetica-Oblique')
        .text(
          'Esta simulação não é uma oferta de crédito e está sujeita à análise e aprovação de crédito da Gloxis.',
          { align: 'center' }
        )

      doc.end()

      stream.on('finish', () => resolve(pdfPath))
      stream.on('error', (err) => reject(err))
    })
  }
}
