export class ProjetoEntity {
  constructor(
    public id: number,
    public data: any
  ) {}

  toJSON() {
    return { id: this.id, ...this.data }
  }
}
