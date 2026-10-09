import { test } from '@japa/runner'
import { MetricaDomain } from '../../app/Modules/Transparencia/Domain/Entities/MetricaDomain.js'
import { DocumentoDomain } from '../../app/Modules/Transparencia/Domain/Entities/DocumentoDomain.js'
import { type ITransparenciaMetricaRepository } from '../../app/Modules/Transparencia/Domain/Repositories/ITransparenciaMetricaRepository.js'
import { type ITransparenciaDocumentoRepository } from '../../app/Modules/Transparencia/Domain/Repositories/ITransparenciaDocumentoRepository.js'
import { ObterTransparenciaPublicaUseCase } from '../../app/Modules/Transparencia/Application/UseCases/ObterTransparenciaPublicaUseCase.js'
import { AtualizarMetricasUseCase } from '../../app/Modules/Transparencia/Application/UseCases/AtualizarMetricasUseCase.js'
import { GerenciarDocumentosUseCase } from '../../app/Modules/Transparencia/Application/UseCases/GerenciarDocumentosUseCase.js'

// InMemory Repositories for Isolated TDD Unit Testing
class InMemoryMetricaRepository implements ITransparenciaMetricaRepository {
  private metricas: MetricaDomain[] = []

  async findAll(): Promise<MetricaDomain[]> {
    return [...this.metricas]
  }

  async findByChave(chave: string): Promise<MetricaDomain | null> {
    return this.metricas.find((m) => m.chave === chave) || null
  }

  async save(metrica: MetricaDomain): Promise<MetricaDomain> {
    const idx = this.metricas.findIndex((m) => m.chave === metrica.chave)
    const saved = new MetricaDomain(
      metrica.id || Math.floor(Math.random() * 1000) + 1,
      metrica.chave,
      metrica.label,
      metrica.val,
      metrica.ordem
    )
    if (idx >= 0) {
      this.metricas[idx] = saved
    } else {
      this.metricas.push(saved)
    }
    return saved
  }

  async saveMany(items: MetricaDomain[]): Promise<MetricaDomain[]> {
    const res: MetricaDomain[] = []
    for (const item of items) {
      res.push(await this.save(item))
    }
    return res
  }
}

class InMemoryDocumentoRepository implements ITransparenciaDocumentoRepository {
  private docs: DocumentoDomain[] = []

  async findAll(): Promise<DocumentoDomain[]> {
    return [...this.docs]
  }

  async findActivos(): Promise<DocumentoDomain[]> {
    return this.docs.filter((d) => d.ativo)
  }

  async findById(id: number): Promise<DocumentoDomain | null> {
    return this.docs.find((d) => d.id === id) || null
  }

  async save(doc: DocumentoDomain): Promise<DocumentoDomain> {
    const id = doc.id || Math.floor(Math.random() * 1000) + 1
    const saved = new DocumentoDomain(
      id,
      doc.title,
      doc.date,
      doc.size,
      doc.categoria,
      doc.fileUrl,
      doc.ordem,
      doc.ativo
    )
    const idx = this.docs.findIndex((d) => d.id === id)
    if (idx >= 0) {
      this.docs[idx] = saved
    } else {
      this.docs.push(saved)
    }
    return saved
  }

  async saveMany(items: DocumentoDomain[]): Promise<DocumentoDomain[]> {
    const res: DocumentoDomain[] = []
    for (const item of items) {
      res.push(await this.save(item))
    }
    return res
  }

  async delete(id: number): Promise<void> {
    this.docs = this.docs.filter((d) => d.id !== id)
  }
}

test.group('Transparência Domain & Use Cases Unit Tests (TDD)', () => {
  test('Deve validar regras de negócio das entidades de domínio MetricaDomain e DocumentoDomain', ({
    assert,
  }) => {
    assert.throws(() => {
      new MetricaDomain(1, '', 'Label', '10.0')
    }, 'Chave da métrica não pode ser vazia.')

    assert.throws(() => {
      new DocumentoDomain(1, '', 'Janeiro 2026', '1 MB', 'Normativo', '/file.pdf')
    }, 'Título do documento não pode ser vazio.')

    const metrica = new MetricaDomain(1, 'vol', 'Volume', '10 B')
    metrica.updateValue('15 B', 'Volume Atualizado')
    assert.equal(metrica.val, '15 B')
    assert.equal(metrica.label, 'Volume Atualizado')
  })

  test('ObterTransparenciaPublicaUseCase deve retornar seeds de fallback se a base estiver vazia', async ({
    assert,
  }) => {
    const metricaRepo = new InMemoryMetricaRepository()
    const docRepo = new InMemoryDocumentoRepository()
    const useCase = new ObterTransparenciaPublicaUseCase(metricaRepo, docRepo)

    const result = await useCase.execute()

    assert.equal(result.metricas.length, 4)
    assert.equal(result.documentos.length, 5)
    assert.equal(result.metricas[0].chave, 'volume')
  })

  test('AtualizarMetricasUseCase deve atualizar valores de métricas existentes', async ({
    assert,
  }) => {
    const metricaRepo = new InMemoryMetricaRepository()
    await metricaRepo.save(new MetricaDomain(1, 'volume', 'Volume', '10 B', 1))

    const useCase = new AtualizarMetricasUseCase(metricaRepo)
    const updated = await useCase.execute([
      { chave: 'volume', label: 'Volume Concedido', val: '20 B Kz', ordem: 1 },
      { chave: 'novametrica', label: 'Nova Métrica', val: '100%', ordem: 2 },
    ])

    assert.equal(updated.length, 2)
    const vol = await metricaRepo.findByChave('volume')
    assert.equal(vol?.val, '20 B Kz')
    assert.equal(vol?.label, 'Volume Concedido')
  })

  test('GerenciarDocumentosUseCase deve criar, atualizar e remover documentos regulamentares', async ({
    assert,
  }) => {
    const docRepo = new InMemoryDocumentoRepository()
    const useCase = new GerenciarDocumentosUseCase(docRepo)

    // Criar
    const doc = await useCase.criar({
      title: 'Aviso BNA N.º 01/2026',
      fileUrl: '/uploads/aviso_01_2026.pdf',
      categoria: 'Regulamento',
      date: 'Fevereiro 2026',
      size: '2.5 MB',
    })

    assert.isDefined(doc.id)
    assert.equal(doc.title, 'Aviso BNA N.º 01/2026')

    // Atualizar
    const updated = await useCase.atualizar({
      id: doc.id!,
      title: 'Aviso BNA N.º 01/2026 (Revisado)',
      ativo: false,
    })

    assert.equal(updated.title, 'Aviso BNA N.º 01/2026 (Revisado)')
    assert.equal(updated.ativo, false)

    // Listar ativos (deve vir vazio pois foi desativado)
    const ativos = await docRepo.findActivos()
    assert.equal(ativos.length, 0)

    // Remover
    await useCase.remover(doc.id!)
    const todos = await useCase.listarTodos()
    assert.equal(todos.length, 0)
  })
})
