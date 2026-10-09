import { test, expect } from '@playwright/test';
import { ADMIN_URL, loginAdmin } from '../support/helpers.js';
import { auditTheme, setThemePreference, summarize } from '../support/contrast.js';

const STORAGE_KEY = 'accountable-admin-theme';

const PROTECTED_ROUTES = [
  '/dashboard',
  '/documents',
  '/clients',
  '/subscriptions',
  '/plans',
  '/leads',
  '/users',
  '/roles',
  '/document-types',
  '/audit',
  '/backups',
  '/tickets',
  '/notifications',
  '/settings',
];
const PUBLIC_ROUTES = ['/login', '/forgot-password', '/reset-password'];

for (const theme of ['light', 'dark'] as const) {
  test.describe(`Admin — tema ${theme === 'light' ? 'claro' : 'escuro'}: contraste e superfícies`, () => {
    test.beforeEach(async ({ page }) => {
      await setThemePreference(page, STORAGE_KEY, theme);
    });

    for (const route of PUBLIC_ROUTES) {
      test(`${route}`, async ({ page }) => {
        await page.goto(`${ADMIN_URL}${route}`);
        await page.waitForLoadState('networkidle');
        const audit = await auditTheme(page);

        expect(audit.isDark).toBe(theme === 'dark');
        expect(summarize(audit.issues)).toEqual([]);
      });
    }

    test('páginas protegidas', async ({ page }) => {
      test.setTimeout(120_000);
      await loginAdmin(page);
      const failures: Record<string, unknown> = {};

      for (const route of PROTECTED_ROUTES) {
        await page.goto(`${ADMIN_URL}${route}`);
        await page.waitForLoadState('networkidle');
        const audit = await auditTheme(page);

        expect(audit.isDark, route).toBe(theme === 'dark');
        // A área principal tem de acompanhar o tema (claro = fundo claro, escuro = fundo escuro).
        if (theme === 'light') expect(audit.surfaceLuminance, route).toBeGreaterThan(0.8);
        else expect(audit.surfaceLuminance, route).toBeLessThan(0.05);
        expect(audit.checked, `${route}: sem texto verificado`).toBeGreaterThan(5);
        if (audit.issues.length > 0) failures[route] = summarize(audit.issues);
      }

      expect(failures).toEqual({});
    });
  });
}

test.describe('Admin — alternância de tema', () => {
  test('o botão alterna e a escolha persiste após recarregar', async ({ page }) => {
    await setThemePreference(page, STORAGE_KEY, 'light');
    await loginAdmin(page);

    await expect(page.locator('html')).not.toHaveClass(/dark/);
    await page.getByTestId('theme-toggle').first().click();
    await expect(page.locator('html')).toHaveClass(/dark/);

    await page.reload();
    await expect(page.locator('html')).toHaveClass(/dark/);
  });

  test('preferência "Sistema" segue o sistema operativo', async ({ browser }) => {
    const context = await browser.newContext({ colorScheme: 'dark' });
    const page = await context.newPage();
    await loginAdmin(page);
    await page.goto(`${ADMIN_URL}/settings`);
    await page.getByRole('tab', { name: 'Aparência' }).click();

    await page.getByTestId('theme-option-light').click();
    await expect(page.locator('html')).not.toHaveClass(/dark/);

    await page.getByTestId('theme-option-system').click();
    await expect(page.locator('html')).toHaveClass(/dark/);

    await page.emulateMedia({ colorScheme: 'light' });
    await expect(page.locator('html')).not.toHaveClass(/dark/);
    await context.close();
  });
});
