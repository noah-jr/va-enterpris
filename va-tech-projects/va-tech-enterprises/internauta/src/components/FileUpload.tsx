'use client';

import { useState } from 'react';
import { Upload, X, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface FileUploadProps {
    onUploadComplete?: (url: string) => void;
    folder?: string;
    accept?: string;
    maxSizeMB?: number;
}

export function FileUpload({
    onUploadComplete,
    folder = 'va-uploads',
    accept = 'image/*,video/*,application/pdf',
    maxSizeMB = 10,
}: FileUploadProps) {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        // Validar tamanho
        const maxSize = maxSizeMB * 1024 * 1024;
        if (selectedFile.size > maxSize) {
            setError(`Arquivo muito grande. Tamanho máximo: ${maxSizeMB}MB`);
            return;
        }

        setFile(selectedFile);
        setError(null);
        setUploadedUrl(null);
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setProgress(0);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('folder', folder);

            // Simular progresso (Cloudinary não fornece progresso real via API)
            const progressInterval = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return 90;
                    }
                    return prev + 10;
                });
            }, 200);

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            clearInterval(progressInterval);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erro ao fazer upload');
            }

            const { url } = await response.json();
            setProgress(100);
            setUploadedUrl(url);
            onUploadComplete?.(url);

            // Limpar após 2 segundos
            setTimeout(() => {
                setFile(null);
                setProgress(0);
            }, 2000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro desconhecido');
            setProgress(0);
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = () => {
        setFile(null);
        setUploadedUrl(null);
        setError(null);
        setProgress(0);
    };

    return (
        <div className="w-full space-y-4">
            {/* Upload Area */}
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center hover:border-gray-400 dark:hover:border-gray-600 transition-colors">
                <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept={accept}
                    onChange={handleFileChange}
                    disabled={uploading}
                />
                <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center space-y-2"
                >
                    <Upload className="w-12 h-12 text-gray-400" />
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                            Clique para fazer upload
                        </span>{' '}
                        ou arraste e solte
                    </div>
                    <div className="text-xs text-gray-500">
                        Máximo {maxSizeMB}MB
                    </div>
                </label>
            </div>

            {/* File Preview */}
            {file && (
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <div className="flex-shrink-0">
                                {file.type.startsWith('image/') ? (
                                    <img
                                        src={URL.createObjectURL(file)}
                                        alt="Preview"
                                        className="w-12 h-12 object-cover rounded"
                                    />
                                ) : (
                                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded flex items-center justify-center">
                                        <Upload className="w-6 h-6 text-gray-400" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                    {file.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleRemove}
                            disabled={uploading}
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>

                    {/* Progress Bar */}
                    {uploading && (
                        <div className="space-y-2">
                            <Progress value={progress} className="h-2" />
                            <p className="text-xs text-center text-gray-500">
                                Enviando... {progress}%
                            </p>
                        </div>
                    )}

                    {/* Success Message */}
                    {uploadedUrl && (
                        <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                            <Check className="w-4 h-4" />
                            <span className="text-sm">Upload concluído!</span>
                        </div>
                    )}

                    {/* Upload Button */}
                    {!uploading && !uploadedUrl && (
                        <Button
                            onClick={handleUpload}
                            className="w-full"
                            disabled={uploading}
                        >
                            <Upload className="w-4 h-4 mr-2" />
                            Enviar Arquivo
                        </Button>
                    )}
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <p className="text-sm font-medium text-red-800 dark:text-red-200">
                            Erro no upload
                        </p>
                        <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                            {error}
                        </p>
                    </div>
                </div>
            )}

            {/* Uploaded URL */}
            {uploadedUrl && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <p className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">
                        URL do arquivo:
                    </p>
                    <div className="flex items-center space-x-2">
                        <input
                            type="text"
                            value={uploadedUrl}
                            readOnly
                            className="flex-1 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-3 py-2 font-mono"
                        />
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                                navigator.clipboard.writeText(uploadedUrl);
                            }}
                        >
                            Copiar
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
