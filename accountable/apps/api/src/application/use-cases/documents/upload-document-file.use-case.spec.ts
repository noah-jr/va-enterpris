import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UploadDocumentFileUseCase } from './upload-document-file.use-case.js';
import type {
  IDocumentRepository,
  IDocumentFileRepository,
} from '../../../domain/repositories/document.repository.interface.js';
import type { IFileStorage } from '../../contracts/file-storage.contract.js';
import type { IAuditRepository } from '../../../domain/repositories/user.repository.interface.js';
import {
  BusinessRuleError,
  ForbiddenError,
  ValidationError,
} from '../../../domain/errors/index.js';
import { FakeUnitOfWork, SAMPLE_FILES } from '../../../__tests__/unit/fakes.js';

describe('UploadDocumentFileUseCase', () => {
  let documentRepository: IDocumentRepository;
  let documentFileRepository: IDocumentFileRepository;
  let fileStorage: IFileStorage;
  let auditRepository: IAuditRepository;
  let useCase: UploadDocumentFileUseCase;
  let unitOfWork: FakeUnitOfWork;

  beforeEach(() => {
    documentRepository = {
      findById: vi.fn().mockResolvedValue({
        id: 'doc-1',
        clientId: 'client-1',
        title: 'Contrato Social',
        description: null,
        type: 'LEGAL',
        priority: 'NORMAL',
        status: 'SUBMITTED',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      }),
      findByIdWithRelations: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      softDelete: vi.fn(),
      list: vi.fn(),
    };

    documentFileRepository = {
      findById: vi.fn(),
      findByDocumentId: vi.fn(),
      create: vi.fn().mockImplementation((data) =>
        Promise.resolve({
          id: 'file-123',
          ...data,
          createdAt: new Date(),
          deletedAt: null,
        }),
      ),
      softDelete: vi.fn(),
    };

    fileStorage = {
      upload: vi.fn().mockResolvedValue({
        storagePath: 'accountable-documents/documents/doc-1/safe-name.pdf',
        etag: 'etag-123',
      }),
      getSignedUrl: vi.fn(),
      delete: vi.fn(),
      exists: vi.fn(),
      ensureBucketExists: vi.fn().mockResolvedValue(undefined),
      getObject: vi.fn().mockResolvedValue(Buffer.from('')),
    };

    auditRepository = {
      log: vi.fn().mockResolvedValue(undefined),
      list: vi.fn(),
    };

    useCase = new UploadDocumentFileUseCase(
      documentRepository,
      documentFileRepository,
      fileStorage,
      auditRepository,
      (unitOfWork = new FakeUnitOfWork()),
      'accountable-documents',
      10 * 1024 * 1024,
    );
  });

  it('should upload a valid PDF document file successfully', async () => {
    const dummyBuffer = Buffer.from('%PDF-1.4 mock pdf content');

    const result = await useCase.execute(
      {
        documentId: 'doc-1',
        originalName: 'contrato.pdf',
        mimeType: 'application/pdf',
        buffer: dummyBuffer,
        size: dummyBuffer.length,
      },
      { actorId: 'client-1', actorType: 'client' },
    );

    expect(result.id).toBe('file-123');
    expect(result.originalName).toBe('contrato.pdf');
    expect(result.mimeType).toBe('application/pdf');
    expect(result.checksum).toBeDefined();

    expect(fileStorage.upload).toHaveBeenCalledWith(
      expect.objectContaining({
        bucketName: 'accountable-documents',
        mimeType: 'application/pdf',
        buffer: dummyBuffer,
      }),
    );

    expect(auditRepository.log).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'FILE_UPLOADED',
        entity: 'DocumentFile',
      }),
    );
  });

  it('should reject file if MIME type is not allowed (e.g. executable)', async () => {
    const dummyBuffer = Buffer.from('malicious binary');

    await expect(
      useCase.execute(
        {
          documentId: 'doc-1',
          originalName: 'malware.exe',
          mimeType: 'application/x-msdownload',
          buffer: dummyBuffer,
          size: dummyBuffer.length,
        },
        { actorId: 'client-1', actorType: 'client' },
      ),
    ).rejects.toThrow(ValidationError);
  });

  it('should reject file if MIME type and extension do not match (e.g. .exe spoofed as pdf)', async () => {
    const dummyBuffer = Buffer.from('fake pdf');

    await expect(
      useCase.execute(
        {
          documentId: 'doc-1',
          originalName: 'malware.exe',
          mimeType: 'application/pdf',
          buffer: dummyBuffer,
          size: dummyBuffer.length,
        },
        { actorId: 'client-1', actorType: 'client' },
      ),
    ).rejects.toThrow(ValidationError);
  });

  it('should reject file if size exceeds maximum permitted', async () => {
    const dummyBuffer = Buffer.from('large buffer');
    const oversize = 11 * 1024 * 1024; // 11MB

    await expect(
      useCase.execute(
        {
          documentId: 'doc-1',
          originalName: 'grande.pdf',
          mimeType: 'application/pdf',
          buffer: dummyBuffer,
          size: oversize,
        },
        { actorId: 'client-1', actorType: 'client' },
      ),
    ).rejects.toThrow(ValidationError);
  });

  it('should prevent client from uploading file to another client document', async () => {
    const dummyBuffer = Buffer.from('pdf');

    await expect(
      useCase.execute(
        {
          documentId: 'doc-1',
          originalName: 'contrato.pdf',
          mimeType: 'application/pdf',
          buffer: dummyBuffer,
          size: dummyBuffer.length,
        },
        { actorId: 'other-client', actorType: 'client' },
      ),
    ).rejects.toThrow(ForbiddenError);
  });

  it('should prevent file upload if document status is COMPLETED', async () => {
    vi.mocked(documentRepository.findById).mockResolvedValueOnce({
      id: 'doc-1',
      clientId: 'client-1',
      title: 'Contrato Social',
      description: null,
      type: 'LEGAL',
      priority: 'NORMAL',
      status: 'COMPLETED',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });

    const dummyBuffer = Buffer.from('pdf');

    await expect(
      useCase.execute(
        {
          documentId: 'doc-1',
          originalName: 'contrato.pdf',
          mimeType: 'application/pdf',
          buffer: dummyBuffer,
          size: dummyBuffer.length,
        },
        { actorId: 'client-1', actorType: 'client' },
      ),
    ).rejects.toThrow(BusinessRuleError);
  });

  it('rejeita ficheiro cujo conteúdo não corresponde ao MIME declarado (exe disfarçado de PDF)', async () => {
    await expect(
      useCase.execute(
        {
          documentId: 'doc-1',
          originalName: 'fatura.pdf',
          mimeType: 'application/pdf',
          buffer: SAMPLE_FILES.exe,
          size: SAMPLE_FILES.exe.length,
        },
        { actorId: 'client-1', actorType: 'client' },
      ),
    ).rejects.toThrow(/não corresponde ao tipo declarado/);

    expect(fileStorage.upload).not.toHaveBeenCalled();
  });

  it('rejeita ficheiro vazio', async () => {
    await expect(
      useCase.execute(
        {
          documentId: 'doc-1',
          originalName: 'vazio.pdf',
          mimeType: 'application/pdf',
          buffer: Buffer.alloc(0),
          size: 0,
        },
        { actorId: 'client-1', actorType: 'client' },
      ),
    ).rejects.toThrow(/vazio/);
  });

  it('apaga o objeto do storage se a gravação na base de dados falhar', async () => {
    vi.mocked(auditRepository.log).mockRejectedValueOnce(new Error('db down'));

    await expect(
      useCase.execute(
        {
          documentId: 'doc-1',
          originalName: 'contrato.pdf',
          mimeType: 'application/pdf',
          buffer: SAMPLE_FILES.pdf,
          size: SAMPLE_FILES.pdf.length,
        },
        { actorId: 'client-1', actorType: 'client' },
      ),
    ).rejects.toThrow('db down');

    expect(unitOfWork.rollbacks).toBe(1);
    expect(fileStorage.upload).toHaveBeenCalledTimes(1);
    expect(fileStorage.delete).toHaveBeenCalledWith(
      'accountable-documents',
      expect.stringMatching(/^documents\/doc-1\/.+\.pdf$/),
    );
  });
});
