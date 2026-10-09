import jwt from 'jsonwebtoken';
import { createHash, randomBytes } from 'node:crypto';
import { UnauthorizedError } from '../../domain/errors/index.js';
import type {
  ITokenService,
  AccessTokenPayload,
  RefreshTokenPayload,
  TokenPair,
} from '../../application/contracts/index.js';

interface JwtConfig {
  accessSecret: string;
  refreshSecret: string;
  accessExpiresIn: string;
  refreshExpiresIn: string;
}

const ALGORITHM = 'HS256';

function isRefreshPayload(value: unknown): value is RefreshTokenPayload {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.sub === 'string' &&
    typeof v.email === 'string' &&
    typeof v.jti === 'string' &&
    (v.type === 'client' || v.type === 'user')
  );
}

function isAccessPayload(value: unknown): value is AccessTokenPayload {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.sub === 'string' &&
    typeof v.email === 'string' &&
    (v.type === 'client' || v.type === 'user')
  );
}

export class JwtTokenService implements ITokenService {
  constructor(private readonly config: JwtConfig) {}

  generateTokenPair(payload: AccessTokenPayload, refreshTokenId: string): TokenPair {
    const { sub, email, type, roles, permissions } = payload;

    const accessToken = jwt.sign(
      { sub, email, type, roles, permissions },
      this.config.accessSecret,
      {
        algorithm: ALGORITHM,
        expiresIn: this.config.accessExpiresIn as jwt.SignOptions['expiresIn'],
      },
    );

    const refreshToken = jwt.sign({ sub, email, type }, this.config.refreshSecret, {
      algorithm: ALGORITHM,
      expiresIn: this.config.refreshExpiresIn as jwt.SignOptions['expiresIn'],
      jwtid: refreshTokenId,
    });

    const accessDecoded = jwt.decode(accessToken) as { exp: number; iat: number } | null;
    const accessExpiresIn = accessDecoded !== null ? accessDecoded.exp - accessDecoded.iat : 900;

    const refreshDecoded = jwt.decode(refreshToken) as { exp: number } | null;
    const refreshExpiresAt = new Date((refreshDecoded?.exp ?? 0) * 1000);

    return { accessToken, refreshToken, accessExpiresIn, refreshExpiresAt };
  }

  verifyAccessToken(token: string): AccessTokenPayload {
    let decoded: unknown;
    try {
      decoded = jwt.verify(token, this.config.accessSecret, { algorithms: [ALGORITHM] });
    } catch {
      throw new UnauthorizedError('Token de acesso inválido ou expirado.');
    }
    if (!isAccessPayload(decoded)) {
      throw new UnauthorizedError('Token de acesso inválido ou expirado.');
    }
    return decoded;
  }

  verifyRefreshToken(token: string): RefreshTokenPayload {
    let decoded: unknown;
    try {
      decoded = jwt.verify(token, this.config.refreshSecret, { algorithms: [ALGORITHM] });
    } catch {
      throw new UnauthorizedError('Token de renovação inválido ou expirado.');
    }
    if (!isRefreshPayload(decoded)) {
      throw new UnauthorizedError('Token de renovação inválido ou expirado.');
    }
    return decoded;
  }

  generateSecureToken(): string {
    return randomBytes(32).toString('hex');
  }

  hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
