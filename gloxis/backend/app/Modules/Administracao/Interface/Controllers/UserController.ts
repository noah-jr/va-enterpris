import { type HttpContext } from '@adonisjs/core/http'
import User from '../../../../models/user.js'
import hash from '@adonisjs/core/services/hash'
import db from '@adonisjs/lucid/services/db'

export default class UserController {
  /**
   * Lista todos os utilizadores internos da plataforma (filtros por perfil, pesquisa por nome/email)
   */
  public async index({ request, response }: HttpContext) {
    try {
      const page = request.input('page', 1)
      const perPage = request.input('perPage', 10)
      const search = request.input('search', '')
      const role = request.input('role', '')

      const query = User.query()

      if (search) {
        query.where((q) => {
          q.where('fullName', 'like', `%${search}%`).orWhere('email', 'like', `%${search}%`)
        })
      }

      if (role) {
        query.where('role', role)
      }

      query.orderBy('createdAt', 'desc')

      const users = await query.paginate(page, perPage)
      return response.ok(users)
    } catch (error) {
      return response.internalServerError({ error: (error as Error).message })
    }
  }

  /**
   * Cria um novo utilizador operador da plataforma
   */
  public async store({ request, response }: HttpContext) {
    try {
      const { fullName, email, password, role } = request.only([
        'fullName',
        'email',
        'password',
        'role',
      ])

      if (!email || !password || !role) {
        return response.badRequest({
          error: 'Email, palavra-passe e perfil (role) são obrigatórios.',
        })
      }

      const existingUser = await User.findBy('email', email)
      if (existingUser) {
        return response.badRequest({
          error: 'Já existe um utilizador registado com este endereço de email.',
        })
      }

      const hashedPassword = await hash.make(password)

      const user = await User.create({
        fullName: fullName || email.split('@')[0],
        email,
        password: hashedPassword,
        role: role.toUpperCase(),
        mustChangePassword: false,
      })

      return response.created({
        message: 'Utilizador de plataforma criado com sucesso.',
        data: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
      })
    } catch (error) {
      return response.internalServerError({ error: (error as Error).message })
    }
  }

