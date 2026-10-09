import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RegisterClientUseCase } from './register-client.use-case.js';
import { ConflictError } from '../../../domain/errors/index.js';
import {
  FakeUnitOfWork,
  buildClient,
  createAuditRepositoryMock,
  createClientRepositoryMock,
  createEmailServiceMock,
  createEmailTokens,
} from '../../../__tests__/unit/fakes.js';

describe('RegisterClientUseCase', () => {
  const created = buildClient({ id: 'client-123', email: 'teste@empresa.com', name: 'Empresa Teste', isActive: false, emailVerified: false, passwordHash: null });

  let clients = createClientRepositoryMock();
  let emailService = createEmailServiceMock();
  let auditRepository = createAuditRepositoryMock();
  let unitOfWork = new FakeUnitOfWork();

  beforeEach(() => {
    clients = createClientRepositoryMock();
    vi.mocked(clients.findByEmail).mockResolvedValue(null);
    vi.mocked(clients.findByNip).mockResolvedValue(null);
    vi.mocked(clients.create).mockResolvedValue(created);
    emailService = createEmailServiceMock();
    auditRepository = createAuditRepositoryMock();
    unitOfWork = new FakeUnitOfWork();
  });

  const build = () =>
    new RegisterClientUseCase(clients, createEmailTokens().emailTokens, emailService, auditRepository, unitOfWork, 'http://localhost:5173');

  it('regista o cliente numa transação e envia link + código de ativação', async () => {
    const out = await build().execute({ nip: '123456789', name: 'Empresa Teste', email: 'teste@empresa.com' }, {});

    expect(out).toEqual({ clientId: 'client-123', email: 'teste@empresa.com' });
    expect(unitOfWork.runs).toBe(1);
    expect(emailService.sendEmailVerification).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'teste@empresa.com',
        verificationUrl: expect.stringMatching(/^http:\/\/localhost:5173\/auth\/verify-email\?token=[0-9a-f]{64}$/),
        code: expect.stringMatching(/^\d{6}$/),
        expiresInHours: 24,
      }),
    );
    expect(auditRepository.log).toHaveBeenCalledWith(expect.objectContaining({ action: 'CLIENT_CREATED' }));
  });

  it.each([
    ['email', 'findByEmail'],
    ['NIP', 'findByNip'],
  ] as const)('recusa %s duplicado com mensagem genérica', async (_label, method) => {
    vi.mocked(clients[method]).mockResolvedValueOnce(buildClient());
    await expect(build().execute({ nip: '1', name: 'X', email: 'teste@empresa.com' }, {})).rejects.toThrow(ConflictError);
  });

  it('não envia email se a transação falhar', async () => {
    vi.mocked(auditRepository.log).mockRejectedValueOnce(new Error('db down'));
    await expect(build().execute({ nip: '1', name: 'X', email: 'teste@empresa.com' }, {})).rejects.toThrow('db down');
    expect(unitOfWork.rollbacks).toBe(1);
    expect(emailService.sendEmailVerification).not.toHaveBeenCalled();
  });
});
