export class ProdutoCredito {
  constructor(
    public readonly id: number | null,
    public nome: string,
    public descricao: string | null,
    public taxaJurosMensal: number,
    public prazoMinimoMeses: number,
    public prazoMaximoMeses: number,
    public valorMinimo: number,
    public valorMaximo: number,
    public ativo: boolean
  ) {}
}
