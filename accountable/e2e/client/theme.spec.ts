import { test, expect } from '@playwright/test';
import { CLIENT_URL, loginClient } from '../support/helpers.js';
import { auditTheme, setThemePreference, summarize } from '../support/contrast.js';

const STORAGE_KEY = 'accountable-client-theme';

const PROTECTED_ROUTES = ['/dashboard', '/documents', '/documents/new', '/tickets', '/tickets/new', '/notifications', '/settings'];
const PUBLIC_ROUTES = [
  '/auth/login',
  '/auth/register',
  '/auth/verify-email?email=cliente%40empresa.com',
  '/auth/forgot-password',
  '/auth/reset-password?email=cliente%40empresa.com',
  `/publico/documentos/upload?token=${'0'.repeat(64)}`,
];

for (const theme of ['light', 'dark'] as const) {
  test.describe(`Cliente — tema ${theme === 'light' ? 'claro' : 'escuro'}: contraste e superfícies`, () => {
    test.beforeEach(async ({ page }) => {
      await setThemePreference(page, STORAGE_KEY, theme);
    });

    test('páginas públicas', async ({ page }) => {
      const failures: Record<string, string[]> = {};
      for (const route of PUBLIC_ROUTES) {
        await page.goto(`${CLIENT_URL}${route}`);
        await page.waitForLoadState('networkidle');
        const audit = await auditTheme(page);
        expect(audit.isDark, route).toBe(theme === 'dark');
        if (audit.issues.length > 0) failures[route] = summarize(audit.issues);
      }
      expect(failures).toEqual({});
    });

    test('páginas protegidas', async ({ page }) => {
      test.setTimeout(120_000);
      await loginClient(page);
      const failures: Record<string, string[]> = {};
      for (const route of PROTECTED_ROUTES) {
        await page.goto(`${CLIENT_URL}${route}`);
        await page.waitForLoadState('networkidle');
        const audit = await auditTheme(page);
        expect(audit.isDark, route).toBe(theme === 'dark');
        if (theme === 'light') expect(audit.surfaceLuminance, route).toBeGreaterThan(0.8);
        else expect(audit.surfaceLuminance, route).toBeLessThan(0.05);
        expect(audit.checked, `${route}: sem texto verificado`).toBeGreaterThan(5);
        if (audit.issues.length > 0) failures[route] = summarize(audit.issues);
      }
      expect(failures).toEqual({});
    });
  });
}

test('Cliente — a escolha de tema nas Definições persiste', async ({ page }) => {
  await setThemePreference(page, STORAGE_KEY, 'light');
  await loginClient(page);
  await page.goto(`${CLIENT_URL}/settings`);
  await page.getByTestId('theme-option-dark').click();
  await expect(page.locator('html')).toHaveClass(/dark/);
  await page.reload();
  await expect(page.locator('html')).toHaveClass(/dark/);
  await expect(page.getByTestId('theme-option-dark')).toHaveAttribute('aria-checked', 'true');
});
