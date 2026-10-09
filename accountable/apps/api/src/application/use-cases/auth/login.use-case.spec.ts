import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LoginClientUseCase, LoginUserUseCase } from './login.use-case.js';
import type { AuthSessionService } from '../../services/auth-session.service.js';
import type { IHasher, TokenPair } from '../../contracts/index.js';
import type { IUserRepository, UserEntity } from '../../../domain/repositories/index.js';
import type { IClientRepository } from '../../../domain/repositories/client.repository.interface.js';
import { UnauthorizedError, ValidationError } from '../../../domain/errors/index.js';
import {
  buildClient,
  createAuditRepositoryMock,
  createClientRepositoryMock, createUserRepositoryMock,
} from '../../../__tests__/unit/fakes.js';

const TOKENS: TokenPair = {
  accessToken: 'access',
  refreshToken: 'refresh',
  accessExpiresIn: 900,
  refreshExpiresAt: new Date(Date.now() + 7 * 86_400_000),
};

function createHasher(correctPassword: string): IHasher {
  return {
    hash: vi.fn().mockResolvedValue('$dummy$'),
    compare: vi.fn(async (plain: string, hash: string) => hash !== '$dummy$' && plain === correctPassword),
  };
}

function createSessionService(claimsResult: 'ok' | 'none' = 'ok'): AuthSessionService {
  return {
    resolveClaims: vi.fn(async (type: 'client' | 'user', id: string) =>
      claimsResult === 'ok'
        ? { sub: id, email: 'x@x', type, roles: ['R'], permissions: ['p:1'] }
        : null,
    ),
    issue: vi.fn().mockResolvedValue(TOKENS),
  } as unknown as AuthSessionService;
}

describe('LoginClientUseCase', () => {
  let clientRepository: IClientRepository;
  let hasher: IHasher;

  beforeEach(() => {
    clientRepository = createClientRepositoryMock();
    hasher = createHasher('Senha!2026');
  });

  const build = (sessions = createSessionService()) =>
    new LoginClientUseCase(clientRepository, hasher, sessions, createAuditRepositoryMock());

  it('login válido emite sessão persistida', async () => {
    vi.mocked(clientRepository.findByEmail).mockResolvedValue(buildClient());
    const sessions = createSessionService();

    const out = await build(sessions).execute({ email: 'c@c', password: 'Senha!2026' }, {});

    expect(out.userType).toBe('client');
    expect(sessions.issue).toHaveBeenCalled();
    expect(clientRepository.update).toHaveBeenCalledWith('client-1', { lastLoginAt: expect.any(Date) });
  });

  it('email inexistente: bcrypt corre na mesma (sem diferença de tempo) e a mensagem é genérica', async () => {
    vi.mocked(clientRepository.findByEmail).mockResolvedValue(null);

    await expect(build().execute({ email: 'nao@existe', password: 'x' }, {})).rejects.toThrow(
      'Credenciais inválidas.',
    );
    expect(hasher.compare).toHaveBeenCalledTimes(1);
  });

  it('conta suspensa com senha ERRADA devolve apenas "Credenciais inválidas" (sem enumeração)', async () => {
    vi.mocked(clientRepository.findByEmail).mockResolvedValue(buildClient({ isActive: false }));
    await expect(build().execute({ email: 'c@c', password: 'errada' }, {})).rejects.toThrow(
      'Credenciais inválidas.',
    );
  });

  it('email não verificado com senha ERRADA não revela o estado da conta', async () => {
    vi.mocked(clientRepository.findByEmail).mockResolvedValue(buildClient({ emailVerified: false }));
    await expect(build().execute({ email: 'c@c', password: 'errada' }, {})).rejects.toThrow(UnauthorizedError);
  });

  it('email não verificado com senha certa recebe a mensagem específica', async () => {
    vi.mocked(clientRepository.findByEmail).mockResolvedValue(buildClient({ emailVerified: false }));
    await expect(build().execute({ email: 'c@c', password: 'Senha!2026' }, {})).rejects.toThrow(ValidationError);
  });

  it('conta suspensa com senha certa é recusada e não emite sessão', async () => {
    vi.mocked(clientRepository.findByEmail).mockResolvedValue(buildClient({ isActive: false }));
    const sessions = createSessionService('none');
    await expect(build(sessions).execute({ email: 'c@c', password: 'Senha!2026' }, {})).rejects.toThrow(
      /inativa ou suspensa/,
    );
    expect(sessions.issue).not.toHaveBeenCalled();
  });

  it('cliente sem senha definida não consegue entrar', async () => {
    vi.mocked(clientRepository.findByEmail).mockResolvedValue(buildClient({ passwordHash: null }));
    await expect(build().execute({ email: 'c@c', password: 'qualquer' }, {})).rejects.toThrow(
      'Credenciais inválidas.',
    );
  });
});

describe('LoginUserUseCase', () => {
  const user: UserEntity = {
    id: 'user-1',
    email: 'admin@va.ao',
    name: 'Admin',
    passwordHash: '$real$',
    isActive: true,
    lastLoginAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };
  let userRepository: IUserRepository;
  let hasher: IHasher;

  beforeEach(() => {
    userRepository = {
      ...createUserRepositoryMock(),
      findByIdWithRoles: vi.fn(),
      findByEmail: vi.fn().mockResolvedValue(user),
    };
    hasher = createHasher('Admin!2026');
  });

  it('login válido devolve roles/permissões atuais', async () => {
    const out = await new LoginUserUseCase(userRepository, hasher, createSessionService(), createAuditRepositoryMock())
      .execute({ email: 'admin@va.ao', password: 'Admin!2026' }, {});
    expect(out.permissions).toEqual(['p:1']);
  });

  it('utilizador inexistente: bcrypt corre na mesma', async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(null);
    await expect(
      new LoginUserUseCase(userRepository, hasher, createSessionService(), createAuditRepositoryMock()).execute(
        { email: 'x@x', password: 'x' },
        {},
      ),
    ).rejects.toThrow('Credenciais inválidas.');
    expect(hasher.compare).toHaveBeenCalledTimes(1);
  });

  it('utilizador desativado com senha errada não revela o estado', async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue({ ...user, isActive: false });
    await expect(
      new LoginUserUseCase(userRepository, hasher, createSessionService('none'), createAuditRepositoryMock()).execute(
        { email: 'admin@va.ao', password: 'errada' },
        {},
      ),
    ).rejects.toThrow('Credenciais inválidas.');
  });
});
