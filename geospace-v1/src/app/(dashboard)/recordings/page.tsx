'use client';

import React, { useState } from 'react';
import { useRecordings, useDownloadRecording, useDeleteRecording, useRecording } from '@/hooks/use-recordings';
import type { RecordingFilters } from '@/lib/services/recording.service';
import recordingService from '@/lib/services/recording.service';
import { cn } from '@/lib/utils';
import { AudioPlayer } from '@/components/recordings/AudioPlayer';

export default function RecordingsPage() {
    const [filters, setFilters] = useState<RecordingFilters>({});
    const [selectedRecordingId, setSelectedRecordingId] = useState<string | null>(null);

    const { data: recordings, isLoading } = useRecordings(filters);
    const downloadRecording = useDownloadRecording();
    const deleteRecording = useDeleteRecording();

    const handleDownload = (id: string) => {
        downloadRecording.mutate(id);
    };

    const handleDelete = (id: string) => {
        if (confirm('Tem certeza que deseja deletar esta gravação? Esta ação não pode ser desfeita.')) {
            deleteRecording.mutate(id);
        }
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const formatFileSize = (bytes?: number) => {
        if (!bytes) return 'N/A';
        const mb = bytes / (1024 * 1024);
        return `${mb.toFixed(2)} MB`;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'READY': return 'bg-green-500/20 text-green-500 border-green-500';
            case 'PROCESSING': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500';
            case 'FAILED': return 'bg-red-500/20 text-red-500 border-red-500';
            default: return 'bg-muted text-muted-foreground border-border';
        }
    };

    return (
        <div className="flex flex-col gap-8 w-full pb-20">
            {/* Tactical Header */}
            <div className="border-b border-border pb-8 flex flex-col md:flex-row justify-between items-end gap-8 relative">
                <div className="absolute top-0 right-0 opacity-[0.01] pointer-events-none font-black text-[80px] leading-none -translate-y-1/4 select-none">GRAVAÇÕES</div>

                <div className="space-y-3 z-10">
                    <div className="flex items-center gap-3">
                        <div className="h-4 w-1 bg-foreground" />
                        <h1 className="text-3xl font-black uppercase tracking-tighter leading-none">Gravações de Áudio</h1>
                    </div>
                    <div className="flex gap-6 font-tactical">
                        <div className="flex items-center gap-2">
                            <span className="text-foreground/40 text-[8px] font-black uppercase tracking-[0.3em]">
                                Total: {recordings?.length || 0}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Filtros */}
                <div className="flex gap-2 z-10">
                    <select
                        className="tactical-btn px-4 text-[9px] bg-background"
                        value={filters.userType || ''}
                        onChange={(e) => setFilters({ ...filters, userType: e.target.value as any || undefined })}
                    >
                        <option value="">Todos os Tipos</option>
                        <option value="DRIVER">Motorista</option>
                        <option value="PASSENGER">Passageiro</option>
                    </select>
                    <select
                        className="tactical-btn px-4 text-[9px] bg-background"
                        value={filters.status || ''}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value as any || undefined })}
                    >
                        <option value="">Todos os Status</option>
                        <option value="READY">Pronto</option>
                        <option value="PROCESSING">Processando</option>
                        <option value="FAILED">Falhou</option>
                    </select>
                    <select
                        className="tactical-btn px-4 text-[9px] bg-background"
                        value={filters.hasTranscription?.toString() || ''}
                        onChange={(e) => setFilters({
                            ...filters,
                            hasTranscription: e.target.value ? e.target.value === 'true' : undefined
                        })}
                    >
                        <option value="">Transcrição: Todas</option>
                        <option value="true">Com Transcrição</option>
                        <option value="false">Sem Transcrição</option>
                    </select>
                </div>
            </div>

            {/* Audio Player (se houver gravação selecionada) */}
            {selectedRecordingId && (() => {
                const { data: selectedRecording } = useRecording(selectedRecordingId);
                if (!selectedRecording) return null;

                return (
                    <div className="border border-border bg-card">
                        <AudioPlayer
                            recordingId={selectedRecording.id}
                            fileName={`Gravação ${selectedRecording.userType}`}
                            audioUrl={recordingService.getDownloadUrl(selectedRecording.id)}
                            duration={selectedRecording.duration}
                            transcription={selectedRecording.transcription}
                            onDownload={() => handleDownload(selectedRecording.id)}
                        />
                    </div>
                );
            })()}

            {/* Tactical Data Grid */}
            <div className="border border-border w-full overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-12 bg-muted/40 h-10 border-b border-border text-[8px] font-black text-muted-foreground uppercase tracking-[0.4em] font-tactical">
                    <div className="col-span-2 flex items-center px-6 border-r border-border">ID</div>
                    <div className="col-span-2 flex items-center px-6 border-r border-border">Tipo</div>
                    <div className="col-span-1 flex items-center px-6 border-r border-border">Duração</div>
                    <div className="col-span-1 flex items-center px-6 border-r border-border">Tamanho</div>
                    <div className="col-span-2 flex items-center px-6 border-r border-border">Status</div>
                    <div className="col-span-2 flex items-center px-6 border-r border-border">Data</div>
                    <div className="col-span-2 flex items-center px-6 justify-end">Ações</div>
                </div>

                {/* Table Content */}
                <div className="divide-y divide-border/20">
                    {isLoading ? (
                        <div className="p-20 text-center opacity-10">
                            <span className="text-[8px] font-black uppercase tracking-[0.5em] font-tactical animate-pulse">Carregando...</span>
                        </div>
                    ) : !recordings || recordings.length === 0 ? (
                        <div className="p-20 text-center text-[8px] font-black uppercase text-muted-foreground opacity-20 font-tactical">Nenhuma gravação encontrada</div>
                    ) : (
                        recordings.map((recording) => (
                            <div key={recording.id} className="grid grid-cols-12 min-h-16 hover:bg-muted/30 group transition-all items-center">
                                <div className="col-span-2 px-6 h-full flex flex-col justify-center border-r border-border/10">
                                    <span className="text-[9px] font-black opacity-30 font-tactical uppercase truncate">
                                        #{recording.id.substring(0, 8)}
                                    </span>
                                </div>
                                <div className="col-span-2 px-6 h-full flex items-center border-r border-border/10">
                                    <div className="h-6 px-3 border border-border text-[8px] font-black uppercase tracking-widest flex items-center">
                                        {recording.userType}
                                    </div>
                                </div>
                                <div className="col-span-1 px-6 h-full flex items-center border-r border-border/10">
                                    <span className="text-[10px] font-bold font-tactical">{formatDuration(recording.duration)}</span>
                                </div>
                                <div className="col-span-1 px-6 h-full flex items-center border-r border-border/10">
                                    <span className="text-[9px] opacity-50">{formatFileSize(recording.fileSize)}</span>
                                </div>
                                <div className="col-span-2 px-6 h-full flex items-center border-r border-border/10">
                                    <div className={cn(
                                        "h-6 px-3 border text-[8px] font-black uppercase tracking-widest flex items-center",
                                        getStatusColor(recording.status)
                                    )}>
                                        {recording.status}
                                    </div>
                                </div>
                                <div className="col-span-2 px-6 h-full flex flex-col justify-center border-r border-border/10 font-tactical opacity-40">
                                    <span className="text-[8px] font-black">{new Date(recording.createdAt).toLocaleDateString()}</span>
                                    <span className="text-[7px] font-bold">{new Date(recording.createdAt).toLocaleTimeString()} HRS</span>
                                </div>
                                <div className="col-span-2 px-6 h-full flex items-center justify-end gap-2">
                                    <button
                                        onClick={() => setSelectedRecordingId(recording.id)}
                                        className="tactical-btn h-8 px-4 text-[8px] border-blue-500/40 hover:bg-blue-500/10"
                                    >
                                        PLAY
                                    </button>
                                    <button
                                        onClick={() => handleDownload(recording.id)}
                                        className="tactical-btn h-8 px-4 text-[8px] border-green-500/40 hover:bg-green-500/10"
                                    >
                                        DOWNLOAD
                                    </button>
                                    <button
                                        onClick={() => handleDelete(recording.id)}
                                        className="tactical-btn h-8 px-4 text-[8px] border-red-500/40 hover:bg-red-500/10"
                                    >
                                        DELETE
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
