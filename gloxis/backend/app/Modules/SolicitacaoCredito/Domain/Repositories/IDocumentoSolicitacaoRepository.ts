import { type DocumentoSolicitacao } from '../Entities/DocumentoSolicitacao.js'

export interface IDocumentoSolicitacaoRepository {
  create(documento: DocumentoSolicitacao): Promise<DocumentoSolicitacao>
  findBySolicitacaoId(solicitacaoId: number): Promise<DocumentoSolicitacao[]>
}
