import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { ProcessarInadimplencia as UseCase } from '../app/Modules/OperacaoFinanceira/Application/UseCases/ProcessarInadimplencia.js'
import { PagamentoRepositoryImpl } from '../app/Modules/OperacaoFinanceira/Infrastructure/Repositories/PagamentoRepositoryImpl.js'

export default class ProcessarInadimplencia extends BaseCommand {
  static commandName = 'processar:inadimplencia'
  static description = 'Calcula e aplica multas e juros de mora para parcelas em atraso'

  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    this.logger.info('Iniciando processamento de inadimplência...')

    try {
      const useCase = new UseCase(new PagamentoRepositoryImpl())
      const { processados } = await useCase.execute()

      this.logger.success(
        `Processamento concluído. ${processados} parcelas atualizadas com multas/juros.`
      )
    } catch (error) {
      this.logger.error(`Erro ao processar inadimplência: ${(error as Error).message}`)
    }
  }
}
