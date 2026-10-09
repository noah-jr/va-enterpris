import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetDocumentOcrUseCase } from './get-document-ocr.use-case.js';
import type {
  IDocumentRepository,
  IDocumentFileRepository,
} from '../../../domain/repositories/document.repository.interface.js';
import type { IFileStorage } from '../../contracts/file-storage.contract.js';
import type { IOcrService } from '../../contracts/ocr.contract.js';
import { ForbiddenError, NotFoundError } from '../../../domain/errors/index.js';
import { SAMPLE_FILES } from '../../../__tests__/unit/fakes.js';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const DOC_ID = 'doc-ocr-1';
const CLIENT_ID = 'client-1';
const FILE_ID = 'file-1';

function buildDocument(overrides: Record<string, unknown> = {}) {
  return {
    id: DOC_ID,
    clientId: CLIENT_ID,
    title: 'Balancete Q3 2026',
    type: 'Contabilístico / Fiscal',
    description: null,
    priority: 'NORMAL' as const,
    status: 'IN_ANALYSIS' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    client: { id: CLIENT_ID, name: 'Empresa Alfa Lda', email: 'alfa@empresa.com', nip: '5000000001' },
    assignments: [],
    _count: { files: 1, messages: 0 },
    ...overrides,
  };
}

function buildFile(overrides: Record<string, unknown> = {}) {
  return {
    id: FILE_ID,
    documentId: DOC_ID,
    originalName: 'balancete.pdf',
    storageName: 'balancete-safe.pdf',
    mimeType: 'application/pdf',
    size: SAMPLE_FILES.pdf.length,
    checksum: 'sha256:abc123',
    storagePath: `accountable-documents/documents/${DOC_ID}/balancete-safe.pdf`,
    uploadedById: CLIENT_ID,
    uploaderType: 'CLIENT' as const,
    createdAt: new Date(),
    deletedAt: null,
    ...overrides,
  };
}

