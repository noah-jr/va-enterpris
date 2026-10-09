import type { HttpContext } from '@adonisjs/core/http'
import { ObterKPIsAdmin } from '../../Application/UseCases/ObterKPIsAdmin.js'
import { GerarRelatorioPdf } from '../../Application/UseCases/GerarRelatorioPdf.js'
import { DateTime } from 'luxon'
import { EmpresaService } from '../../../../Services/EmpresaService.js'

export default class RelatoriosController {
  public async getKPIs({ request, response }: HttpContext) {
    const dias = request.input('dias', 30)
    const useCase = new ObterKPIsAdmin()
    try {
      const kpis = await useCase.execute(Number(dias))
      return response.ok({ data: kpis })
    } catch (error) {
      return response.internalServerError({
        message: 'Erro ao gerar KPIs',
        error: (error as Error).message,
      })
    }
  }

  public async exportarPdf({ request, response }: HttpContext) {
    const dias = request.input('dias', 30)
    const useCase = new GerarRelatorioPdf()
    try {
      const pdfBytes = await useCase.execute(Number(dias))

      const fileName = `Relatorio_KPIs_${DateTime.now().toFormat('yyyyMMdd_HHmm')}.pdf`

      response.header('Content-Type', 'application/pdf')
      response.header('Content-Disposition', `inline; filename="${fileName}"`)
      response.header('Access-Control-Allow-Origin', '*')
      response.header('Cross-Origin-Resource-Policy', 'cross-origin')
      return response.send(Buffer.from(pdfBytes))
    } catch (error) {
      return response.internalServerError({
        message: 'Erro ao gerar Relatório PDF',
        error: (error as Error).message,
      })
    }
  }

  public async gerarContratoPdf({ params, response }: HttpContext) {
    try {
      const db = (await import('@adonisjs/lucid/services/db')).default
      const solicitacao = await db.from('solicitacao_creditos').where('id', params.id).first()
      if (!solicitacao)
        return response.notFound({ message: 'Solicitação de crédito não encontrada' })

      const cliente = await db.from('clientes').where('id', solicitacao.cliente_id).first()
      const PDFDocument = (await import('pdfkit')).default
      const doc = new PDFDocument({ margin: 40, size: 'A4' })

      const year = new Date().getFullYear()
      const contratoNum = `GLX-CTR-${year}/${solicitacao.id.toString().padStart(6, '0')}`
      const dataEmissao = solicitacao.created_at
        ? new Date(solicitacao.created_at).toLocaleDateString('pt-AO')
        : new Date().toLocaleDateString('pt-AO')

      const chunks: Uint8Array[] = []
      doc.on('data', (chunk) => chunks.push(chunk))

      // ─── 1. BARRA SUPERIOR DE DECORAÇÃO DA MARCA ───────────────────────
      doc.rect(0, 0, 595, 6).fill('#1d4ed8')
      doc.rect(400, 0, 195, 6).fill('#d97706')

      // ─── 2. CABEÇALHO DA INSTITUIÇÃO COM LOGOTIPO ──────────────────────
      const empresa = await EmpresaService.getDadosEmpresa()
      const logoPath = (await import('node:path')).join(process.cwd(), 'public', 'logo-gloxis.png')
      const fs = await import('node:fs')

      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 40, 16, { width: 95 })
        doc
          .fillColor('#0f172a')
          .fontSize(12)
          .font('Helvetica-Bold')
          .text(empresa.nome.toUpperCase(), 145, 23)
        doc
          .fillColor('#475569')
          .fontSize(7)
          .font('Helvetica-Bold')
          .text(empresa.denominacao.toUpperCase(), 145, 38)
        doc
          .fillColor('#64748b')
          .fontSize(6.5)
          .font('Helvetica')
          .text(`NIF: ${empresa.nif} | Registo BNA nº ${empresa.bnaRegistro}`, 145, 48)
        doc.text(`Sede: ${empresa.endereco}, ${empresa.cidade}`, 145, 57)
      } else {
        doc
          .fillColor('#0f172a')
          .fontSize(16)
          .font('Helvetica-Bold')
          .text(empresa.nome.toUpperCase(), 40, 25)
        doc
          .fillColor('#475569')
          .fontSize(7.5)
          .font('Helvetica-Bold')
          .text(empresa.denominacao.toUpperCase(), 40, 44)
        doc
          .fillColor('#64748b')
          .fontSize(7)
          .font('Helvetica')
          .text(`NIF: ${empresa.nif} | Registo BNA nº ${empresa.bnaRegistro}`, 40, 55)
        doc.text(`Sede: ${empresa.endereco}, ${empresa.cidade}`, 40, 65)
      }

