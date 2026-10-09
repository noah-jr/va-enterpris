export class MetricaDomain {
  constructor(
    public readonly id: number | undefined,
    public readonly chave: string,
    public label: string,
    public val: string,
    public ordem: number = 0
  ) {
    this.validate()
  }

  public validate(): void {
    if (!this.chave || this.chave.trim() === '') {
      throw new Error('Chave da métrica não pode ser vazia.')
    }
    if (!this.label || this.label.trim() === '') {
      throw new Error('Label da métrica não pode ser vazia.')
    }
    if (this.val === undefined || this.val === null) {
      throw new Error('Valor da métrica não pode ser nulo.')
    }
  }

  public updateValue(newVal: string, newLabel?: string, newOrdem?: number): void {
    this.val = newVal
    if (newLabel) this.label = newLabel
    if (newOrdem !== undefined) this.ordem = newOrdem
    this.validate()
  }
}
