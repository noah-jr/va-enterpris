import type { FastifyPluginAsync } from 'fastify';
import type { UserController } from '../controllers/user.controller.js';
import type { ITokenService } from '../../application/contracts/auth.contract.js';
import { createRequireUserMiddleware } from '../middlewares/auth.middleware.js';
import { requirePermission } from '../middlewares/rbac.middleware.js';

export interface UserRoutesOptions {
  userController: UserController;
  tokenService: ITokenService;
}

export const userRoutes: FastifyPluginAsync<UserRoutesOptions> = async (fastify, opts) => {
  const { userController, tokenService } = opts;
  fastify.addHook('preHandler', createRequireUserMiddleware(tokenService));

  fastify.get('/', { preHandler: [requirePermission('users:read')] }, (req, rep) => userController.list(req, rep));
  fastify.post('/', { preHandler: [requirePermission('users:create')] }, (req, rep) => userController.create(req, rep));
  fastify.patch<{ Params: { id: string } }>(
    '/:id',
    { preHandler: [requirePermission('users:update')] },
    (req, rep) => userController.update(req, rep),
  );
  fastify.post<{ Params: { id: string } }>(
    '/:id/send-password-reset',
    { preHandler: [requirePermission('users:update')] },
    (req, rep) => userController.sendPasswordReset(req, rep),
  );
};

/** Perfis (roles) e catálogo de permissões. */
export const roleRoutes: FastifyPluginAsync<UserRoutesOptions> = async (fastify, opts) => {
  const { userController, tokenService } = opts;
  fastify.addHook('preHandler', createRequireUserMiddleware(tokenService));

  fastify.get('/', { preHandler: [requirePermission('users:read')] }, (req, rep) => userController.listRoles(req, rep));
  fastify.get('/permissions', { preHandler: [requirePermission('users:read')] }, (req, rep) =>
    userController.listPermissions(req, rep),
  );
  fastify.post('/', { preHandler: [requirePermission('roles:manage')] }, (req, rep) => userController.createRole(req, rep));
  fastify.patch<{ Params: { id: string } }>(
    '/:id',
    { preHandler: [requirePermission('roles:manage')] },
    (req, rep) => userController.updateRole(req, rep),
  );
  fastify.delete<{ Params: { id: string } }>(
    '/:id',
    { preHandler: [requirePermission('roles:manage')] },
    (req, rep) => userController.deleteRole(req, rep),
  );
};