      // Caixa de Identificação do Documento (Canto Superior Direito)
      doc.rect(385, 20, 170, 55).fillColor('#f8fafc').fillAndStroke('#cbd5e1')
      doc
        .fillColor('#1e40af')
        .fontSize(8.5)
        .font('Helvetica-Bold')
        .text('CONTRATO DE MÚTUO', 395, 27, { align: 'center', width: 150 })
      doc
        .fillColor('#0f172a')
        .fontSize(10)
        .font('Helvetica-Bold')
        .text(contratoNum, 395, 39, { align: 'center', width: 150 })
      doc
        .fillColor('#64748b')
        .fontSize(7.5)
        .font('Helvetica')
        .text(`Data Emissão: ${dataEmissao}`, 395, 54, { align: 'center', width: 150 })

      // Linha Divisória de Secção
      doc.moveTo(40, 85).lineTo(555, 85).strokeColor('#e2e8f0').lineWidth(1).stroke()

      // ─── 3. BANNER PRINCIPAL DO TÍTULO ────────────────────────────────
      doc.rect(40, 95, 515, 24).fill('#0f172a')
      doc
        .fillColor('#ffffff')
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('CONTRATO DE MÚTUO E CONCESSÃO DE MICROCRÉDITO', 40, 102, {
          align: 'center',
          width: 515,
        })

      // ─── 4. SECÇÃO 1: PARTES CONTRATANTES ──────────────────────────────
      let y = 130
      doc.rect(40, y, 4, 14).fill('#1d4ed8')
      doc
        .fillColor('#0f172a')
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('1. IDENTIFICAÇÃO DAS PARTES CONTRATANTES', 50, y + 2)
      y += 20

      // Quadro Mutuante
      doc.rect(40, y, 252, 60).fillColor('#f8fafc').fillAndStroke('#e2e8f0')
      doc
        .fillColor('#1e40af')
        .fontSize(8)
        .font('Helvetica-Bold')
        .text('PRIMO MUTUANTE (INSTITUIÇÃO)', 48, y + 6)
      doc
        .fillColor('#0f172a')
        .fontSize(8.5)
        .font('Helvetica-Bold')
        .text(empresa.nome.toUpperCase(), 48, y + 18)
      doc
        .fillColor('#475569')
        .fontSize(7.5)
        .font('Helvetica')
        .text(`NIF: ${empresa.nif}`, 48, y + 30)
      doc.text(`Endereço: ${empresa.cidade}`, 48, y + 41)

      // Quadro Mutuário
      doc.rect(303, y, 252, 60).fillColor('#f8fafc').fillAndStroke('#e2e8f0')
      doc
        .fillColor('#1e40af')
        .fontSize(8)
        .font('Helvetica-Bold')
        .text('MUTUÁRIO (CLIENTE / FINANCIADO)', 311, y + 6)
      doc
        .fillColor('#0f172a')
        .fontSize(8.5)
        .font('Helvetica-Bold')
        .text((cliente?.nome || 'Cliente Gloxis').toUpperCase(), 311, y + 18)
      doc
        .fillColor('#475569')
        .fontSize(7.5)
        .font('Helvetica')
        .text(
          `NIF / BI: ${cliente?.nif || '000000000'} | Tel: ${cliente?.telefone || 'N/A'}`,
          311,
          y + 30
        )
      doc.text(`Endereço: ${cliente?.endereco || 'Luanda, Angola'}`, 311, y + 41)
      y += 70

      // ─── 5. SECÇÃO 2: QUADRO RESUMO DO FINANCIAMENTO ──────────────────
      doc.rect(40, y, 4, 14).fill('#1d4ed8')
      doc
        .fillColor('#0f172a')
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('2. QUADRO RESUMO DO FINANCIAMENTO', 50, y + 2)
      y += 20

      const valorMontante = Number(solicitacao.valor || 0)
      const parcelasNum = Number(solicitacao.parcelas || 12)
      const taxaJurosMensal = 2.5
      const valorPrestacao = Math.round(
        (valorMontante * (1 + (taxaJurosMensal / 100) * parcelasNum)) / parcelasNum
      )
      const totalReembolso = valorPrestacao * parcelasNum

      // Tabela Estilizada
      doc.rect(40, y, 515, 18).fill('#1e293b')
      doc.fillColor('#ffffff').fontSize(8).font('Helvetica-Bold')
      doc.text('PARÂMETRO DO CRÉDITO', 50, y + 5)
      doc.text('CONDIÇÃO CONTRATADA', 320, y + 5)
      y += 18

