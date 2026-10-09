import type { HttpContext } from '@adonisjs/core/http'
import { ObterTransparenciaPublicaUseCase } from '../../Application/UseCases/ObterTransparenciaPublicaUseCase.js'
import { AtualizarMetricasUseCase } from '../../Application/UseCases/AtualizarMetricasUseCase.js'
import { GerenciarDocumentosUseCase } from '../../Application/UseCases/GerenciarDocumentosUseCase.js'
import { TransparenciaMetricaRepositoryImpl } from '../../Infrastructure/Repositories/TransparenciaMetricaRepositoryImpl.js'
import { TransparenciaDocumentoRepositoryImpl } from '../../Infrastructure/Repositories/TransparenciaDocumentoRepositoryImpl.js'
import app from '@adonisjs/core/services/app'

export default class TransparenciaController {
  private metricaRepo = new TransparenciaMetricaRepositoryImpl()
  private docRepo = new TransparenciaDocumentoRepositoryImpl()

  /**
   * Endpoint público para a landing page (/transparencia)
   */
  public async publicData({ response }: HttpContext) {
    const useCase = new ObterTransparenciaPublicaUseCase(this.metricaRepo, this.docRepo)
    const result = await useCase.execute()
    return response.ok({ data: result })
  }

  /**
   * Index para a área administrativa
   */
  public async index({ response }: HttpContext) {
    const metricas = await this.metricaRepo.findAll()
    const documentos = await this.docRepo.findAll()
    return response.ok({ data: { metricas, documentos } })
  }

  /**
   * Atualizar métricas financeiras públicas (Admin)
   */
  public async updateMetricas({ request, response }: HttpContext) {
    const payload = request.input('metricas', [])
    const useCase = new AtualizarMetricasUseCase(this.metricaRepo)
    const updated = await useCase.execute(payload)
    return response.ok({
      data: updated,
      message: 'Métricas de transparência atualizadas com sucesso.',
    })
  }

  /**
   * Criar novo documento regulamentar/normativo (Admin)
   */
  public async storeDocumento({ request, response }: HttpContext) {
    const file = request.file('file', {
      size: '15mb',
      extnames: ['pdf', 'doc', 'docx'],
    })

    let fileUrl = request.input('fileUrl', '')

    if (file) {
      const fileName = `${Date.now()}_${file.clientName}`
      await file.move(app.makePath('public/uploads'), {
        name: fileName,
        overwrite: true,
      })
      fileUrl = `/uploads/${fileName}`
    }

    const useCase = new GerenciarDocumentosUseCase(this.docRepo)
    const doc = await useCase.criar({
      title: request.input('title'),
      date: request.input('date'),
      size: request.input('size', file ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : '1.0 MB'),
      categoria: request.input('categoria', 'Normativo'),
      fileUrl: fileUrl || '/uploads/documento_oficial.pdf',
      ordem: Number(request.input('ordem', 0)),
      ativo: request.input('ativo', true) === true || request.input('ativo') === 'true',
    })

    return response.created({ data: doc, message: 'Documento publicado com sucesso.' })
  }

  /**
   * Editar documento existente (Admin)
   */
  public async updateDocumento({ params, request, response }: HttpContext) {
    const file = request.file('file', {
      size: '15mb',
      extnames: ['pdf', 'doc', 'docx'],
    })

    let fileUrl = request.input('fileUrl')

    if (file) {
      const fileName = `${Date.now()}_${file.clientName}`
      await file.move(app.makePath('public/uploads'), {
        name: fileName,
        overwrite: true,
      })
      fileUrl = `/uploads/${fileName}`
    }

    const useCase = new GerenciarDocumentosUseCase(this.docRepo)
    const doc = await useCase.atualizar({
      id: Number(params.id),
      title: request.input('title'),
      date: request.input('date'),
      size: request.input('size'),
      categoria: request.input('categoria'),
      fileUrl,
      ordem: request.input('ordem') !== undefined ? Number(request.input('ordem')) : undefined,
      ativo:
        request.input('ativo') !== undefined
          ? request.input('ativo') === true || request.input('ativo') === 'true'
          : undefined,
    })

    return response.ok({ data: doc, message: 'Documento atualizado com sucesso.' })
  }

  /**
   * Eliminar documento (Admin)
   */
  public async destroyDocumento({ params, response }: HttpContext) {
    const useCase = new GerenciarDocumentosUseCase(this.docRepo)
    await useCase.remover(Number(params.id))
    return response.ok({ message: 'Documento removido da transparência pública.' })
  }
}
