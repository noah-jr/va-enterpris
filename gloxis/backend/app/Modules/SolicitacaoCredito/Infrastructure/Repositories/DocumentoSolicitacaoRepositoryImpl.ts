import { DocumentoSolicitacao } from '../../Domain/Entities/DocumentoSolicitacao.js'
import { type IDocumentoSolicitacaoRepository } from '../../Domain/Repositories/IDocumentoSolicitacaoRepository.js'
import SolicitacaoDocumentoModel from '#models/SolicitacaoDocumento'

export class DocumentoSolicitacaoRepositoryImpl implements IDocumentoSolicitacaoRepository {
  async create(documento: DocumentoSolicitacao): Promise<DocumentoSolicitacao> {
    const model = await SolicitacaoDocumentoModel.create({
      solicitacaoId: documento.solicitacaoId,
      tipoDocumento: documento.tipoDocumento,
      filePath: documento.filePath,
      fileName: documento.fileName,
      contentType: documento.contentType,
      size: documento.size,
    })

    return new DocumentoSolicitacao(
      model.id,
      model.solicitacaoId,
      model.tipoDocumento,
      model.filePath,
      model.fileName,
      model.contentType,
      model.size,
      model.createdAt.toJSDate()
    )
  }

  async findBySolicitacaoId(solicitacaoId: number): Promise<DocumentoSolicitacao[]> {
    const models = await SolicitacaoDocumentoModel.query().where('solicitacao_id', solicitacaoId)

    return models.map(
      (model) =>
        new DocumentoSolicitacao(
          model.id,
          model.solicitacaoId,
          model.tipoDocumento,
          model.filePath,
          model.fileName,
          model.contentType,
          model.size,
          model.createdAt.toJSDate()
        )
    )
  }
}
