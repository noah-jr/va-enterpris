import type { ITransparenciaDocumentoRepository } from '../../Domain/Repositories/ITransparenciaDocumentoRepository.js'
import { DocumentoDomain } from '../../Domain/Entities/DocumentoDomain.js'

export interface CriarDocumentoDTO {
  title: string
  date?: string
  size?: string | null
  categoria?: string
  fileUrl: string
  ordem?: number
  ativo?: boolean
}

export interface AtualizarDocumentoDTO {
  id: number
  title?: string
  date?: string
  size?: string | null
  categoria?: string
  fileUrl?: string
  ordem?: number
  ativo?: boolean
}

export class GerenciarDocumentosUseCase {
  constructor(private docRepo: ITransparenciaDocumentoRepository) {}

  public async listarTodos(): Promise<DocumentoDomain[]> {
    return await this.docRepo.findAll()
  }

  public async criar(dto: CriarDocumentoDTO): Promise<DocumentoDomain> {
    const doc = new DocumentoDomain(
      undefined,
      dto.title,
      dto.date || new Date().toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' }),
      dto.size || '1.0 MB',
      dto.categoria || 'Normativo',
      dto.fileUrl,
      dto.ordem ?? 0,
      dto.ativo !== undefined ? dto.ativo : true
    )
    return await this.docRepo.save(doc)
  }

  public async atualizar(dto: AtualizarDocumentoDTO): Promise<DocumentoDomain> {
    const existing = await this.docRepo.findById(dto.id)
    if (!existing) {
      throw new Error(`Documento com ID ${dto.id} não foi encontrado.`)
    }

    existing.update(dto)
    return await this.docRepo.save(existing)
  }

  public async remover(id: number): Promise<void> {
    const existing = await this.docRepo.findById(id)
    if (!existing) {
      throw new Error(`Documento com ID ${id} não foi encontrado.`)
    }
    await this.docRepo.delete(id)
  }
}
