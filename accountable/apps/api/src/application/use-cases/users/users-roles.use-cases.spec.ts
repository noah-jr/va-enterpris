import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateUserUseCase, UpdateUserUseCase } from './users.use-cases.js';
import { CreateRoleUseCase, DeleteRoleUseCase, UpdateRoleUseCase } from './roles.use-cases.js';
import type { IRoleRepository, IUserRepository, RoleEntity } from '../../../domain/repositories/index.js';
import type { IEmailService, IHasher } from '../../contracts/index.js';
import type { AuthSessionService } from '../../services/auth-session.service.js';
import {
  BusinessRuleError,
  ConflictError,
  ForbiddenError,
  ValidationError,
} from '../../../domain/errors/index.js';
import {
  FakeUnitOfWork,
  buildUserWithRoles,
  createAuditRepositoryMock,
  createEmailServiceMock,
  createEmailTokens,
  createUserRepositoryMock,
} from '../../../__tests__/unit/fakes.js';

const PERMISSIONS = ['documents:read', 'users:read', 'roles:manage', 'reports:read'];

function role(overrides: Partial<RoleEntity>): RoleEntity {
  return { id: 'r1', name: 'CUSTOM', description: null, isSystem: false, permissions: ['documents:read'], usersCount: 0, ...overrides };
}

function createRoleRepository(roles: RoleEntity[]): IRoleRepository {
  return {
    list: vi.fn(async () => roles),
    findById: vi.fn(async (id) => roles.find((r) => r.id === id) ?? null),
    findByName: vi.fn(async (name) => roles.find((r) => r.name === name) ?? null),
    findByIds: vi.fn(async (ids) => roles.filter((r) => ids.includes(r.id))),
    create: vi.fn(async (data) => role({ id: 'new', ...data })),
    update: vi.fn(async (id, data) => ({ ...roles.find((r) => r.id === id)!, ...Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined)) })),
    delete: vi.fn(async () => undefined),
    listPermissions: vi.fn(async () => PERMISSIONS.map((name, i) => ({ id: `p${i}`, name, description: null }))),
  };
}

const hasher: IHasher = { hash: vi.fn(async (p: string) => `hashed:${p}`), compare: vi.fn() };
const ADMIN_ROLE = role({ id: 'admin', name: 'ADMINISTRATOR', isSystem: true, permissions: PERMISSIONS, usersCount: 1 });
const CONSULTANT_ROLE = role({ id: 'consultant', name: 'CONSULTANT', isSystem: true, permissions: ['documents:read'] });

// ====================================================================
describe('CreateUserUseCase', () => {
  let users: IUserRepository;
  let emailService: IEmailService;
  let roles: IRoleRepository;

  beforeEach(() => {
    users = createUserRepositoryMock();
    vi.mocked(users.findByEmail).mockResolvedValue(null);
    vi.mocked(users.create).mockImplementation(async (data) => ({ ...buildUserWithRoles({ id: 'u-new', email: data.email, name: data.name }) }));
    vi.mocked(users.findByIdWithRoles).mockResolvedValue(buildUserWithRoles({ id: 'u-new', email: 'novo@va.ao', name: 'Novo' }));
    emailService = createEmailServiceMock();
    roles = createRoleRepository([ADMIN_ROLE, CONSULTANT_ROLE]);
  });

  const build = () =>
    new CreateUserUseCase(users, roles, hasher, createEmailTokens().emailTokens, emailService, createAuditRepositoryMock(), new FakeUnitOfWork(), 'http://admin');

  it('sem senha: cria o utilizador e envia convite com link + código (72h)', async () => {
    await build().execute({ name: 'Novo', email: 'novo@va.ao', roleIds: ['consultant'] }, { actorId: 'admin-1', actorEmail: 'admin@va.ao' });

    expect(emailService.sendUserInvitation).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'novo@va.ao',
        inviteUrl: expect.stringMatching(/^http:\/\/admin\/reset-password\?token=[0-9a-f]{64}&invite=1$/),
        code: expect.stringMatching(/^\d{6}$/),
        expiresInHours: 72,
        invitedBy: 'admin@va.ao',
      }),
    );
    // A senha guardada é aleatória — o administrador não a conhece.
    const stored = vi.mocked(users.create).mock.calls[0]![0].passwordHash;
    expect(stored).toMatch(/^hashed:[0-9a-f]{64}$/);
  });

  it('com senha: não envia convite', async () => {
    await build().execute({ name: 'Novo', email: 'novo@va.ao', password: 'Senha!2026', roleIds: ['consultant'] }, { actorId: 'a' });
    expect(emailService.sendUserInvitation).not.toHaveBeenCalled();
    expect(vi.mocked(users.create).mock.calls[0]![0].passwordHash).toBe('hashed:Senha!2026');
  });

  it('email duplicado → 409; perfil inexistente → validação', async () => {
    vi.mocked(users.findByEmail).mockResolvedValueOnce(buildUserWithRoles());
    await expect(build().execute({ name: 'X Y', email: 'dup@va.ao', roleIds: ['consultant'] }, { actorId: 'a' })).rejects.toThrow(ConflictError);
    await expect(build().execute({ name: 'X Y', email: 'x@va.ao', roleIds: ['nao-existe'] }, { actorId: 'a' })).rejects.toThrow(ValidationError);
  });
});

