import type { HttpContext } from '@adonisjs/core/http'
import { CadastrarCliente } from '../../Application/UseCases/CadastrarCliente.js'
import { ListarClientes } from '../../Application/UseCases/ListarClientes.js'
import { ObterClienteDetalhado } from '../../Application/UseCases/ObterClienteDetalhado.js'
import { AtualizarCliente } from '../../Application/UseCases/AtualizarCliente.js'
import { RemoverCliente } from '../../Application/UseCases/RemoverCliente.js'
import { ObterDashboardCliente } from '../../Application/UseCases/ObterDashboardCliente.js'
import { ObterClienteMe } from '../../Application/UseCases/ObterClienteMe.js'
import { ClienteRepositoryImpl } from '../../Infrastructure/Repositories/ClienteRepositoryImpl.js'

import { ExportarClientes } from '../../Application/UseCases/ExportarClientes.js'
import { ObterKpisClientes } from '../../Application/UseCases/ObterKpisClientes.js'
import PDFDocument from 'pdfkit'
import { EmpresaService } from '../../../../Services/EmpresaService.js'

export default class ClienteController {
  private repository = new ClienteRepositoryImpl()

  private useCases = {
    cadastrar: new CadastrarCliente(this.repository),
    listar: new ListarClientes(this.repository),
    obterDetalhado: new ObterClienteDetalhado(this.repository),
    atualizar: new AtualizarCliente(this.repository),
    remover: new RemoverCliente(this.repository),
    dashboard: new ObterDashboardCliente(this.repository),
    me: new ObterClienteMe(this.repository),
    exportar: new ExportarClientes(this.repository),
    kpis: new ObterKpisClientes(this.repository),
  }

  public async kpis({ response }: HttpContext) {
    try {
      const data = await this.useCases.kpis.execute()
      return response.ok({ data })
    } catch (error) {
      return response.internalServerError({ error: (error as Error).message })
    }
  }

  public async store({ request, response }: HttpContext) {
    const payload = request.only([
      'nome',
      'nif',
      'documentos',
      'endereco',
      'contaBancaria',
      'email',
      'telefone',
      'fotografia',
      'logotipo',
    ])

    // Handle file uploads if present (Multipart Form)
    const fotografiaFile = request.file('fotografia', {
      size: '5mb',
      extnames: ['jpg', 'png', 'jpeg'],
    })
    const logotipoFile = request.file('logotipo', { size: '5mb', extnames: ['jpg', 'png', 'jpeg'] })

    if (fotografiaFile) {
      await fotografiaFile.move('public/uploads/clientes/fotografias')
      payload.fotografia = `/uploads/clientes/fotografias/${fotografiaFile.fileName}`
    }

    if (logotipoFile) {
      await logotipoFile.move('public/uploads/clientes/logotipos')
      payload.logotipo = `/uploads/clientes/logotipos/${logotipoFile.fileName}`
    }

    try {
      const cliente = await this.useCases.cadastrar.execute(payload)
      return response.created({ data: cliente })
    } catch (error) {
      return response.badRequest({ error: (error as Error).message })
    }
  }

  public async index({ request, response }: HttpContext) {
    try {
      const page = request.input('page', 1)
      const perPage = request.input('perPage', 10)
      const search = request.input('search')
      const risco = request.input('risco')

      const clientes = await this.useCases.listar.execute({ page, perPage, search, risco })
      return response.ok(clientes) // Since paginate returns { meta, data }, we return it directly
    } catch (error) {
      return response.internalServerError({ error: (error as Error).message })
    }
  }

  public async export({ request, response }: HttpContext) {
    try {
      const search = request.input('search')
      const risco = request.input('risco')
      const data = await this.useCases.exportar.execute({ search, risco })
      return response.ok({ data })
    } catch (error) {
      return response.internalServerError({ error: (error as Error).message })
    }
  }

