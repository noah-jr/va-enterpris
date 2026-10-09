import * as React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button } from '@accountable/ui';
import { UploadCloud, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { AxiosError } from 'axios';
import type { ApiError } from '@accountable/types';
import { publicUploadLinkService } from '../../services/public-upload-link.service.js';

export const PublicUploadPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [uploadError, setUploadError] = React.useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = React.useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['public-upload-link', token],
    queryFn: () => publicUploadLinkService.getContext(token as string),
    enabled: Boolean(token),
    retry: false,
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => publicUploadLinkService.uploadFile(token as string, file),
    onSuccess: () => {
      setUploadSuccess('Ficheiro enviado com sucesso.');
      setUploadError(null);
      setSelectedFile(null);
      queryClient.invalidateQueries({ queryKey: ['public-upload-link', token] });
    },
    onError: (err) => {
      const axiosErr = err as AxiosError<ApiError>;
      setUploadError(axiosErr.response?.data?.message || 'Erro ao enviar o ficheiro.');
      setUploadSuccess(null);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setSelectedFile(e.target.files[0]);
      setUploadError(null);
      setUploadSuccess(null);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      uploadMutation.mutate(selectedFile);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa] dark:bg-[#09090b] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-6">
        <div className="text-center">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-950 font-bold text-sm mx-auto shadow-sm tracking-tight">
            VA
          </div>
          <h2 className="mt-3.5 text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">VA OneGest</h2>
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">Envio seguro de documentos sem necessidade de login</p>
        </div>

        {isLoading && (
          <Card>
            <CardContent className="py-10 text-center text-xs text-subtle">
              A validar o link de submissão...
            </CardContent>
          </Card>
        )}

        {!isLoading && (isError || !data) && (
          <Card>
            <CardContent className="py-8 text-center space-y-2">
              <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Este link é inválido ou expirou.
              </p>
              <p className="text-xs text-subtle">
                Contacte a empresa para obter um novo link de submissão.
              </p>
            </CardContent>
          </Card>
        )}

        {!isLoading && data && (
          <Card>
            <CardHeader>
              <CardTitle>{data.data.documentTitle}</CardTitle>
              <CardDescription>
                Destinatário: {data.data.clientName}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium">
                  {data.data.documentType}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium">
                  {data.data.documentStatus}
                </span>
              </div>

              {uploadError && (
                <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              {uploadSuccess && (
                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{uploadSuccess}</span>
                </div>
              )}

              <div className="space-y-3">
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Anexar Ficheiro (PDF, Word, Excel, Imagens)
                </label>

                <div className="border border-dashed border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 rounded-xl p-6 text-center bg-zinc-50/50 dark:bg-zinc-900/30 transition-colors">
                  <input
                    type="file"
                    id="public-file-upload"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.txt,.csv"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="public-file-upload"
                    className="cursor-pointer flex flex-col items-center justify-center space-y-2"
                  >
                    <div className="w-9 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 flex items-center justify-center">
                      <UploadCloud className="w-5 h-5" />
                    </div>
                    <div className="text-xs text-zinc-600 dark:text-zinc-300">
                      <span className="font-medium text-zinc-900 dark:text-zinc-100 underline underline-offset-2">
                        Clique para selecionar um ficheiro
                      </span>{' '}
                      ou arraste para aqui
                    </div>
                    <p className="text-[11px] text-subtle">
                      Máximo de 10MB (PDF, DOCX, XLSX, JPG, PNG, CSV, TXT)
                    </p>
                  </label>
                </div>

                {selectedFile && (
                  <div className="px-3.5 py-2.5 flex items-center justify-between text-xs text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900">
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="w-4 h-4 text-subtle shrink-0" />
                      <span className="font-medium truncate">{selectedFile.name}</span>
                      <span className="text-subtle text-[11px]">
                        ({(selectedFile.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                  </div>
                )}

                <Button
                  type="button"
                  className="w-full"
                  disabled={!selectedFile}
                  isLoading={uploadMutation.isPending}
                  onClick={handleUpload}
                >
                  Enviar Documento
                </Button>
              </div>

              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
                <p className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                  Ficheiros já enviados ({data.data.existingFiles.length})
                </p>
                {data.data.existingFiles.length === 0 && (
                  <p className="text-xs text-subtle">Nenhum ficheiro enviado ainda.</p>
                )}
                <ul className="divide-y divide-zinc-100 dark:divide-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden bg-white dark:bg-zinc-900">
                  {data.data.existingFiles.map((file, idx) => (
                    <li
                      key={`${file.originalName}-${idx}`}
                      className="px-3.5 py-2.5 flex items-center justify-between text-xs text-zinc-700 dark:text-zinc-300"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-4 h-4 text-subtle shrink-0" />
                        <span className="font-medium truncate">{file.originalName}</span>
                      </div>
                      <span className="text-subtle text-[11px]">
                        {new Date(file.createdAt).toLocaleDateString('pt-PT')}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
