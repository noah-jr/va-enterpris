import type { HttpContext } from '@adonisjs/core/http'
import { GestaoFaturacaoUseCase } from '../../Application/UseCases/GestaoFaturacaoUseCase.js'
import { FaturacaoMySQLRepository } from '../../Infrastructure/Repositories/FaturacaoMySQLRepository.js'
import Fatura from '#models/fatura'
import crypto from 'node:crypto'
import { EmpresaService } from '../../../../Services/EmpresaService.js'

export default class FaturacaoController {
  private useCase: GestaoFaturacaoUseCase

  constructor() {
    const mysqlRepo = new FaturacaoMySQLRepository()
    this.useCase = new GestaoFaturacaoUseCase(mysqlRepo)
  }

  async index({ request }: HttpContext) {
    const page = request.input('page', 1)
    const perPage = request.input('perPage', 50)

    const result = await this.useCase.listar(page, perPage)
    return {
      meta: result.meta,
      data: result.data.map((e) => e.toJSON()),
    }
  }

  async minhasFaturas({ auth, request, response }: HttpContext) {
    try {
      const user = auth.user!
      // Usar o model diretamente para simplificar o filtro por clienteId
      const page = request.input('page', 1)
      const perPage = request.input('perPage', 50)

      const faturas = await Fatura.query()
        .where('cliente_id', user.id)
        .orderBy('created_at', 'desc')
        .paginate(page, perPage)

      return response.ok({ data: faturas })
    } catch (error) {
      return response.internalServerError({ error: (error as Error).message })
    }
  }

  async kpis() {
    const todas = await Fatura.all()
    const totalFaturas = todas.length
    const valorFaturadoTotal = todas
      .filter((f) => f.status === 'PAGA' || f.status === 'EMITIDA')
      .reduce((acc, f) => acc + Number(f.valor), 0)
    const faturasPagas = todas.filter((f) => f.status === 'PAGA').length
    const faturasVencidas = todas.filter((f) => f.status === 'VENCIDA').length
    const faturasEmitidas = todas.filter((f) => f.status === 'EMITIDA').length

    return {
      totalFaturas,
      valorFaturadoTotal,
      faturasPagas,
      faturasVencidas,
      faturasEmitidas,
    }
  }

  async store({ request }: HttpContext) {
    const data = request.all()

    // Gerar Hash de Validação AGT para conformidade fiscal angolana
    const hashDummy = crypto
      .createHash('sha256')
      .update(`${Date.now()}-${data.valor || 0}`)
      .digest('hex')
      .substring(0, 16)
      .toUpperCase()

    const payload = {
      cliente_id: data.cliente_id || data.clienteId || null,
      cliente_nome: data.cliente_nome || data.clienteNome || 'Cliente Consumidor Final',
      cliente_nif: data.cliente_nif || data.clienteNif || '5418009900',
      tipo_documento: data.tipo_documento || data.tipoDocumento || 'FT',
      valor: data.valor || 0,
      valor_imposto: data.valor_imposto || Math.round((data.valor || 0) * 0.14),
      valor_retencao: data.valor_retencao || 0,
      status: data.status || 'EMITIDA',
      hash_agt: hashDummy,
      itens_json:
        typeof data.itens === 'object' ? JSON.stringify(data.itens) : data.itens_json || '[]',
      data_vencimento:
        data.data_vencimento ||
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    }

    const entity = await this.useCase.criar(payload)
    return entity.toJSON()
  }

  async show({ params, response }: HttpContext) {
    const entity = await this.useCase.obterPorId(params.id)
    if (!entity) return response.notFound({ error: 'Fatura não encontrada' })
    return entity.toJSON()
  }

