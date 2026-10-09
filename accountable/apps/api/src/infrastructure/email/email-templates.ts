/**
 * Templates institucionais de email. Todo o conteúdo dinâmico passa por `escapeHtml`
 * (nomes de clientes, títulos de documentos, etc. vêm de input de utilizadores).
 */

const BRAND = {
  name: 'VA OneGest',
  tagline: 'Plataforma de Tramitação Documental',
  primary: '#0B3B66',
  accent: '#C8A24A',
  text: '#1F2937',
  muted: '#6B7280',
  border: '#E5E7EB',
  background: '#F3F4F6',
};

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Só permite URLs http(s) em href — evita `javascript:` em links. */
function safeUrl(url: string): string {
  return /^https?:\/\//i.test(url) ? escapeHtml(url) : '#';
}

export function button(label: string, url: string): string {
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" style="margin:24px 0;">
      <tr><td style="border-radius:6px;background:${BRAND.primary};">
        <a href="${safeUrl(url)}" style="display:inline-block;padding:12px 28px;font-weight:600;font-size:15px;color:#ffffff;text-decoration:none;border-radius:6px;">
          ${escapeHtml(label)}
        </a>
      </td></tr>
    </table>`;
}

export function codeBox(code: string): string {
  return `
    <div style="margin:20px 0;padding:16px;border:1px dashed ${BRAND.accent};border-radius:8px;background:#FFFBEB;text-align:center;">
      <div style="font-size:12px;color:${BRAND.muted};text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">Código de verificação</div>
      <div data-otp="${escapeHtml(code)}" style="font-family:'Courier New',monospace;font-size:30px;font-weight:700;letter-spacing:8px;color:${BRAND.primary};">${escapeHtml(code)}</div>
    </div>`;
}

export function paragraph(html: string): string {
  return `<p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:${BRAND.text};">${html}</p>`;
}

export function note(html: string): string {
  return `<p style="margin:16px 0 0;font-size:13px;line-height:1.5;color:${BRAND.muted};">${html}</p>`;
}

export function layout(params: { title: string; preheader: string; body: string }): string {
  return `<!doctype html>
<html lang="pt">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(params.title)}</title></head>
<body style="margin:0;padding:0;background:${BRAND.background};font-family:Segoe UI,Helvetica,Arial,sans-serif;">
  <span style="display:none;max-height:0;overflow:hidden;">${escapeHtml(params.preheader)}</span>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${BRAND.background};padding:32px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:580px;background:#ffffff;border:1px solid ${BRAND.border};border-radius:10px;overflow:hidden;">
        <tr><td style="background:${BRAND.primary};padding:22px 32px;border-bottom:4px solid ${BRAND.accent};">
          <div style="font-size:20px;font-weight:700;color:#ffffff;letter-spacing:.3px;">${BRAND.name}</div>
          <div style="font-size:12px;color:#CBD5E1;margin-top:2px;">${BRAND.tagline}</div>
        </td></tr>
        <tr><td style="padding:32px;">
          <h1 style="margin:0 0 18px;font-size:20px;color:${BRAND.primary};">${escapeHtml(params.title)}</h1>
          ${params.body}
        </td></tr>
        <tr><td style="padding:18px 32px;background:#F9FAFB;border-top:1px solid ${BRAND.border};font-size:12px;color:${BRAND.muted};line-height:1.5;">
          Esta é uma mensagem automática da ${BRAND.name}. Não responda a este email.<br>
          Nunca lhe pediremos a sua senha por email ou telefone.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
