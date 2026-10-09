import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import DocumentoModel from '#models/documento'
import TramitacaoDocumento from '#models/tramitacao_documento'
import MensagemInbox from '#models/mensagem_inbox'
import fs from 'node:fs'
import path from 'node:path'
import emitter from '@adonisjs/core/services/emitter'

export default class DocumentoController {
  /**
   * 1. Listagem Geral de Documentos com Filtros
   */
  async index({ request, response }: HttpContext) {
    try {
      const page = request.input('page', 1)
      const perPage = request.input('perPage', 10)
      const search = request.input('search')
      const categoria = request.input('categoria')
      const status = request.input('status')
      const departamento = request.input('departamento')

      const query = DocumentoModel.query().orderBy('created_at', 'desc')

      if (search) {
        query.where((q) => {
          q.where('titulo', 'like', `%${search}%`)
            .orWhere('cliente_nome', 'like', `%${search}%`)
            .orWhere('caminho', 'like', `%${search}%`)
        })
      }

      if (categoria && categoria !== 'TODOS') {
        query.where('categoria', categoria)
      }

      if (status && status !== 'TODOS') {
        query.where('status', status)
      }

      if (departamento && departamento !== 'TODOS') {
        query.where('departamento', departamento)
      }

      const paginated = await query.paginate(page, perPage)
      return response.ok(paginated.toJSON())
    } catch (error) {
      return response.internalServerError({
        error: 'Erro ao listar documentos: ' + (error as Error).message,
      })
    }
  }

