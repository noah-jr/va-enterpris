import type { FastifyRequest, FastifyReply } from 'fastify';
import type { ITokenService, AccessTokenPayload } from '../../application/contracts/auth.contract.js';
import { UnauthorizedError, ForbiddenError } from '../../domain/errors/index.js';
import { CLIENT_ROLE, DEFAULT_CLIENT_PERMISSIONS } from '../../domain/auth/client-permissions.js';

declare module 'fastify' {
  interface FastifyRequest {
    auth?: AccessTokenPayload;
  }
}

/** A sessão vive apenas no cookie httpOnly — o token nunca é exposto ao JavaScript. */
export function extractToken(request: FastifyRequest): string | null {
  return request.cookies?.access_token || null;
}

export function createAuthMiddleware(tokenService: ITokenService) {
  return async function authenticate(
    request: FastifyRequest,
    _reply: FastifyReply,
  ): Promise<void> {
    const token = extractToken(request);
    if (!token) {
      throw new UnauthorizedError('Sessão não encontrada ou expirada. Faça login novamente.');
    }

    let payload: AccessTokenPayload;
    try {
      payload = tokenService.verifyAccessToken(token);
    } catch {
      throw new UnauthorizedError('Sessão inválida ou expirada. Faça login novamente.');
    }

    // Clientes têm sempre o conjunto fixo de permissões, independentemente do que vier no token.
    request.auth =
      payload.type === 'client'
        ? { ...payload, roles: [CLIENT_ROLE], permissions: [...DEFAULT_CLIENT_PERMISSIONS] }
        : payload;
  };
}

export function createRequireClientMiddleware(tokenService: ITokenService) {
  const authenticate = createAuthMiddleware(tokenService);

  return async function requireClient(
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> {
    await authenticate(request, reply);
    if (request.auth?.type !== 'client') {
      throw new ForbiddenError('Acesso reservado apenas para clientes');
    }
  };
}

export function createRequireUserMiddleware(tokenService: ITokenService) {
  const authenticate = createAuthMiddleware(tokenService);

  return async function requireUser(
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> {
    await authenticate(request, reply);
    if (request.auth?.type !== 'user') {
      throw new ForbiddenError('Acesso reservado apenas para colaboradores internos');
    }
  };
}
