import { test, expect } from '@playwright/test';
import { ADMIN_URL, CLIENT, SAMPLE_PDF, loginAdmin } from '../support/helpers.js';
import { request } from '@playwright/test';

const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);
const CSV = Buffer.from('nif;valor;descricao\n500123;1500;Fatura Março\n500456;250;Recibo\n');
const DOCX = Buffer.concat([Buffer.from([0x50, 0x4b, 0x03, 0x04]), Buffer.alloc(64)]);

/** Cria (como cliente seed, via API) um processo com PDF, PNG, CSV e DOCX. */
async function createDocumentWithFiles(): Promise<{ id: string; title: string }> {
  const api = await request.newContext({ baseURL: 'http://localhost:3001' });
  expect((await api.post('/api/v1/auth/client/login', { data: CLIENT })).ok()).toBe(true);
  const title = `Visualizador E2E ${Date.now()}`;
  const doc = await (await api.post('/api/v1/documents', { data: { title, type: 'CONTRATO' } })).json();
  const files = [
    { name: SAMPLE_PDF.name, mimeType: 'application/pdf', buffer: SAMPLE_PDF.buffer },
    { name: 'recibo.png', mimeType: 'image/png', buffer: PNG },
    { name: 'extrato.csv', mimeType: 'text/csv', buffer: CSV },
    { name: 'relatorio.docx', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', buffer: DOCX },
  ];
  for (const f of files) {
    const res = await api.post(`/api/v1/documents/${doc.data.id}/files`, { multipart: { file: f } });
    expect(res.status(), await res.text()).toBe(201);
  }
  await api.dispose();
  return { id: doc.data.id as string, title };
}

test.describe('Admin — gestão do processo em página própria e visualização interna', () => {
  test('abre a página de gestão a partir da lista e visualiza cada formato dentro da plataforma', async ({ page }) => {
    const { id: documentId, title } = await createDocumentWithFiles();
    await loginAdmin(page);

    await page.goto(`${ADMIN_URL}/documents?search=${encodeURIComponent(title)}`);
    await page.locator(`a[href="/documents/${documentId}"]`).click();
    await expect(page).toHaveURL(new RegExp(`/documents/${documentId}$`));
    await expect(page.getByTestId('document-management-page')).toBeVisible();
    await expect(page.getByText('Documentos anexados (4)')).toBeVisible();
    await expect(page.getByTestId('status-history')).toBeVisible();

    const tabs = page.context().pages().length;
    await page.getByTestId(`open-file-${SAMPLE_PDF.name}`).click();
    const viewer = page.getByTestId('document-viewer');
    await expect(viewer.getByTestId('viewer-pdf')).toBeVisible();
    expect(page.context().pages().length).toBe(tabs);

    // Navegação entre anexos (→) — ordem mais recente primeiro depende da API; percorre todos.
    // Recua até ao primeiro anexo e depois percorre todos com "Documento seguinte".
    const previous = viewer.getByRole('button', { name: 'Documento anterior' });
    while (await previous.isEnabled()) await previous.click();
    await expect(viewer.getByText('1 de 4')).toBeVisible();

    const seen = new Set<string>();
    for (let i = 0; i < 4; i++) {
      seen.add((await viewer.getByTestId('viewer-file-name').textContent()) ?? '');
      const name = await viewer.getByTestId('viewer-file-name').textContent();
      if (name === 'recibo.png') await expect(viewer.getByTestId('viewer-image')).toBeVisible();
      if (name === 'extrato.csv') await expect(viewer.getByTestId('viewer-csv')).toContainText('Fatura Março');
      if (name === 'relatorio.docx') await expect(viewer.getByTestId('viewer-unsupported')).toContainText('Pré-visualização indisponível');
      if (name === SAMPLE_PDF.name) await expect(viewer.getByTestId('viewer-pdf')).toBeVisible();
      const next = viewer.getByRole('button', { name: 'Documento seguinte' });
      if (await next.isEnabled()) await next.click();
    }
    expect(seen.size).toBe(4);

    await viewer.getByRole('button', { name: 'Fechar visualizador' }).click();
    await expect(viewer).toBeHidden();
  });

  test('Ctrl+clique no processo abre a gestão noutro separador', async ({ page, context }) => {
    const { id: documentId, title } = await createDocumentWithFiles();
    await loginAdmin(page);
    await page.goto(`${ADMIN_URL}/documents?search=${encodeURIComponent(title)}`);

    const [popup] = await Promise.all([
      context.waitForEvent('page'),
      page.locator(`a[href="/documents/${documentId}"]`).click({ modifiers: ['ControlOrMeta'] }),
    ]);
    await popup.waitForLoadState();
    await expect(popup).toHaveURL(new RegExp(`/documents/${documentId}$`));
    await expect(popup.getByTestId('document-management-page')).toBeVisible();
  });
});
