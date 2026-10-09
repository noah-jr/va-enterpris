// ============================================================
// IUnitOfWork — fronteira transacional dos use-cases
// ============================================================

export interface IUnitOfWork {
  /**
   * Executa `work` numa única transação de base de dados. Todos os repositórios
   * usados dentro de `work` participam na mesma transação; qualquer erro faz rollback.
   * Chamadas aninhadas reutilizam a transação exterior.
   */
  run<T>(work: () => Promise<T>): Promise<T>;

  /**
   * Regista uma compensação a executar se a transação corrente fizer rollback —
   * p.ex. apagar um objeto já enviado para o storage. Só pode ser chamado dentro de `run`.
   */
  onRollback(compensation: () => Promise<void>): void;
}
