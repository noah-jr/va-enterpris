import { type ISolicitacaoCreditoRepository } from '../../Domain/Repositories/ISolicitacaoCreditoRepository.js'
import { SolicitacaoCredito } from '../../Domain/Entities/SolicitacaoCredito.js'
import {
  CreateSolicitacaoCreditoDTO,
  type CreateSolicitacaoCreditoInput,
} from '../../Domain/DTOs/CreateSolicitacaoCreditoDTO.js'
import { SolicitacaoCreditoRepositoryImpl } from '../../Infrastructure/Repositories/SolicitacaoCreditoRepositoryImpl.js'
import { ConsultarListaNegra } from '../../../ListaNegra/Application/UseCases/ConsultarListaNegra.js'

/**
 * Use case to create a new credit request.
 */
export class CreateSolicitacaoCredito {
  private repository: ISolicitacaoCreditoRepository

  constructor(repository?: ISolicitacaoCreditoRepository) {
    // Allows injection for testing; defaults to concrete implementation.
    this.repository = repository ?? new SolicitacaoCreditoRepositoryImpl()
  }

  async execute(payload: CreateSolicitacaoCreditoInput): Promise<SolicitacaoCredito> {
    // Validate payload using Zod schema (will throw if invalid).
    const validated = CreateSolicitacaoCreditoDTO.parse(payload)

    // --- Block if client is on Lista Negra ---
    const consultarListaNegra = new ConsultarListaNegra()
    const naListaNegra = await consultarListaNegra.isClienteNaLista(validated.clienteId)
    if (naListaNegra) {
      throw new Error(
        'CLIENTE_LISTA_NEGRA: Este cliente está na lista negra e não pode solicitar crédito.'
      )
    }

    // DSR (Debt Service Ratio / Taxa de Esforço) & Audit Log
    const db = (await import('@adonisjs/lucid/services/db')).default
    const cliente = await db.from('clientes').where('id', validated.clienteId).first()
    const { AuditLogService } =
      await import('../../../Core/Infrastructure/Services/AuditLogService.js')

    if (cliente && cliente.rendimento_mensal) {
      const rendimento = Number(cliente.rendimento_mensal)
      const prestacaoEstimada = validated.valor / (validated.parcelas || 12)
      if (rendimento > 0 && prestacaoEstimada / rendimento > 0.35) {
        await AuditLogService.log({
          acao: 'ALERTA_TAXA_ESFORCO_ELEVADA',
          entidade: 'SOLICITACAO_CREDITO',
          entidadeId: validated.clienteId,
          detalhes: {
            prestacaoEstimada,
            rendimentoMensal: rendimento,
            taxaEsforcoPct: `${Math.round((prestacaoEstimada / rendimento) * 100)}%`,
          },
        })
      }
    }

    const solicitacao = new SolicitacaoCredito(
      0,
      validated.clienteId,
      validated.valor,
      validated.parcelas,
      'PENDENTE',
      new Date(),
      new Date()
    )
    const saved = await this.repository.create(solicitacao)

    await AuditLogService.log({
      acao: 'SOLICITACAO_CRIADA',
      entidade: 'SOLICITACAO_CREDITO',
      entidadeId: saved.id,
      detalhes: { valor: saved.valor, parcelas: saved.parcelas },
    })

    // Emit domain event for decoupling
    const { default: emitter } = await import('@adonisjs/core/services/emitter')
    const { SolicitacaoCriadaEvent } = await import('../../Events/SolicitacaoCriadaEvent.js')
    await emitter.emit('solicitacao:criada', new SolicitacaoCriadaEvent(saved))

    return saved
  }
}
