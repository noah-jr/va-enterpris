import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import { ObterKPIsAdmin } from './ObterKPIsAdmin.js'
import { DateTime } from 'luxon'

export class GerarRelatorioPdf {
  private obterKPIs: ObterKPIsAdmin

  constructor() {
    this.obterKPIs = new ObterKPIsAdmin()
  }

  async execute(dias: number = 30): Promise<Uint8Array> {
    const kpis = await this.obterKPIs.execute(dias)

    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage([595.28, 841.89]) // A4 size
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

    const { width, height } = page.getSize()

    // Header
    page.drawRectangle({
      x: 0,
      y: height - 100,
      width,
      height: 100,
      color: rgb(0.05, 0.15, 0.25),
    })

    page.drawText('GLOXIS ERP', {
      x: 40,
      y: height - 45,
      size: 24,
      font: fontBold,
      color: rgb(1, 1, 1),
    })

    page.drawText('RELATÓRIO EXECUTIVO DE DESEMPENHO', {
      x: 40,
      y: height - 70,
      size: 10,
      font,
      color: rgb(0.8, 0.8, 0.8),
    })

    page.drawText(`Período: Últimos ${dias} dias`, {
      x: width - 200,
      y: height - 45,
      size: 10,
      font,
      color: rgb(1, 1, 1),
    })
    page.drawText(
      `Gerado em: ${DateTime.now().setZone('Africa/Luanda').toFormat('dd/MM/yyyy HH:mm')}`,
      {
        x: width - 200,
        y: height - 60,
        size: 10,
        font,
        color: rgb(0.8, 0.8, 0.8),
      }
    )

    const formatCurrency = (value: number) =>
      `Kz ${value.toLocaleString('pt-AO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

    let currentY = height - 140

    const drawSectionHeader = (title: string) => {
      page.drawText(title.toUpperCase(), {
        x: 40,
        y: currentY,
        size: 12,
        font: fontBold,
        color: rgb(0.1, 0.2, 0.4),
      })
      page.drawLine({
        start: { x: 40, y: currentY - 5 },
        end: { x: width - 40, y: currentY - 5 },
        thickness: 1,
        color: rgb(0.8, 0.8, 0.8),
      })
      currentY -= 30
    }

    const drawRow = (
      label1: string,
      val1: string,
      label2: string,
      val2: string,
      color2 = rgb(0.2, 0.2, 0.2)
    ) => {
      page.drawText(label1, { x: 40, y: currentY, size: 10, font, color: rgb(0.4, 0.4, 0.4) })
      page.drawText(val1, {
        x: 180,
        y: currentY,
        size: 10,
        font: fontBold,
        color: rgb(0.2, 0.2, 0.2),
      })

      if (label2) {
        page.drawText(label2, { x: 320, y: currentY, size: 10, font, color: rgb(0.4, 0.4, 0.4) })
        page.drawText(val2, { x: 460, y: currentY, size: 10, font: fontBold, color: color2 })
      }
      currentY -= 20
    }

    // --- SECÇÃO: ERP ---
    drawSectionHeader('Operações ERP')
    drawRow(
      'Receita Vendas:',
      formatCurrency(kpis.erp.valorTotalVendas),
      'Despesa Compras:',
      formatCurrency(kpis.erp.valorTotalCompras)
    )
    drawRow(
      'Total Vendas (Qtd):',
      String(kpis.erp.totalVendas),
      'Total Compras (Qtd):',
      String(kpis.erp.totalCompras)
    )
    drawRow(
      'Funcionários Ativos:',
      String(kpis.erp.totalFuncionarios),
      'Itens em Stock (SKU):',
      String(kpis.erp.totalItensStock)
    )
    currentY -= 15

    // --- SECÇÃO: CLIENTES ---
    drawSectionHeader('Base de Clientes')
    drawRow(
      'Total Registados:',
      String(kpis.totalClientes),
      'Na Lista Negra:',
      String(kpis.clientesNaListaNegra),
      rgb(0.8, 0.1, 0.1)
    )
    drawRow(
      'Inadimplentes:',
      String(kpis.totalClientesInadimplentes),
      'Taxa Inadimplência:',
      `${kpis.taxaInadimplencia.toFixed(2)}%`,
      rgb(0.8, 0.1, 0.1)
    )
    currentY -= 15

    // --- SECÇÃO: PIPELINE DE CRÉDITO ---
    drawSectionHeader('Pipeline de Crédito')
    drawRow(
      'Solicitações Totais:',
      String(kpis.solicitacoesTotal),
      'Pendentes:',
      String(kpis.solicitacoesPendentes),
      rgb(0.8, 0.5, 0.1)
    )
    drawRow(
      'Aprovadas:',
      String(kpis.solicitacoesAprovadas),
      'Reprovadas:',
      String(kpis.solicitacoesReprovadas),
      rgb(0.8, 0.1, 0.1)
    )
    drawRow('Taxa de Aprovação:', `${kpis.taxaAprovacao}%`, '', '')
    currentY -= 15

    // --- SECÇÃO: FINANCEIRO ---
    drawSectionHeader('Desempenho Financeiro (Crédito)')
    drawRow(
      'Total Desembolsado:',
      formatCurrency(kpis.totalDesembolsado),
      'Total Recebido:',
      formatCurrency(kpis.totalRecebidoPagamentos)
    )
    drawRow(
      'Juros e Multas:',
      formatCurrency(kpis.totalJurosRecebidos),
      'Carteira em Aberto:',
      formatCurrency(kpis.saldoCarteiraTotalDevedor)
    )
    drawRow('Valor em Atraso:', formatCurrency(kpis.valorTotalAtrasado), '', '', rgb(0.8, 0.1, 0.1))

    // Footer
    page.drawText('Documento gerado automaticamente pelo sistema Gloxis ERP - Confidencial', {
      x: 40,
      y: 30,
      size: 8,
      font,
      color: rgb(0.5, 0.5, 0.5),
    })

    const pdfBytes = await pdfDoc.save()
    return pdfBytes
  }
}
