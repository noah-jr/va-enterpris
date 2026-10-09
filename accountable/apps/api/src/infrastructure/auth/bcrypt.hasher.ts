import bcrypt from 'bcryptjs';
import type { IHasher } from '../../application/contracts/index.js';

export class BcryptHasher implements IHasher {
  constructor(private readonly rounds: number = 12) {}

  async hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, this.rounds);
  }

  async compare(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }
}
