import { test, expect } from '@playwright/test';

test.describe('Landing — smoke', () => {
  test('carrega a página e mostra todas as secções principais', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/.+/);
    await expect(page.locator('nav')).toBeVisible();

    const sectionHeadingCount = await page.locator('main h2').count();
    expect(sectionHeadingCount).toBeGreaterThan(0);

    await expect(page.locator('footer')).toBeVisible();
  });

  test('o link para a área de cliente aponta para o portal correto', async ({ page }) => {
    await page.goto('/');

    const clientLink = page.locator('a[href*="localhost:5173"]').first();
    await expect(clientLink).toBeVisible();
  });

  test('planos públicos são carregados da API', async ({ page }) => {
    const plansResponse = page.waitForResponse((r) => r.url().includes('/api/v1/plans') && r.status() === 200);
    await page.goto('/');
    await plansResponse;
  });

  test('formulário de contacto envia um pedido e mostra confirmação', async ({ page }) => {
    await page.goto('/');

    await page.getByPlaceholder('Ex: Dra. Ana Silva').fill('Lead E2E');
    await page.getByPlaceholder('nome@empresa.pt').fill(`lead-e2e-${Date.now()}@example.com`);
    await page.getByPlaceholder('Sociedade de Advogados / Consultora').fill('Empresa E2E Lda');
    await page
      .getByPlaceholder(/Descreva eventuais integrações necessárias/)
      .fill('Pretendemos uma demonstração da plataforma para a nossa equipa.');

    const submitted = page.waitForResponse((r) => r.url().endsWith('/api/v1/contact'));
    await page.getByRole('button', { name: 'Solicitar Agendamento de Demonstração' }).click();
    expect((await submitted).status()).toBeLessThan(300);

    await expect(page.getByText('Obrigado pelo seu contacto.', { exact: false })).toBeVisible({ timeout: 10_000 });
  });
});