  public async exportPdf({ request, response }: HttpContext) {
    try {
      const empresa = await EmpresaService.getDadosEmpresa()
      const search = request.input('search')
      const risco = request.input('risco')
      const data = await this.useCases.exportar.execute({ search, risco })

      const doc = new PDFDocument({ margin: 50, size: 'A4', bufferPages: true })

      // Header
      doc
        .fillColor('#1e40af')
        .fontSize(20)
        .font('Helvetica-Bold')
        .text(empresa.nome.toUpperCase(), { align: 'left' })
      doc
        .fillColor('#64748b')
        .fontSize(8.5)
        .font('Helvetica')
        .text(`${empresa.denominacao} | NIF: ${empresa.nif}`, { align: 'left' })
      doc.moveUp(2)
      doc
        .fillColor('#0f172a')
        .fontSize(14)
        .font('Helvetica-Bold')
        .text('RELATÓRIO DE CARTEIRA', { align: 'right' })
      doc
        .fillColor('#64748b')
        .fontSize(10)
        .font('Helvetica')
        .text(`Emitido a: ${new Date().toLocaleDateString('pt-PT')}`, { align: 'right' })

      doc.moveDown(1.5)

      // Divider
      doc.moveTo(50, doc.y).lineTo(545, doc.y).lineWidth(1).strokeColor('#e2e8f0').stroke()
      doc.moveDown(1.5)

      // Metadados do Filtro
      doc
        .fontSize(9)
        .font('Helvetica-Bold')
        .fillColor('#334155')
        .text('FILTROS APLICADOS:', { continued: true })
        .font('Helvetica')
        .fillColor('#64748b')
        .text(`   Pesquisa: ${search || 'Nenhuma'}   |   Risco: ${risco || 'Todos'}`)
      doc.moveDown(1.5)

      // Tabela: Cabeçalho
      const tableTop = doc.y
      doc.font('Helvetica-Bold').fontSize(9).fillColor('#ffffff')
      doc.rect(50, tableTop, 495, 20).fill('#0f172a')

      const colId = 55
      const colNome = 85
      const colNif = 250
      const colContacto = 330
      const colRisco = 450
      const colScore = 505

      doc
        .fillColor('#ffffff')
        .text('#', colId, tableTop + 6)
        .text('ENTIDADE', colNome, tableTop + 6)
        .text('NIF', colNif, tableTop + 6)
        .text('CONTACTO', colContacto, tableTop + 6)
        .text('RISCO', colRisco, tableTop + 6)
        .text('SCORE', colScore, tableTop + 6)

      let y = tableTop + 25

      // Tabela: Linhas
      data.forEach((cliente: any, index) => {
        if (y > 750) {
          doc.addPage()
          y = 50
        }

        // Fundo zebra
        if (index % 2 === 0) {
          doc.rect(50, y - 5, 495, 25).fill('#f8fafc')
        }

        // Definir cor baseada no risco
        let riskColor = '#64748b' // default
        if (cliente.risco === 'ALTO') riskColor = '#e11d48' // red
        if (cliente.risco === 'MEDIO') riskColor = '#d97706' // yellow/amber
        if (cliente.risco === 'BAIXO') riskColor = '#059669' // green

        doc.font('Helvetica').fontSize(9).fillColor('#475569')
        doc.text(String(index + 1).padStart(3, '0'), colId, y)
        doc
          .font('Helvetica-Bold')
          .fillColor('#0f172a')
          .text(cliente.nome.substring(0, 30), colNome, y)
        doc.font('Helvetica').fillColor('#475569').text(cliente.nif, colNif, y)
        doc.text((cliente.telefone || cliente.email || 'N/A').substring(0, 20), colContacto, y)
        doc
          .font('Helvetica-Bold')
          .fillColor(riskColor)
          .text(cliente.risco || 'N/A', colRisco, y)
        doc.fillColor('#3b82f6').text(String(cliente.scoreCredito ?? 0), colScore, y)

        y += 25
      })

      // Footer - Paginação
      const pages = doc.bufferedPageRange()
      for (let i = 0; i < pages.count; i++) {
        doc.switchToPage(i)
        doc.moveTo(50, 800).lineTo(545, 800).lineWidth(0.5).strokeColor('#e2e8f0').stroke()
        doc
          .font('Helvetica')
          .fontSize(8)
          .fillColor('#94a3b8')
          .text(`Página ${i + 1} de ${pages.count}  |  Gerado via Sistema GLOXIS ERP`, 50, 810, {
            align: 'center',
            width: 495,
          })
      }

      doc.end()

      response.header('Content-Type', 'application/pdf')
      response.header('Content-Disposition', 'attachment; filename="relatorio_clientes.pdf"')
      return response.stream(doc)
    } catch (error) {
      return response.internalServerError({ error: (error as Error).message })
    }
  }

