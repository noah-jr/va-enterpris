/**
 * Só `development` e `test` são tratados como ambientes locais. Qualquer outro valor —
 * incluindo `NODE_ENV` não definido — é tratado como produção (fail-safe).
 */
export function isLocalEnvironment(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.NODE_ENV === 'development' || env.NODE_ENV === 'test';
}

/**
 * Converte `TRUST_PROXY` para a opção `trustProxy` do Fastify.
 * - não definido / "false" → false (não confia em X-Forwarded-For)
 * - "true"                 → true (só atrás de um proxy que reescreve sempre o cabeçalho)
 * - número                 → nº de saltos de proxy em que confiar
 * - lista separada por ",": IPs/CIDRs de proxies confiáveis
 */
export function parseTrustProxy(value: string | undefined = process.env.TRUST_PROXY): boolean | number | string[] {
  const raw = value?.trim();
  if (!raw || raw.toLowerCase() === 'false') return false;
  if (raw.toLowerCase() === 'true') return true;
  if (/^\d+$/.test(raw)) return parseInt(raw, 10);
  return raw
    .split(',')
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}

/**
 * Remove segredos de URLs antes de irem para os logs: parâmetros `token` na query
 * e o segmento do token nos links públicos de upload.
 */
export function redactUrlSecrets(url: string): string {
  return url
    .replace(/([?&]token=)[^&#]*/gi, '$1[REDACTED]')
    .replace(/(\/public\/upload-links\/)[^/?#]+/i, '$1[REDACTED]');
}
