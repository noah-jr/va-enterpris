import { describe, it, expect } from 'vitest';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { JwtTokenService } from '../../infrastructure/auth/jwt.token-service.js';
import { createAuthMiddleware } from './auth.middleware.js';
import {
  requireAnyPermission,
  requirePermission,
  requirePermissionIfUser,
  requireSelfClientOrPermission,
} from './rbac.middleware.js';
import type { AccessTokenPayload } from '../../application/contracts/auth.contract.js';
import { ForbiddenError, UnauthorizedError } from '../../domain/errors/index.js';
import { DEFAULT_CLIENT_PERMISSIONS } from '../../domain/auth/client-permissions.js';

const reply = {} as FastifyReply;
const tokenService = new JwtTokenService({
  accessSecret: 'test-access-secret-with-at-least-32-chars',
  refreshSecret: 'test-refresh-secret-with-at-least-32-chars',
  accessExpiresIn: '15m',
  refreshExpiresIn: '7d',
});

function req(parts: { auth?: AccessTokenPayload; cookies?: Record<string, string>; headers?: Record<string, string>; params?: Record<string, string> }) {
  return {
    auth: parts.auth,
    cookies: parts.cookies ?? {},
    headers: parts.headers ?? {},
    params: parts.params ?? {},
  } as unknown as FastifyRequest<{ Params: { id: string } }>;
}

const user = (permissions: string[], roles: string[] = []): AccessTokenPayload => ({
  sub: 'u1',
  email: 'u@u',
  type: 'user',
  roles,
  permissions,
});
const client: AccessTokenPayload = { sub: 'c1', email: 'c@c', type: 'client' };

describe('authenticate', () => {
  const authenticate = createAuthMiddleware(tokenService);

  it('aceita a sessão via cookie httpOnly', async () => {
    const { accessToken } = tokenService.generateTokenPair(user(['documents:read']), 's1');
    const r = req({ cookies: { access_token: accessToken } });
    await authenticate(r, reply);
    expect(r.auth?.sub).toBe('u1');
  });

  it('ignora Authorization: Bearer (token nunca sai do cookie)', async () => {
    const { accessToken } = tokenService.generateTokenPair(user([]), 's1');
    await expect(authenticate(req({ headers: { authorization: `Bearer ${accessToken}` } }), reply)).rejects.toThrow(
      UnauthorizedError,
    );
  });

  it('força as permissões fixas do cliente, mesmo que o token traga outras', async () => {
    const { accessToken } = tokenService.generateTokenPair(
      { ...client, roles: ['ADMINISTRATOR'], permissions: ['users:create', 'backups:create'] },
      's1',
    );
    const r = req({ cookies: { access_token: accessToken } });
    await authenticate(r, reply);
    expect(r.auth?.roles).toEqual(['CLIENT']);
    expect(r.auth?.permissions).toEqual([...DEFAULT_CLIENT_PERMISSIONS]);
  });

  it('rejeita token inválido', async () => {
    await expect(authenticate(req({ cookies: { access_token: 'lixo' } }), reply)).rejects.toThrow(UnauthorizedError);
  });
});

describe('RBAC', () => {
  it('requirePermission: utilizador com a permissão passa', async () => {
    await expect(requirePermission('users:read')(req({ auth: user(['users:read']) }), reply)).resolves.toBeUndefined();
  });

  it('requirePermission: o NOME da role não dá acesso — só permissões', async () => {
    await expect(
      requirePermission('users:read')(req({ auth: user([], ['ADMINISTRATOR', 'ADMIN']) }), reply),
    ).rejects.toThrow(ForbiddenError);
  });

  it('requirePermission: clientes nunca passam', async () => {
    await expect(requirePermission('documents:read')(req({ auth: client }), reply)).rejects.toThrow(ForbiddenError);
  });

  it('requirePermission: sem autenticação → 401', async () => {
    await expect(requirePermission('x')(req({}), reply)).rejects.toThrow(UnauthorizedError);
  });

  it('requirePermissionIfUser: clientes passam; utilizadores precisam da permissão', async () => {
    await expect(requirePermissionIfUser('documents:read')(req({ auth: client }), reply)).resolves.toBeUndefined();
    await expect(requirePermissionIfUser('documents:read')(req({ auth: user([]) }), reply)).rejects.toThrow(
      ForbiddenError,
    );
  });

  it('requireSelfClientOrPermission: cliente só acede ao próprio id', async () => {
    const check = requireSelfClientOrPermission('clients:read');
    await expect(check(req({ auth: client, params: { id: 'c1' } }), reply)).resolves.toBeUndefined();
    await expect(check(req({ auth: client, params: { id: 'outro' } }), reply)).rejects.toThrow(ForbiddenError);
    await expect(check(req({ auth: user(['clients:read']), params: { id: 'x' } }), reply)).resolves.toBeUndefined();
    await expect(check(req({ auth: user([]), params: { id: 'x' } }), reply)).rejects.toThrow(ForbiddenError);
  });

  it('requireAnyPermission: basta uma', async () => {
    const check = requireAnyPermission(['a:1', 'b:2']);
    await expect(check(req({ auth: user(['b:2']) }), reply)).resolves.toBeUndefined();
    await expect(check(req({ auth: user(['c:3']) }), reply)).rejects.toThrow(ForbiddenError);
  });
});