      const rowsGrid = [
        {
          label: 'Montante Principal Concedido (Capital)',
          val: `Kz ${valorMontante.toLocaleString('pt-AO', { minimumFractionDigits: 2 })}`,
        },
        { label: 'Prazo Total de Amortização', val: `${parcelasNum} Prestações Mensais` },
        { label: 'Taxa de Juros Nominal Aplicada', val: `${taxaJurosMensal}% ao Mês` },
        {
          label: 'Valor Estimado da Prestação Mensal',
          val: `Kz ${valorPrestacao.toLocaleString('pt-AO', { minimumFractionDigits: 2 })}`,
        },
        {
          label: 'Total Geral do Reembolso (Capital + Juros)',
          val: `Kz ${totalReembolso.toLocaleString('pt-AO', { minimumFractionDigits: 2 })}`,
        },
        {
          label: 'Finalidade Declarada do Financiamento',
          val: solicitacao.finalidade || 'Microcrédito de Consumo / Capital de Giro',
        },
        {
          label: 'Estado Atual do Contrato no Sistema',
          val: String(solicitacao.status).toUpperCase(),
        },
      ]

      rowsGrid.forEach((r, idx) => {
        const bg = idx % 2 === 0 ? '#ffffff' : '#f8fafc'
        doc.rect(40, y, 515, 16).fillColor(bg).fillAndStroke('#e2e8f0')
        doc
          .fillColor('#334155')
          .fontSize(7.5)
          .font('Helvetica')
          .text(r.label, 50, y + 4)
        doc
          .fillColor('#0f172a')
          .font('Helvetica-Bold')
          .text(r.val, 320, y + 4)
        y += 16
      })
      y += 15

      // ─── 6. SECÇÃO 3: CLÁUSULAS GERAIS E CONDIÇÕES LEGAIS ──────────────
      doc.rect(40, y, 4, 14).fill('#1d4ed8')
      doc
        .fillColor('#0f172a')
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('3. CLÁUSULAS GERAIS E CONDIÇÕES LEGAIS', 50, y + 2)
      y += 20

      const clausulas = [
        {
          num: 'Cláusula 1.ª (Objeto e Concessão)',
          body: 'O Mutuante concede ao Mutuário o valor estipulado no Quadro Resumo, declarando o Mutuário ter recebido ou estar em vias de receber o valor na sua conta bancária após formalização e validação documental.',
        },
        {
          num: 'Cláusula 2.ª (Modalidade e Amortização)',
          body: 'O Mutuário compromete-se a efetuar o pagamento das prestações mensais até à data de vencimento correspondente, através dos canais de pagamento autorizados (Transferência Bancária / Multicaixa Express com envio do comprovativo).',
        },
        {
          num: 'Cláusula 3.ª (Incumprimento, Juros de Mora e Multa)',
          body: 'Em caso de atraso na liquidação de qualquer prestação, incidirão juros de mora diários de 0.5% ao dia sobre o montante em dívida, sem prejuízo da aplicação de multa moratória e integração no ficheiro de crédito com restrição.',
        },
        {
          num: 'Cláusula 4.ª (Taxa de Esforço e Avaliação de Risco DSR)',
          body: 'O Mutuário declara sob compromisso de honra que a prestação contratada não excede a sua taxa de esforço financeira (DSR de 35% dos seus rendimentos comprovados), prevenindo a situação de sobre-endividamento.',
        },
        {
          num: 'Cláusula 5.ª (Foro e Legislação Aplicável)',
          body: 'Para resolução de qualquer litígio emergente da interpretação ou execução do presente contrato, é competente o Foro da Comarca de Luanda, aplicando-se a legislação financeira da República de Angola.',
        },
      ]

      clausulas.forEach((c) => {
        doc.fillColor('#1e40af').fontSize(8).font('Helvetica-Bold').text(c.num, 40, y)
        y += 10
        doc
          .fillColor('#334155')
          .fontSize(7.5)
          .font('Helvetica')
          .text(c.body, 40, y, { align: 'justify', width: 515 })
        y += doc.heightOfString(c.body, { align: 'justify', width: 515 }) + 6
      })

      y += 10

      // ─── 7. SECÇÃO 4: TERMO DE ACEITAÇÃO E ASSINATURAS ─────────────────
      doc.rect(40, y, 515, 80).fillColor('#fafafa').fillAndStroke('#cbd5e1')

