import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RegisterClientUseCase, ResendVerificationUseCase } from './register-client.use-case.js';
import { VerifyEmailUseCase } from './verify-email.use-case.js';
import { SetClientPasswordUseCase } from './set-client-password.use-case.js';
import {
  CompletePasswordResetUseCase,
  RequestPasswordResetUseCase,
  type PasswordResetAudience,
} from './reset-password.use-case.js';
import { ChangeOwnPasswordUseCase } from './change-password.use-case.js';
import type { AuthSessionService } from '../../services/auth-session.service.js';
import type { IEmailService, IHasher } from '../../contracts/index.js';
import type { IClientRepository } from '../../../domain/repositories/client.repository.interface.js';
import { InvalidTokenError, UnauthorizedError, ValidationError } from '../../../domain/errors/index.js';
import {
  FakeUnitOfWork,
  InMemoryTokenRepository,
  buildClient,
  createAuditRepositoryMock,
  createClientRepositoryMock,
  createEmailServiceMock,
  createEmailTokens,
  createUserRepositoryMock,
  sha256,
} from '../../../__tests__/unit/fakes.js';

const hasher: IHasher = {
  hash: vi.fn(async (plain: string) => `hashed:${plain}`),
  compare: vi.fn(async (plain: string, hash: string) => hash === `hashed:${plain}`),
};

/** Código OTP e link enviados no último email de ativação. */
function lastVerificationEmail(emailService: IEmailService) {
  const calls = vi.mocked(emailService.sendEmailVerification).mock.calls;
  const params = calls[calls.length - 1]![0];
  return { code: params.code, token: new URL(params.verificationUrl).searchParams.get('token')! };
}

function lastResetEmail(emailService: IEmailService) {
  const calls = vi.mocked(emailService.sendPasswordReset).mock.calls;
  const params = calls[calls.length - 1]![0];
  return { code: params.code, token: new URL(params.resetUrl).searchParams.get('token')! };
}

