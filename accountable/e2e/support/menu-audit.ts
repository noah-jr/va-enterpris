import type { Page } from '@playwright/test';

export interface PageProblems {
  consoleErrors: string[];
  failedRequests: string[];
}

/**
 * Regista erros de consola e respostas da API com erro (≥ 400) enquanto a página é usada.
 * 401 em /auth/refresh e /auth/me no arranque são normais (verificação de sessão) e ignorados.
 */
export function watchPage(page: Page): { take: () => PageProblems } {
  let consoleErrors: string[] = [];
  let failedRequests: string[] = [];

  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    const text = msg.text();
    // Erros de rede já são capturados abaixo com mais contexto.
    if (text.startsWith('Failed to load resource')) return;
    consoleErrors.push(text.slice(0, 200));
  });
  page.on('pageerror', (err) => consoleErrors.push(`pageerror: ${err.message.slice(0, 200)}`));
  page.on('response', (res) => {
    const url = res.url();
    if (!url.includes('/api/v1/') || res.status() < 400) return;
    if (/\/auth\/(refresh|me)$/.test(new URL(url).pathname) && res.status() === 401) return;
    failedRequests.push(`${res.status()} ${res.request().method()} ${new URL(url).pathname}`);
  });

  return {
    take: () => {
      const result = { consoleErrors, failedRequests };
      consoleErrors = [];
      failedRequests = [];
      return result;
    },
  };
}
