export class RenegociacaoEntity {
  constructor(
    public id: number | null,
    public solicitacaoId: number,
    public clienteId: number,
    public saldoDevedorOriginal: number,
    public jurosMoraPerdoados: number,
    public multasPerdoadas: number,
    public novoSaldoDevedor: number,
    public novasParcelas: number,
    public novaTaxaJuros: number,
    public status: 'PENDENTE_APROVACAO' | 'APROVADO' | 'REJEITADO',
    public aprovadoPor: number | null
  ) {}
}
