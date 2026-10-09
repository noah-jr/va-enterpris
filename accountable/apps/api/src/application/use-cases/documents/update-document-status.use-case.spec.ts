import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UpdateDocumentStatusUseCase } from './update-document-status.use-case.js';
import type {
  IDocumentRepository,
  IDocumentStatusHistoryRepository,
} from '../../../domain/repositories/document.repository.interface.js';
import type { IClientRepository } from '../../../domain/repositories/client.repository.interface.js';
import type { IAuditRepository } from '../../../domain/repositories/user.repository.interface.js';
import type { IEmailService } from '../../contracts/email.contract.js';
import {
  BusinessRuleError,
  ForbiddenError,
} from '../../../domain/errors/index.js';
import { FakeUnitOfWork, createEmailServiceMock } from '../../../__tests__/unit/fakes.js';

describe('UpdateDocumentStatusUseCase', () => {
  let documentRepository: IDocumentRepository;
  let statusHistoryRepository: IDocumentStatusHistoryRepository;
  let clientRepository: IClientRepository;
  let emailService: IEmailService;
  let auditRepository: IAuditRepository;
  let useCase: UpdateDocumentStatusUseCase;
  let unitOfWork: FakeUnitOfWork;

  beforeEach(() => {
    documentRepository = {
      findById: vi.fn().mockResolvedValue({
        id: 'doc-1',
        clientId: 'client-1',
        title: 'Declaração Fiscal 2025',
        description: 'Documentos fiscais',
        type: 'FISCAL',
        priority: 'NORMAL',
        status: 'DRAFT',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      }),
      findByIdWithRelations: vi.fn(),
      create: vi.fn(),
      update: vi.fn().mockImplementation((id, data) =>
        Promise.resolve({
          id,
          clientId: 'client-1',
          title: 'Declaração Fiscal 2025',
          description: 'Documentos fiscais',
          type: 'FISCAL',
          priority: 'NORMAL',
          status: data.status,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        }),
      ),
      softDelete: vi.fn(),
      list: vi.fn(),
    };

    statusHistoryRepository = {
      create: vi.fn().mockResolvedValue(undefined),
      findByDocumentId: vi.fn(),
    };

    clientRepository = {
      findById: vi.fn().mockResolvedValue({
        id: 'client-1',
        nip: '123456789',
        name: 'Cliente Teste',
        email: 'cliente@teste.com',
        phone: null,
        company: null,
        department: null,
        isActive: true,
        emailVerified: true,
        passwordHash: 'hash',
        lastLoginAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      }),
      findByEmail: vi.fn(),
      findByNip: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      setInitialPassword: vi.fn(),
      softDelete: vi.fn(),
      list: vi.fn(),
    };

    emailService = createEmailServiceMock();

    auditRepository = {
      log: vi.fn().mockResolvedValue(undefined),
      list: vi.fn(),
    };

    useCase = new UpdateDocumentStatusUseCase(
      documentRepository,
      statusHistoryRepository,
      clientRepository,
      emailService,
      auditRepository,
      'http://localhost:5173',
      (unitOfWork = new FakeUnitOfWork()),
    );
  });

  it('should allow client to transition DRAFT to SUBMITTED', async () => {
    const updated = await useCase.execute(
      { documentId: 'doc-1', toStatus: 'SUBMITTED', note: 'Documentação finalizada' },
      { actorId: 'client-1', actorType: 'client' },
    );

    expect(updated.status).toBe('SUBMITTED');
    expect(statusHistoryRepository.create).toHaveBeenCalledWith({
      documentId: 'doc-1',
      fromStatus: 'DRAFT',
      toStatus: 'SUBMITTED',
      changedById: 'client-1',
      note: 'Documentação finalizada',
    });
    expect(auditRepository.log).toHaveBeenCalledWith(
      expect.objectContaining({
        clientId: 'client-1',
        action: 'DOCUMENT_STATUS_CHANGED',
      }),
    );
  });

  it('should prevent client from transitioning directly to IN_ANALYSIS', async () => {
    await expect(
      useCase.execute(
        { documentId: 'doc-1', toStatus: 'IN_ANALYSIS' },
        { actorId: 'client-1', actorType: 'client' },
      ),
    ).rejects.toThrow(BusinessRuleError);
  });

  it('should prevent client from updating document belonging to another client', async () => {
    await expect(
      useCase.execute(
        { documentId: 'doc-1', toStatus: 'SUBMITTED' },
        { actorId: 'another-client', actorType: 'client' },
      ),
    ).rejects.toThrow(ForbiddenError);
  });

  it('should prevent invalid status transition like DRAFT to COMPLETED', async () => {
    await expect(
      useCase.execute(
        { documentId: 'doc-1', toStatus: 'COMPLETED' },
        { actorId: 'user-admin', actorType: 'user' },
      ),
    ).rejects.toThrow(BusinessRuleError);
  });

  it('should notify client via email when status is changed by internal user', async () => {
    vi.mocked(documentRepository.findById).mockResolvedValueOnce({
      id: 'doc-1',
      clientId: 'client-1',
      title: 'Declaração Fiscal 2025',
      description: 'Documentos fiscais',
      type: 'FISCAL',
      priority: 'NORMAL',
      status: 'SUBMITTED',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });

    await useCase.execute(
      { documentId: 'doc-1', toStatus: 'IN_ANALYSIS', note: 'Início de análise' },
      { actorId: 'consultant-1', actorType: 'user' },
    );

    expect(emailService.sendDocumentStatusChanged).toHaveBeenCalledWith({
      to: 'cliente@teste.com',
      name: 'Cliente Teste',
      documentTitle: 'Declaração Fiscal 2025',
      newStatus: 'Em Análise',
      platformUrl: 'http://localhost:5173/documents/doc-1',
    });
  });

  it('grava estado, histórico e auditoria numa única transação', async () => {
    await useCase.execute(
      { documentId: 'doc-1', toStatus: 'SUBMITTED' },
      { actorId: 'client-1', actorType: 'client' },
    );
    expect(unitOfWork.runs).toBe(1);
  });

  it('não envia email se a gravação do histórico falhar (rollback)', async () => {
    vi.mocked(statusHistoryRepository.create).mockRejectedValueOnce(new Error('db down'));

    await expect(
      useCase.execute(
        { documentId: 'doc-1', toStatus: 'SUBMITTED' },
        { actorId: 'client-1', actorType: 'client' },
      ),
    ).rejects.toThrow('db down');

    expect(unitOfWork.rollbacks).toBe(1);
    expect(emailService.sendDocumentStatusChanged).not.toHaveBeenCalled();
  });

  it('uma falha no envio de email não reverte a alteração de estado', async () => {
    vi.mocked(emailService.sendDocumentStatusChanged).mockRejectedValueOnce(new Error('smtp down'));

    const updated = await useCase.execute(
      { documentId: 'doc-1', toStatus: 'SUBMITTED' },
      { actorId: 'client-1', actorType: 'client' },
    );

    expect(updated.status).toBe('SUBMITTED');
    expect(unitOfWork.rollbacks).toBe(0);
    expect(auditRepository.log).toHaveBeenCalledWith(
      expect.objectContaining({ metadata: expect.objectContaining({ emailError: 'smtp down' }) }),
    );
  });
});
