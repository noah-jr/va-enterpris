import * as React from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  Button,
  Spinner,
} from '@accountable/ui';
import {
  Clock,
  CheckCircle2,
  Ban,
  Upload,
  SlidersHorizontal,
  FileText,
  Trash2,
  Send,
  Lock,
  AlertCircle,
  Sun,
  Moon,
} from 'lucide-react';
import type { AxiosError } from 'axios';
import type { ApiError } from '@accountable/types';
import { publicClientUploadSessionService } from '../../services/public-client-upload-session.service.js';
import { documentTypeService } from '../../services/document-type.service.js';
import { useTheme } from '../../hooks/useTheme.js';

interface PublicSlotItem {
  id: string;
  name: string;
  required: boolean;
  file: File | null;
  status: 'PENDING' | 'READY' | 'DISPENSED' | 'UPLOADED' | 'ERROR';
  errorMessage?: string;
  category?: string;
  description?: string | null;
  allowedExtensions?: string | null;
}

const MONTH_NAMES: Record<number, string> = {
  1: 'Janeiro',
  2: 'Fevereiro',
  3: 'Março',
  4: 'Abril',
  5: 'Maio',
  6: 'Junho',
  7: 'Julho',
  8: 'Agosto',
  9: 'Setembro',
  10: 'Outubro',
  11: 'Novembro',
  12: 'Dezembro',
};

const INITIAL_PUBLIC_SLOTS: Array<{ id: string; name: string; required: boolean; category?: string }> = [
  { id: 'comprovativo_imposto', name: 'Comprovativo de Pagamento de Imposto', required: true, category: 'Fiscal' },
  { id: 'comprovativo_pagamentos', name: 'Comprovativo de Pagamentos', required: true, category: 'Bancário' },
  { id: 'extratos_bancarios', name: 'Extratos Bancarios', required: true, category: 'Bancário' },
  { id: 'factura_fornecedores', name: 'Factura de Fornecedores', required: true, category: 'Faturação' },
  { id: 'factura_vendas', name: 'Factura de Vendas', required: true, category: 'Faturação' },
  { id: 'ficheiro_saft', name: 'Ficheiro Saft', required: true, category: 'Fiscal' },
  { id: 'folha_caixa', name: 'Folha de Caixa', required: true, category: 'Caixa' },
  { id: 'folha_salarios', name: 'Folha de Salários', required: true, category: 'RH / Salários' },
  { id: 'mapa_inss', name: 'Mapa de Guia de Pagamento INSS', required: true, category: 'RH / Salários' },
  { id: 'outros_documentos', name: 'Outros Documentos', required: false, category: 'Outro' },
  { id: 'recibo_pagamentos', name: 'Recibo de Pagamentos', required: true, category: 'Bancário' },
];

