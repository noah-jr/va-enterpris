/**
 * Verificação do conteúdo real do ficheiro ("magic bytes"). O MIME type e a
 * extensão vêm do cliente e podem ser forjados; a assinatura binária não.
 */

const SIGNATURES = {
  pdf: Buffer.from('%PDF-', 'ascii'),
  png: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  jpeg: Buffer.from([0xff, 0xd8, 0xff]),
  /** ZIP (Office Open XML: .docx, .xlsx) */
  zip: Buffer.from([0x50, 0x4b, 0x03, 0x04]),
  /** OLE2 Compound File (Office legado: .doc, .xls) */
  ole2: Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]),
} as const;

/** O cabeçalho PDF pode ser precedido de lixo; a spec tolera-o no primeiro KB. */
const PDF_HEADER_SEARCH_WINDOW = 1024;
const TEXT_SNIFF_WINDOW = 8192;

function startsWith(buffer: Buffer, signature: Buffer): boolean {
  return buffer.length >= signature.length && buffer.subarray(0, signature.length).equals(signature);
}

function looksLikeText(buffer: Buffer): boolean {
  const sample = buffer.subarray(0, TEXT_SNIFF_WINDOW);
  // Byte NUL nunca aparece em texto UTF-8/ASCII — é o indicador clássico de binário.
  if (sample.includes(0x00)) return false;
  // Rejeita executáveis e outros binários conhecidos disfarçados de texto.
  const binaryPrefixes = [
    SIGNATURES.zip,
    SIGNATURES.ole2,
    SIGNATURES.png,
    Buffer.from('MZ', 'ascii'),
    Buffer.from([0x7f, 0x45, 0x4c, 0x46]), // ELF
  ];
  return !binaryPrefixes.some((prefix) => startsWith(sample, prefix));
}

const VALIDATORS: Record<string, (buffer: Buffer) => boolean> = {
  'application/pdf': (b) => b.subarray(0, PDF_HEADER_SEARCH_WINDOW).includes(SIGNATURES.pdf),
  'image/png': (b) => startsWith(b, SIGNATURES.png),
  'image/jpeg': (b) => startsWith(b, SIGNATURES.jpeg),
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': (b) =>
    startsWith(b, SIGNATURES.zip),
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': (b) =>
    startsWith(b, SIGNATURES.zip),
  'application/msword': (b) => startsWith(b, SIGNATURES.ole2),
  'application/vnd.ms-excel': (b) => startsWith(b, SIGNATURES.ole2),
  'text/plain': looksLikeText,
  'text/csv': looksLikeText,
};

/** `true` se o conteúdo corresponder ao MIME type declarado. MIME desconhecido → `false`. */
export function contentMatchesMimeType(buffer: Buffer, mimeType: string): boolean {
  const validator = VALIDATORS[mimeType.toLowerCase()];
  return validator !== undefined && validator(buffer);
}
