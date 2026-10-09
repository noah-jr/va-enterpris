'use client';

import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Upload,
    File,
    Image as ImageIcon,
    Trash2,
    Search,
    Download,
    Eye,
    Loader2,
    CheckCircle2,
    XCircle
} from 'lucide-react';

export default function AdminFilesPage() {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const [isDragActive, setIsDragActive] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
    const fileInputRef = useRef<HTMLInputElement>(null);
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['admin-files'],
        queryFn: async () => {
            const res = await fetch('/api/files');
            if (!res.ok) throw new Error('Erro ao carregar ficheiros');
            return res.json();
        },
    });

    const files = data?.files ?? [];

    const deleteMutation = useMutation({
        mutationFn: async (filename: string) => {
            const res = await fetch(`/api/files?filename=${filename}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Erro ao eliminar ficheiro');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-files'] });
        },
    });

    const uploadMutation = useMutation({
        mutationFn: async (file: File) => {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Erro no upload');
            }

            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-files'] });
        },
        onError: (error: any) => {
            alert(error.message);
        }
    });

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragActive(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragActive(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragActive(false);
        const droppedFiles = Array.from(e.dataTransfer.files);
        uploadFiles(droppedFiles);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files);
            uploadFiles(selectedFiles);
        }
    };

    const uploadFiles = async (filesToUpload: File[]) => {
        for (const file of filesToUpload) {
            uploadMutation.mutate(file);
        }
    };

    const filteredFiles = files.filter((file: any) =>
        file.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = (filename: string) => {
        if (confirm(`Tem a certeza que deseja eliminar ${filename}?`)) {
            deleteMutation.mutate(filename);
        }
    };

    const getFileIcon = (type: string) => {
        switch (type) {
            case 'image': return <ImageIcon size={32} className="text-gray-900" />;
            case 'pdf': return <File size={32} className="text-red-500" />;
            case 'doc': return <File size={32} className="text-black" />;
            default: return <File size={32} className="text-gray-400" />;
        }
    };

    return (
        <div className="p-4 lg:p-8 space-y-6">
            <h1 className="text-3xl font-bold text-black dark:text-white mb-2">
                Gestor de Ficheiros
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
                Upload e gestão de documentos e imagens
            </p>

            {/* Upload Area */}
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200
                    ${isDragActive
                        ? 'border-black dark:border-white bg-gray-50 dark:bg-gray-800'
                        : 'border-gray-200 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-600'
                    }`}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    multiple
                    onChange={handleFileSelect}
                />
                <div className="flex flex-col items-center gap-4">
                    <div className={`p-4 rounded-full ${uploadMutation.isPending ? 'bg-black dark:bg-white animate-pulse' : 'bg-gray-100 dark:bg-gray-800'}`}>
                        {uploadMutation.isPending ? (
                            <Loader2 size={32} className="text-white dark:text-black animate-spin" />
                        ) : (
                            <Upload size={32} className="text-gray-500 dark:text-gray-400" />
                        )}
                    </div>
                    <div>
                        <p className="text-lg font-medium text-black dark:text-white">
                            {uploadMutation.isPending ? 'A carregar ficheiro(s)...' : 'Arraste ficheiros ou clique para fazer upload'}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Imagens (JPEG, PNG, WebP) e Documentos até 5MB
                        </p>
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Pesquisar ficheiros..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-transparent focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-black text-white dark:bg-white dark:text-black' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-black text-white dark:bg-white dark:text-black' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>
                    </button>
                </div>
            </div>

            {/* Files View */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 size={48} className="text-black dark:text-white animate-spin mb-4" />
                    <p className="text-gray-500">A carregar ficheiros...</p>
                </div>
            ) : filteredFiles.length > 0 ? (
                viewMode === 'grid' ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {filteredFiles.map((file: any) => (
                            <div key={file.id} className="group relative bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all">
                                <div className="aspect-square bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center mb-3 group-hover:bg-gray-100 dark:group-hover:bg-gray-700 transition-colors overflow-hidden">
                                    {file.type === 'image' ? (
                                        <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                                    ) : getFileIcon(file.type)}
                                </div>
                                <p className="font-medium text-sm truncate text-black dark:text-white" title={file.name}>{file.name}</p>
                                <p className="text-xs text-gray-500 mt-1">{file.size}</p>

                                {/* Actions Overlay */}
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                    <a
                                        href={file.url}
                                        download
                                        className="p-1 bg-white dark:bg-gray-800 rounded shadow text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white"
                                    >
                                        <Download size={14} />
                                    </a>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDelete(file.name); }}
                                        className="p-1 bg-white dark:bg-gray-800 rounded shadow text-red-500 hover:text-red-600"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-800">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tamanho</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                    {filteredFiles.map((file: any) => (
                                        <tr key={file.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                            <td className="px-6 py-4 flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center overflow-hidden">
                                                    {file.type === 'image' ? (
                                                        <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                                                    ) : getFileIcon(file.type)}
                                                </div>
                                                <span className="text-sm font-medium text-black dark:text-white truncate max-w-[200px]" title={file.name}>
                                                    {file.name}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{file.size}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{file.date}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <a href={file.url} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                                                        <Eye size={18} />
                                                    </a>
                                                    <a href={file.url} download className="text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                                                        <Download size={18} />
                                                    </a>
                                                    <button
                                                        onClick={() => handleDelete(file.name)}
                                                        className="text-red-400 hover:text-red-600 transition-colors"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )
            ) : (
                <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
                    <File size={64} className="text-gray-300 dark:text-gray-700 mb-4" />
                    <p className="text-gray-500">Nenhum ficheiro encontrado</p>
                </div>
            )}
        </div>
    );
}
