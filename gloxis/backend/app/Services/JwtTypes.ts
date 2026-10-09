export interface JwtPayload {
  userId: number
  email: string
  role?: string
  mustChangePassword?: boolean
  type: 'access' | 'refresh'
  iat?: number
  exp?: number
}

export interface TokenPair {
  token: string
  refreshToken: string
}

export interface IJwtService {
  generateToken(payload: Omit<JwtPayload, 'type'>, expiresIn?: string): string
  generateRefreshToken(payload: Omit<JwtPayload, 'type'>, expiresIn?: string): string
  verifyToken(token: string): JwtPayload | null
  verifyRefreshToken(token: string): JwtPayload | null
  addToBlacklist(token: string): Promise<void>
  isBlacklisted(token: string): Promise<boolean>
}
