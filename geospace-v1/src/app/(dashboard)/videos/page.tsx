'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Play, FileVideo, MessageSquare, Video, Download } from 'lucide-react';

interface MediaFile {
    id: string;
    type: 'VIDEO_CALL' | 'CHAT_LOG' | 'SURVEILLANCE';
    title: string;
    duration: string;
    date: string;
    size: string;
    participants: string[];
    thumbnail?: string;
}

const MOCK_MEDIA: MediaFile[] = [
    {
        id: 'VID_001',
        type: 'VIDEO_CALL',
        title: 'Chamada de Emergência - Ocorrência #442',
        duration: '14:20',
        date: new Date().toISOString(),
        size: '145 MB',
        participants: ['Op. Carlos', 'Unidade Móvel 4'],
    },
    {
        id: 'VID_002',
        type: 'SURVEILLANCE',
        title: 'Câmera Viana - Cruzamento Principal',
        duration: '45:00',
        date: new Date(Date.now() - 86400000).toISOString(),
        size: '450 MB',
        participants: ['Automático'],
    },
    {
        id: 'CHT_003',
        type: 'CHAT_LOG',
        title: 'Log de Chat - Coordenação Tática',
        duration: 'N/A',
        date: new Date(Date.now() - 120000000).toISOString(),
        size: '2 MB',
        participants: ['Central', 'Patrulha Alfa'],
    },
];

export default function VideosPage() {
    const [selectedMedia, setSelectedMedia] = useState<MediaFile | null>(MOCK_MEDIA[0]);

    return (
        <div className="flex flex-col gap-8 w-full pb-20">
            {/* Header Hub */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b-2 border-border pb-8 relative">
                <div className="absolute top-0 right-0 opacity-[0.01] pointer-events-none font-black text-[80px] leading-none -translate-y-1/4 select-none">ARQUIVO_MEDIA</div>

                <div className="space-y-3 z-10">
                    <div className="flex items-center gap-3">
                        <div className="h-4 w-1 bg-foreground" />
                        <h1 className="text-3xl font-black uppercase tracking-tighter leading-none">Arquivo Multimídia</h1>
                    </div>
                    <div className="flex gap-6 font-tactical">
                        <div className="flex items-center gap-2">
                            <span className="text-foreground/40 text-[8px] font-black uppercase tracking-[0.3em]">Vídeos</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground border-l border-border pl-6">
                            <span className="text-[8px] font-black uppercase tracking-[0.3em] opacity-30">Chamadas</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-px bg-border border border-border">
                {/* List */}
                <div className="xl:col-span-4 bg-background flex flex-col h-[700px]">
                    <div className="p-4 border-b border-border bg-muted/20">
                        <span className="text-[9px] font-black uppercase tracking-widest opacity-50">Lista de Arquivos</span>
                    </div>
                    <div className="flex-1 overflow-y-auto divide-y divide-border/20">
                        {MOCK_MEDIA.map((media) => (
                            <div
                                key={media.id}
                                onClick={() => setSelectedMedia(media)}
                                className={cn(
                                    "p-6 cursor-pointer hover:bg-muted/50 transition-all border-l-4 group",
                                    selectedMedia?.id === media.id ? "border-foreground bg-muted/10" : "border-transparent"
                                )}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        {media.type === 'VIDEO_CALL' && <Video className="w-3 h-3 opacity-50" />}
                                        {media.type === 'CHAT_LOG' && <MessageSquare className="w-3 h-3 opacity-50" />}
                                        {media.type === 'SURVEILLANCE' && <FileVideo className="w-3 h-3 opacity-50" />}
                                        <span className="text-[8px] font-black uppercase tracking-[0.2em] font-tactical text-muted-foreground">
                                            {media.type === 'VIDEO_CALL' ? 'CHAMADA_VÍDEO' : media.type === 'CHAT_LOG' ? 'REGISTRO_CHAT' : 'VIGILÂNCIA'}
                                        </span>
                                    </div>
                                    <span className="text-[8px] font-bold opacity-30">{media.date.split('T')[0]}</span>
                                </div>
                                <h4 className="text-sm font-bold uppercase leading-tight mb-2">{media.title}</h4>
                                <div className="flex items-center gap-4 text-[9px] font-tactical opacity-50">
                                    <span>{media.duration}</span>
                                    <span>{media.size}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Player / Viewer */}
                <div className="xl:col-span-8 bg-card flex flex-col h-[700px]">
                    {selectedMedia ? (
                        <div className="flex flex-col h-full">
                            <div className="p-6 border-b border-border flex justify-between items-center bg-muted/10">
                                <div className="flex flex-col">
                                    <span className="text-[8px] font-black uppercase tracking-[0.3em] opacity-40">Visualizando</span>
                                    <h2 className="text-lg font-black uppercase tracking-widest">{selectedMedia.title}</h2>
                                </div>
                                <button className="tactical-btn px-6 gap-2">
                                    <Download className="w-3 h-3" />
                                    <span className="text-[9px]">Baixar</span>
                                </button>
                            </div>

                            <div className="flex-1 bg-black/90 flex items-center justify-center relative group overflow-hidden">
                                {selectedMedia.type === 'CHAT_LOG' ? (
                                    <div className="text-center opacity-30">
                                        <MessageSquare className="w-16 h-16 mx-auto mb-4" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Log de Chat Textual</span>
                                    </div>
                                ) : (
                                    <>
                                        {/* Mock Video Player UI */}
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-full h-full bg-gradient-to-t from-black/50 to-transparent absolute inset-0" />
                                            <Play className="w-16 h-16 text-white opacity-50 group-hover:opacity-100 transition-opacity cursor-pointer transform hover:scale-110 duration-200" />
                                        </div>
                                        <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col gap-2">
                                            <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                                                <div className="w-1/3 h-full bg-emerald-500" />
                                            </div>
                                            <div className="flex justify-between text-white/50 text-[9px] font-tactical font-black uppercase tracking-widest">
                                                <span>00:00:00</span>
                                                <span>{selectedMedia.duration}</span>
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div className="absolute top-4 left-4 p-2 bg-black/50 border border-white/10 text-[8px] font-black uppercase tracking-[0.2em] text-white/70 font-tactical">
                                    REC::{selectedMedia.participants.join(' // ')}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center opacity-10">
                            <span className="text-[10px] font-black uppercase tracking-[0.5em]">Nenhuma Mídia Selecionada</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
