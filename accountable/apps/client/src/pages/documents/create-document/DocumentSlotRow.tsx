import * as React from 'react';
import { Ban, CheckCircle2, Clock, Trash2, Upload } from 'lucide-react';
import { ACCEPT_ATTRIBUTE, type DocumentSlotItem } from './constants.js';

interface DocumentSlotRowProps {
  slot: DocumentSlotItem;
  onFileSelected: (slotId: string, file: File) => void;
  onRemoveFile: (slotId: string) => void;
  onToggleDispense: (slotId: string) => void;
}

export const DocumentSlotRow: React.FC<DocumentSlotRowProps> = ({
  slot,
  onFileSelected,
  onRemoveFile,
  onToggleDispense,
}) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isDragTarget, setIsDragTarget] = React.useState(false);

  const isReady = slot.status === 'READY' && slot.file !== null;
  const isDispensed = slot.status === 'DISPENSED';
  const isPending = slot.status === 'PENDING';

  const openFilePicker = () => {
    if (!inputRef.current) return;
    inputRef.current.value = '';
    inputRef.current.click();
  };

  return (
    <div
      data-testid={`slot-${slot.id}`}
      data-status={slot.status}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragTarget(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setIsDragTarget(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragTarget(false);
        const file = e.dataTransfer.files?.[0];
        if (file) onFileSelected(slot.id, file);
      }}
      className={`p-4 sm:px-6 flex items-center justify-between gap-4 transition-all duration-150 ${
        isDragTarget
          ? 'bg-blue-50/70 dark:bg-blue-950/40 border-l-4 border-blue-600'
          : isReady
          ? 'bg-emerald-50/20 dark:bg-emerald-950/10'
          : isDispensed
          ? 'bg-zinc-50/40 dark:bg-zinc-900/20 opacity-70'
          : 'hover:bg-zinc-50/60 dark:hover:bg-zinc-900/40'
      }`}
    >
      <input
        type="file"
        ref={inputRef}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileSelected(slot.id, file);
        }}
        accept={slot.allowedExtensions || ACCEPT_ATTRIBUTE}
        className="hidden"
        data-testid={`slot-input-${slot.id}`}
      />

      <div className="flex items-center gap-3.5 min-w-0">
        <div
          className={`w-9 h-9 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
            isReady
              ? 'border-emerald-300 dark:border-emerald-700/80 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
              : isDispensed
              ? 'border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-subtle'
              : 'border-blue-100 dark:border-blue-950/80 bg-blue-50/50 dark:bg-blue-950/30 text-blue-500 dark:text-blue-400'
          }`}
        >
          {isReady ? <CheckCircle2 className="w-4 h-4" /> : isDispensed ? <Ban className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p
              className={`text-xs sm:text-sm font-semibold truncate ${
                isDispensed ? 'text-subtle line-through' : 'text-zinc-900 dark:text-zinc-100'
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
              <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 truncate max-w-xs">
                {slot.file.name}
              </span>
              <span className="text-[10px] text-subtle font-mono">({(slot.file.size / 1024).toFixed(0)} KB)</span>
              <button
                type="button"
                onClick={() => onRemoveFile(slot.id)}
                className="text-subtle hover:text-rose-500 transition-colors p-0.5"
                title="Remover ficheiro"
                aria-label="Remover ficheiro"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          )}

          {isDispensed && (
            <p className="text-[10px] uppercase tracking-wider font-semibold text-subtle mt-0.5">
              Não Aplicável / Dispensado
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={() => onToggleDispense(slot.id)}
          title={isDispensed ? 'Marcar como Necessário' : 'Dispensar / Não Aplicável'}
          aria-label={isDispensed ? 'Marcar como Necessário' : 'Dispensar / Não Aplicável'}
          className={`p-2 rounded-lg border transition-colors focus:outline-none ${
            isDispensed
              ? 'border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
              : 'border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-subtle hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
        >
          <Ban className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={openFilePicker}
          title="Carregar ficheiro para este item"
          aria-label="Carregar ficheiro para este item"
          className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-xs transition-all flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500/40"
        >
          <Upload className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
