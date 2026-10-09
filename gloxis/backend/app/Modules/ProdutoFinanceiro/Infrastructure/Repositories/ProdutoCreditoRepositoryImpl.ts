import { type IProdutoCreditoRepository } from '../../Domain/Repositories/IProdutoCreditoRepository.js'
import { ProdutoCredito } from '../../Domain/Entities/ProdutoCredito.js'
import ProdutoCreditoModel from '#models/ProdutoCredito'

export class ProdutoCreditoRepositoryImpl implements IProdutoCreditoRepository {
  private mapToDomain(model: ProdutoCreditoModel): ProdutoCredito {
    return new ProdutoCredito(
      model.id,
      model.nome,
      model.descricao,
      Number(model.taxaJurosMensal),
      model.prazoMinimoMeses,
      model.prazoMaximoMeses,
      Number(model.valorMinimo),
      Number(model.valorMaximo),
      model.ativo
    )
  }

  async findById(id: number): Promise<ProdutoCredito | null> {
    const model = await ProdutoCreditoModel.find(id)
    if (!model) return null
    return this.mapToDomain(model)
  }

  async findAllAtivos(): Promise<ProdutoCredito[]> {
    const models = await ProdutoCreditoModel.query().where('ativo', true)
    return models.map((model) => this.mapToDomain(model))
  }

  async create(produto: ProdutoCredito): Promise<ProdutoCredito> {
    const model = new ProdutoCreditoModel()
    model.nome = produto.nome
    model.descricao = produto.descricao
    model.taxaJurosMensal = produto.taxaJurosMensal
    model.prazoMinimoMeses = produto.prazoMinimoMeses
    model.prazoMaximoMeses = produto.prazoMaximoMeses
    model.valorMinimo = produto.valorMinimo
    model.valorMaximo = produto.valorMaximo
    model.ativo = produto.ativo

    await model.save()
    return this.mapToDomain(model)
  }
}
