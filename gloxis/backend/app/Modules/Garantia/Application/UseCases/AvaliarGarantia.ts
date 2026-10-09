import { type GarantiaRepositoryImpl } from '../../Infrastructure/Repositories/GarantiaRepositoryImpl.js'

export class AvaliarGarantia {
  constructor(private repo: GarantiaRepositoryImpl) {}

  public async execute(data: {
    garantiaId: number
    statusAvaliacao: 'AVALIADO' | 'REJEITADO'
    valorAvaliado: number | null
    avaliadoPorUserId: number
  }): Promise<void> {
    const garantia = await this.repo.findById(data.garantiaId)

    if (!garantia) {
      throw new Error('Garantia não encontrada.')
    }

    if (
      data.statusAvaliacao === 'AVALIADO' &&
      (data.valorAvaliado === null || data.valorAvaliado <= 0)
    ) {
      throw new Error(
        'Para aprovar/avaliar uma garantia, o valor avaliado (real) deve ser informado.'
      )
    }

    garantia.statusAvaliacao = data.statusAvaliacao
    garantia.valorAvaliado = data.valorAvaliado
    garantia.avaliadoPor = data.avaliadoPorUserId

    await this.repo.save(garantia)
  }
}