// ====================================================================
describe('Ativação de conta — link + código OTP', () => {
  let clients: IClientRepository;
  let emailService: IEmailService;
  let tokens: InMemoryTokenRepository;
  let ctx: ReturnType<typeof createEmailTokens>;
  const client = buildClient({ id: 'c1', email: 'novo@cliente.ao', emailVerified: false, isActive: false, passwordHash: null });

  beforeEach(() => {
    clients = createClientRepositoryMock();
    vi.mocked(clients.findByEmail).mockImplementation(async (email) => (email === client.email ? client : null));
    vi.mocked(clients.findByNip).mockResolvedValue(null);
    vi.mocked(clients.create).mockResolvedValue(client);
    vi.mocked(clients.findById).mockResolvedValue(client);
    emailService = createEmailServiceMock();
    tokens = new InMemoryTokenRepository();
    ctx = createEmailTokens(tokens);
  });

  const register = async () => {
    vi.mocked(clients.findByEmail).mockResolvedValueOnce(null);
    await new RegisterClientUseCase(clients, ctx.emailTokens, emailService, createAuditRepositoryMock(), new FakeUnitOfWork(), 'http://app')
      .execute({ nip: '5000', name: 'Novo', email: client.email }, {});
  };
  const verify = () => new VerifyEmailUseCase(clients, ctx.emailTokens, createAuditRepositoryMock(), new FakeUnitOfWork());

  it('o registo envia link e código de 6 dígitos; só os hashes ficam guardados', async () => {
    await register();
    const { code, token } = lastVerificationEmail(emailService);

    expect(code).toMatch(/^\d{6}$/);
    expect(tokens.rows).toHaveLength(1);
    expect(tokens.rows[0]!.tokenHash).toBe(sha256(token));
    expect(tokens.rows[0]!.otpHash).not.toContain(code);
    expect(tokens.rows[0]!.otpHash).toMatch(/^[0-9a-f]{64}$/);
  });

  it('ativa pelo link e devolve o próprio token como setup token', async () => {
    await register();
    const { token } = lastVerificationEmail(emailService);

    const out = await verify().execute({ token }, {});

    expect(out.setupToken).toBe(token);
    expect(clients.update).toHaveBeenCalledWith('c1', { emailVerified: true, isActive: true });
  });

  it('ativa pelo código OTP e emite um NOVO setup token (o link antigo deixa de valer)', async () => {
    await register();
    const { code, token } = lastVerificationEmail(emailService);

    const out = await verify().execute({ email: client.email, code }, {});

    expect(out.setupToken).not.toBe(token);
    expect(await tokens.findByTokenHash('EMAIL_VERIFICATION', sha256(out.setupToken))).not.toBeNull();
    expect(await tokens.findByTokenHash('EMAIL_VERIFICATION', sha256(token))).toBeNull();

    // O setup token serve para definir a primeira senha (a conta já está verificada).
    vi.mocked(clients.findById).mockResolvedValue({ ...client, emailVerified: true, isActive: true });
    await new SetClientPasswordUseCase(clients, tokens, hasher, createAuditRepositoryMock(), ctx.tokenService, new FakeUnitOfWork())
      .execute({ token: out.setupToken, password: 'Nova!2026' }, {});
    expect(clients.setInitialPassword).toHaveBeenCalledWith('c1', 'hashed:Nova!2026');
  });

  it('código errado consome tentativas; ao fim de 5 fica bloqueado mesmo com o código certo', async () => {
    await register();
    const { code } = lastVerificationEmail(emailService);
    const wrong = code === '000000' ? '111111' : '000000';

    for (let i = 4; i >= 1; i--) {
      await expect(verify().execute({ email: client.email, code: wrong }, {})).rejects.toThrow(`Restam ${i}`);
    }
    await expect(verify().execute({ email: client.email, code: wrong }, {})).rejects.toThrow(/Demasiadas tentativas/);
    await expect(verify().execute({ email: client.email, code }, {})).rejects.toThrow(/Demasiadas tentativas/);
    expect(clients.update).not.toHaveBeenCalled();
  });

  it('link e código são de uso único', async () => {
    await register();
    const { token, code } = lastVerificationEmail(emailService);
    await verify().execute({ token }, {});

    await expect(verify().execute({ token }, {})).rejects.toThrow(/já foi utilizado/);
    await expect(verify().execute({ email: client.email, code }, {})).rejects.toThrow(InvalidTokenError);
  });

  it('código de email inexistente é rejeitado com a mesma mensagem genérica', async () => {
    await expect(verify().execute({ email: 'ninguem@x.ao', code: '123456' }, {})).rejects.toThrow('Código inválido ou expirado.');
  });

  it('código expirado é rejeitado', async () => {
    await register();
    const { code } = lastVerificationEmail(emailService);
    tokens.rows[0]!.expiresAt = new Date(Date.now() - 1000);
    await expect(verify().execute({ email: client.email, code }, {})).rejects.toThrow(InvalidTokenError);
  });

  it('reenviar ativação invalida o código anterior e envia um novo', async () => {
    await register();
    const first = lastVerificationEmail(emailService);

    await new ResendVerificationUseCase(clients, ctx.emailTokens, emailService, createAuditRepositoryMock(), 'http://app').execute(client.email);
    const second = lastVerificationEmail(emailService);

    expect(second.token).not.toBe(first.token);
    await expect(verify().execute({ token: first.token }, {})).rejects.toThrow(/já foi utilizado/);
    await expect(verify().execute({ email: client.email, code: second.code }, {})).resolves.toBeDefined();
  });

  it('reenviar para conta já ativa ou inexistente não envia nada (sem enumeração)', async () => {
    vi.mocked(clients.findByEmail).mockResolvedValueOnce(buildClient({ emailVerified: true }));
    const uc = new ResendVerificationUseCase(clients, ctx.emailTokens, emailService, createAuditRepositoryMock(), 'http://app');
    await uc.execute('ativo@x.ao');
    await uc.execute('ninguem@x.ao');
    expect(emailService.sendEmailVerification).not.toHaveBeenCalled();
  });
});

// ====================================================================
describe('SetClientPasswordUseCase (definição da primeira senha)', () => {
  it('VULNERABILIDADE CORRIGIDA: o token de ativação não redefine uma senha já existente', async () => {
    const tokens = new InMemoryTokenRepository();
    const { tokenService } = createEmailTokens(tokens);
    await tokens.create('EMAIL_VERIFICATION', { ownerId: 'c1', tokenHash: sha256('tok'), otpHash: null, expiresAt: new Date(Date.now() + 60_000) });
    const clients = createClientRepositoryMock();
    vi.mocked(clients.findById).mockResolvedValue(buildClient({ id: 'c1', passwordHash: '$existing$' }));

    await expect(
      new SetClientPasswordUseCase(clients, tokens, hasher, createAuditRepositoryMock(), tokenService, new FakeUnitOfWork())
        .execute({ token: 'tok', password: 'Atacante!2026' }, {}),
    ).rejects.toThrow(InvalidTokenError);
    expect(clients.setInitialPassword).not.toHaveBeenCalled();
  });
});

