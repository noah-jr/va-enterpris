import { createHmac, randomInt, timingSafeEqual } from 'node:crypto';
import type { IOtpService } from '../../application/contracts/index.js';

/**
 * OTP de 6 dígitos guardado como HMAC-SHA256 com chave secreta. Um SHA-256 simples
 * de 6 dígitos seria revertido por força bruta em milissegundos se a BD vazasse.
 */
export class HmacOtpService implements IOtpService {
  constructor(private readonly secret: string) {}

  generate(): { code: string; hash: string } {
    const code = randomInt(0, 1_000_000).toString().padStart(6, '0');
    return { code, hash: this.hash(code) };
  }

  verify(code: string, hash: string): boolean {
    if (!/^\d{6}$/.test(code)) return false;
    const expected = Buffer.from(hash, 'hex');
    const actual = Buffer.from(this.hash(code), 'hex');
    return expected.length === actual.length && timingSafeEqual(expected, actual);
  }

  private hash(code: string): string {
    return createHmac('sha256', this.secret).update(code).digest('hex');
  }
}
