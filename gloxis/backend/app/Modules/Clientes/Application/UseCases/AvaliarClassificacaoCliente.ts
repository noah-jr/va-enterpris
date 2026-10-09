import ClienteModel from '#models/Cliente'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'

export class AvaliarClassificacaoCliente {
  public async execute(): Promise<void> {
    const clientes = await ClienteModel.all()
    const hoje = DateTime.now()

    for (const cliente of clientes) {
      // Find all atrasados for this client through SolicitacaoCredito
      const pagamentos = await db
        .from('pagamentos')
        .join('solicitacao_creditos', 'pagamentos.solicitacao_id', 'solicitacao_creditos.id')
        .where('solicitacao_creditos.cliente_id', cliente.id)
        .whereIn('pagamentos.status', ['ATRASADO', 'PENDENTE'])
        .select('pagamentos.data_vencimento')

      let maxDiasAtraso = 0
      for (const pag of pagamentos) {
        const dataVenc = DateTime.fromJSDate(new Date(pag.data_vencimento))
        const diff = hoje.diff(dataVenc, 'days').days
        if (diff > maxDiasAtraso) {
          maxDiasAtraso = diff
        }
      }

      // Regra de Lista Negra: > 90 dias de atraso
      if (maxDiasAtraso > 90) {
        cliente.isListaNegra = true
        cliente.classificacao = 'NOVO'
      } else {
        cliente.isListaNegra = false
        // Lógica simples de classificação (Fidelização)
        if (maxDiasAtraso > 30) {
          cliente.classificacao = 'BRONZE'
        } else if (maxDiasAtraso > 0) {
          cliente.classificacao = 'PRATA'
        } else {
          // Precisaria verificar volume financeiro para ser OURO, mas para simplicidade:
          // Se não tem atraso, e tem pagamentos, é OURO.
          // Mas vamos deixar PRATA por default se não tiver atrasos mas pouca história
          cliente.classificacao = 'OURO'
        }
      }

      await cliente.save()
    }
  }
}