  public async show({ params, response }: HttpContext) {
    try {
      const data = await this.useCases.obterDetalhado.execute(params.id)
      return response.ok({ data })
    } catch (error) {
      return response.notFound({ error: 'Cliente não encontrado' })
    }
  }

  public async update({ params, request, response }: HttpContext) {
    try {
      const rawPayload = request.only([
        'nome',
        'nif',
        'endereco',
        'contaBancaria',
        'email',
        'telefone',
        'fotografia',
        'logotipo',
      ])

      const payload = Object.fromEntries(
        Object.entries(rawPayload).filter(([_, v]) => v !== undefined)
      )

      const fotografiaFile = request.file('fotografia', {
        size: '5mb',
        extnames: ['jpg', 'png', 'jpeg'],
      })
      const logotipoFile = request.file('logotipo', {
        size: '5mb',
        extnames: ['jpg', 'png', 'jpeg'],
      })

      if (fotografiaFile) {
        await fotografiaFile.move('public/uploads/clientes/fotografias')
        payload.fotografia = `/uploads/clientes/fotografias/${fotografiaFile.fileName}`
      }

      if (logotipoFile) {
        await logotipoFile.move('public/uploads/clientes/logotipos')
        payload.logotipo = `/uploads/clientes/logotipos/${logotipoFile.fileName}`
      }

      const data = await this.useCases.atualizar.execute(params.id, payload)
      return response.ok({ data })
    } catch (error) {
      return response.badRequest({ error: (error as Error).message })
    }
  }

  public async destroy({ params, response }: HttpContext) {
    try {
      await this.useCases.remover.execute(params.id)
      return response.ok({ message: 'Cliente removido com sucesso' })
    } catch (error) {
      return response.badRequest({ error: (error as Error).message })
    }
  }

  public async me({ auth, response }: HttpContext) {
    try {
      const user = auth.user!
      const data = await this.useCases.me.execute(user.id)
      return response.ok({ data })
    } catch (error) {
      return response.internalServerError({ error: (error as Error).message })
    }
  }

  public async dashboard({ auth, response }: HttpContext) {
    try {
      const user = auth.user!
      const data = await this.useCases.dashboard.execute(user.id)
      return response.ok({ data })
    } catch (error) {
      return response.internalServerError({ error: (error as Error).message })
    }
  }

  public async updateMe({ auth, request, response }: HttpContext) {
    try {
      const user = auth.user!
      const cliente = await this.repository.findByUserId(user.id)
      if (!cliente) return response.notFound({ error: 'Perfil de cliente não encontrado' })

      const payload: Record<string, unknown> = request.only([
        'telefone',
        'endereco',
        'contaBancaria',
        'nif',
        'email',
        'nome',
      ])

      const fotografiaFile = request.file('fotografia', {
        size: '5mb',
        extnames: ['jpg', 'png', 'jpeg'],
      })
      const logotipoFile = request.file('logotipo', {
        size: '5mb',
        extnames: ['jpg', 'png', 'jpeg'],
      })

      if (fotografiaFile) {
        await fotografiaFile.move('public/uploads/clientes/fotografias')
        payload.fotografia = `/uploads/clientes/fotografias/${fotografiaFile.fileName}`
      }

      if (logotipoFile) {
        await logotipoFile.move('public/uploads/clientes/logotipos')
        payload.logotipo = `/uploads/clientes/logotipos/${logotipoFile.fileName}`
      }

      const data = await this.useCases.atualizar.execute(cliente.id, payload)
      return response.ok({ data })
    } catch (error) {
      return response.badRequest({ error: (error as Error).message })
    }
  }
}
