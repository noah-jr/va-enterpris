export class Desembolso {
  constructor(
    public readonly id: number,
    public solicitacaoId: number,
    public valorDesembolsado: number,
    public metodo: 'TRANSFERENCIA' | 'DINHEIRO' | 'CHEQUE',
    public comprovantePath: string | null,
    public status: 'PENDENTE' | 'REALIZADO' | 'FALHADO',
    public dataDesembolso: Date | null,
    public createdAt: Date,
    public updatedAt: Date
  ) {}
}
