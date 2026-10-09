import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateClientUploadSessionUseCase } from './create-client-upload-session.use-case.js';
import { GetClientUploadSessionContextUseCase } from './get-client-upload-session-context.use-case.js';
import { UploadDocumentViaSessionUseCase } from './upload-document-via-session.use-case.js';
import { ListClientUploadSessionsUseCase } from './list-client-upload-sessions.use-case.js';
import { RevokeClientUploadSessionUseCase } from './revoke-client-upload-session.use-case.js';
import type { IClientRepository } from '../../../domain/repositories/client.repository.interface.js';
import type {
  IClientUploadSessionRepository,
  ClientUploadSessionWithRelationsEntity,
} from '../../../domain/repositories/client-upload-session.repository.interface.js';
import type {
  IDocumentRepository,
  IDocumentFileRepository,
  IDocumentStatusHistoryRepository,
} from '../../../domain/repositories/document.repository.interface.js';
import type { IAuditRepository } from '../../../domain/repositories/user.repository.interface.js';
import type { IFileStorage, ITokenService } from '../../contracts/index.js';
import { BusinessRuleError, NotFoundError, ValidationError } from '../../../domain/errors/index.js';
import {
  FakeUnitOfWork,
  SAMPLE_FILES,
  buildClient,
  createAuditRepositoryMock,
  createClientRepositoryMock,
  createFileStorageMock,
  createTokenServiceMock,
  fakeCipher,
  sha256,
} from '../../../__tests__/unit/fakes.js';

const PORTAL = 'http://localhost:5173';
const TOKEN = 'b'.repeat(64);
const DAY_MS = 24 * 60 * 60 * 1000;

const mockClient = buildClient({
  id: 'client-123',
  name: 'VA TECH ENTERPRISES',
  company: 'VA TECH ENTERPRISES LDA',
});

function buildSession(
  overrides: Partial<ClientUploadSessionWithRelationsEntity> = {},
): ClientUploadSessionWithRelationsEntity {
  return {
    id: 'session-123',
    clientId: 'client-123',
    createdByUserId: 'user-admin-1',
    label: 'Agosto 2026',
    month: 8,
    year: 2026,
    tokenHash: sha256(TOKEN),
    tokenEncrypted: fakeCipher.encrypt(TOKEN),
    expiresAt: new Date(Date.now() + 10 * DAY_MS),
    revokedAt: null,
    createdAt: new Date(),
    client: {
      id: 'client-123',
      name: 'VA TECH ENTERPRISES',
      email: 'contacto@vatech.ao',
      nip: '123456789',
      company: 'VA TECH ENTERPRISES LDA',
    },
    documents: [],
    _count: { documents: 0 },
    ...overrides,
  };
}

