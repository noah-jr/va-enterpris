export class DocumentoSolicitacao {
  public readonly id: number
  public solicitacaoId: number
  public tipoDocumento: string
  public filePath: string
  public fileName: string
  public contentType: string
  public size: number
  public createdAt: Date

  constructor(
    id: number,
    solicitacaoId: number,
    tipoDocumento: string,
    filePath: string,
    fileName: string,
    contentType: string,
    size: number,
    createdAt: Date
  ) {
    this.id = id
    this.solicitacaoId = solicitacaoId
    this.tipoDocumento = tipoDocumento
    this.filePath = filePath
    this.fileName = fileName
    this.contentType = contentType
    this.size = size
    this.createdAt = createdAt
  }
}
