import { MAILHOG_API } from './constants.js';

interface MailHogMessage {
  Content: { Body: string; Headers: Record<string, string[]> };
  To: Array<{ Mailbox: string; Domain: string }>;
}

interface MailHogSearchResponse {
  items: MailHogMessage[];
}

function decodeQuotedPrintableBytes(input: string): Buffer {
  const withoutSoftBreaks = input.replace(/=\r\n/g, '');
  const bytes: number[] = [];
  for (let i = 0; i < withoutSoftBreaks.length; i++) {
    const char = withoutSoftBreaks[i] ?? '';
    if (char === '=' && /[0-9A-Fa-f]{2}/.test(withoutSoftBreaks.slice(i + 1, i + 3))) {
      bytes.push(parseInt(withoutSoftBreaks.slice(i + 1, i + 3), 16));
      i += 2;
    } else {
      bytes.push(char.charCodeAt(0));
    }
  }
  return Buffer.from(bytes);
}

function decodeQuotedPrintable(input: string): string {
  return decodeQuotedPrintableBytes(input).toString('utf-8');
}

function decodeMimeEncodedWords(input: string): string {
  return input
    .replace(/\?=\s+=\?/g, '?==?')
    .replace(/=\?UTF-8\?Q\?(.*?)\?=/gi, (_match, encoded: string) =>
      decodeQuotedPrintable(encoded.replace(/_/g, ' ')),
    );
}

export async function findLatestTokenForEmail(
  email: string,
  timeoutMs = 10_000,
): Promise<string> {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const res = await fetch(
      `${MAILHOG_API}/search?kind=to&query=${encodeURIComponent(email)}`,
    );
    const data = (await res.json()) as MailHogSearchResponse;

    const latest = data.items[0];
    if (latest) {
      const decoded = decodeQuotedPrintable(latest.Content.Body);
      // Tokens atuais: 64 hex (256 bits). Mantém compatibilidade com UUID (legado).
      const match =
        decoded.match(/token=([0-9a-f]{64})/i) ??
        decoded.match(/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
      if (match?.[1]) return match[1];
    }

    await new Promise((resolve) => setTimeout(resolve, 400));
  }

  throw new Error(`Nenhum email com token encontrado para ${email} dentro do tempo limite.`);
}

export async function findLatestEmailSubject(
  toEmail: string,
  subjectContains: string,
  timeoutMs = 10_000,
): Promise<string> {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const res = await fetch(`${MAILHOG_API}/search?kind=to&query=${encodeURIComponent(toEmail)}`);
    const data = (await res.json()) as MailHogSearchResponse;

    const match = data.items.find((item) =>
      decodeMimeEncodedWords(item.Content.Headers.Subject?.[0] ?? '').includes(subjectContains),
    );
    if (match) return decodeMimeEncodedWords(match.Content.Headers.Subject?.[0] ?? '');

    await new Promise((resolve) => setTimeout(resolve, 400));
  }

  throw new Error(
    `Nenhum email para ${toEmail} com assunto contendo "${subjectContains}" dentro do tempo limite.`,
  );
}

interface MailHogFullMessage {
  Content: { Body: string; Headers: Record<string, string[]> };
  Created: string;
}

export interface ReceivedEmail {
  subject: string;
  from: string;
  body: string;
  token: string | null;
  code: string | null;
}

async function listEmailsTo(email: string): Promise<MailHogFullMessage[]> {
  const res = await fetch(`${MAILHOG_API}/search?kind=to&query=${encodeURIComponent(email)}`);
  return ((await res.json()) as { items: MailHogFullMessage[] }).items;
}

function parseEmail(message: MailHogFullMessage): ReceivedEmail {
  const body = decodeQuotedPrintable(message.Content.Body);
  return {
    subject: decodeMimeEncodedWords(message.Content.Headers.Subject?.[0] ?? ''),
    from: decodeMimeEncodedWords(message.Content.Headers.From?.[0] ?? ''),
    body,
    token: body.match(/token=([0-9a-f]{64})/i)?.[1] ?? null,
    code: body.match(/data-otp="(\d{6})"/)?.[1] ?? null,
  };
}

/** Número de emails já recebidos por um destinatário (para esperar pelo próximo). */
export async function countEmailsTo(email: string): Promise<number> {
  return (await listEmailsTo(email)).length;
}

/**
 * Espera por um email NOVO (além dos `previousCount` já existentes) cujo assunto contenha `subjectContains`.
 */
export async function waitForNewEmail(
  email: string,
  previousCount: number,
  subjectContains = '',
  timeoutMs = 10_000,
): Promise<ReceivedEmail> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const items = await listEmailsTo(email);
    if (items.length > previousCount) {
      const normalize = (str: string) =>
        str
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase();
      const query = normalize(subjectContains);
      const match = items
        .slice(0, items.length - previousCount)
        .map(parseEmail)
        .find((m) => (query ? normalize(m.subject).includes(query) : true));
      if (match) return match;
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error(`Nenhum email novo para ${email} com assunto "${subjectContains}".`);
}
