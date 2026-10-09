const MAILHOG_API = process.env.TEST_MAILHOG_API ?? 'http://127.0.0.1:8025/api/v2';

interface MailHogMessage {
  Content: { Body: string; Headers: Record<string, string[]> };
}

function decodeQuotedPrintable(input: string): string {
  const soft = input.replace(/=\r?\n/g, '');
  const bytes: number[] = [];
  for (let i = 0; i < soft.length; i++) {
    const ch = soft[i]!;
    if (ch === '=' && /[0-9A-Fa-f]{2}/.test(soft.slice(i + 1, i + 3))) {
      bytes.push(parseInt(soft.slice(i + 1, i + 3), 16));
      i += 2;
    } else bytes.push(ch.charCodeAt(0));
  }
  return Buffer.from(bytes).toString('utf-8');
}

export interface Email {
  subject: string;
  body: string;
  code: string | null;
  link: string | null;
}

async function list(to: string): Promise<MailHogMessage[]> {
  const res = await fetch(`${MAILHOG_API}/search?kind=to&query=${encodeURIComponent(to)}`);
  return ((await res.json()) as { items: MailHogMessage[] }).items;
}

export async function countEmails(to: string): Promise<number> {
  return (await list(to)).length;
}

/** Espera por um email novo (além de `previous`) e extrai o código OTP e o link de ação. */
export async function waitForEmail(to: string, previous = 0, timeoutMs = 15_000): Promise<Email> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const items = await list(to);
    if (items.length > previous) {
      const body = decodeQuotedPrintable(items[0]!.Content.Body);
      return {
        subject: items[0]!.Content.Headers.Subject?.[0] ?? '',
        body,
        code: body.match(/data-otp="(\d{6})"/)?.[1] ?? null,
        link: body.match(/href="(https?:\/\/[^"]+token=[^"]+)"/)?.[1]?.replace(/&amp;/g, '&') ?? null,
      };
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  throw new Error(`Nenhum email novo para ${to}`);
}
