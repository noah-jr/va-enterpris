import type { FastifyRequest, FastifyReply } from 'fastify';
import { ForbiddenError, UnauthorizedError } from '../../domain/errors/index.js';
import type { AccessTokenPayload } from '../../application/contracts/auth.contract.js';

/**
 * Autorização baseada exclusivamente em permissões granulares — nunca em nomes de roles.
 * O ADMINISTRATOR tem acesso total porque o seed lhe atribui todas as permissões.
 */
export function hasPermission(auth: AccessTokenPayload, permission: string): boolean {
  return (auth.permissions ?? []).includes(permission);
}

function requireAuth(request: FastifyRequest): AccessTokenPayload {
  if (!request.auth) {
    throw new UnauthorizedError('Autenticação necessária');
  }
  return request.auth;
}

/** Rota exclusiva de utilizadores internos com a permissão indicada. */
export function requirePermission(permission: string) {
  return async function checkPermission(
    request: FastifyRequest,
    _reply: FastifyReply,
  ): Promise<void> {
    const auth = requireAuth(request);

    if (auth.type !== 'user') {
      throw new ForbiddenError('Acesso restrito a utilizadores internos');
    }

    if (!hasPermission(auth, permission)) {
      throw new ForbiddenError(`Permissão necessária: '${permission}'`);
    }
  };
}

/**
 * Para rotas partilhadas entre clientes e utilizadores internos, onde o próprio
 * use-case já restringe o cliente aos seus dados (ownership). Clientes passam
 * livremente; utilizadores internos têm de possuir a permissão indicada.
 */
export function requirePermissionIfUser(permission: string) {
  return async function checkPermissionIfUser(
    request: FastifyRequest,
    _reply: FastifyReply,
  ): Promise<void> {
    const auth = requireAuth(request);

    if (auth.type !== 'user') {
      return;
    }

    if (!hasPermission(auth, permission)) {
      throw new ForbiddenError(`Permissão necessária: '${permission}'`);
    }
  };
}

/**
 * Rota partilhada em que o recurso é um cliente identificado por `:id`: o cliente
 * só acede ao próprio registo; utilizadores internos precisam da permissão indicada.
 */
export function requireSelfClientOrPermission(permission: string) {
  return async function checkSelfClientOrPermission(
    request: FastifyRequest<{ Params: { id: string } }>,
    _reply: FastifyReply,
  ): Promise<void> {
    const auth = requireAuth(request);

    if (auth.type === 'client') {
      if (auth.sub !== request.params.id) {
        throw new ForbiddenError('Acesso restrito à própria entidade');
      }
      return;
    }

    if (!hasPermission(auth, permission)) {
      throw new ForbiddenError(`Permissão necessária: '${permission}'`);
    }
  };
}

/**
 * Permite verificar se o utilizador possui qualquer uma das permissões passadas (OR).
 */
export function requireAnyPermission(permissions: string[]) {
  return async function checkAnyPermission(
    request: FastifyRequest,
    _reply: FastifyReply,
  ): Promise<void> {
    const auth = requireAuth(request);

    if (auth.type !== 'user') {
      throw new ForbiddenError('Acesso restrito a utilizadores internos');
    }

    if (!permissions.some((p) => hasPermission(auth, p))) {
      throw new ForbiddenError(`Requer pelo menos uma das seguintes permissões: ${permissions.join(', ')}`);
    }
  };
}
