// ============================================================
// ISecretCipher — cifra simétrica para segredos que precisam de ser recuperados
// ============================================================

export interface ISecretCipher {
  encrypt(plain: string): string;
  /** Devolve `null` se o valor não puder ser decifrado (chave rodada, dados corrompidos). */
  decrypt(encrypted: string): string | null;
}