// ====================================================================
describe('UpdateUserUseCase — proteção contra perda de acesso', () => {
  let users: IUserRepository;
  let sessions: AuthSessionService;
  const roles = createRoleRepository([ADMIN_ROLE, CONSULTANT_ROLE]);

  beforeEach(() => {
    users = createUserRepositoryMock();
    sessions = { revokeAllForSubject: vi.fn() } as unknown as AuthSessionService;
  });

  const build = () => new UpdateUserUseCase(users, roles, sessions, createAuditRepositoryMock(), new FakeUnitOfWork());

  it('não pode desativar-se a si próprio nem alterar os próprios perfis', async () => {
    vi.mocked(users.findByIdWithRoles).mockResolvedValue(buildUserWithRoles({ id: 'me' }, PERMISSIONS, 'ADMINISTRATOR'));
    await expect(build().execute('me', { isActive: false }, { actorId: 'me' })).rejects.toThrow(ForbiddenError);
    await expect(build().execute('me', { roleIds: ['consultant'] }, { actorId: 'me' })).rejects.toThrow(ForbiddenError);
  });

  it('não permite desativar o ÚLTIMO administrador ativo', async () => {
    vi.mocked(users.findByIdWithRoles).mockResolvedValue(buildUserWithRoles({ id: 'u2' }, PERMISSIONS, 'ADMINISTRATOR'));
    vi.mocked(users.countActiveWithPermission).mockResolvedValue(0);
    await expect(build().execute('u2', { isActive: false }, { actorId: 'me' })).rejects.toThrow(/último administrador/);
  });

  it('não permite retirar o perfil de administração ao último administrador', async () => {
    vi.mocked(users.findByIdWithRoles).mockResolvedValue(buildUserWithRoles({ id: 'u2' }, PERMISSIONS, 'ADMINISTRATOR'));
    vi.mocked(users.countActiveWithPermission).mockResolvedValue(0);
    await expect(build().execute('u2', { roleIds: ['consultant'] }, { actorId: 'me' })).rejects.toThrow(BusinessRuleError);
  });

  it('desativar ou mudar perfis termina as sessões do utilizador', async () => {
    vi.mocked(users.findByIdWithRoles).mockResolvedValue(buildUserWithRoles({ id: 'u2' }));
    await build().execute('u2', { isActive: false }, { actorId: 'me' });
    expect(sessions.revokeAllForSubject).toHaveBeenCalledWith('user', 'u2');

    await build().execute('u2', { roleIds: ['consultant'] }, { actorId: 'me' });
    expect(users.setRoles).toHaveBeenCalledWith('u2', ['consultant']);
  });

  it('mudar só o nome não termina sessões', async () => {
    vi.mocked(users.findByIdWithRoles).mockResolvedValue(buildUserWithRoles({ id: 'u2' }));
    await build().execute('u2', { name: 'Novo Nome' }, { actorId: 'me' });
    expect(sessions.revokeAllForSubject).not.toHaveBeenCalled();
  });
});

// ====================================================================
describe('Perfis (roles)', () => {
  const ctx = { actorId: 'admin-1' };

  it('cria perfil personalizado com permissões válidas; recusa permissões desconhecidas e nomes duplicados', async () => {
    const roles = createRoleRepository([CONSULTANT_ROLE]);
    const uc = new CreateRoleUseCase(roles, createAuditRepositoryMock(), new FakeUnitOfWork());

    const created = await uc.execute({ name: 'GESTOR', permissions: ['documents:read', 'reports:read'] }, ctx);
    expect(created.permissions).toEqual(['documents:read', 'reports:read']);

    await expect(uc.execute({ name: 'OUTRO', permissions: ['admin:everything'] }, ctx)).rejects.toThrow(/desconhecidas/);
    await expect(uc.execute({ name: 'CONSULTANT', permissions: ['documents:read'] }, ctx)).rejects.toThrow(ConflictError);
  });

  it('ADMINISTRATOR mantém sempre todas as permissões; perfis de sistema não são renomeados', async () => {
    const roles = createRoleRepository([ADMIN_ROLE, CONSULTANT_ROLE]);
    const uc = new UpdateRoleUseCase(roles, createAuditRepositoryMock(), new FakeUnitOfWork());

    await expect(uc.execute('admin', { permissions: ['documents:read'] }, ctx)).rejects.toThrow(/todas as permissões/);
    await expect(uc.execute('consultant', { name: 'RENOMEADO' }, ctx)).rejects.toThrow(/não podem ser renomeados/);
    await expect(uc.execute('consultant', { permissions: ['documents:read', 'reports:read'] }, ctx)).resolves.toBeDefined();
  });

  it('não elimina perfis de sistema nem perfis com utilizadores', async () => {
    const roles = createRoleRepository([ADMIN_ROLE, role({ id: 'busy', usersCount: 2 }), role({ id: 'free' })]);
    const uc = new DeleteRoleUseCase(roles, createAuditRepositoryMock(), new FakeUnitOfWork());

    await expect(uc.execute('admin', ctx)).rejects.toThrow(/sistema/);
    await expect(uc.execute('busy', ctx)).rejects.toThrow(/2 utilizador/);
    await uc.execute('free', ctx);
    expect(roles.delete).toHaveBeenCalledWith('free');
  });
});
