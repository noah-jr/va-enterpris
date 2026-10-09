import { type IClienteRepository } from '../../Domain/Repositories/IClienteRepository.js'
import type {
  CreateClienteDTO,
  UpdateClienteDTO,
  ClienteFilterDTO,
  ClienteKPIDTO,
} from '../../Application/DTOs/ClienteDTOs.js'
import ClienteModel from '#models/Cliente'
import db from '@adonisjs/lucid/services/db'
import User from '#models/user'

export class ClienteRepositoryImpl implements IClienteRepository {
  async create(clienteData: CreateClienteDTO): Promise<ClienteModel> {
    const trx = await db.transaction()

    try {
      // 1. Create the User (Pending / Must Change Password)
      const user = new User()
      user.fullName = clienteData.nome
      user.email = clienteData.email || ''
      user.password = clienteData.generatedPassword || 'DefaultPassword123!'
      user.role = 'CLIENTE'
      user.mustChangePassword = true
      user.useTransaction(trx)
      await user.save()

      // 2. Create the Cliente linked to the User
      const payload: Record<string, unknown> = { ...clienteData }
      delete payload.generatedPassword // Remove from payload before passing to Model
      const cliente = new ClienteModel()
      cliente.fill(payload as any)
      cliente.userId = user.id
      cliente.useTransaction(trx)
      await cliente.save()

      await trx.commit()
      return cliente
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }

  async findById(id: number): Promise<ClienteModel | null> {
    return await ClienteModel.find(id)
  }

  async findByNif(nif: string): Promise<ClienteModel | null> {
    return await ClienteModel.findBy('nif', nif)
  }

  async update(id: number, payload: UpdateClienteDTO): Promise<ClienteModel | null> {
    const model = await ClienteModel.findOrFail(id)
    model.merge(payload as any)
    await model.save()
    return model
  }

  async delete(id: number): Promise<void> {
    const model = await ClienteModel.findOrFail(id)
    await model.delete()
  }

  async findAllWithRisk(
    params: ClienteFilterDTO
  ): Promise<{ data: Record<string, unknown>[]; meta?: Record<string, unknown> }> {
    const { page = 1, perPage = 10, search, risco } = params

    let query = db
      .from('clientes')
      .leftJoin('classificacao_clientes', 'clientes.id', 'classificacao_clientes.cliente_id')
      .select(
        'clientes.*',
        'classificacao_clientes.pontos_fidelidade',
        'classificacao_clientes.dias_medios_atraso'
      )
      .orderBy('clientes.created_at', 'desc')

    if (search) {
      query.where((q) => {
        q.where('clientes.nome', 'LIKE', `%${search}%`)
          .orWhere('clientes.nif', 'LIKE', `%${search}%`)
          .orWhere('clientes.email', 'LIKE', `%${search}%`)
          .orWhere('clientes.telefone', 'LIKE', `%${search}%`)
      })
    }

    const paginated = await query.paginate(page, perPage)
    const json = paginated.toJSON()

    let items: Record<string, unknown>[] = json.data.map((r: Record<string, unknown>) => {
      const diasAtraso = Number(r.dias_medios_atraso || 0)
      const computedRisco = diasAtraso > 30 ? 'ALTO' : diasAtraso > 10 ? 'MEDIO' : 'BAIXO'

      const isOnline = Math.random() > 0.5

      return {
        ...r,
        scoreCredito: r.pontos_fidelidade || 0,
        risco: computedRisco,
        isOnline,
      }
    })

    if (risco) {
      items = items.filter((c) => c.risco === risco)
    }

    return {
      data: items,
      meta: json.meta,
    }
  }

  async exportData(params: ClienteFilterDTO): Promise<Record<string, unknown>[]> {
    const result = await this.findAllWithRisk({ ...params, page: 1, perPage: 10000 })
    return result.data
  }

  async getKpis(): Promise<ClienteKPIDTO> {
    const totalClientesResult = await db.from('clientes').count('* as total').first()
    const totalClientes = Number(totalClientesResult?.total || 0)

    const riscoAltoRes = await db
      .from('classificacao_clientes')
      .where('dias_medios_atraso', '>', 30)
      .count('* as total')
      .first()
    const riscoAlto = Number(riscoAltoRes?.total || 0)

    return {
      totalClientes,
      clientesAtivos: totalClientes,
      clientesNaListaNegra: riscoAlto,
      totalInadimplentes: riscoAlto,
    }
  }

  async findByIdWithDetails(id: number): Promise<Record<string, unknown> | null> {
    const cliente = await ClienteModel.find(id)
    if (!cliente) return null

    const classificacao = await db
      .from('classificacao_clientes')
      .where('cliente_id', cliente.id)
      .first()
    const creditos = await db
      .from('solicitacao_creditos')
      .where('cliente_id', cliente.id)
      .orderBy('created_at', 'desc')
    const faturas = await db
      .from('faturas')
      .where('cliente_id', cliente.id)
      .orderBy('created_at', 'desc')
      .catch(() => [])
    const mensagens = await db
      .from('mensagens_inbox')
      .where('destinatario_nome', cliente.nome)
      .orWhere('remetente_nome', cliente.nome)
      .orderBy('created_at', 'desc')
      .catch(() => [])

    return {
      ...cliente.toJSON(),
      scoreCredito: classificacao?.pontos_fidelidade || 0,
      risco:
        (classificacao?.dias_medios_atraso || 0) > 30
          ? 'ALTO'
          : (classificacao?.dias_medios_atraso || 0) > 10
            ? 'MEDIO'
            : 'BAIXO',
      creditos,
      faturas,
      mensagens,
    }
  }

  async findByUserId(userId: number): Promise<ClienteModel | null> {
    return await ClienteModel.query().where('user_id', userId).first()
  }

  async findDashboardMetrics(userId: number): Promise<Record<string, unknown> | null> {
    const cliente = await this.findByUserId(userId)
    if (!cliente) return null

    const saldoDevedor = await db
      .from('pagamentos')
      .join('solicitacao_creditos', 'pagamentos.solicitacao_id', 'solicitacao_creditos.id')
      .where('solicitacao_creditos.cliente_id', cliente.id)
      .whereIn('pagamentos.status', ['PENDENTE', 'ATRASADO'])
      .sum('pagamentos.valor_parcela as total')
      .first()

    const proximaParcela = await db
      .from('pagamentos')
      .join('solicitacao_creditos', 'pagamentos.solicitacao_id', 'solicitacao_creditos.id')
      .where('solicitacao_creditos.cliente_id', cliente.id)
      .where('pagamentos.status', 'PENDENTE')
      .orderBy('pagamentos.data_vencimento', 'asc')
      .select(
        'pagamentos.valor_parcela as valor',
        'pagamentos.data_vencimento as vencimento',
        'pagamentos.numero_parcela as numeroParcela'
      )
      .first()

    const ultimosPagamentos = await db
      .from('pagamentos')
      .join('solicitacao_creditos', 'pagamentos.solicitacao_id', 'solicitacao_creditos.id')
      .where('solicitacao_creditos.cliente_id', cliente.id)
      .where('pagamentos.status', 'PROCESSADO')
      .orderBy('pagamentos.data_pagamento', 'desc')
      .limit(3)
      .select(
        'pagamentos.numero_parcela as numeroParcela',
        'pagamentos.valor_pago as valorPago',
        'pagamentos.data_pagamento as dataPagamento',
        'solicitacao_creditos.parcelas as totalParcelas'
      )

    const classificacao = await db
      .from('classificacao_clientes')
      .where('cliente_id', cliente.id)
      .select('nivel', 'pontos_fidelidade', 'dias_medios_atraso')
      .first()

    return {
      saldoDevedor: Number(saldoDevedor?.total || 0),
      classificacao: classificacao
        ? {
            nivel: classificacao.nivel,
            pontosFidelidade: classificacao.pontos_fidelidade,
            diasMediosAtraso: classificacao.dias_medios_atraso,
          }
        : null,
      proximaParcela: proximaParcela
        ? {
            valor: Number(proximaParcela.valor),
            vencimento: proximaParcela.vencimento,
            numeroParcela: proximaParcela.numeroParcela,
          }
        : null,
      ultimosPagamentos: ultimosPagamentos.map((p) => ({
        ...p,
        valorPago: Number(p.valorPago),
      })),
    }
  }
}
