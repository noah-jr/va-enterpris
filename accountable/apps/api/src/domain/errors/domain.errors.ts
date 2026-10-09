// Base domain error — all domain errors extend this
export class DomainError extends Error {
  public readonly code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = 'DomainError';
    this.code = code;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class NotFoundError extends DomainError {
  constructor(entity: string, id?: string) {
    const msg = id ? `${entity} com id '${id}' não encontrado` : `${entity} não encontrado`;
    super(msg, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends DomainError {
  constructor(message = 'Não autorizado') {
    super(message, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends DomainError {
  constructor(message = 'Acesso negado') {
    super(message, 'FORBIDDEN');
    this.name = 'ForbiddenError';
  }
}

export class ValidationError extends DomainError {
  public readonly details: Record<string, string[]>;

  constructor(message: string, details: Record<string, string[]> = {}) {
    super(message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
    this.details = details;
  }
}

export class ConflictError extends DomainError {
  constructor(message: string) {
    super(message, 'CONFLICT');
    this.name = 'ConflictError';
  }
}

export class BusinessRuleError extends DomainError {
  constructor(message: string) {
    super(message, 'BUSINESS_RULE_VIOLATION');
    this.name = 'BusinessRuleError';
  }
}

export class InvalidTokenError extends DomainError {
  constructor(message = 'Token inválido ou expirado') {
    super(message, 'INVALID_TOKEN');
    this.name = 'InvalidTokenError';
  }
}

export class RateLimitError extends DomainError {
  constructor(message = 'Demasiadas tentativas. Tente mais tarde.') {
    super(message, 'RATE_LIMIT');
    this.name = 'RateLimitError';
  }
}