  /**
   * Atualiza dados de um utilizador de plataforma
   */
  public async update({ params, request, response }: HttpContext) {
    try {
      const user = await User.find(params.id)
      if (!user) {
        return response.notFound({ error: 'Utilizador não encontrado.' })
      }

      const { fullName, email, role, password } = request.only([
        'fullName',
        'email',
        'role',
        'password',
      ])

      if (fullName) user.fullName = fullName
      if (email) user.email = email
      if (role) user.role = role.toUpperCase()
      if (password && password.trim() !== '') {
        user.password = await hash.make(password)
      }

      await user.save()

      return response.ok({
        message: 'Perfil de utilizador atualizado com sucesso.',
        data: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          updatedAt: user.updatedAt,
        },
      })
    } catch (error) {
      return response.internalServerError({ error: (error as Error).message })
    }
  }

  /**
   * Elimina ou inativa um utilizador da plataforma
   */
  public async destroy({ params, response }: HttpContext) {
    try {
      const user = await User.find(params.id)
      if (!user) {
        return response.notFound({ error: 'Utilizador não encontrado.' })
      }

      await user.delete()
      return response.ok({ message: 'Utilizador removido da plataforma com sucesso.' })
    } catch (error) {
      return response.internalServerError({ error: (error as Error).message })
    }
  }

  /**
   * Redefinir palavra-passe de utilizador
   */
  public async resetPassword({ params, request, response }: HttpContext) {
    try {
      const user = await User.find(params.id)
      if (!user) {
        return response.notFound({ error: 'Utilizador não encontrado.' })
      }

      const { newPassword } = request.only(['newPassword'])
      if (!newPassword || newPassword.length < 6) {
        return response.badRequest({
          error: 'A nova palavra-passe deve ter pelo menos 6 caracteres.',
        })
      }

      user.password = await hash.make(newPassword)
      user.mustChangePassword = true
      await user.save()

      return response.ok({
        message: `Palavra-passe redefinida com sucesso para o utilizador ${user.email}.`,
      })
    } catch (error) {
      return response.internalServerError({ error: (error as Error).message })
    }
  }

  /**
   * Obtém a Matriz de Perfis (Roles) & Permissões do Sistema
   */
  public async getRolesAndPermissions({ response }: HttpContext) {
    const roles = [
      {
        code: 'ADMIN',
        name: 'Administrador Supremo',
        description: 'Acesso irrestrito a todas as configurações, auditorias e módulos do ERP.',
        badgeColor: 'red',
        permissions: ['*'],
      },
      {
        code: 'ANALISTA_CREDITO',
        name: 'Analista de Risco & Crédito',
        description:
          'Avaliação de Scoring, pareceres técnicos de comissões e emissão de pareceres de concessão.',
        badgeColor: 'blue',
        permissions: [
          'solicitacoes:read',
          'solicitacoes:write',
          'solicitacoes:aprovar',
          'clientes:read',
          'garantias:read',
          'garantias:avaliar',
        ],
      },
      {
        code: 'GESTOR_FINANCEIRO',
        name: 'Gestor Financeiro / Tesoureiro',
        description: 'Processamento de desembolsos, reconciliação bancária e reporte de mora.',
        badgeColor: 'emerald',
        permissions: [
          'pagamentos:read',
          'pagamentos:write',
          'desembolsos:executar',
          'renegociacoes:read',
          'renegociacoes:aprovar',
          'financeiro:*',
        ],
      },
      {
        code: 'OPERADOR_TESOURARIA',
        name: 'Operador de Caixa / Tesouraria',
        description: 'Recebimento de parcelas de amortização e emissão de recibos.',
        badgeColor: 'amber',
        permissions: ['pagamentos:read', 'pagamentos:liquidar', 'comprovativos:emitir'],
      },
      {
        code: 'AGENTE_CREDITO',
        name: 'Agente de Originação / Comercial',
        description:
          'Cadastro de mutuários, submissão inicial de pedidos de crédito e recolha de colaterais.',
        badgeColor: 'indigo',
        permissions: [
          'clientes:read',
          'clientes:write',
          'solicitacoes:criar',
          'garantias:registar',
        ],
      },
      {
        code: 'AUDITOR',
        name: 'Auditor & Compliance BNA',
        description:
          'Acesso de leitura para relatórios regulatórios, logs de auditoria e monitorização de restrições.',
        badgeColor: 'purple',
        permissions: ['relatorios:read', 'audit_logs:read', 'lista_negra:read', 'bna:export'],
      },
    ]

    return response.ok({ data: roles })
  }

  /**
   * Obtém Logs de Auditoria & Segurança do Sistema
   */
  public async getAuditLogs({ request, response }: HttpContext) {
    try {
      const page = request.input('page', 1)
      const perPage = request.input('perPage', 20)
      const search = request.input('search')

      let query = db
        .from('audit_logs')
        .leftJoin('users', 'audit_logs.user_id', 'users.id')
        .select(
          'audit_logs.id',
          'audit_logs.action',
          'audit_logs.ip_address',
          'audit_logs.payload',
          'audit_logs.created_at',
          'users.full_name as userName',
          'users.email as userEmail',
          'users.role as userRole'
        )
        .orderBy('audit_logs.id', 'desc')

      if (search) {
        query.where((q) => {
          q.where('audit_logs.action', 'like', `%${search}%`)
            .orWhere('users.full_name', 'like', `%${search}%`)
            .orWhere('users.email', 'like', `%${search}%`)
        })
      }

      const paginated = await query.paginate(page, perPage)
      return response.ok(paginated.toJSON())
    } catch (error) {
      return response.internalServerError({ error: (error as Error).message })
    }
  }
}
