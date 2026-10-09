import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { DocumentTypeDTO } from '@accountable/types';
import { Button, Spinner } from '@accountable/ui';
import { AlertCircle, Trash2 } from 'lucide-react';
import { adminApiService } from '../../../services/admin-api.service.js';
import { apiErrorMessage, invalidateDocumentTypes } from '../document-type-form.js';

interface DeleteDocumentTypeDialogProps {
  target: DocumentTypeDTO;
  onClose: () => void;
}

export const DeleteDocumentTypeDialog: React.FC<DeleteDocumentTypeDialogProps> = ({ target, onClose }) => {
  const queryClient = useQueryClient();

  const remove = useMutation({
    mutationFn: () => adminApiService.deleteDocumentType(target.id),
    onSuccess: () => {
      invalidateDocumentTypes(queryClient);
      onClose();
    },
  });

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="delete-document-type-title"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl max-w-sm w-full p-6 space-y-4 shadow-xl animate-in zoom-in-95 duration-150">
        <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto border border-rose-200 dark:border-rose-900">
          <Trash2 className="w-5 h-5" />
        </div>

        <div className="text-center space-y-1">
          <h3 id="delete-document-type-title" className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Eliminar Tipo de Documento?
          </h3>
          <p className="text-xs text-subtle">
            Tem a certeza que deseja remover o tipo{' '}
            <strong className="text-zinc-800 dark:text-zinc-200">{target.name}</strong>? Esta ação efetuará soft
            delete e o slot deixará de surgir para os clientes.
          </p>
        </div>

        {remove.isError && (
          <div
            role="alert"
            className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{apiErrorMessage(remove.error, 'Não foi possível eliminar o tipo de documento.')}</span>
          </div>
        )}

        <div className="flex items-center justify-center gap-2 pt-2">
          <Button variant="outline" onClick={onClose} disabled={remove.isPending}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={() => remove.mutate()} disabled={remove.isPending}>
            {remove.isPending ? <Spinner size="sm" /> : 'Confirmar Eliminação'}
          </Button>
        </div>
      </div>
    </div>
  );
};
