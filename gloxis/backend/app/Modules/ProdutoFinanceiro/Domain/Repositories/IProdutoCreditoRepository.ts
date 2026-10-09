import { type ProdutoCredito } from '../Entities/ProdutoCredito.js'

export interface IProdutoCreditoRepository {
  findById(id: number): Promise<ProdutoCredito | null>
  findAllAtivos(): Promise<ProdutoCredito[]>
  create(produto: ProdutoCredito): Promise<ProdutoCredito>
}
