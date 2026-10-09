import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthSessionService } from './auth-session.service.js';
import { JwtTokenService } from '../../infrastructure/auth/jwt.token-service.js';
import type {
  IRefreshSessionRepository,
  IUserRepository,
  RefreshSessionEntity,
  UserWithRolesEntity,
} from '../../domain/repositories/index.js';
import type { IClientRepository } from '../../domain/repositories/client.repository.interface.js';
import { UnauthorizedError } from '../../domain/errors/index.js';
import { FakeUnitOfWork, buildClient, createClientRepositoryMock, createUserRepositoryMock } from '../../__tests__/unit/fakes.js';

/** Repositório de sessões em memória com a mesma semântica do Prisma. */
class InMemoryRefreshSessionRepository implements IRefreshSessionRepository {
  sessions = new Map<string, RefreshSessionEntity>();

  async create(data: Parameters<IRefreshSessionRepository['create']>[0]) {
    const entity: RefreshSessionEntity = {
      id: data.id,
      familyId: data.familyId,
      subjectType: data.subjectType,
      subjectId: data.subjectId,
      expiresAt: data.expiresAt,
      revokedAt: null,
      replacedById: null,
      createdAt: new Date(),
    };
    this.sessions.set(entity.id, entity);
    return entity;
  }
  async findById(id: string) {
    return this.sessions.get(id) ?? null;
  }
  async revokeIfActive(id: string, replacedById?: string) {
    const s = this.sessions.get(id);
    if (!s || s.revokedAt) return false;
    s.revokedAt = new Date();
    s.replacedById = replacedById ?? null;
    return true;
  }
  async revokeFamily(familyId: string) {
    for (const s of this.sessions.values()) if (s.familyId === familyId && !s.revokedAt) s.revokedAt = new Date();
  }
  async revokeAllForSubject(type: 'CLIENT' | 'USER', id: string) {
    for (const s of this.sessions.values())
      if (s.subjectType === type && s.subjectId === id && !s.revokedAt) s.revokedAt = new Date();
  }
  activeCount() {
    return [...this.sessions.values()].filter((s) => !s.revokedAt).length;
  }
}

function buildUser(overrides: Partial<UserWithRolesEntity> = {}): UserWithRolesEntity {
  return {
    id: 'user-1',
    email: 'consultor@va.ao',
    name: 'Consultor',
    passwordHash: 'hash',
    isActive: true,
    lastLoginAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    roles: [
      {
        role: {
          id: 'r1',
          name: 'CONSULTANT',
          permissions: [{ permission: { name: 'documents:read' } }, { permission: { name: 'documents:read' } }],
        },
      },
    ],
    ...overrides,
  };
}

