import { DocumentoSolicitacao } from '../../Domain/Entities/DocumentoSolicitacao.js'
import { type IDocumentoSolicitacaoRepository } from '../../Domain/Repositories/IDocumentoSolicitacaoRepository.js'
import { DocumentoSolicitacaoRepositoryImpl } from '../../Infrastructure/Repositories/DocumentoSolicitacaoRepositoryImpl.js'
import { type ISolicitacaoCreditoRepository } from '../../Domain/Repositories/ISolicitacaoCreditoRepository.js'
import { SolicitacaoCreditoRepositoryImpl } from '../../Infrastructure/Repositories/SolicitacaoCreditoRepositoryImpl.js'

interface UploadDocumentoRequest {
  solicitacaoId: number
  tipoDocumento: string
  filePath: string
  fileName: string
  contentType: string
  size: number
}

export class UploadDocumentoSolicitacao {
  private documentoRepository: IDocumentoSolicitacaoRepository
  private solicitacaoRepository: ISolicitacaoCreditoRepository

  constructor(
    documentoRepository?: IDocumentoSolicitacaoRepository,
    solicitacaoRepository?: ISolicitacaoCreditoRepository
  ) {
    this.documentoRepository = documentoRepository ?? new DocumentoSolicitacaoRepositoryImpl()
    this.solicitacaoRepository = solicitacaoRepository ?? new SolicitacaoCreditoRepositoryImpl()
  }

  async execute(data: UploadDocumentoRequest): Promise<DocumentoSolicitacao> {
    // 1. Verify if solicitacao exists
    const solicitacao = await this.solicitacaoRepository.findById(data.solicitacaoId)
    if (!solicitacao) {
      throw new Error(`Solicitação de crédito ${data.solicitacaoId} não encontrada.`)
    }

    // 2. Upload file via StorageFactory
    const { StorageFactory } = await import('../../../Core/Storage/StorageFactory.js')
    const storage = StorageFactory.getStorage()

    // We assume data.filePath is the tmp path on disk.
    const uniqueFileName = `${new Date().getTime()}_${data.fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    const publicUrl = await storage.upload(data.filePath, uniqueFileName, data.contentType)

    // 3. Create the document entity
    const documento = new DocumentoSolicitacao(
      0,
      data.solicitacaoId,
      data.tipoDocumento,
      publicUrl,
      data.fileName,
      data.contentType,
      data.size,
      new Date()
    )

    // 4. Persist the metadata
    return await this.documentoRepository.create(documento)
  }
}