describe('ClientUploadSessions Use Cases', () => {
  let clientRepository: IClientRepository;
  let sessionRepository: IClientUploadSessionRepository;
  let documentRepository: IDocumentRepository;
  let documentFileRepository: IDocumentFileRepository;
  let statusHistoryRepository: IDocumentStatusHistoryRepository;
  let auditRepository: IAuditRepository;
  let fileStorage: IFileStorage;
  let tokenService: ITokenService;
  let unitOfWork: FakeUnitOfWork;

  beforeEach(() => {
    clientRepository = createClientRepositoryMock();
    vi.mocked(clientRepository.findById).mockResolvedValue(mockClient);

    sessionRepository = {
      create: vi.fn().mockImplementation(async (data) => ({
        id: 'session-123',
        clientId: data.clientId,
        createdByUserId: data.createdByUserId,
        label: data.label ?? null,
        month: data.month ?? null,
        year: data.year ?? null,
        tokenHash: data.tokenHash,
        tokenEncrypted: data.tokenEncrypted,
        expiresAt: data.expiresAt,
        revokedAt: null,
        createdAt: new Date(),
      })),
      findById: vi.fn(),
      findByTokenHash: vi.fn(),
      listByClientId: vi.fn(),
      revoke: vi.fn().mockResolvedValue(undefined),
    };

    documentRepository = {
      findById: vi.fn(),
      findByIdWithRelations: vi.fn(),
      create: vi.fn().mockImplementation(async (data) => ({
        id: 'doc-123',
        clientId: data.clientId,
        uploadSessionId: data.uploadSessionId ?? null,
        title: data.title,
        description: data.description ?? null,
        type: data.type,
        priority: data.priority,
        status: data.status ?? 'SUBMITTED',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      })),
      update: vi.fn(),
      softDelete: vi.fn(),
      list: vi.fn(),
    };

    documentFileRepository = {
      findById: vi.fn(),
      findByDocumentId: vi.fn(),
      create: vi.fn().mockImplementation(async (data) => ({
        id: 'file-123',
        ...data,
        createdAt: new Date(),
        deletedAt: null,
      })),
      softDelete: vi.fn(),
    };

    statusHistoryRepository = {
      create: vi.fn().mockResolvedValue(undefined),
      findByDocumentId: vi.fn().mockResolvedValue([]),
    };

    auditRepository = createAuditRepositoryMock();
    fileStorage = createFileStorageMock();
    tokenService = createTokenServiceMock({ generateSecureToken: vi.fn().mockReturnValue(TOKEN) });
    unitOfWork = new FakeUnitOfWork();
  });

  // ------------------------------------------------------------------
  describe('CreateClientUploadSessionUseCase', () => {
    const build = () =>
      new CreateClientUploadSessionUseCase(
        clientRepository,
        sessionRepository,
        auditRepository,
        tokenService,
        fakeCipher,
        unitOfWork,
        PORTAL,
        30,
      );

    it('guarda apenas hash + token cifrado e devolve o URL com o token em claro', async () => {
      const result = await build().execute(
        { clientId: 'client-123', month: 8, year: 2026, label: 'Agosto' },
        { actorId: 'user-admin-1', actorType: 'user' },
      );

      expect(sessionRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          tokenHash: sha256(TOKEN),
          tokenEncrypted: `enc:${TOKEN}`,
          createdByUserId: 'user-admin-1',
        }),
      );
      expect(result.token).toBe(TOKEN);
      expect(result.url).toContain(`token=${TOKEN}`);
      expect(result.url).toContain('month=8');
      expect(result.url).toContain('year=2026');
      expect(result.url).not.toContain('companyId');
    });

    it('define expiração por omissão (30 dias) e respeita o máximo de 365', async () => {
      const before = Date.now();
      const r1 = await build().execute({ clientId: 'client-123' }, { actorId: 'u', actorType: 'user' });
      expect(r1.expiresAt.getTime() - before).toBeGreaterThanOrEqual(30 * DAY_MS - 1000);
      expect(r1.expiresAt.getTime() - before).toBeLessThanOrEqual(30 * DAY_MS + 1000);

      const r2 = await build().execute(
        { clientId: 'client-123', expiresInDays: 9999 },
        { actorId: 'u', actorType: 'user' },
      );
      expect(r2.expiresAt.getTime() - before).toBeLessThanOrEqual(365 * DAY_MS + 1000);
    });

    it('nunca escreve o token na auditoria', async () => {
      await build().execute({ clientId: 'client-123' }, { actorId: 'u', actorType: 'user' });
      const logged = JSON.stringify(vi.mocked(auditRepository.log).mock.calls);
      expect(logged).not.toContain(TOKEN);
    });

    it('sessão criada pelo próprio cliente fica com createdByUserId nulo (sem violar FK)', async () => {
      await build().execute({ clientId: 'client-123' }, { actorId: 'client-123', actorType: 'client' });

      expect(sessionRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ createdByUserId: null }),
      );
      expect(auditRepository.log).toHaveBeenCalledWith(
        expect.not.objectContaining({ userId: expect.anything() }),
      );
    });

    it('recusa criar sessão para cliente bloqueado', async () => {
      vi.mocked(clientRepository.findById).mockResolvedValue(buildClient({ isActive: false }));
      await expect(
        build().execute({ clientId: 'client-123' }, { actorId: 'u', actorType: 'user' }),
      ).rejects.toThrow(BusinessRuleError);
    });
  });

  // ------------------------------------------------------------------
  describe('ListClientUploadSessionsUseCase', () => {
    const build = () =>
      new ListClientUploadSessionsUseCase(clientRepository, sessionRepository, fakeCipher, PORTAL);

    it('reconstrói o URL só para sessões ativas com token cifrado', async () => {
      vi.mocked(sessionRepository.listByClientId).mockResolvedValue([
        buildSession({ id: 'active' }),
        buildSession({ id: 'revoked', revokedAt: new Date() }),
        buildSession({ id: 'expired', expiresAt: new Date(Date.now() - 1000) }),
        buildSession({ id: 'legacy', tokenEncrypted: null }),
      ]);

      const result = await build().execute('client-123');
      const byId = Object.fromEntries(result.map((s) => [s.id, s]));

      expect(byId.active?.url).toContain(`token=${TOKEN}`);
      expect(byId.revoked?.url).toBeUndefined();
      expect(byId.expired?.url).toBeUndefined();
      expect(byId.legacy?.url).toBeUndefined();
      expect(result.every((s) => s.token === undefined)).toBe(true);
    });
  });

  // ------------------------------------------------------------------
  describe('RevokeClientUploadSessionUseCase', () => {
    const build = () => new RevokeClientUploadSessionUseCase(sessionRepository, auditRepository, unitOfWork);

    it('revoga a sessão do próprio cliente', async () => {
      vi.mocked(sessionRepository.findById).mockResolvedValue(buildSession());
      await build().execute(
        { clientId: 'client-123', sessionId: 'session-123' },
        { actorId: 'client-123', actorType: 'client' },
      );
      expect(sessionRepository.revoke).toHaveBeenCalledWith('session-123');
    });

    it('IDOR: não permite revogar sessão de outro cliente', async () => {
      vi.mocked(sessionRepository.findById).mockResolvedValue(buildSession({ clientId: 'victim-client' }));
      await expect(
        build().execute(
          { clientId: 'attacker-client', sessionId: 'session-123' },
          { actorId: 'attacker-client', actorType: 'client' },
        ),
      ).rejects.toThrow(NotFoundError);
      expect(sessionRepository.revoke).not.toHaveBeenCalled();
    });
  });

  // ------------------------------------------------------------------
  describe('GetClientUploadSessionContextUseCase', () => {
    const build = () =>
      new GetClientUploadSessionContextUseCase(sessionRepository, clientRepository, tokenService);

    it('procura a sessão pelo hash do token e não expõe clientId nem token', async () => {
      vi.mocked(sessionRepository.findByTokenHash).mockResolvedValue(buildSession());

      const result = await build().execute(TOKEN);

      expect(sessionRepository.findByTokenHash).toHaveBeenCalledWith(sha256(TOKEN));
      expect(result.sessionId).toBe('session-123');
      expect(result.companyName).toBe('VA TECH ENTERPRISES LDA');
      expect(result).not.toHaveProperty('clientId');
      expect(result).not.toHaveProperty('token');
    });

    it.each([
      ['revogada', { revokedAt: new Date() }],
      ['expirada', { expiresAt: new Date(Date.now() - 1000) }],
    ])('rejeita sessão %s', async (_label, overrides) => {
      vi.mocked(sessionRepository.findByTokenHash).mockResolvedValue(buildSession(overrides));
      await expect(build().execute(TOKEN)).rejects.toThrow(/inválido, expirado ou revogado/);
    });

    it('rejeita sessão de cliente bloqueado', async () => {
      vi.mocked(sessionRepository.findByTokenHash).mockResolvedValue(buildSession());
      vi.mocked(clientRepository.findById).mockResolvedValue(buildClient({ isActive: false }));
      await expect(build().execute(TOKEN)).rejects.toThrow(NotFoundError);
    });
  });

  // ------------------------------------------------------------------
  describe('UploadDocumentViaSessionUseCase', () => {
    const build = () =>
      new UploadDocumentViaSessionUseCase(
        sessionRepository,
        clientRepository,
        documentRepository,
        documentFileRepository,
        statusHistoryRepository,
        fileStorage,
        auditRepository,
        tokenService,
        unitOfWork,
        'test-bucket',
      );

    const pdfInput = {
      token: TOKEN,
      title: 'Fatura Fornecedor 001',
      type: 'FATURAS_FORNECEDORES',
      originalName: 'fatura_001.pdf',
      mimeType: 'application/pdf',
      buffer: SAMPLE_FILES.pdf,
      size: SAMPLE_FILES.pdf.length,
    };

    beforeEach(() => {
      vi.mocked(sessionRepository.findByTokenHash).mockResolvedValue(buildSession());
    });

    it('cria documento SUBMITTED e guarda o ficheiro numa transação', async () => {
      const result = await build().execute(pdfInput, { ipAddress: '127.0.0.1' });

      expect(result.document.status).toBe('SUBMITTED');
      expect(result.document.uploadSessionId).toBe('session-123');
      expect(result.file.originalName).toBe('fatura_001.pdf');
      expect(unitOfWork.runs).toBe(1);
    });

    it('ficheiro inválido NÃO cria documento órfão', async () => {
      await expect(
        build().execute(
          { ...pdfInput, originalName: 'virus.exe', mimeType: 'application/x-msdownload' },
          {},
        ),
      ).rejects.toThrow(ValidationError);

      expect(documentRepository.create).not.toHaveBeenCalled();
      expect(statusHistoryRepository.create).not.toHaveBeenCalled();
    });

    it('conteúdo falsificado (exe com extensão .pdf) NÃO cria documento', async () => {
      await expect(
        build().execute({ ...pdfInput, buffer: SAMPLE_FILES.exe, size: SAMPLE_FILES.exe.length }, {}),
      ).rejects.toThrow(ValidationError);
      expect(documentRepository.create).not.toHaveBeenCalled();
    });

    it('rejeita upload com sessão expirada', async () => {
      vi.mocked(sessionRepository.findByTokenHash).mockResolvedValue(
        buildSession({ expiresAt: new Date(Date.now() - 1000) }),
      );
      await expect(build().execute(pdfInput, {})).rejects.toThrow(NotFoundError);
      expect(documentRepository.create).not.toHaveBeenCalled();
    });

    it('rejeita upload para cliente bloqueado', async () => {
      vi.mocked(clientRepository.findById).mockResolvedValue(buildClient({ isActive: false }));
      await expect(build().execute(pdfInput, {})).rejects.toThrow(NotFoundError);
      expect(documentRepository.create).not.toHaveBeenCalled();
    });

    it('se a base de dados falhar depois do upload, apaga o objeto do storage', async () => {
      vi.mocked(auditRepository.log).mockRejectedValueOnce(new Error('db down'));

      await expect(build().execute(pdfInput, {})).rejects.toThrow('db down');

      expect(unitOfWork.rollbacks).toBe(1);
      expect(fileStorage.delete).toHaveBeenCalledWith('test-bucket', expect.stringContaining('documents/doc-123/'));
    });
  });
});
