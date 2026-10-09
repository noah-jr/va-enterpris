// ============================================================
// IHasher — Password hashing contract
// ============================================================

export interface IHasher {
  hash(plain: string): Promise<string>;
  compare(plain: string, hash: string): Promise<boolean>;
}

// ============================================================
// ITokenService — JWT contract
// ============================================================

export interface AccessTokenPayload {
  sub: string;
  email: string;
  type: 'client' | 'user';
  roles?: string[];
  permissions?: string[];
}

export interface RefreshTokenPayload {
  sub: string;
  email: string;
  type: 'client' | 'user';
  /** Id da RefreshSession persistida. */
  jti: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  accessExpiresIn: number;
  refreshExpiresAt: Date;
}

export interface ITokenService {
  generateTokenPair(payload: AccessTokenPayload, refreshTokenId: string): TokenPair;
  verifyAccessToken(token: string): AccessTokenPayload;
  verifyRefreshToken(token: string): RefreshTokenPayload;
  generateSecureToken(): string;
  hashToken(token: string): string;
}
