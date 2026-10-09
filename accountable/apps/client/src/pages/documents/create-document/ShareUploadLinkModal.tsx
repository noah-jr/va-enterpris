import * as React from 'react';
import { useMutation } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { ApiError } from '@accountable/types';
import { Spinner } from '@accountable/ui';
import {
  AlertCircle,
  Check,
  Copy,
  ExternalLink,
  Link as LinkIcon,
  Lock,
  Mail,
  MessageCircle,
  ShieldCheck,
  X,
} from 'lucide-react';
import { publicClientUploadSessionService } from '../../../services/public-client-upload-session.service.js';
import { monthName } from './constants.js';

interface ShareUploadLinkModalProps {
  clientId: string;
  companyName: string;
  month: number;
  year: number;
  onClose: () => void;
}

/**
 * Gera um link público real (sessão de upload na API). Se a geração falhar,
 * mostra o erro — nunca um link "demo" que não funcionaria para quem o recebe.
 */
export const ShareUploadLinkModal: React.FC<ShareUploadLinkModalProps> = ({
  clientId,
  companyName,
  month,
  year,
  onClose,
}) => {
  const [isCopied, setIsCopied] = React.useState(false);
  const period = `${monthName(month)}/${year}`;

  const generate = useMutation({
    mutationFn: () =>
      publicClientUploadSessionService.createSession(clientId, {
        month,
        year,
        label: `Competência ${period}`,
      }),
  });

  const { mutate } = generate;
  // Garante uma única sessão por abertura do modal (StrictMode monta efeitos duas vezes).
  const requestedRef = React.useRef(false);
  React.useEffect(() => {
    if (requestedRef.current) return;
    requestedRef.current = true;
    mutate();
  }, [mutate]);

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const url = generate.data?.data.url ?? '';
  const expiresAt = generate.data?.data.expiresAt;
  const errorMessage =
    (generate.error as AxiosError<ApiError> | null)?.response?.data?.message ??
    (generate.isError ? 'Não foi possível gerar o link. Tente novamente.' : null);

  const handleCopy = async () => {
    if (!url) return;
    await navigator.clipboard.writeText(url);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-link-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto p-4 sm:p-6 shadow-2xl space-y-4 sm:space-y-5 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200/60 dark:border-blue-800/60 shrink-0">
              <LinkIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 id="share-link-title" className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                Gerar Link de Envio Público
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Permite enviar documentos diretamente sem login obrigatório
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-subtle hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Fechar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3.5 sm:p-4 rounded-xl bg-zinc-100 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 space-y-2 text-xs">
          <div className="flex items-center justify-between gap-2">
            <span className="text-zinc-500 dark:text-zinc-400 font-medium shrink-0">Entidade:</span>
            <span className="font-bold text-zinc-900 dark:text-zinc-100 truncate text-right">{companyName}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-zinc-500 dark:text-zinc-400 font-medium shrink-0">Competência:</span>
            <span className="font-bold text-blue-600 dark:text-blue-400 font-mono">{period}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-zinc-500 dark:text-zinc-400 font-medium shrink-0">Validade:</span>
            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 font-medium text-[11px]">
              <Lock className="w-3.5 h-3.5 shrink-0" />
              <span>{expiresAt ? `Até ${new Date(expiresAt).toLocaleDateString('pt-PT')}` : '—'}</span>
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="share-link-url" className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            URL de Acesso Seguro:
          </label>

          {generate.isPending && (
            <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950 flex items-center justify-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
              <Spinner size="sm" />
              <span>A gerar link seguro...</span>
            </div>
          )}

          {errorMessage && (
            <div
              role="alert"
              data-testid="share-link-error"
              className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-center justify-between gap-2"
            >
              <span className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {errorMessage}
              </span>
              <button type="button" onClick={() => mutate()} className="font-semibold underline shrink-0">
                Tentar novamente
              </button>
            </div>
          )}

          {url && (
            <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                id="share-link-url"
                data-testid="share-link-url"
                type="text"
                readOnly
                value={url}
                className="w-full pl-3.5 pr-3 sm:pr-24 py-2.5 text-xs font-mono rounded-xl bg-zinc-100 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500 select-all"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="sm:absolute sm:right-1.5 sm:top-1.5 sm:bottom-1.5 py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isCopied ? 'Copiado!' : 'Copiar Link'}</span>
              </button>
            </div>
          )}
        </div>

        {url && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                `Olá, segue o link seguro para envio da documentação de ${period} da empresa ${companyName}: ${url}`,
              )}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl border border-emerald-300 dark:border-emerald-800/80 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-xs font-semibold transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </a>
            <a
              href={`mailto:?subject=${encodeURIComponent(`Envio de Documentos - ${companyName} (${period})`)}&body=${encodeURIComponent(
                `Aceda ao link seguro para carregar os documentos da competência ${period}:\n\n${url}`,
              )}`}
              className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-semibold transition-colors"
            >
              <Mail className="w-4 h-4" />
              <span>Email</span>
            </a>
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl border border-blue-300 dark:border-blue-800/80 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-xs font-semibold transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Testar Link</span>
            </a>
          </div>
        )}

        <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3 flex items-center justify-between text-[11px] text-subtle">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Os ficheiros enviados entram diretamente na tramitação oficial.</span>
          </div>
          <button type="button" onClick={onClose} className="font-medium text-zinc-700 dark:text-zinc-300 hover:underline">
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
