import { test, expect } from '@playwright/test';
import { ADMIN_URL, loginAdmin } from '../support/helpers.js';
import { watchPage } from '../support/menu-audit.js';

test.describe('Admin — todos os menus funcionam', () => {
  test('cada item da barra lateral abre a sua página sem erros', async ({ page }) => {
    test.setTimeout(180_000);
    const watcher = watchPage(page);
    await page.setViewportSize({ width: 1440, height: 900 });
    await loginAdmin(page);
    watcher.take();

    const sidebar = page.locator('aside nav');
    const items = await sidebar.locator('a').evaluateAll((links) =>
      links.map((a) => ({ label: (a.textContent ?? '').trim(), href: a.getAttribute('href') ?? '' })),
    );
    // + Definições (fora da <nav>)
    items.push({ label: 'Definições', href: '/settings' });
    expect(items.length).toBeGreaterThan(10);

    const problems: Record<string, unknown> = {};
    for (const item of items) {
      await page.locator(`aside a[href="${item.href}"]`).first().click();
      await expect(page, item.label).toHaveURL(new RegExp(`${item.href}$`));
      await page.waitForLoadState('networkidle');

      const main = page.locator('main');
      await expect(main.locator('h1, h2').first(), `${item.label}: sem título`).toBeVisible();
      await expect(main, `${item.label}: página vazia`).not.toHaveText(/^\s*$/);

      const found = watcher.take();
      if (found.consoleErrors.length || found.failedRequests.length) problems[`${item.label} (${item.href})`] = found;
    }

    expect(problems).toEqual({});
  });

  test('menus do cabeçalho: notificações, tickets, utilizador e pesquisa', async ({ page }) => {
    const watcher = watchPage(page);
    await loginAdmin(page);
    watcher.take();

    await page.getByRole('button', { name: 'Notificações' }).click();
    await expect(page.getByRole('menu').or(page.getByText(/Notificações/).nth(1))).toBeVisible();
    await page.keyboard.press('Escape');

    await page.getByRole('button', { name: /Tickets de suporte/ }).click();
    await expect(page).toHaveURL(/\/tickets/);

    await page.getByRole('button', { name: /Menu do utilizador/i }).click();
    await expect(page.getByText('admin@accountable.local').last()).toBeVisible();
    await page.keyboard.press('Escape');

    await page.getByPlaceholder(/Pesquisar/).first().fill('a');
    await page.waitForLoadState('networkidle');

    expect(watcher.take()).toEqual({ consoleErrors: [], failedRequests: [] });
  });
});