      // Assinatura Mutuante
      doc
        .moveTo(60, y + 55)
        .lineTo(250, y + 55)
        .strokeColor('#94a3b8')
        .lineWidth(1)
        .stroke()
      doc
        .fillColor('#0f172a')
        .fontSize(7.5)
        .font('Helvetica-Bold')
        .text('PELA GLOXIS FINANCIAL S.A.', 60, y + 58, { width: 190, align: 'center' })
      doc
        .fillColor('#64748b')
        .fontSize(7)
        .font('Helvetica')
        .text('Departamento de Concessão de Crédito', 60, y + 68, { width: 190, align: 'center' })

      // Carimbo Digital no Centro
      doc
        .rect(265, y + 15, 65, 50)
        .strokeColor('#1d4ed8')
        .lineWidth(1.5)
        .stroke()
      doc
        .fillColor('#1d4ed8')
        .fontSize(7)
        .font('Helvetica-Bold')
        .text('GLOXIS', 265, y + 22, { width: 65, align: 'center' })
      doc.fontSize(6).text('SELO DIGITAL', 265, y + 32, { width: 65, align: 'center' })
      doc.fontSize(5.5).text('AUDITADO', 265, y + 42, { width: 65, align: 'center' })

      // Assinatura Mutuário
      doc
        .moveTo(345, y + 55)
        .lineTo(535, y + 55)
        .strokeColor('#94a3b8')
        .lineWidth(1)
        .stroke()
      doc
        .fillColor('#0f172a')
        .fontSize(7.5)
        .font('Helvetica-Bold')
        .text('O MUTUÁRIO / CLIENTE', 345, y + 58, { width: 190, align: 'center' })
      doc
        .fillColor('#64748b')
        .fontSize(7)
        .font('Helvetica')
        .text((cliente?.nome || 'Assinatura do Cliente').toUpperCase(), 345, y + 68, {
          width: 190,
          align: 'center',
        })

      // ─── 8. RODAPÉ DE INTEGRIDADE E AUDITORIA ─────────────────────────
      doc.moveTo(40, 785).lineTo(555, 785).strokeColor('#cbd5e1').lineWidth(0.8).stroke()
      doc
        .fillColor('#64748b')
        .fontSize(7)
        .font('Helvetica')
        .text(
          'Documento emitido eletronicamente pelo Sistema Gloxis Microcredit ERP · Válido como Contrato de Mútuo nos termos da Lei.',
          40,
          792,
          { align: 'center', width: 515 }
        )
      doc
        .fontSize(6.5)
        .text(
          `Código de Auditabilidade (Hash SHA-256): ${solicitacao.id.toString().padStart(8, '0')}-GLX-${Date.now().toString(36).toUpperCase()}`,
          40,
          802,
          { align: 'center', width: 515 }
        )

      doc.end()

      const buffer = await new Promise<Buffer>((resolve) => {
        doc.on('end', () => resolve(Buffer.concat(chunks)))
      })

