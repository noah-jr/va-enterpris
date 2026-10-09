import * as React from 'react';
import { ChevronLeft, ChevronRight, Download, FileText, Loader2, X, ZoomIn, ZoomOut } from 'lucide-react';

export interface ViewerFile {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  /** URL assinado (temporário) do ficheiro, servido pela API. */
  downloadUrl: string;
}

type Loaded =
  | { kind: 'pdf' | 'image'; url: string }
  | { kind: 'text'; text: string }
  | { kind: 'csv'; rows: string[][] }
  | { kind: 'unsupported' };

const MAX_PREVIEW_ROWS = 500;

function parseCsv(text: string): string[][] {
  const firstLine = text.split(/\r?\n/, 1)[0] ?? '';
  const separator = (firstLine.match(/;/g)?.length ?? 0) > (firstLine.match(/,/g)?.length ?? 0) ? ';' : ',';
  return text
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0)
    .slice(0, MAX_PREVIEW_ROWS)
    .map((line) => line.split(separator).map((cell) => cell.replace(/^"|"$/g, '').trim()));
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/**
 * Visualizador interno de documentos: abre o ficheiro dentro da plataforma (sem
 * novo separador). PDF e imagens são mostrados diretamente; TXT/CSV como texto/tabela;
 * formatos Office indicam que não têm pré-visualização e oferecem o download.
 * O conteúdo é obtido como blob, pelo que o download também é feito internamente.
 */
