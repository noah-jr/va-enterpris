import type { ITransparenciaDocumentoRepository } from '../../Domain/Repositories/ITransparenciaDocumentoRepository.js'
import { DocumentoDomain } from '../../Domain/Entities/DocumentoDomain.js'
import TransparenciaDocumentoModel from '#models/transparencia_documento'

export class TransparenciaDocumentoRepositoryImpl implements ITransparenciaDocumentoRepository {
  public async findAll(): Promise<DocumentoDomain[]> {
    const models = await TransparenciaDocumentoModel.query().orderBy('ordem', 'asc')
    return models.map(this.toDomain)
  }

  public async findActivos(): Promise<DocumentoDomain[]> {
    const models = await TransparenciaDocumentoModel.query()
      .where('ativo', true)
      .orderBy('ordem', 'asc')
    return models.map(this.toDomain)
  }

  public async findById(id: number): Promise<DocumentoDomain | null> {
    const model = await TransparenciaDocumentoModel.find(id)
    return model ? this.toDomain(model) : null
  }

  public async save(doc: DocumentoDomain): Promise<DocumentoDomain> {
    let model: TransparenciaDocumentoModel | null = null

    if (doc.id) {
      model = await TransparenciaDocumentoModel.find(doc.id)
    }

    if (model) {
      model.merge({
        title: doc.title,
        date: doc.date,
        size: doc.size,
        categoria: doc.categoria,
        fileUrl: doc.fileUrl,
        ordem: doc.ordem,
        ativo: doc.ativo,
      })
      await model.save()
    } else {
      model = await TransparenciaDocumentoModel.create({
        title: doc.title,
        date: doc.date,
        size: doc.size,
        categoria: doc.categoria,
        fileUrl: doc.fileUrl,
        ordem: doc.ordem,
        ativo: doc.ativo,
      })
    }

    return this.toDomain(model)
  }

  public async saveMany(documentos: DocumentoDomain[]): Promise<DocumentoDomain[]> {
    const result: DocumentoDomain[] = []
    for (const d of documentos) {
      const saved = await this.save(d)
      result.push(saved)
    }
    return result
  }

  public async delete(id: number): Promise<void> {
    const model = await TransparenciaDocumentoModel.findOrFail(id)
    await model.delete()
  }

  private toDomain(model: TransparenciaDocumentoModel): DocumentoDomain {
    return new DocumentoDomain(
      model.id,
      model.title,
      model.date,
      model.size,
      model.categoria,
      model.fileUrl,
      model.ordem,
      model.ativo
    )
  }
}