export const PublicClientSessionUploadPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const routeParams = useParams<{ token?: string }>();
  const queryClient = useQueryClient();
  const { theme, toggleTheme } = useTheme();

  // Extract token and info from query params
  const token = searchParams.get('token') || searchParams.get('s') || routeParams.token || '';
  const urlCompanyName = searchParams.get('companyName') || searchParams.get('clientName') || '';
  const now = new Date();
  const urlMonth = searchParams.get('month') ? parseInt(searchParams.get('month')!, 10) : now.getMonth() + 1;
  const urlYear = searchParams.get('year') ? parseInt(searchParams.get('year')!, 10) : now.getFullYear();

  // Query dynamic document types from backend
  const { data: docTypesResponse } = useQuery({
    queryKey: ['public', 'document-types'],
    queryFn: () => documentTypeService.listActive(),
    staleTime: 5 * 60 * 1000,
  });

  // Slots State
  const [slots, setSlots] = React.useState<PublicSlotItem[]>(() =>
    INITIAL_PUBLIC_SLOTS.map((s) => ({
      id: s.id,
      name: s.name,
      required: s.required,
      category: s.category,
      file: null,
      status: 'PENDING',
    })),
  );

  // Sync slots when dynamic document types arrive from DB
  React.useEffect(() => {
    if (docTypesResponse?.data && docTypesResponse.data.length > 0) {
      setSlots((prevSlots) => {
        const prevMap = new Map(prevSlots.map((s) => [s.id, s]));
        return docTypesResponse.data.map((dt) => {
          const existing = prevMap.get(dt.code) || prevMap.get(dt.id);
          return {
            id: dt.code,
            name: dt.name,
            required: dt.required,
            category: dt.category,
            description: dt.description,
            allowedExtensions: dt.allowedExtensions,
            file: existing ? existing.file : null,
            status: existing ? existing.status : 'PENDING',
            errorMessage: existing ? existing.errorMessage : undefined,
          };
        });
      });
    }
  }, [docTypesResponse]);

  const [notes, setNotes] = React.useState<string>('');
  const [isSubmittingAll, setIsSubmittingAll] = React.useState<boolean>(false);
  const [submissionProgress, setSubmissionProgress] = React.useState<string | null>(null);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [isSuccessBatch, setIsSuccessBatch] = React.useState<boolean>(false);
  const [dragOverSlotId, setDragOverSlotId] = React.useState<string | null>(null);

  const fileInputRefs = React.useRef<Record<string, HTMLInputElement | null>>({});

  // Query session context from backend
  const { data, isLoading, isError } = useQuery({
    queryKey: ['public-client-upload-session', token],
    queryFn: () => publicClientUploadSessionService.getContext(token),
    enabled: Boolean(token),
    retry: 1,
  });

  const session = data?.data;

  // Nunca mostrar o nome de outra empresa como fallback.
  const displayCompanyName = session?.companyName || session?.clientName || urlCompanyName || '';

  const displayMonth = session?.month ?? urlMonth;
  const displayYear = session?.year ?? urlYear;
  const displayMonthName = MONTH_NAMES[displayMonth] ?? '';

  const uploadMutation = useMutation({
    mutationFn: (payload: { slotId: string; file: File; name: string }) =>
      publicClientUploadSessionService.uploadFile({
        token,
        file: payload.file,
        title: `${payload.name} (${displayMonthName}/${displayYear})`,
        type: payload.name,
        description: notes || undefined,
      }),
    onSuccess: (_, variables) => {
      setSlots((prev) =>
        prev.map((s) =>
          s.id === variables.slotId ? { ...s, status: 'UPLOADED' } : s,
        ),
      );
      queryClient.invalidateQueries({ queryKey: ['public-client-upload-session', token] });
    },
    onError: (err, variables) => {
      const axiosErr = err as AxiosError<ApiError>;
      const msg = axiosErr.response?.data?.message || 'Erro ao carregar ficheiro.';
      setSlots((prev) =>
        prev.map((s) =>
          s.id === variables.slotId ? { ...s, status: 'ERROR', errorMessage: msg } : s,
        ),
      );
    },
  });

  // Toggle Dispensar / Não Aplicável
  const handleToggleDispense = (slotId: string) => {
    setSlots((prev) =>
      prev.map((slot) => {
        if (slot.id !== slotId) return slot;
        if (slot.status === 'DISPENSED') {
          return { ...slot, status: slot.file ? 'READY' : 'PENDING' };
        }
        return { ...slot, status: 'DISPENSED' };
      }),
    );
  };

  // Trigger File Input Click
  const handleTriggerUpload = (slotId: string) => {
    const inputEl = fileInputRefs.current[slotId];
    if (inputEl) {
      inputEl.value = '';
      inputEl.click();
    }
  };

  // File Selected for Slot
  const handleFileChange = (slotId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSlots((prev) =>
        prev.map((slot) =>
          slot.id === slotId ? { ...slot, file, status: 'READY' } : slot,
        ),
      );
    }
  };

  // Remove File from Slot
  const handleRemoveFile = (slotId: string) => {
    setSlots((prev) =>
      prev.map((slot) =>
        slot.id === slotId ? { ...slot, file: null, status: 'PENDING' } : slot,
      ),
    );
  };

  // Drag & Drop handlers
  const handleDragOver = (e: React.DragEvent, slotId: string) => {
    e.preventDefault();
    setDragOverSlotId(slotId);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverSlotId(null);
  };

  const handleDrop = (e: React.DragEvent, slotId: string) => {
    e.preventDefault();
    setDragOverSlotId(null);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSlots((prev) =>
        prev.map((slot) =>
          slot.id === slotId ? { ...slot, file, status: 'READY' } : slot,
        ),
      );
    }
  };

  // Metrics
  const readySlots = slots.filter((s) => s.status === 'READY' && s.file !== null);
  const uploadedSlots = slots.filter((s) => s.status === 'UPLOADED');
  const totalFilesCount = readySlots.length + uploadedSlots.length;

  // Process and upload all ready files
  const handleProcessSubmission = async () => {
    if (readySlots.length === 0) {
      setServerError('Selecione pelo menos um documento para enviar.');
      return;
    }

    setServerError(null);
    setIsSubmittingAll(true);

    let count = 0;
    for (const slot of readySlots) {
      if (!slot.file) continue;
      count++;
      setSubmissionProgress(
        `A enviar anexo ${count} de ${readySlots.length}: ${slot.name}...`,
      );

      try {
        await uploadMutation.mutateAsync({
          slotId: slot.id,
          file: slot.file,
          name: slot.name,
        });
      } catch {
        // Handled in mutation
      }
    }

    setIsSubmittingAll(false);
    setSubmissionProgress(null);
    setIsSuccessBatch(true);
  };

  // Link sem token, inválido, expirado, revogado ou de cliente bloqueado:
  // não mostrar o formulário (os uploads falhariam um a um).
  if (!token || (!isLoading && (isError || !session))) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 flex items-center justify-center px-4">
        <Card className="max-w-md w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
          <CardContent className="p-6 sm:p-8 text-center space-y-3" data-testid="upload-link-unavailable">
            <AlertCircle className="w-10 h-10 mx-auto text-amber-500" />
            <h1 className="text-lg font-semibold">Link de envio indisponível</h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Este link é inválido, expirou ou foi revogado. Peça à sua equipa de contabilidade um novo link de envio.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 py-6 sm:py-10 px-3.5 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-4xl mx-auto space-y-5 sm:space-y-6">
        {/* Top Minimal Header with Theme Switcher */}
        <header className="flex items-center justify-between border-b border-zinc-200/80 dark:border-zinc-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 flex items-center justify-center font-bold text-xs tracking-tight shadow-xs shrink-0">
              VA
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm tracking-tight text-zinc-900 dark:text-zinc-100">
                  VA OneGest
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                  Recepção
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Portal Seguro de Entrega Documental
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-900 px-2.5 py-1 rounded-md border border-zinc-200 dark:border-zinc-800 shadow-2xs">
              <Lock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Sessão Criptografada</span>
            </div>

            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors shadow-2xs"
              aria-label="Alternar tema"
              title={theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-muted" />}
            </button>
          </div>
        </header>

        {/* Loading Header Context */}
        {isLoading && (
          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex items-center justify-center gap-2 text-xs text-zinc-500">
            <Spinner size="sm" />
            <span>A carregar dados do envio...</span>
          </div>
        )}

        {/* Top Company Card (Exact Screenshot Match) */}
        <Card className="bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl shadow-xs overflow-hidden">
          <CardContent className="p-4 sm:p-7 space-y-2">
            <h1 className="text-sm sm:text-lg lg:text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 uppercase break-words leading-snug">
              {displayCompanyName}
            </h1>

            <div className="flex items-center gap-2 pt-0.5">
              <span className="text-xs sm:text-sm font-medium text-zinc-500 dark:text-zinc-400">
                Competência:
              </span>
              <span className="font-bold text-xs sm:text-sm text-blue-600 dark:text-blue-400 font-mono">
                {displayMonthName} / {displayYear}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Success Banner if batch completed */}
        {isSuccessBatch && (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs flex items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>
                <strong>Documentos submetidos com sucesso!</strong> Os seus ficheiros foram recebidos e arquivados com segurança na conta da empresa.
              </span>
            </div>
          </div>
        )}

        {/* Main Document Checklist Card */}
        <Card className="bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl shadow-xs overflow-hidden">
          {/* Card Header */}
          <div className="p-4 sm:p-5 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/40 flex items-center justify-between">
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-semibold text-xs sm:text-sm">
              <SlidersHorizontal className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>Documentos Obrigatórios</span>
            </div>

            <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
              {totalFilesCount} de {slots.length} anexados
            </div>
          </div>

          {/* Server Error */}
          {serverError && (
            <div className="m-4 p-3.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          {/* Submission Progress Banner */}
          {submissionProgress && (
            <div className="m-4 p-3.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-blue-700 dark:text-blue-300 text-xs flex items-center gap-2.5">
              <Spinner size="sm" className="shrink-0" />
              <span className="font-medium">{submissionProgress}</span>
            </div>
          )}

          {/* Slots List */}
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {slots.map((slot) => {
              const isUploaded = slot.status === 'UPLOADED';
              const isReady = slot.status === 'READY' && slot.file !== null;
              const isDispensed = slot.status === 'DISPENSED';
              const isPending = slot.status === 'PENDING';
              const isDragTarget = dragOverSlotId === slot.id;

              return (
                <div
                  key={slot.id}
                  onDragOver={(e) => handleDragOver(e, slot.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, slot.id)}
                  className={`p-3.5 sm:p-4 sm:px-6 flex items-center justify-between gap-3 sm:gap-4 transition-all duration-150 ${
                    isDragTarget
                      ? 'bg-blue-50/70 dark:bg-blue-950/40 border-l-4 border-blue-600'
                      : isUploaded || isReady
                      ? 'bg-emerald-50/20 dark:bg-emerald-950/10'
                      : isDispensed
                      ? 'bg-zinc-50/40 dark:bg-zinc-900/20 opacity-70'
                      : 'hover:bg-zinc-50/60 dark:hover:bg-zinc-900/40'
                  }`}
                >
                  {/* Hidden Native File Input */}
                  <input
                    type="file"
                    ref={(el) => {
                      fileInputRefs.current[slot.id] = el;
                    }}
                    onChange={(e) => handleFileChange(slot.id, e)}
                    accept={slot.allowedExtensions || '.pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.txt,.csv'}
                    className="hidden"
                  />

                  {/* Left: Status Icon */}
                  <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
                    <div
                      className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                        isUploaded || isReady
                          ? 'border-emerald-300 dark:border-emerald-700/80 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
                          : isDispensed
                          ? 'border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-subtle'
                          : 'border-blue-100 dark:border-blue-950/80 bg-blue-50/50 dark:bg-blue-950/30 text-blue-500 dark:text-blue-400'
                      }`}
                    >
                      {isUploaded || isReady ? (
                        <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      ) : isDispensed ? (
                        <Ban className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      ) : (
                        <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      )}
                    </div>

                    {/* Document Name & Status */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p
                          className={`text-xs sm:text-sm font-semibold truncate ${
                            isDispensed
                              ? 'text-subtle line-through'
                              : 'text-zinc-900 dark:text-zinc-100'
                          }`}
                        >
                          {slot.name}
                        </p>
                        {slot.category && (
                          <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700/60 shrink-0">
                            {slot.category}
                          </span>
                        )}
                      </div>

                      {isPending && (
                        <p className="text-[10px] uppercase tracking-wider font-semibold text-subtle mt-0.5">
                          {slot.required ? 'Pendente • Obrigatório' : 'Pendente • Opcional'}
                          {slot.allowedExtensions ? ` • Formatos: ${slot.allowedExtensions}` : ''}
                        </p>
                      )}

                      {isReady && slot.file && (
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 truncate max-w-[140px] sm:max-w-xs">
                            {slot.file.name}
                          </span>
                          <span className="text-[10px] text-subtle font-mono">
                            ({(slot.file.size / 1024).toFixed(0)} KB)
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(slot.id)}
                            className="text-subtle hover:text-rose-500 transition-colors p-0.5"
                            title="Remover ficheiro"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}

                      {isUploaded && (
                        <p className="text-[10px] uppercase tracking-wider font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Enviado com Sucesso
                        </p>
                      )}

                      {isDispensed && (
                        <p className="text-[10px] uppercase tracking-wider font-semibold text-subtle mt-0.5">
                          Não Aplicável / Dispensado
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleDispense(slot.id)}
                      title={isDispensed ? 'Marcar como Necessário' : 'Dispensar / Não Aplicável'}
                      aria-label={isDispensed ? 'Marcar como Necessário' : 'Dispensar / Não Aplicável'}
                      className={`p-2 rounded-lg border transition-colors focus:outline-none ${
                        isDispensed
                          ? 'border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
                          : 'border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-subtle hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                      }`}
                    >
                      <Ban className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTriggerUpload(slot.id)}
                      title="Carregar ficheiro para este item"
                      aria-label="Carregar ficheiro para este item"
                      className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-xs transition-all flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                    >
                      <Upload className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Notes */}
        <Card className="bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl shadow-xs">
          <CardContent className="p-4 sm:p-5 space-y-2">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-subtle" />
              <span>Mensagem ou Observações para a Contabilidade (Opcional)</span>
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Indique informações complementares sobre faturas, comprovativos bancários ou esclarecimentos..."
              className="w-full p-2.5 text-xs sm:text-sm rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors resize-y"
            />
          </CardContent>
        </Card>

        {/* Sticky Submit Bar */}
        <div className="sticky bottom-3 sm:bottom-4 z-20 p-3.5 sm:p-4 rounded-xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-zinc-200/90 dark:border-zinc-800/90 shadow-lg flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="text-xs text-zinc-600 dark:text-zinc-300 text-center sm:text-left">
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">
              {readySlots.length} documento{readySlots.length === 1 ? '' : 's'} pronto{readySlots.length === 1 ? '' : 's'} para envio
            </span>
            {' • '}
            <span className="text-zinc-500 dark:text-zinc-400 font-mono">
              {displayMonthName} / {displayYear}
            </span>
          </div>

          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={handleProcessSubmission}
            disabled={isSubmittingAll || readySlots.length === 0}
            isLoading={isSubmittingAll}
            className="w-full sm:w-auto justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm px-6"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Enviar Documentos para a Contabilidade</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