export const DocumentViewer: React.FC<{
  files: ViewerFile[];
  initialIndex?: number;
  onClose: () => void;
}> = ({ files, initialIndex = 0, onClose }) => {
  const [index, setIndex] = React.useState(initialIndex);
  const [loaded, setLoaded] = React.useState<Loaded | null>(null);
  const [blobUrl, setBlobUrl] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [zoom, setZoom] = React.useState(1);
  const dialogRef = React.useRef<HTMLDivElement>(null);
  const file = files[index];

  // Mantém o foco no visualizador (o leitor de PDF num iframe "rouba" o teclado).
  React.useEffect(() => {
    dialogRef.current?.focus();
  }, [index, loaded]);

  React.useEffect(() => {
    if (!file) return;
    let revoked = false;
    let objectUrl: string | null = null;
    setLoaded(null);
    setError(null);
    setZoom(1);

    fetch(file.downloadUrl, { credentials: 'same-origin' })
      .then(async (res) => {
        if (!res.ok) throw new Error(res.status === 404 ? 'A ligação expirou. Feche e abra novamente o documento.' : 'Não foi possível abrir o documento.');
        const blob = await res.blob();
        if (revoked) return;
        objectUrl = URL.createObjectURL(new Blob([blob], { type: file.mimeType }));
        setBlobUrl(objectUrl);

        if (file.mimeType === 'application/pdf') setLoaded({ kind: 'pdf', url: objectUrl });
        else if (file.mimeType.startsWith('image/')) setLoaded({ kind: 'image', url: objectUrl });
        else if (file.mimeType === 'text/csv') setLoaded({ kind: 'csv', rows: parseCsv(await blob.text()) });
        else if (file.mimeType === 'text/plain') setLoaded({ kind: 'text', text: await blob.text() });
        else setLoaded({ kind: 'unsupported' });
      })
      .catch((err: unknown) => !revoked && setError(err instanceof Error ? err.message : 'Não foi possível abrir o documento.'));

    return () => {
      revoked = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setIndex((i) => Math.min(files.length - 1, i + 1));
      if (e.key === 'ArrowLeft') setIndex((i) => Math.max(0, i - 1));
    };
    document.addEventListener('keydown', onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [files.length, onClose]);

  if (!file) return null;

  return (
    <div
      ref={dialogRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label={`Visualizar ${file.originalName}`}
      data-testid="document-viewer"
      className="fixed inset-0 z-[60] flex flex-col bg-zinc-950/90 backdrop-blur-sm outline-none"
    >
      <header className="flex items-center gap-3 px-4 h-14 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100">
        <FileText className="w-4 h-4 text-zinc-500 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium truncate" data-testid="viewer-file-name">
            {file.originalName}
          </p>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
            {formatSize(file.size)}
            {files.length > 1 && ` · ${index + 1} de ${files.length}`}
          </p>
        </div>

        {loaded?.kind === 'image' && (
          <div className="flex items-center gap-1">
            <button type="button" aria-label="Diminuir" onClick={() => setZoom((z) => Math.max(0.25, z - 0.25))} className="p-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800">
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs tabular-nums w-10 text-center">{Math.round(zoom * 100)}%</span>
            <button type="button" aria-label="Aumentar" onClick={() => setZoom((z) => Math.min(4, z + 0.25))} className="p-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800">
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
        )}

        {files.length > 1 && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Documento anterior"
              disabled={index === 0}
              onClick={() => setIndex((i) => i - 1)}
              className="p-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              aria-label="Documento seguinte"
              disabled={index === files.length - 1}
              onClick={() => setIndex((i) => i + 1)}
              className="p-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {blobUrl && (
          <a
            href={blobUrl}
            download={file.originalName}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <Download className="w-3.5 h-3.5" /> Descarregar
          </a>
        )}
        <button type="button" onClick={onClose} aria-label="Fechar visualizador" className="p-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800">
          <X className="w-5 h-5" />
        </button>
      </header>

      <div className="flex-1 overflow-auto flex items-start justify-center p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
        {!loaded && !error && (
          <div className="m-auto flex items-center gap-2 text-sm text-zinc-200">
            <Loader2 className="w-5 h-5 animate-spin" /> A abrir documento…
          </div>
        )}
        {error && <div role="alert" className="m-auto px-4 py-3 rounded-lg bg-red-50 text-red-800 text-sm">{error}</div>}

        {loaded?.kind === 'pdf' && (
          <iframe
            title={file.originalName}
            src={loaded.url}
            data-testid="viewer-pdf"
            className="w-full h-full min-h-[70vh] max-w-6xl rounded-lg bg-white shadow-2xl"
          />
        )}
        {loaded?.kind === 'image' && (
          <img
            src={loaded.url}
            alt={file.originalName}
            data-testid="viewer-image"
            style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
            className="max-w-full rounded-lg shadow-2xl bg-white transition-transform"
          />
        )}
        {loaded?.kind === 'text' && (
          <pre data-testid="viewer-text" className="w-full max-w-5xl whitespace-pre-wrap break-words rounded-lg bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 p-6 text-sm font-mono shadow-2xl">
            {loaded.text}
          </pre>
        )}
        {loaded?.kind === 'csv' && (
          <div className="w-full max-w-6xl overflow-auto rounded-lg bg-white dark:bg-zinc-950 shadow-2xl">
            <table data-testid="viewer-csv" className="w-full text-xs text-zinc-900 dark:text-zinc-100">
              <tbody>
                {loaded.rows.map((row, r) => (
                  <tr key={r} className={r === 0 ? 'bg-zinc-100 dark:bg-zinc-900 font-semibold' : 'border-t border-zinc-100 dark:border-zinc-800'}>
                    {row.map((cell, c) => (
                      <td key={c} className="px-3 py-1.5 whitespace-nowrap">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {loaded?.kind === 'unsupported' && (
          <div data-testid="viewer-unsupported" className="m-auto max-w-sm text-center rounded-xl bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 p-8 shadow-2xl space-y-3">
            <FileText className="w-10 h-10 mx-auto text-zinc-400" />
            <p className="text-sm font-medium">Pré-visualização indisponível para este formato</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Ficheiros Word e Excel não podem ser mostrados no navegador. Descarregue-o para abrir.
            </p>
            {blobUrl && (
              <a
                href={blobUrl}
                download={file.originalName}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950"
              >
                <Download className="w-3.5 h-3.5" /> Descarregar ficheiro
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