describe('AuthSessionService', () => {
  let sessions: InMemoryRefreshSessionRepository;
  let clientRepository: IClientRepository;
  let userRepository: IUserRepository;
  let service: AuthSessionService;
  const tokenService = new JwtTokenService({
    accessSecret: 'test-access-secret-with-at-least-32-chars',
    refreshSecret: 'test-refresh-secret-with-at-least-32-chars',
    accessExpiresIn: '15m',
    refreshExpiresIn: '7d',
  });

  beforeEach(() => {
    sessions = new InMemoryRefreshSessionRepository();
    clientRepository = createClientRepositoryMock();
    vi.mocked(clientRepository.findById).mockResolvedValue(buildClient());
    userRepository = {
      ...createUserRepositoryMock(),
      findByIdWithRoles: vi.fn().mockResolvedValue(buildUser()),
      findByEmail: vi.fn(),
    };
    service = new AuthSessionService(tokenService, sessions, clientRepository, userRepository, new FakeUnitOfWork());
  });

  describe('resolveClaims', () => {
    it('cliente ativo recebe role CLIENT e permissões fixas', async () => {
      const claims = await service.resolveClaims('client', 'client-1');
      expect(claims?.roles).toEqual(['CLIENT']);
      expect(claims?.permissions).toContain('documents:read');
    });

    it.each([
      ['inativo', { isActive: false }],
      ['não verificado', { emailVerified: false }],
      ['apagado', { deletedAt: new Date() }],
    ])('cliente %s não tem claims', async (_l, overrides) => {
      vi.mocked(clientRepository.findById).mockResolvedValue(buildClient(overrides));
      expect(await service.resolveClaims('client', 'client-1')).toBeNull();
    });

    it('utilizador: permissões desduplicadas a partir das roles', async () => {
      const claims = await service.resolveClaims('user', 'user-1');
      expect(claims?.permissions).toEqual(['documents:read']);
      expect(claims?.roles).toEqual(['CONSULTANT']);
    });

    it('utilizador desativado não tem claims', async () => {
      vi.mocked(userRepository.findByIdWithRoles).mockResolvedValue(buildUser({ isActive: false }));
      expect(await service.resolveClaims('user', 'user-1')).toBeNull();
    });
  });

  describe('issue + refresh (rotação)', () => {
    it('login cria uma sessão persistida cujo id é o jti do refresh token', async () => {
      const claims = (await service.resolveClaims('user', 'user-1'))!;
      const tokens = await service.issue(claims, { ipAddress: '1.2.3.4' });

      const payload = tokenService.verifyRefreshToken(tokens.refreshToken);
      expect(sessions.sessions.get(payload.jti)).toBeDefined();
      expect(sessions.activeCount()).toBe(1);
    });

    it('refresh revoga a sessão atual e cria outra na mesma família', async () => {
      const claims = (await service.resolveClaims('user', 'user-1'))!;
      const first = await service.issue(claims, {});
      const firstJti = tokenService.verifyRefreshToken(first.refreshToken).jti;

      const { tokens } = await service.refresh(first.refreshToken, {});
      const secondJti = tokenService.verifyRefreshToken(tokens.refreshToken).jti;

      expect(secondJti).not.toBe(firstJti);
      expect(sessions.sessions.get(firstJti)?.revokedAt).not.toBeNull();
      expect(sessions.sessions.get(firstJti)?.replacedById).toBe(secondJti);
      expect(sessions.sessions.get(secondJti)?.familyId).toBe(sessions.sessions.get(firstJti)?.familyId);
      expect(sessions.activeCount()).toBe(1);
    });

    it('refresh recarrega permissões da base de dados (mudanças de role têm efeito)', async () => {
      const claims = (await service.resolveClaims('user', 'user-1'))!;
      const first = await service.issue(claims, {});

      vi.mocked(userRepository.findByIdWithRoles).mockResolvedValue(
        buildUser({ roles: [{ role: { id: 'r2', name: 'SUPPORT', permissions: [{ permission: { name: 'tickets:read' } }] } }] }),
      );
      const { tokens } = await service.refresh(first.refreshToken, {});

      expect(tokenService.verifyAccessToken(tokens.accessToken).permissions).toEqual(['tickets:read']);
    });

    it('reutilização de token já rodado fora da janela de tolerância revoga toda a família', async () => {
      const claims = (await service.resolveClaims('user', 'user-1'))!;
      const stolen = await service.issue(claims, {});
      await service.refresh(stolen.refreshToken, {});

      // Simula que a rotação aconteceu há mais de 30s
      const stolenJti = tokenService.verifyRefreshToken(stolen.refreshToken).jti;
      sessions.sessions.get(stolenJti)!.revokedAt = new Date(Date.now() - 60_000);

      await expect(service.refresh(stolen.refreshToken, {})).rejects.toThrow(UnauthorizedError);
      expect(sessions.activeCount()).toBe(0);
    });

    it('reutilização dentro da janela (corrida entre separadores) é rejeitada sem terminar a sessão legítima', async () => {
      const claims = (await service.resolveClaims('user', 'user-1'))!;
      const original = await service.issue(claims, {});
      await service.refresh(original.refreshToken, {});

      await expect(service.refresh(original.refreshToken, {})).rejects.toThrow(UnauthorizedError);
      expect(sessions.activeCount()).toBe(1);
    });

    it('conta desativada: refresh falha e revoga a família', async () => {
      const claims = (await service.resolveClaims('user', 'user-1'))!;
      const tokens = await service.issue(claims, {});

      vi.mocked(userRepository.findByIdWithRoles).mockResolvedValue(buildUser({ isActive: false }));

      await expect(service.refresh(tokens.refreshToken, {})).rejects.toThrow(/inativa/);
      expect(sessions.activeCount()).toBe(0);
    });

    it('utilizador apagado: refresh não emite tokens', async () => {
      const claims = (await service.resolveClaims('user', 'user-1'))!;
      const tokens = await service.issue(claims, {});
      vi.mocked(userRepository.findByIdWithRoles).mockResolvedValue(null);
      await expect(service.refresh(tokens.refreshToken, {})).rejects.toThrow(UnauthorizedError);
    });

    it('refresh token sem sessão persistida (ex.: emitido antes da migração) é rejeitado', async () => {
      const orphan = tokenService.generateTokenPair(
        { sub: 'user-1', email: 'x@x', type: 'user' },
        '00000000-0000-4000-8000-000000000000',
      );
      await expect(service.refresh(orphan.refreshToken, {})).rejects.toThrow(UnauthorizedError);
    });

    it('rejeita access token usado como refresh token', async () => {
      const claims = (await service.resolveClaims('user', 'user-1'))!;
      const tokens = await service.issue(claims, {});
      await expect(service.refresh(tokens.accessToken, {})).rejects.toThrow(UnauthorizedError);
    });
  });

  describe('revoke / revokeAllForSubject', () => {
    it('logout revoga a família do refresh token', async () => {
      const claims = (await service.resolveClaims('client', 'client-1'))!;
      const tokens = await service.issue(claims, {});
      await service.revoke(tokens.refreshToken);
      expect(sessions.activeCount()).toBe(0);
      await expect(service.refresh(tokens.refreshToken, {})).rejects.toThrow(UnauthorizedError);
    });

    it('logout com token inválido ou ausente não falha', async () => {
      await expect(service.revoke(undefined)).resolves.toBeUndefined();
      await expect(service.revoke('lixo')).resolves.toBeUndefined();
    });

    it('revokeAllForSubject termina todas as sessões (vários dispositivos)', async () => {
      const claims = (await service.resolveClaims('client', 'client-1'))!;
      await service.issue(claims, {});
      await service.issue(claims, {});
      expect(sessions.activeCount()).toBe(2);

      await service.revokeAllForSubject('client', 'client-1');
      expect(sessions.activeCount()).toBe(0);
    });
  });
});
