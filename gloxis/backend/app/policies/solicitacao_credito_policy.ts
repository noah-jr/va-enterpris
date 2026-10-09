import type User from '#models/user'
import type SolicitacaoCredito from '#models/SolicitacaoCredito'
import { BasePolicy } from '@adonisjs/bouncer'
import { type AuthorizerResponse } from '@adonisjs/bouncer/types'

export default class SolicitacaoCreditoPolicy extends BasePolicy {
  // Permite criação de solicitações para utilizadores autenticados (Clientes, Admins, Gestores, Analistas)
  public async create(user: User): Promise<AuthorizerResponse> {
    if (!user) return false
    const role = (user.role || '').toUpperCase()
    return (
      role === 'CLIENTE' ||
      role === 'ADMIN' ||
      role === 'GESTOR' ||
      role === 'ANALISTA' ||
      role === 'DIRETOR'
    )
  }

  // Clientes só podem ver suas próprias solicitações, Analistas e Admins veem todas
  public async view(user: User, solicitacao: SolicitacaoCredito): Promise<AuthorizerResponse> {
    if (!user) return false
    const role = (user.role || '').toUpperCase()
    if (role === 'ADMIN' || role === 'ANALISTA' || role === 'GESTOR' || role === 'DIRETOR')
      return true

    const Cliente = (await import('#models/Cliente')).default
    const cliente = await Cliente.findBy('user_id', user.id)

    return cliente ? Number(cliente.id) === Number(solicitacao.clienteId) : false
  }

  // Apenas Analistas, Admins, Gestores e Diretores podem atualizar status (Aprovar/Rejeitar)
  public async updateStatus(user: User): Promise<AuthorizerResponse> {
    if (!user) return false
    const role = (user.role || '').toUpperCase()
    return role === 'ADMIN' || role === 'ANALISTA' || role === 'GESTOR' || role === 'DIRETOR'
  }

  // Upload de documentos
  public async uploadDocumento(
    user: User,
    solicitacao: SolicitacaoCredito
  ): Promise<AuthorizerResponse> {
    if (!user) return false
    const role = (user.role || '').toUpperCase()
    if (role === 'ADMIN' || role === 'ANALISTA' || role === 'GESTOR' || role === 'DIRETOR')
      return true

    const Cliente = (await import('#models/Cliente')).default
    const cliente = await Cliente.findBy('user_id', user.id)

    return cliente ? Number(cliente.id) === Number(solicitacao.clienteId) : false
  }
}
