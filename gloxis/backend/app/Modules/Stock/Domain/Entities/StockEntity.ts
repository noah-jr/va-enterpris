export class StockEntity {
  constructor(
    public id: number,
    public data: any
  ) {}

  toJSON() {
    return { id: this.id, ...this.data }
  }
}
