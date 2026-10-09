export class DocumentoDomain {
  constructor(
    public readonly id: number | undefined,
    public title: string,
    public date: string,
    public size: string | null,
    public categoria: string,
    public fileUrl: string,
    public ordem: number = 0,
    public ativo: boolean = true
  ) {
    this.validate()
  }

  public validate(): void {
    if (!this.title || this.title.trim() === '') {
      throw new Error('Título do documento não pode ser vazio.')
    }
    if (!this.fileUrl || this.fileUrl.trim() === '') {
      throw new Error('URL do ficheiro não pode ser vazia.')
    }
  }

  public update(payload: {
    title?: string
    date?: string
    size?: string | null
    categoria?: string
    fileUrl?: string
    ordem?: number
    ativo?: boolean
  }): void {
    if (payload.title !== undefined) this.title = payload.title
    if (payload.date !== undefined) this.date = payload.date
    if (payload.size !== undefined) this.size = payload.size
    if (payload.categoria !== undefined) this.categoria = payload.categoria
    if (payload.fileUrl !== undefined) this.fileUrl = payload.fileUrl
    if (payload.ordem !== undefined) this.ordem = payload.ordem
    if (payload.ativo !== undefined) this.ativo = payload.ativo
    this.validate()
  }

  public toggleAtivo(): void {
    this.ativo = !this.ativo
  }
}
