import * as React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { ApiError } from '@accountable/types';
import { Card, CardContent, Button, Spinner } from '@accountable/ui';
import {
  AlertCircle,
  ArrowLeft,
  ExternalLink,
  FileText,
  FileUp,
  Link as LinkIcon,
  Send,
  Share2,
  SlidersHorizontal,
} from 'lucide-react';
import { useAuthStore } from '../../stores/auth.store.js';
import { documentService } from '../../services/document.service.js';
import { documentTypeService } from '../../services/document-type.service.js';
import {
  ACCEPT_ATTRIBUTE,
  INITIAL_SLOTS,
  monthName,
  validateFileForUpload,
  type DocumentPriorityValue,
  type DocumentSlotItem,
  type FilterTab,
} from './create-document/constants.js';
import { CompetencePeriodPicker } from './create-document/CompetencePeriodPicker.js';
import { DocumentSlotRow } from './create-document/DocumentSlotRow.js';
import { PrioritySelect } from './create-document/PrioritySelect.js';
import { ShareUploadLinkModal } from './create-document/ShareUploadLinkModal.js';

const FILTERS: Array<{ value: FilterTab; label: string; activeClass: string }> = [
  { value: 'ALL', label: 'Todos', activeClass: 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950' },
  { value: 'PENDING', label: 'Pendentes', activeClass: 'bg-blue-600 text-white' },
  { value: 'READY', label: 'Anexados', activeClass: 'bg-emerald-600 text-white' },
  { value: 'DISPENSED', label: 'Dispensados', activeClass: 'bg-zinc-600 text-white' },
];

function previousMonth(): { month: number; year: number } {
  // O fecho contabilístico é normalmente do mês anterior.
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return { month: d.getMonth() + 1, year: d.getFullYear() };
}

export const CreateDocumentPage: React.FC = () => {
  const navigate = useNavigate();
  const { client } = useAuthStore();

  const [period, setPeriod] = React.useState(previousMonth);
  const [activeFilter, setActiveFilter] = React.useState<FilterTab>('ALL');
  const [priority, setPriority] = React.useState<DocumentPriorityValue>('NORMAL');
  const [additionalNotes, setAdditionalNotes] = React.useState('');

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [uploadProgressText, setUploadProgressText] = React.useState<string | null>(null);
  const [serverError, setServerError] = React.useState<string | null>(null);
  /** Processo já criado cujo envio de anexos falhou a meio — impede duplicar ao repetir. */
  const [partiallyCreatedId, setPartiallyCreatedId] = React.useState<string | null>(null);
  const [isLinkModalOpen, setIsLinkModalOpen] = React.useState(false);

  const multiFileInputRef = React.useRef<HTMLInputElement | null>(null);

  const { data: docTypesResponse } = useQuery({
    queryKey: ['public', 'document-types'],
    queryFn: () => documentTypeService.listActive(),
    staleTime: 5 * 60 * 1000,
  });

  const [slots, setSlots] = React.useState<DocumentSlotItem[]>(() =>
    INITIAL_SLOTS.map((s) => ({ ...s, file: null, status: 'PENDING' })),
  );

  // Substitui os slots iniciais pelos tipos de documento configurados, preservando ficheiros já escolhidos.
  React.useEffect(() => {
    const types = docTypesResponse?.data;
    if (!types || types.length === 0) return;
    setSlots((prev) => {
      const prevMap = new Map(prev.map((s) => [s.id, s]));
      return types.map((dt) => {
        const existing = prevMap.get(dt.code) ?? prevMap.get(dt.id);
        return {
          id: dt.code,
          name: dt.name,
          required: dt.required,
          category: dt.category,
          description: dt.description,
          allowedExtensions: dt.allowedExtensions,
          file: existing?.file ?? null,
          status: existing?.status ?? 'PENDING',
        };
      });
    });
  }, [docTypesResponse]);

  const companyDisplayName = client?.company || client?.name || '';
  const periodLabel = `${monthName(period.month)} / ${period.year}`;

  const updateSlot = (slotId: string, change: (slot: DocumentSlotItem) => DocumentSlotItem) =>
    setSlots((prev) => prev.map((slot) => (slot.id === slotId ? change(slot) : slot)));

  const attachFile = (slotId: string, file: File) => {
    const error = validateFileForUpload(file);
    if (error) {
      setServerError(error);
      return;
    }
    setServerError(null);
    updateSlot(slotId, (slot) => ({ ...slot, file, status: 'READY' }));
  };

  const handleMultiFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const rejected = files.map(validateFileForUpload).filter((msg): msg is string => msg !== null);
    const valid = files.filter((f) => validateFileForUpload(f) === null);
    setServerError(rejected.length > 0 ? rejected.join(' ') : null);

    setSlots((prev) => {
      const next = [...prev];
      let fileIdx = 0;
      for (let i = 0; i < next.length && fileIdx < valid.length; i++) {
        const slot = next[i]!;
        if (slot.status === 'PENDING' || !slot.file) {
          next[i] = { ...slot, file: valid[fileIdx]!, status: 'READY' };
          fileIdx++;
        }
      }
      return next;
    });
  };

  const handleToggleDispense = (slotId: string) =>
    updateSlot(slotId, (slot) =>
      slot.status === 'DISPENSED'
        ? { ...slot, status: slot.file ? 'READY' : 'PENDING' }
        : { ...slot, status: 'DISPENSED' },
    );

  const handleRemoveFile = (slotId: string) =>
    updateSlot(slotId, (slot) => ({ ...slot, file: null, status: 'PENDING' }));

  const readySlots = slots.filter((s) => s.status === 'READY' && s.file !== null);
  const dispensedSlots = slots.filter((s) => s.status === 'DISPENSED');
  const counts: Record<FilterTab, number> = {
    ALL: slots.length,
    PENDING: slots.filter((s) => s.status === 'PENDING').length,
    READY: readySlots.length,
    DISPENSED: dispensedSlots.length,
  };
  const progressPercent = slots.length
    ? Math.round(((readySlots.length + dispensedSlots.length) / slots.length) * 100)
    : 0;
  const filteredSlots = activeFilter === 'ALL' ? slots : slots.filter((s) => s.status === activeFilter);

  const handleSubmitBatch = async () => {
    setServerError(null);

    if (readySlots.length === 0) {
      setServerError('Por favor, anexe pelo menos um ficheiro antes de submeter.');
      return;
    }

    setIsSubmitting(true);
    setUploadProgressText('A inicializar processo contabilístico...');

    let documentId: string | null = null;
    try {
      const listing = readySlots.map((s) => `• ${s.name}: ${s.file?.name}`).join('\n');
      const dispensed = dispensedSlots.length
        ? `\n\nDispensados:\n${dispensedSlots.map((s) => `• ${s.name}`).join('\n')}`
        : '';
      const notes = additionalNotes ? `\n\nObservações: ${additionalNotes}` : '';

      const createdDoc = await documentService.create({
        title: `Fecho Contabilístico Mensal — ${periodLabel}`,
        type: 'Contabilidade Geral',
        priority,
        description: `Submissão de fecho documental de ${monthName(period.month)} de ${period.year}.\n${listing}${dispensed}${notes}`,
      });
      documentId = createdDoc.data.id;

      const failed: string[] = [];
      for (const [index, slot] of readySlots.entries()) {
        setUploadProgressText(`A carregar anexo ${index + 1} de ${readySlots.length}: ${slot.name}...`);
        try {
          await documentService.uploadFile(documentId, slot.file!);
        } catch (err) {
          const message = (err as AxiosError<ApiError>).response?.data?.message ?? 'erro desconhecido';
          failed.push(`${slot.name} (${message})`);
        }
      }

      if (failed.length > 0) {
        setPartiallyCreatedId(documentId);
        setServerError(
          `O processo foi criado, mas ${failed.length} anexo(s) não foram enviados: ${failed.join('; ')}. ` +
            'Pode anexá-los na página do processo.',
        );
        setUploadProgressText(null);
        setIsSubmitting(false);
        return;
      }

      setUploadProgressText('Processo submetido com sucesso! A redirecionar...');
      setTimeout(() => navigate(`/documents/${documentId}`), 800);
    } catch (err) {
      const axiosErr = err as AxiosError<ApiError>;
      setServerError(
        axiosErr.response?.data?.message ||
          'Erro ao submeter o processo contabilístico. Por favor, tente novamente.',
      );
      setIsSubmitting(false);
      setUploadProgressText(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16 text-zinc-900 dark:text-zinc-100 animate-in fade-in duration-200">
      <input
        type="file"
        ref={multiFileInputRef}
        multiple
        onChange={handleMultiFilesSelected}
        accept={ACCEPT_ATTRIBUTE}
        className="hidden"
        data-testid="batch-file-input"
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
        <Link
          to="/documents"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          <span>Voltar à Lista de Processos</span>
        </Link>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => multiFileInputRef.current?.click()}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors shadow-2xs"
          >
            <FileUp className="w-3.5 h-3.5 text-subtle shrink-0" />
            <span>Carregar em Lote</span>
          </button>

          <button
            type="button"
            onClick={() => setIsLinkModalOpen(true)}
            disabled={!client?.id}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-950/70 hover:bg-blue-100 dark:hover:bg-blue-900/80 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900 transition-all shadow-2xs hover:shadow-xs disabled:opacity-50"
          >
            <LinkIcon className="w-3.5 h-3.5 shrink-0" />
            <span>Gerar Link</span>
          </button>
        </div>
      </div>

      <Card className="bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl shadow-xs overflow-visible">
        <CardContent className="p-4 sm:p-6 lg:p-7">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
            <div className="space-y-2 sm:space-y-2.5 min-w-0">
              <h1 className="text-sm sm:text-lg lg:text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 uppercase break-words leading-snug">
                {companyDisplayName}
              </h1>
              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                <span className="text-xs sm:text-sm font-medium text-zinc-500 dark:text-zinc-400">Competência:</span>
                <CompetencePeriodPicker month={period.month} year={period.year} onChange={setPeriod} />
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsLinkModalOpen(true)}
              disabled={!client?.id}
              className="self-start px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-900/60 flex items-center gap-1.5 transition-colors shadow-2xs disabled:opacity-50"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Link Público</span>
            </button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-semibold text-xs sm:text-sm">
            <SlidersHorizontal className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Documentos Obrigatórios</span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar" role="tablist">
            {FILTERS.filter((f) => f.value !== 'DISPENSED' || counts.DISPENSED > 0).map((f) => (
              <button
                key={f.value}
                type="button"
                role="tab"
                aria-selected={activeFilter === f.value}
                onClick={() => setActiveFilter(f.value)}
                className={`shrink-0 px-2.5 py-1.5 sm:py-1 rounded-md text-xs font-medium transition-colors ${
                  activeFilter === f.value
                    ? `${f.activeClass} font-semibold shadow-2xs`
                    : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200/60 dark:hover:bg-zinc-800'
                }`}
              >
                {f.label} ({counts[f.value]})
              </button>
            ))}
          </div>
        </div>

        <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1">
          <div className="bg-blue-600 h-1 transition-all duration-300" style={{ width: `${progressPercent}%` }} />
        </div>

        {serverError && (
          <div
            role="alert"
            data-testid="create-document-error"
            className="m-4 p-3.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        {uploadProgressText && (
          <div className="m-4 p-3.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-blue-700 dark:text-blue-300 text-xs flex items-center gap-2.5">
            <Spinner size="sm" className="shrink-0" />
            <span className="font-medium">{uploadProgressText}</span>
          </div>
        )}

        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {filteredSlots.map((slot) => (
            <DocumentSlotRow
              key={slot.id}
              slot={slot}
              onFileSelected={attachFile}
              onRemoveFile={handleRemoveFile}
              onToggleDispense={handleToggleDispense}
            />
          ))}
        </div>
      </Card>

      <Card className="bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl shadow-xs overflow-visible">
        <CardContent className="p-4 sm:p-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <label
              htmlFor="additional-notes"
              className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5 text-subtle" />
              <span>Instruções ou Notas Adicionais (Opcional)</span>
            </label>
            <PrioritySelect value={priority} onChange={setPriority} />
          </div>

          <textarea
            id="additional-notes"
            rows={2}
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            placeholder="Indique informações complementares sobre faturas, contas bancárias ou esclarecimentos para o contabilista..."
            className="w-full p-2.5 text-xs sm:text-sm rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors resize-y"
          />
        </CardContent>
      </Card>

      <div className="sticky bottom-3 sm:bottom-4 z-20 p-3.5 sm:p-4 rounded-xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-zinc-200/90 dark:border-zinc-800/90 shadow-lg flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="text-xs text-zinc-600 dark:text-zinc-300 text-center sm:text-left">
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">
            {readySlots.length} de {slots.length} documentos anexados
          </span>
          {' • '}
          <span className="text-zinc-500 dark:text-zinc-400 font-mono">Competência: {periodLabel}</span>
        </div>

        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate('/documents')}
            disabled={isSubmitting}
            className="w-full sm:w-auto justify-center"
          >
            Cancelar
          </Button>

          {partiallyCreatedId ? (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => navigate(`/documents/${partiallyCreatedId}`)}
              className="w-full sm:w-auto justify-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Abrir processo criado</span>
            </Button>
          ) : (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleSubmitBatch}
              disabled={isSubmitting || readySlots.length === 0}
              isLoading={isSubmitting}
              className="w-full sm:w-auto justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submeter Fecho Contabilístico</span>
            </Button>
          )}
        </div>
      </div>

      {isLinkModalOpen && client?.id && (
        <ShareUploadLinkModal
          clientId={client.id}
          companyName={companyDisplayName}
          month={period.month}
          year={period.year}
          onClose={() => setIsLinkModalOpen(false)}
        />
      )}
    </div>
  );
};
