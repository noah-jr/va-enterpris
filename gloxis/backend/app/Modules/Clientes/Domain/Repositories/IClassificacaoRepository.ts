export interface IClassificacaoRepository {
  findByClienteId(clienteId: number): Promise<any>
  findAll(nivel?: string, page?: number, perPage?: number): Promise<any>
}