// ====================================================================
describe('Recuperação de senha — link ou código (clientes e utilizadores)', () => {
  let emailService: IEmailService;
  let ctx: ReturnType<typeof createEmailTokens>;
  let passwords: Map<string, string>;
  let sessionService: AuthSessionService;

  const audience = (): PasswordResetAudience => ({
    kind: 'CLIENT_PASSWORD_RESET',
    sessionType: 'client',
    resetPageUrl: 'http://app/auth/reset-password',
    entity: 'Client',
    findEligibleByEmail: async (email) => (email === 'c@x.ao' ? { id: 'c1', name: 'Cliente', email } : null),
    findIdByEmail: async (email) => (email === 'c@x.ao' ? 'c1' : null),
    setPassword: async (id, hash) => void passwords.set(id, hash),
    auditActor: (id) => ({ clientId: id }),
  });

  beforeEach(() => {
    emailService = createEmailServiceMock();
    ctx = createEmailTokens();
    passwords = new Map();
    sessionService = { revokeAllForSubject: vi.fn() } as unknown as AuthSessionService;
  });

  const request = (email = 'c@x.ao') =>
    new RequestPasswordResetUseCase(audience(), ctx.emailTokens, emailService, createAuditRepositoryMock()).execute(email);
  const complete = () =>
    new CompletePasswordResetUseCase(audience(), ctx.emailTokens, hasher, createAuditRepositoryMock(), sessionService, new FakeUnitOfWork());

  it('email inexistente: não envia nada e não falha', async () => {
    await expect(request('ninguem@x.ao')).resolves.toBeUndefined();
    expect(emailService.sendPasswordReset).not.toHaveBeenCalled();
  });

  it('pelo link: redefine, termina sessões e o link fica gasto', async () => {
    await request();
    const { token } = lastResetEmail(emailService);

    await complete().execute({ token, password: 'Nova!2026' }, {});

    expect(passwords.get('c1')).toBe('hashed:Nova!2026');
    expect(sessionService.revokeAllForSubject).toHaveBeenCalledWith('client', 'c1');
    await expect(complete().execute({ token, password: 'Outra!2027' }, {})).rejects.toThrow(InvalidTokenError);
  });

  it('pelo código OTP: redefine com email + código', async () => {
    await request();
    const { code } = lastResetEmail(emailService);

    await complete().execute({ email: 'c@x.ao', code, password: 'Nova!2026' }, {});
    expect(passwords.get('c1')).toBe('hashed:Nova!2026');
  });

  it('pedir novo reset invalida o código anterior', async () => {
    await request();
    const first = lastResetEmail(emailService);
    await request();

    await expect(complete().execute({ email: 'c@x.ao', code: first.code, password: 'X!2026aa' }, {})).rejects.toThrow(
      InvalidTokenError,
    );
  });

  it('o email inclui a validade de 15 minutos', async () => {
    await request();
    expect(emailService.sendPasswordReset).toHaveBeenCalledWith(expect.objectContaining({ expiresInMinutes: 15 }));
  });
});

// ====================================================================
describe('ChangeOwnPasswordUseCase', () => {
  it('exige a senha atual correta, grava a nova e termina as sessões', async () => {
    const clients = createClientRepositoryMock();
    vi.mocked(clients.findById).mockResolvedValue(buildClient({ id: 'c1', passwordHash: 'hashed:Atual!2026' }));
    const sessionService = { revokeAllForSubject: vi.fn() } as unknown as AuthSessionService;
    const uc = new ChangeOwnPasswordUseCase(clients, createUserRepositoryMock(), hasher, sessionService, createAuditRepositoryMock(), new FakeUnitOfWork());

    await expect(
      uc.execute({ currentPassword: 'errada', newPassword: 'Nova!2026' }, { actorId: 'c1', actorType: 'client' }),
    ).rejects.toThrow(UnauthorizedError);

    await expect(
      uc.execute({ currentPassword: 'Atual!2026', newPassword: 'Atual!2026' }, { actorId: 'c1', actorType: 'client' }),
    ).rejects.toThrow(ValidationError);

    await uc.execute({ currentPassword: 'Atual!2026', newPassword: 'Nova!2026' }, { actorId: 'c1', actorType: 'client' });
    expect(clients.update).toHaveBeenCalledWith('c1', { passwordHash: 'hashed:Nova!2026' });
    expect(sessionService.revokeAllForSubject).toHaveBeenCalledWith('client', 'c1');
  });
});
