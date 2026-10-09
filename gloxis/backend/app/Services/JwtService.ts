import jwt from 'jsonwebtoken'
import type { JwtPayload } from './JwtTypes.js'

export class JwtService {
  private static inMemoryBlacklist: Set<string> = new Set()

  private static get secret(): string {
    return process.env.APP_KEY || 'P5pT2ePYSvUhtFpdnAVBTH9MPeWFjtwz'
  }

  public static generateToken(
    payload: Omit<JwtPayload, 'type'>,
    expiresIn: string = '15m'
  ): string {
    return jwt.sign({ ...payload, type: 'access' }, this.secret, { expiresIn } as jwt.SignOptions)
  }

  public static generateRefreshToken(
    payload: Omit<JwtPayload, 'type'>,
    expiresIn: string = '7d'
  ): string {
    return jwt.sign({ ...payload, type: 'refresh' }, this.secret, { expiresIn } as jwt.SignOptions)
  }

  public static verifyToken(token: string): JwtPayload | null {
    try {
      const decoded = jwt.verify(token, this.secret) as JwtPayload
      if (!decoded || decoded.type !== 'access') return null
      if (this.inMemoryBlacklist.has(token)) return null
      return decoded
    } catch {
      return null
    }
  }

  public static verifyRefreshToken(token: string): JwtPayload | null {
    try {
      const decoded = jwt.verify(token, this.secret) as JwtPayload
      if (!decoded || decoded.type !== 'refresh') return null
      if (this.inMemoryBlacklist.has(token)) return null
      return decoded
    } catch {
      return null
    }
  }

  public static async addToBlacklist(
    token: string,
    _expiresInSeconds: number = 86400
  ): Promise<void> {
    this.inMemoryBlacklist.add(token)
  }

  public static async isBlacklisted(token: string): Promise<boolean> {
    return this.inMemoryBlacklist.has(token)
  }
}