function buildOcrResult() {
  return {
    documentId: DOC_ID,
    fileId: FILE_ID,
    fileName: 'balancete.pdf',
    fileSize: SAMPLE_FILES.pdf.length,
    mimeType: 'application/pdf',
    extractedText: 'balanço ativo passivo',
    characterCount: 22,
    wordCount: 4,
    pageCount: 1,
    detectedDocumentType: 'Documento Contabilístico / Fiscal',
    detectedEntities: [],
    detectedNifs: ['5000000001'],
    detectedDates: [],
    detectedAmounts: [],
    confidenceScore: 92.5,
    decisionRecommendation: {
      suggestedStatus: 'IN_PROCESSING' as const,
      confidence: 'HIGH' as const,
      summary: 'Leitura OCR concluída com sucesso.',
      suggestedNote: 'Documento em conformidade.',
      complianceFlags: [],
      isNifMatchingClient: true,
      typeMatchScore: 100,
    },
    processedAt: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('GetDocumentOcrUseCase', () => {
  let documentRepository: IDocumentRepository;
  let documentFileRepository: IDocumentFileRepository;
  let fileStorage: IFileStorage;
  let ocrService: IOcrService;
  let useCase: GetDocumentOcrUseCase;

  beforeEach(() => {
    documentRepository = {
      findById: vi.fn(),
      findByIdWithRelations: vi.fn().mockResolvedValue(buildDocument()),
      create: vi.fn(),
      update: vi.fn(),
      softDelete: vi.fn(),
      list: vi.fn(),
    };

    documentFileRepository = {
      findById: vi.fn(),
      findByDocumentId: vi.fn().mockResolvedValue([buildFile()]),
      create: vi.fn(),
      softDelete: vi.fn(),
    };

    fileStorage = {
      upload: vi.fn(),
      getSignedUrl: vi.fn(),
      delete: vi.fn(),
      exists: vi.fn(),
      ensureBucketExists: vi.fn(),
      getObject: vi.fn().mockResolvedValue(SAMPLE_FILES.pdf),
    };

    ocrService = {
      extractText: vi.fn().mockResolvedValue('balanço ativo passivo'),
      analyzeDocument: vi.fn().mockReturnValue(buildOcrResult()),
    };

    useCase = new GetDocumentOcrUseCase(
      documentRepository,
      documentFileRepository,
      fileStorage,
      ocrService,
      'accountable-documents',
    );
  });

  it('retorna o resultado OCR do ficheiro principal do documento', async () => {
    const result = await useCase.execute(DOC_ID, { actorId: CLIENT_ID, actorType: 'client' });

    expect(result.documentId).toBe(DOC_ID);
    expect(result.fileId).toBe(FILE_ID);
    expect(result.extractedText).toBe('balanço ativo passivo');
    expect(result.confidenceScore).toBe(92.5);
  });

  it('chama extractText com o buffer, mimeType e fileName correctos', async () => {
    await useCase.execute(DOC_ID, { actorId: CLIENT_ID, actorType: 'client' });

    expect(ocrService.extractText).toHaveBeenCalledWith(
      SAMPLE_FILES.pdf,
      'application/pdf',
      'balancete.pdf',
    );
  });

  it('chama analyzeDocument com contexto do documento (NIP, título, tipo)', async () => {
    await useCase.execute(DOC_ID, { actorId: CLIENT_ID, actorType: 'client' });

    expect(ocrService.analyzeDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        documentId: DOC_ID,
        documentTitle: 'Balancete Q3 2026',
        declaredType: 'Contabilístico / Fiscal',
        clientNip: '5000000001',
        clientName: 'Empresa Alfa Lda',
        fileId: FILE_ID,
        fileName: 'balancete.pdf',
        mimeType: 'application/pdf',
      }),
      'balanço ativo passivo',
    );
  });

  it('carrega o objeto correcto do storage (bucket + path)', async () => {
    await useCase.execute(DOC_ID, { actorId: CLIENT_ID, actorType: 'client' });

    expect(fileStorage.getObject).toHaveBeenCalledWith(
      'accountable-documents',
      `documents/${DOC_ID}/balancete-safe.pdf`,
    );
  });

  it('utilizadores internos (actorType=user) acedem a qualquer documento', async () => {
    await expect(
      useCase.execute(DOC_ID, { actorId: 'user-admin', actorType: 'user' }),
    ).resolves.toBeDefined();
  });

  it('lança NotFoundError se o documento não existir', async () => {
    vi.mocked(documentRepository.findByIdWithRelations).mockResolvedValueOnce(null);

    await expect(
      useCase.execute('nao-existe', { actorId: CLIENT_ID, actorType: 'client' }),
    ).rejects.toThrow(NotFoundError);
  });

  it('lança ForbiddenError se o cliente tentar aceder a documento de outro cliente', async () => {
    await expect(
      useCase.execute(DOC_ID, { actorId: 'outro-cliente', actorType: 'client' }),
    ).rejects.toThrow(ForbiddenError);
  });

  it('lança NotFoundError se o documento não tiver ficheiros anexados', async () => {
    vi.mocked(documentFileRepository.findByDocumentId).mockResolvedValueOnce([]);

    await expect(
      useCase.execute(DOC_ID, { actorId: CLIENT_ID, actorType: 'client' }),
    ).rejects.toThrow(NotFoundError);
  });

  it('usa fallback gracioso para client.name e client.nip se o documento não tiver cliente populado', async () => {
    vi.mocked(documentRepository.findByIdWithRelations).mockResolvedValueOnce(
      buildDocument({ client: null }) as unknown as Awaited<
        ReturnType<IDocumentRepository['findByIdWithRelations']>
      >,
    );

    await useCase.execute(DOC_ID, { actorId: CLIENT_ID, actorType: 'user' });

    expect(ocrService.analyzeDocument).toHaveBeenCalledWith(
      expect.objectContaining({ clientName: 'Cliente', clientNip: '' }),
      expect.any(String),
    );
  });
});
