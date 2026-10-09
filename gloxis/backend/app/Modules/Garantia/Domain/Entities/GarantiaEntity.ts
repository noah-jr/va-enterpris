export class GarantiaEntity {
  constructor(
    public id: number | null,
    public solicitacaoId: number,
    public tipo: 'FIADOR' | 'IMOVEL' | 'VEICULO' | 'OUTROS',
    public valorEstimado: number,
    public descricao: string,
    public detalhes: Record<string, unknown>,
    public statusAvaliacao: 'PENDENTE' | 'AVALIADO' | 'REJEITADO',
    public valorAvaliado: number | null,
    public avaliadoPor: number | null
  ) {}
}
