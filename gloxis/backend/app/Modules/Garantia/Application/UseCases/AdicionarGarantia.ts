import { GarantiaEntity } from '../../Domain/Entities/GarantiaEntity.js'
import { type GarantiaRepositoryImpl } from '../../Infrastructure/Repositories/GarantiaRepositoryImpl.js'

export class AdicionarGarantia {
  constructor(private repo: GarantiaRepositoryImpl) {}

  public async execute(data: {
    solicitacaoId: number
    tipo: 'FIADOR' | 'IMOVEL' | 'VEICULO' | 'OUTROS'
    valorEstimado: number
    descricao: string
    detalhes: any
  }): Promise<GarantiaEntity> {
    if (data.valorEstimado <= 0) {
      throw new Error('O valor estimado da garantia deve ser maior que zero.')
    }

    const entity = new GarantiaEntity(
      null,
      data.solicitacaoId,
      data.tipo,
      data.valorEstimado,
      data.descricao,
      data.detalhes,
      'PENDENTE',
      null,
      null
    )

    return await this.repo.save(entity)
  }
}
