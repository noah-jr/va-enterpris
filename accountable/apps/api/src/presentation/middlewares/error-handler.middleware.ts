import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import type { ApiError } from '@accountable/types';
import {
  DomainError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ValidationError,
  ConflictError,
  BusinessRuleError,
  InvalidTokenError,
  RateLimitError,
} from '../../domain/errors/index.js';
import { isLocalEnvironment } from '../../infrastructure/config/runtime.js';

export function errorHandler(
  error: FastifyError | Error,
  request: FastifyRequest,
  reply: FastifyReply,
): void {
  const timestamp = new Date().toISOString();

  // 1. Zod validation error
  if (error instanceof ZodError) {
    const details: Record<string, string[]> = {};
    for (const issue of error.issues) {
      const path = issue.path.join('.') || '_global';
      if (!details[path]) details[path] = [];
      details[path].push(issue.message);
    }

    const payload: ApiError = {
      code: 'VALIDATION_ERROR',
      message: 'Dados de entrada inválidos',
      details,
      timestamp,
    };

    reply.status(400).send(payload);
    return;
  }

  // 2. Domain ValidationError
  if (error instanceof ValidationError) {
    const payload: ApiError = {
      code: error.code,
      message: error.message,
      details: error.details,
      timestamp,
    };
    reply.status(400).send(payload);
    return;
  }

  // 3. Unauthorized / Invalid Token
  if (error instanceof UnauthorizedError || error instanceof InvalidTokenError) {
    const payload: ApiError = {
      code: error.code,
      message: error.message,
      timestamp,
    };
    reply.status(401).send(payload);
    return;
  }

  // 4. Forbidden
  if (error instanceof ForbiddenError) {
    const payload: ApiError = {
      code: error.code,
      message: error.message,
      timestamp,
    };
    reply.status(403).send(payload);
    return;
  }

  // 5. Not Found
  if (error instanceof NotFoundError) {
    const payload: ApiError = {
      code: error.code,
      message: error.message,
      timestamp,
    };
    reply.status(404).send(payload);
    return;
  }

  // 6. Conflict
  if (error instanceof ConflictError) {
    const payload: ApiError = {
      code: error.code,
      message: error.message,
      timestamp,
    };
    reply.status(409).send(payload);
    return;
  }

  // 7. Business Rule Violation
  if (error instanceof BusinessRuleError) {
    const payload: ApiError = {
      code: error.code,
      message: error.message,
      timestamp,
    };
    reply.status(422).send(payload);
    return;
  }

  // 8. Rate Limit
  if (error instanceof RateLimitError || ('statusCode' in error && error.statusCode === 429)) {
    const payload: ApiError = {
      code: 'RATE_LIMIT',
      message: 'Demasiadas tentativas. Tente mais tarde.',
      timestamp,
    };
    reply.status(429).send(payload);
    return;
  }

  // 9. Other Domain Errors
  if (error instanceof DomainError) {
    const payload: ApiError = {
      code: error.code,
      message: error.message,
      timestamp,
    };
    reply.status(400).send(payload);
    return;
  }

  // 10. Unexpected / Server errors (Never expose stack traces in production)
  request.log.error(error);

  const payload: ApiError = {
    code: 'INTERNAL_SERVER_ERROR',
    message: isLocalEnvironment()
      ? error.message
      : 'Ocorreu um erro interno. Tente novamente mais tarde.',
    timestamp,
  };

  reply.status(500).send(payload);
}
