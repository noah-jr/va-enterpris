import { test, expect } from '@playwright/test';
import { loginClient } from '../support/helpers.js';
import { watchPage } from '../support/menu-audit.js';

test.describe('Cliente — todos os menus funcionam', () => {
  test('cada item da barra lateral e o botão Novo Processo abrem sem erros', async ({ page }) => {
    test.setTimeout(120_000);
    const watcher = watchPage(page);
    await page.setViewportSize({ width: 1440, height: 900 });
    await loginClient(page);
    watcher.take();

    const items = await page.locator('aside a').evaluateAll((links) =>
      links.map((a) => ({ label: (a.textContent ?? '').trim(), href: a.getAttribute('href') ?? '' })),
    );
    expect(items.length).toBeGreaterThanOrEqual(6);

    const problems: Record<string, unknown> = {};
    for (const item of items) {
      await page.locator(`aside a[href="${item.href}"]`).first().click();
      await expect(page, item.label).toHaveURL(new RegExp(`${item.href}$`));
      await page.waitForLoadState('networkidle');
      await expect(page.locator('main h1, main h2').first(), `${item.label}: sem título`).toBeVisible();

      const found = watcher.take();
      if (found.consoleErrors.length || found.failedRequests.length) problems[`${item.label} (${item.href})`] = found;
    }

    expect(problems).toEqual({});
  });

  test('menus do cabeçalho: notificações e utilizador (incl. terminar sessão)', async ({ page }) => {
    const watcher = watchPage(page);
    await loginClient(page);
    watcher.take();

    await page.getByRole('button', { name: /Notificações/ }).first().click();
    await page.keyboard.press('Escape');

    await page.getByRole('button', { name: 'Menu do Utilizador' }).click();
    await expect(page.getByText('Terminar Sessão')).toBeVisible();
    expect(watcher.take()).toEqual({ consoleErrors: [], failedRequests: [] });

    await page.getByText('Terminar Sessão').click();
    await expect(page).toHaveURL(/\/auth\/login/);
  });
});