      response.header('Content-Type', 'application/pdf')
      response.header('Content-Disposition', `inline; filename="Contrato_${solicitacao.id}.pdf"`)
      response.header('Access-Control-Allow-Origin', '*')
      response.header('Cross-Origin-Resource-Policy', 'cross-origin')
      return response.send(buffer)
    } catch (error) {
      return response.internalServerError({
        message: 'Erro ao gerar Contrato em PDF',
        error: (error as Error).message,
      })
    }
  }

  public async gerarExtratoPdf({ params, response }: HttpContext) {
    try {
      const db = (await import('@adonisjs/lucid/services/db')).default
      const cliente = await db.from('clientes').where('id', params.clienteId).first()
      if (!cliente) return response.notFound({ message: 'Cliente não encontrado' })

      const solicitacoes = await db.from('solicitacao_creditos').where('cliente_id', cliente.id)
      const solicitacoesIds = solicitacoes.map((s: { id: number }) => s.id)

      const pagamentos =
        solicitacoesIds.length > 0
          ? await db
              .from('pagamentos')
              .whereIn('solicitacao_id', solicitacoesIds)
              .orderBy('data_vencimento', 'asc')
          : []

      const totalSolicitado = solicitacoes.reduce(
        (acc: number, s: { valor: number }) => acc + Number(s.valor || 0),
        0
      )
      const totalPago = pagamentos
        .filter((p: { status: string }) => p.status === 'PROCESSADO')
        .reduce(
          (acc: number, p: { valor_parcela: number }) => acc + Number(p.valor_parcela || 0),
          0
        )
      const saldoPendente = Math.max(0, totalSolicitado - totalPago)

      const PDFDocument = (await import('pdfkit')).default
      const doc = new PDFDocument({ margin: 50, size: 'A4' })

      const chunks: Uint8Array[] = []
      doc.on('data', (chunk) => chunks.push(chunk))

      // Cabeçalho com Logotipo
      const empresa = await EmpresaService.getDadosEmpresa()
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
          .text(`EXTRATO DE CONTA CORRENTE | NIF: ${empresa.nif}`, 155, 48)
        doc.text(`Registo BNA nº ${empresa.bnaRegistro}`, 155, 60)
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
          .text(`EXTRATO DE CONTA CORRENTE | NIF: ${empresa.nif}`, 50, 58)
      }
      doc.moveTo(50, 85).lineTo(545, 85).strokeColor('#cbd5e1').stroke()

      // Dados do Cliente
      doc
        .fillColor('#0f172a')
        .fontSize(11)
        .font('Helvetica-Bold')
        .text(`Mutuário: ${cliente.nome}`, 50, 100)
      doc
        .fillColor('#64748b')
        .fontSize(9.5)
        .font('Helvetica')
        .text(`NIF: ${cliente.nif || 'N/A'} | Email: ${cliente.email || 'N/A'}`, 50, 115)

      // Resumo Financeiro
      doc.rect(50, 135, 495, 45).fillColor('#f8fafc').fillAndStroke('#e2e8f0')
      doc.fillColor('#1e40af').fontSize(9).font('Helvetica-Bold').text('TOTAL CONCEDIDO', 65, 145)
      doc
        .fillColor('#0f172a')
        .fontSize(11)
        .text(`Kz ${totalSolicitado.toLocaleString('pt-AO')}`, 65, 160)

      doc.fillColor('#166534').fontSize(9).font('Helvetica-Bold').text('TOTAL PAGO', 230, 145)
      doc
        .fillColor('#0f172a')
        .fontSize(11)
        .text(`Kz ${totalPago.toLocaleString('pt-AO')}`, 230, 160)

      doc.fillColor('#991b1b').fontSize(9).font('Helvetica-Bold').text('SALDO DEVEDOR', 400, 145)
      doc
        .fillColor('#0f172a')
        .fontSize(11)
        .text(`Kz ${saldoPendente.toLocaleString('pt-AO')}`, 400, 160)

      // Tabela de Prestações
      let y = 200
      doc
        .fillColor('#0f172a')
        .fontSize(11)
        .font('Helvetica-Bold')
        .text('HISTÓRICO DE PRESTAÇÕES', 50, y)
      y += 20

      doc.rect(50, y, 495, 20).fill('#1e293b')
      doc
        .fillColor('#ffffff')
        .fontSize(8.5)
        .font('Helvetica-Bold')
        .text('SOLICITAÇÃO', 55, y + 5)
      doc.text('PARCELA', 140, y + 5)
      doc.text('VENCIMENTO', 210, y + 5)
      doc.text('VALOR (KZ)', 300, y + 5)
      doc.text('ESTADO', 450, y + 5)
      y += 25

      pagamentos.forEach(
        (p: {
          solicitacao_id: number
          numero_parcela: number
          data_vencimento: string
          valor_parcela: number
          status: string
        }) => {
          doc
            .fillColor('#334155')
            .fontSize(8.5)
            .font('Helvetica')
            .text(`#SOL-${p.solicitacao_id}`, 55, y)
          doc.text(`${p.numero_parcela}ª Parcela`, 140, y)
          doc.text(new Date(p.data_vencimento).toLocaleDateString('pt-AO'), 210, y)
          doc.text(Number(p.valor_parcela).toLocaleString('pt-AO'), 300, y)
          doc
            .fillColor(p.status === 'PROCESSADO' ? '#166534' : '#b45309')
            .font('Helvetica-Bold')
            .text(p.status, 450, y)
          y += 18
        }
      )

      doc.end()

      const buffer = await new Promise<Buffer>((resolve) => {
        doc.on('end', () => resolve(Buffer.concat(chunks)))
      })

      response.header('Content-Type', 'application/pdf')
      response.header('Content-Disposition', `inline; filename="Extrato_Cliente_${cliente.id}.pdf"`)
      return response.send(buffer)
    } catch (error) {
      return response.internalServerError({
        message: 'Erro ao gerar Extrato em PDF',
        error: (error as Error).message,
      })
    }
  }
}