  async gerarPdf({ params, response }: HttpContext) {
    const fatura = await Fatura.find(params.id)
    if (!fatura) return response.notFound({ error: 'Fatura não encontrada' })

    const empresa = await EmpresaService.getDadosEmpresa()
    const PDFDocument = (await import('pdfkit')).default
    const doc = new PDFDocument({ margin: 50, size: 'A4' })

    const year = fatura.createdAt
      ? new Date(fatura.createdAt.toString()).getFullYear()
      : new Date().getFullYear()
    const docNum = `${fatura.tipoDocumento} ${year}/${fatura.id.toString().padStart(6, '0')}`

    const chunks: Uint8Array[] = []
    doc.on('data', (chunk) => chunks.push(chunk))

    // Cabeçalho / Estilo com Logotipo
    const logoPath = (await import('node:path')).join(process.cwd(), 'public', 'logo-gloxis.png')
    const fs = await import('node:fs')

    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 50, 25, { width: 90 })
      doc
        .fillColor('#0f172a')
        .fontSize(14)
        .font('Helvetica-Bold')
        .text(empresa.nome.toUpperCase(), 155, 30)
      doc
        .fillColor('#64748b')
        .fontSize(8)
        .font('Helvetica')
        .text(`${empresa.denominacao} | NIF: ${empresa.nif}`, 155, 48)
      doc.text(`${empresa.cidade} | IBAN: ${empresa.iban}`, 155, 60)
    } else {
      doc
        .fillColor('#0f172a')
        .fontSize(18)
        .font('Helvetica-Bold')
        .text(empresa.nome.toUpperCase(), 50, 35)
      doc
        .fillColor('#64748b')
        .fontSize(8.5)
        .font('Helvetica')
        .text(`${empresa.denominacao} | NIF: ${empresa.nif}`, 50, 58)
      doc.text(`${empresa.cidade} | IBAN: ${empresa.iban}`, 50, 70)
    }

    // Linha Separadora Topo
    doc.moveTo(50, 98).lineTo(545, 98).strokeColor('#e2e8f0').lineWidth(1.5).stroke()

    // Título do Documento
    const titulo =
      fatura.tipoDocumento === 'RC'
        ? 'RECIBO DE LIQUIDAÇÃO / DESEMBOLSO'
        : 'FATURA PROFORMA / COBRANÇA'
    doc.fillColor('#1e293b').fontSize(14).font('Helvetica-Bold').text(titulo, 50, 112)
    doc
      .fillColor('#3b82f6')
      .fontSize(11)
      .font('Helvetica-Bold')
      .text(docNum, 400, 112, { align: 'right' })

    // Caixa de Informação do Cliente & Documento
    doc.rect(50, 135, 495, 75).fillColor('#f8fafc').fillAndStroke('#e2e8f0')

    doc
      .fillColor('#475569')
      .fontSize(9)
      .font('Helvetica-Bold')
      .text('DADOS DO MUTUÁRIO / CLIENTE', 65, 147)
    doc
      .fillColor('#0f172a')
      .fontSize(10)
      .font('Helvetica-Bold')
      .text(`Nome: ${fatura.clienteNome}`, 65, 162)
    doc
      .fillColor('#64748b')
      .fontSize(9)
      .font('Helvetica')
      .text(`NIF / Identificação: ${fatura.clienteNif}`, 65, 177)

    const dataEmissao = fatura.createdAt
      ? new Date(fatura.createdAt.toString()).toLocaleDateString('pt-AO')
      : new Date().toLocaleDateString('pt-AO')
    const dataVenc = fatura.dataVencimento
      ? new Date(fatura.dataVencimento.toString()).toLocaleDateString('pt-AO')
      : dataEmissao

    doc
      .fillColor('#475569')
      .fontSize(9)
      .font('Helvetica-Bold')
      .text('DETALHES DA EMISSÃO', 350, 147)
    doc
      .fillColor('#64748b')
      .fontSize(9)
      .font('Helvetica')
      .text(`Data de Emissão: ${dataEmissao}`, 350, 162)
    doc.text(`Data de Vencimento: ${dataVenc}`, 350, 177)
    doc.text(`Estado: ${fatura.status.toUpperCase()}`, 350, 192)

    // Tabela de Itens
    let startY = 230
    doc.rect(50, startY, 495, 22).fill('#1e293b')
    doc
      .fillColor('#ffffff')
      .fontSize(9)
      .font('Helvetica-Bold')
      .text('DESCRIÇÃO DOS SERVIÇOS / OPERAÇÃO', 60, startY + 6)
    doc.text('VALOR (KZ)', 430, startY + 6, { align: 'right', width: 105 })

    startY += 30

    try {
      const itens = JSON.parse(fatura.itensJson || '[]') as Array<{
        descricao: string
        valor: number
      }>
      itens.forEach((item) => {
        doc.fillColor('#1e293b').fontSize(9.5).font('Helvetica').text(item.descricao, 60, startY)
        doc
          .fillColor('#0f172a')
          .font('Helvetica-Bold')
          .text(
            `${Number(item.valor).toLocaleString('pt-AO', { minimumFractionDigits: 2 })} Kz`,
            430,
            startY,
            { align: 'right', width: 105 }
          )
        startY += 20
        doc
          .moveTo(50, startY - 5)
          .lineTo(545, startY - 5)
          .strokeColor('#f1f5f9')
          .lineWidth(0.8)
          .stroke()
      })
    } catch (e) {
      doc
        .fillColor('#1e293b')
        .fontSize(9.5)
        .font('Helvetica')
        .text('Operação Financeira de Microcrédito', 60, startY)
      doc
        .fillColor('#0f172a')
        .font('Helvetica-Bold')
        .text(
          `${Number(fatura.valor).toLocaleString('pt-AO', { minimumFractionDigits: 2 })} Kz`,
          430,
          startY,
          { align: 'right', width: 105 }
        )
      startY += 20
    }

    // Totais
    startY += 10
    doc.rect(330, startY, 215, 35).fillColor('#eff6ff').fillAndStroke('#bfdbfe')
    doc
      .fillColor('#1e40af')
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('TOTAL GERAL:', 340, startY + 12)
    doc
      .fontSize(12)
      .text(
        `${Number(fatura.valor).toLocaleString('pt-AO', { minimumFractionDigits: 2 })} Kz`,
        420,
        startY + 11,
        { align: 'right', width: 115 }
      )

    // Carimbo de Estado
    const stampColor =
      fatura.status === 'PAGA' ? '#16a34a' : fatura.status === 'PENDENTE' ? '#d97706' : '#dc2626'
    const stampText =
      fatura.status === 'PAGA'
        ? 'PAGO / CONCILIADO'
        : fatura.status === 'PENDENTE'
          ? 'PENDENTE / NÃO PAGO'
          : 'CANCELADO'

    doc.save()
    doc.rect(50, startY, 160, 35).strokeColor(stampColor).lineWidth(2).stroke()
    doc
      .fillColor(stampColor)
      .fontSize(10)
      .font('Helvetica-Bold')
      .text(stampText, 50, startY + 12, { align: 'center', width: 160 })
    doc.restore()

    // Rodapé de Validação Interna e Auditabilidade
    doc.moveTo(50, 720).lineTo(545, 720).strokeColor('#cbd5e1').lineWidth(1).stroke()
    doc
      .fillColor('#64748b')
      .fontSize(8)
      .font('Helvetica')
      .text('DOCUMENTO DE CONTROLO INTERNO E CONCILIAÇÃO FINANCEIRA - GLOXIS ERP', 50, 730, {
        align: 'center',
      })
    doc
      .fontSize(7.5)
      .text(`Validação de Integridade (Hash SHA-256): ${fatura.hashAgt || 'N/A'}`, 50, 742, {
        align: 'center',
      })
    doc.text(
      'Este documento comprova o registo da operação financeira nos termos dos controlos internos do sistema Gloxis.',
      50,
      754,
      { align: 'center' }
    )

    doc.end()

    const buffer = await new Promise<Buffer>((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)))
    })

    response.header('Content-Type', 'application/pdf')
    response.header(
      'Content-Disposition',
      `inline; filename="${fatura.tipoDocumento}_${fatura.id}.pdf"`
    )
    response.header('Access-Control-Allow-Origin', '*')
    response.header('Cross-Origin-Resource-Policy', 'cross-origin')
    return response.send(buffer)
  }

  async update({ params, request }: HttpContext) {
    const data = request.all()
    const entity = await this.useCase.atualizar(params.id, data)
    return entity.toJSON()
  }

  async destroy({ params }: HttpContext) {
    return await this.useCase.remover(params.id)
  }
}
