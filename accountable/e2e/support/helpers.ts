import { expect, type Page } from '@playwright/test';

export const CLIENT = { email: 'cliente@empresa.com', password: 'AccountableClient2026!' };
export const ADMIN = { email: 'admin@accountable.local', password: 'AccountableAdmin2026!' };

export const CLIENT_URL = 'http://localhost:5173';
export const ADMIN_URL = 'http://localhost:5174';

/** PDF mínimo válido (assinatura %PDF-) — passa a validação por magic bytes da API. */
export const SAMPLE_PDF = {
  name: 'balancete.pdf',
  mimeType: 'application/pdf',
  buffer: Buffer.from('%PDF-1.7\n1 0 obj << /Type /Catalog >> endobj\ntrailer << >>\n%%EOF\n'),
};

export const FAKE_EXE = {
  name: 'programa.exe',
  mimeType: 'application/x-msdownload',
  buffer: Buffer.concat([Buffer.from('MZ'), Buffer.alloc(64)]),
};

export async function loginClient(page: Page, credentials = CLIENT): Promise<void> {
  await page.goto(`${CLIENT_URL}/auth/login`);
  await page.getByLabel('Email Corporativo').fill(credentials.email);
  await page.locator('input[type="password"]').fill(credentials.password);
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
}

export async function loginAdmin(page: Page): Promise<void> {
  await page.goto(`${ADMIN_URL}/login`);
  await page.getByLabel('Email Profissional').fill(ADMIN.email);
  await page.getByLabel('Senha de Acesso').fill(ADMIN.password);
  await page.getByRole('button', { name: 'Aceder ao Painel' }).click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
}

export const uniqueSuffix = (): string => `${Date.now()}-${Math.floor(Math.random() * 1e4)}`;
