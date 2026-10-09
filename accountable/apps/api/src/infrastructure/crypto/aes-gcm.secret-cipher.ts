import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';
import type { ISecretCipher } from '../../application/contracts/index.js';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const TAG_LENGTH = 16;

/**
 * AES-256-GCM. Formato: base64url(iv | authTag | ciphertext).
 * A chave é derivada (SHA-256) do segredo configurado.
 */
export class AesGcmSecretCipher implements ISecretCipher {
  private readonly key: Buffer;

  constructor(secret: string) {
    this.key = createHash('sha256').update(secret).digest();
  }

  encrypt(plain: string): string {
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ALGORITHM, this.key, iv);
    const ciphertext = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
    return Buffer.concat([iv, cipher.getAuthTag(), ciphertext]).toString('base64url');
  }

  decrypt(encrypted: string): string | null {
    try {
      const raw = Buffer.from(encrypted, 'base64url');
      if (raw.length <= IV_LENGTH + TAG_LENGTH) return null;
      const iv = raw.subarray(0, IV_LENGTH);
      const tag = raw.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
      const ciphertext = raw.subarray(IV_LENGTH + TAG_LENGTH);
      const decipher = createDecipheriv(ALGORITHM, this.key, iv);
      decipher.setAuthTag(tag);
      return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
    } catch {
      return null;
    }
  }
}
