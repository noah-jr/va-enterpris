import * as React from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button, Input } from '@accountable/ui';
import { Link2, Copy, Ban, Check } from 'lucide-react';
import { adminApiService } from '../../../services/admin-api.service.js';
import { useAdminAuthStore } from '../../../stores/admin-auth.store.js';

export interface DocumentUploadLinkSectionProps {
  documentId: string;
}

export const DocumentUploadLinkSection: React.FC<DocumentUploadLinkSectionProps> = ({
  documentId,
}) => {
  const canRequestFile = useAdminAuthStore((s) => s.hasPermission('documents:request_file'));
  const [link, setLink] = React.useState<{ id: string; url: string; expiresAt: string } | null>(
    null,
  );
  const [copied, setCopied] = React.useState(false);

  const generateMutation = useMutation({
    mutationFn: () => adminApiService.createDocumentUploadLink(documentId),
    onSuccess: (res) => {
      if (res.data.token && res.data.url) {
        setLink({ id: res.data.id, url: res.data.url, expiresAt: res.data.expiresAt });
      }
      setCopied(false);
    },
  });

  const revokeMutation = useMutation({
    mutationFn: (linkId: string) => adminApiService.revokeDocumentUploadLink(documentId, linkId),
    onSuccess: () => setLink(null),
  });

  if (!canRequestFile) {
    return null;
  }

  const handleCopy = async () => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="pt-3 border-t border-border/80 space-y-2">
      <p className="text-[11px] font-semibold text-muted uppercase tracking-wider">
        Link de Envio Sem Login
      </p>

      {!link && (
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="w-full text-xs gap-1.5"
          isLoading={generateMutation.isPending}
          onClick={() => generateMutation.mutate()}
        >
          <Link2 className="w-3.5 h-3.5" />
          Gerar Link de Submissão
        </Button>
      )}

      {link && (
        <div className="space-y-2">
          <div className="flex gap-1.5">
            <Input readOnly value={link.url} className="text-xs bg-surface border-border text-foreground" />
            <Button type="button" size="sm" variant="secondary" onClick={handleCopy}>
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </Button>
          </div>
          {copied && <p className="text-[10px] text-emerald-700 dark:text-emerald-400">Link copiado para a área de transferência.</p>}
          <p className="text-[10px] text-subtle">
            Expira em {new Date(link.expiresAt).toLocaleString('pt-PT')}
          </p>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="w-full text-xs text-rose-700 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20"
            isLoading={revokeMutation.isPending}
            onClick={() => revokeMutation.mutate(link.id)}
          >
            <Ban className="w-3.5 h-3.5 mr-1.5" />
            Revogar Link
          </Button>
        </div>
      )}
    </div>
  );
};