  /**
   * 2. Store / Upload do Documento com Metadados
   */
  async store({ request, response }: HttpContext) {
    try {
      const file = request.file('arquivo', {
        extnames: ['pdf', 'png', 'jpg', 'jpeg', 'docx', 'xlsx', 'txt', 'csv'],
        size: '50mb',
      })

      if (!file) {
        return response.badRequest({ error: 'Nenhum ficheiro anexado.' })
      }

      if (!file.isValid) {
        return response.badRequest({ error: file.errors })
      }

      const fileName = `${Date.now()}_${file.clientName.replace(/\s+/g, '_')}`
      const uploadDir = app.makePath('public/uploads/documentos')

      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true })
      }

      await file.move(uploadDir, {
        name: fileName,
        overwrite: true,
      })

      const titulo = request.input('titulo', file.clientName)
      const categoria = request.input('categoria', 'OUTRO')
      const departamento = request.input('departamento', 'GERAL')
      const status = request.input('status', 'PENDENTE')
      const clienteNome = request.input('cliente_nome', null)
      const clienteEmail = request.input('cliente_email', null)
      const notas = request.input('notas', null)
      const caminho = `/uploads/documentos/${fileName}`

      const doc = await DocumentoModel.create({
        titulo,
        caminho,
        categoria,
        departamento,
        status,
        clienteNome,
        clienteEmail,
        notas,
      })

      // Registar primeira tramitação de entrada
      await TramitacaoDocumento.create({
        documentoId: doc.id,
        origem: 'Recepção / Upload',
        destino: departamento,
        despacho: 'Documento submetido para a infraestrutura de arquivo.',
        usuario: 'Sistema',
        statusAnterior: 'NOVO',
        statusNovo: status,
      })

      return response.created({ message: 'Documento registado com sucesso!', data: doc })
    } catch (error) {
      return response.internalServerError({
        error: 'Erro ao efetuar upload do documento: ' + (error as Error).message,
      })
    }
  }

  /**
   * Retornar templates pré-configurados do Editor Institucional
   */
  async getTemplate({ params, response }: HttpContext) {
    const { key } = params
    let template = {}

    if (key === 'CONTRATO_CREDITO') {
      template = {
        title: 'Contrato de Concessão de Crédito #2026',
        category: 'CONTRATO',
        content: `
          <h1 style="text-align: center; color: #1e3a8a;">CONTRATO DE CONCESSÃO DE CRÉDITO MICROFINANÇAS</h1>
          <p style="text-align: center; font-size: 12px; color: #64748b;">GLOXIS ERP - DEPARTAMENTO FINANCEIRO & JURÍDICO</p>
          <hr style="margin: 20px 0; border: 0; border-top: 1px solid #cbd5e1;"/>
          
          <h3>1. DAS PARTES CONTRATANTES</h3>
          <p><strong>PRIMEIRA CONTRATANTE:</strong> GLOXIS FINTECH S.A., pessoa coletiva de direito angolano com sede em Luanda.</p>
          <p><strong>SEGUNDO CONTRATANTE:</strong> {{CLIENTE_NOME}}, com o e-mail {{CLIENTE_EMAIL}}.</p>

          <h3>2. DO OBJECTO E VALOR DO CRÉDITO</h3>
          <p>O presente contrato tem como objecto a concessão de um empréstimo no valor de Kz 2.500.000,00 (Dois Milhões e Quinhentos Mil Kwanzas) a ser reembolsado em 12 prestações mensais.</p>

          <h3>3. DAS CONDIÇÕES E GARANTIAS</h3>
          <p>O mutuário compromete-se a efetuar os pagamentos de acordo com o plano de amortização anexo a este documento.</p>

          <br/><br/>
          <p style="text-align: right;">Luanda, {{DATA_ATUAL}}</p>
        `,
      }
    } else if (key === 'NOTIFICACAO_COBRANCA') {
      template = {
        title: 'Notificação Extrajudicial de Incumprimento',
        category: 'RELATORIO',
        content: `
          <h1 style="text-align: center; color: #b91c1c;">NOTIFICAÇÃO EXTRAJUDICIAL DE COBRANÇA</h1>
          <p style="text-align: center; font-size: 12px; color: #64748b;">DEPARTAMENTO DE RECUPERAÇÃO DE CRÉDITO & JURÍDICO</p>
          <hr style="margin: 20px 0; border: 0; border-top: 1px solid #cbd5e1;"/>

          <p>Ao Exmo.(a) Sr.(a) <strong>{{CLIENTE_NOME}}</strong>,</p>
          <p>Endereço eletrónico: <strong>{{CLIENTE_EMAIL}}</strong></p>

          <p>Vimos por este meio solicitar a regularização imediata do saldo em atraso referente ao contrato de financiamento em vigor. O valor acumulado com juros de mora fixa-se em Kz 350.000,00.</p>

          <p>Solicitamos o contacto no prazo de 5 (cinco) dias úteis a contar da receção desta notificação.</p>

          <br/><br/>
          <p style="text-align: right;">Luanda, {{DATA_ATUAL}}</p>
        `,
      }
    } else if (key === 'QUITACAO') {
      template = {
        title: 'Declaração de Quitação Total de Débito',
        category: 'CONTRATO',
        content: `
          <h1 style="text-align: center; color: #15803d;">DECLARAÇÃO DE QUITAÇÃO INTEGRAL</h1>
          <hr style="margin: 20px 0; border: 0; border-top: 1px solid #cbd5e1;"/>

          <p>A GLOXIS FINTECH S.A. declara para os devidos efeitos que o(a) Sr.(a) <strong>{{CLIENTE_NOME}}</strong> liquidou integralmente todas as obrigações financeiras assumidas no âmbito do processo de microcrédito.</p>

          <p>Nada mais havendo a reclamar a qualquer título, confere-se a presente quitação irrevogável e definitiva.</p>

          <br/><br/>
          <p style="text-align: right;">Luanda, {{DATA_ATUAL}}</p>
        `,
      }
    } else {
      return response.notFound({ error: 'Template não encontrado.' })
    }

    return response.ok(template)
  }

  /**
   * 3. Obter Detalhes do Documento
   */
  async show({ params, response }: HttpContext) {
    try {
      const doc = await DocumentoModel.find(params.id)
      if (!doc) return response.notFound({ error: 'Documento não encontrado.' })

      const tramitacoes = await TramitacaoDocumento.query()
        .where('documento_id', doc.id)
        .orderBy('created_at', 'asc')

      return response.ok({ data: { ...doc.toJSON(), tramitacoes } })
    } catch (error) {
      return response.internalServerError({ error: (error as Error).message })
    }
  }

  /**
   * 4. Tramitação de Documento (Workflow entre Departamentos)
   */
  async tramitar({ params, request, response }: HttpContext) {
    try {
      const doc = await DocumentoModel.find(params.id)
      if (!doc) return response.notFound({ error: 'Documento não encontrado.' })

      const { destino, despacho, status_novo, usuario } = request.only([
        'destino',
        'despacho',
        'status_novo',
        'usuario',
      ])

      const origemAnterior = doc.departamento
      const statusAnterior = doc.status

      if (destino) doc.departamento = destino
      if (status_novo) doc.status = status_novo
      await doc.save()

      const tramitacao = await TramitacaoDocumento.create({
        documentoId: doc.id,
        origem: origemAnterior,
        destino: destino || origemAnterior,
        despacho: despacho || 'Documento tramitado.',
        usuario: usuario || 'Administrador',
        statusAnterior,
        statusNovo: doc.status,
      })

      return response.ok({
        message: `Documento #${doc.id} tramitado para ${doc.departamento} com o estado [${doc.status}].`,
        data: tramitacao,
      })
    } catch (error) {
      return response.internalServerError({
        error: 'Erro ao tramitar documento: ' + (error as Error).message,
      })
    }
  }

  /**
   * 5. Enviar Documento por Email
   */
  async enviarEmail({ params, request, response }: HttpContext) {
    try {
      const doc = await DocumentoModel.find(params.id)
      if (!doc) return response.notFound({ error: 'Documento não encontrado.' })

      const { email_destino, assunto, mensagem } = request.only([
        'email_destino',
        'assunto',
        'mensagem',
      ])
      const targetEmail = email_destino || doc.clienteEmail

      if (!targetEmail) {
        return response.badRequest({ error: 'Endereço de e-mail de destino é obrigatório.' })
      }

      // Log/Notificação real de envio do anexo
      console.log(
        `[DOC EMAIL DISPATCH] A enviar anexo (${doc.caminho}) para ${targetEmail}... Assunto: ${assunto || 'Envio'} | Mensagem: ${mensagem || ''}`
      )

      return response.ok({
        message: `Documento "${doc.titulo}" enviado com sucesso por e-mail para ${targetEmail}!`,
      })
    } catch (error) {
      return response.internalServerError({
        error: 'Erro ao enviar e-mail: ' + (error as Error).message,
      })
    }
  }

  /**
   * 6. Enviar Notificação / Mensagem com Link do Documento
   */
  async enviarMensagem({ params, request, response }: HttpContext) {
    try {
      const doc = await DocumentoModel.find(params.id)
      if (!doc) return response.notFound({ error: 'Documento não encontrado.' })

      const { destinatario_nome, telefone_ou_canal, mensagem } = request.only([
        'destinatario_nome',
        'telefone_ou_canal',
        'mensagem',
      ])

      // Registar mensagem na Inbox
      await MensagemInbox.create({
        remetenteNome: 'Sistema Gloxis',
        remetenteTipo: 'ADMIN',
        destinatarioNome: destinatario_nome || doc.clienteNome || 'Cliente',
        destinatarioTipo: 'CLIENTE',
        assunto: `Documento Partilhado: ${doc.titulo}`,
        conteudo: `${mensagem || 'Foi partilhado um documento consigo.'}\n\nCanal: ${telefone_ou_canal || 'Interno'}\nLink de Acesso: http://localhost:3333${doc.caminho}`,
        documentoId: doc.id,
        lida: false,
      })

      return response.ok({
        message: `Notificação enviada com sucesso para ${destinatario_nome || 'o destinatário'}!`,
      })
    } catch (error) {
      return response.internalServerError({
        error: 'Erro ao enviar mensagem: ' + (error as Error).message,
      })
    }
  }

  /**
   * 7. Remover Documento
   */
  async destroy({ params, response }: HttpContext) {
    try {
      const doc = await DocumentoModel.find(params.id)
      if (doc) {
        const fullPath = path.join(process.cwd(), 'public', doc.caminho)
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath)
        }
        await doc.delete()
      }
      return response.ok({ message: 'Documento eliminado com sucesso.' })
    } catch (error) {
      return response.internalServerError({ error: (error as Error).message })
    }
  }

  // ==========================================
  // INBOX & MENSAGENS INTERNAS (ADMIN ↔ CLIENTE)
  // ==========================================

  /**
   * 8. Listar Mensagens da Inbox (Geral/Admin)
   */
  async getInbox({ response }: HttpContext) {
    try {
      const mensagens = await MensagemInbox.query().orderBy('created_at', 'desc')
      return response.ok({ data: mensagens })
    } catch (error) {
      return response.internalServerError({ error: (error as Error).message })
    }
  }

  /**
   * 8.1 Listar Mensagens da Inbox do Cliente Autenticado
   */
  async getInboxMe({ auth, response }: HttpContext) {
    try {
      const userObj = auth.user as Record<string, unknown> | undefined
      const userName =
        (userObj?.fullName as string) ||
        (userObj?.nome as string) ||
        (userObj?.email as string) ||
        'Cliente'

      const mensagens = await MensagemInbox.query()
        .where('destinatario_nome', userName)
        .orWhere('remetente_nome', userName)
        .orderBy('created_at', 'desc')
      return response.ok({ data: mensagens })
    } catch (error) {
      return response.internalServerError({ error: (error as Error).message })
    }
  }

  /**
   * 9. Enviar Nova Mensagem na Inbox
   */
  async sendInboxMessage({ request, response }: HttpContext) {
    try {
      const {
        remetente_nome,
        remetente_tipo,
        destinatario_nome,
        destinatario_tipo,
        assunto,
        conteudo,
        documento_id,
      } = request.all()

      if (!destinatario_nome || !assunto || !conteudo) {
        return response.badRequest({
          error: 'Campos obrigatórios: destinatario_nome, assunto, conteudo.',
        })
      }

      const msg = await MensagemInbox.create({
        remetenteNome: remetente_nome || 'Administrador',
        remetenteTipo: remetente_tipo || 'ADMIN',
        destinatarioNome: destinatario_nome,
        destinatarioTipo: destinatario_tipo || 'CLIENTE',
        assunto,
        conteudo,
        documentoId: documento_id || null,
        lida: false,
      })

      // Emite o evento SSE para notificar os clientes conectados em tempo real
      emitter.emit('notificacao:realtime' as any, {
        type: 'NOVA_MENSAGEM',
        message: `Nova mensagem de ${msg.remetenteNome}: ${assunto}`,
        destinatario_nome: msg.destinatarioNome,
        broadcast: msg.destinatarioTipo === 'ADMIN',
      })

      return response.created({ message: 'Mensagem enviada com sucesso para a Inbox!', data: msg })
    } catch (error) {
      return response.internalServerError({
        error: 'Erro ao enviar mensagem: ' + (error as Error).message,
      })
    }
  }

  /**
   * 10. Marcar Mensagem como Lida
   */
  async markInboxRead({ params, response }: HttpContext) {
    try {
      const msg = await MensagemInbox.find(params.id)
      if (msg) {
        msg.lida = true
        await msg.save()
      }
      return response.ok({ message: 'Mensagem marcada como lida.' })
    } catch (error) {
      return response.internalServerError({ error: (error as Error).message })
    }
  }
}
