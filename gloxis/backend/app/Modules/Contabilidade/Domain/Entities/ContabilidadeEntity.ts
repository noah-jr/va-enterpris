export class ContabilidadeEntity {
  constructor(
    public id: number,
    public data: Record<string, unknown>
  ) {}

  toJSON() {
    return { id: this.id, ...this.data }
  }
}
