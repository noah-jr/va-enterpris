export class Pagamento {
  constructor(
    public readonly id: number,
    public solicitacaoId: number,
    public numeroParcela: number,
    public valorPago: number,
    public valorJurosMora: number,
    public valorMulta: number,
    public metodo: 'TRANSFERENCIA' | 'MULTICAIXA' | 'DINHEIRO',
    public reciboPath: string | null,
    public status: 'PENDENTE' | 'PROCESSADO' | 'REJEITADO' | 'ATRASADO',
    public dataVencimento: Date,
    public dataPagamento: Date | null,
    public createdAt: Date,
    public updatedAt: Date
  ) {}
}
