'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useEmergency, useResolveEmergency, useUpdateEmergency } from '@/hooks/use-emergencies';
import { cn } from '@/lib/utils';
import {
    ShieldAlert, MapPin, Clock, User, Phone, Car,
    MessageSquare, AlertTriangle, ShieldCheck,
    XOctagon, ChevronLeft, Send
} from 'lucide-react';
import dynamic from 'next/dynamic';

const TacticalMap = dynamic(() => import('@/components/map/TacticalMap'), { ssr: false });

export default function EmergencyDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const { data: emergency, isLoading } = useEmergency(id);
    const resolveMutation = useResolveEmergency();
    const updateMutation = useUpdateEmergency();

    const [note, setNote] = useState('');

    if (isLoading) {
        return (
            <div className="p-20 text-center animate-pulse font-tactical text-[10px] uppercase tracking-[0.5em]">
                Sincronizando Dados de Incidente...
            </div>
        );
    }

    if (!emergency) {
        return (
            <div className="p-20 text-center font-tactical text-[10px] uppercase tracking-[0.5em]">
                Incidente não localizado na malha.
            </div>
        );
    }

    const handleResolve = () => {
        if (confirm('Marcar incidente como RESOLVIDO?')) {
            resolveMutation.mutate({ id, notes: note });
        }
    };

    return (
        <div className="flex flex-col gap-8 w-full pb-20 p-8">
            {/* Tactical Breadcrumb */}
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 group text-muted-foreground hover:text-foreground transition-colors"
            >
                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-[8px] font-black uppercase tracking-[0.3em] font-tactical">Retornar à Fila</span>
            </button>

            {/* Tactical Header */}
            <div className="border-b border-border pb-8 flex flex-col md:flex-row justify-between items-end gap-8 relative">
                <div className="absolute top-0 right-0 opacity-[0.01] pointer-events-none font-black text-[120px] leading-none -translate-y-1/3 select-none uppercase">INCIDENTE</div>

                <div className="space-y-3 z-10 w-full lg:w-2/3">
                    <div className="flex items-center gap-4">
                        <div className={cn(
                            "h-5 px-3 flex items-center text-[9px] font-black uppercase tracking-widest",
                            emergency.priority === 'CRITICAL' ? "bg-red-600 text-white" : "bg-orange-500 text-white"
                        )}>
                            {emergency.priority}
                        </div>
                        <h1 className="text-4xl font-black uppercase tracking-tighter leading-none">Protocolo_#{emergency.id.substring(0, 8)}</h1>
                    </div>
                    <div className="flex flex-wrap gap-6 font-tactical">
                        <div className="flex items-center gap-2">
                            <span className="text-foreground/40 text-[8px] font-black uppercase tracking-[0.3em]">Status:</span>
                            <span className={cn(
                                "text-[8px] font-black uppercase tracking-[0.3em]",
                                emergency.status === 'RESOLVED' ? "text-green-500" : "text-red-500 animate-pulse"
                            )}>{emergency.status}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground border-l border-border pl-6">
                            <span className="text-[8px] font-black uppercase tracking-[0.3em] opacity-30">Iniciado: {new Date(emergency.createdAt).toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2 z-10">
                    <button
                        onClick={handleResolve}
                        disabled={emergency.status === 'RESOLVED'}
                        className="tactical-btn h-12 px-8 bg-green-500/10 border-green-500/30 text-green-500 hover:bg-green-500 hover:text-white transition-all text-[9px] font-black uppercase tracking-widest"
                    >
                        RESOLVER_CASO
                    </button>
                    <button className="tactical-btn h-12 px-8 bg-red-500/10 border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white transition-all text-[9px] font-black uppercase tracking-widest">
                        ESCALAR_UNIT
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Map & Evidence */}
                <div className="lg:col-span-8 flex flex-col gap-8">
                    {/* Map Hub */}
                    <div className="tactical-panel h-[400px] relative overflow-hidden group">
                        <div className="absolute top-4 left-4 z-10 p-4 bg-background/90 backdrop-blur-md border border-border flex flex-col gap-1">
                            <span className="text-[7px] font-black uppercase tracking-widest opacity-40">Coordenadas_GPS</span>
                            <span className="text-[10px] font-mono font-black">{emergency.latitude.toFixed(6)}, {emergency.longitude.toFixed(6)}</span>
                        </div>
                        <TacticalMap emergencies={[emergency]} center={[emergency.latitude, emergency.longitude]} zoom={16} />
                    </div>

                </div>

                {/* Right Column: Entity Data & Notes */}
                <div className="lg:col-span-4 flex flex-col gap-8">
                    {/* User Data Card */}
                    <div className="tactical-panel p-8 space-y-6">
                        <div className="flex items-center gap-3 border-b border-border pb-4">
                            <User className="w-5 h-5 opacity-40" />
                            <span className="text-[11px] font-black uppercase tracking-[0.2em]">Agente Envolvido</span>
                        </div>

                        <div className="space-y-4">
                            <div className="flex flex-col gap-1">
                                <span className="text-[7px] font-black uppercase opacity-30">Nome_Operacional</span>
                                <span className="text-xl font-black uppercase tracking-tight">{emergency.user?.name || 'DESCONHECIDO'}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[7px] font-black uppercase opacity-30">Tipo_Nexus</span>
                                    <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 border border-border inline-block w-fit">{emergency.userType}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[7px] font-black uppercase opacity-30">Contacto_Unidade</span>
                                    <span className="text-[10px] font-black font-tactical">{emergency.user?.phone || '---'}</span>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Operational Notes */}
                    <div className="tactical-panel p-8 space-y-6 flex-1">
                        <div className="flex items-center gap-3 border-b border-border pb-4">
                            <MessageSquare className="w-5 h-5 opacity-40" />
                            <span className="text-[11px] font-black uppercase tracking-[0.2em]">Notas Operacionais</span>
                        </div>

                        <div className="flex flex-col h-full gap-4">
                            <div className="flex-1 bg-muted/20 p-4 border border-border text-[10px] font-mono opacity-60 overflow-y-auto min-h-[150px]">
                                {emergency.notes || '> Iniciando escuta de log...\n> Protocolo aberto via dispositivo móvel.\n> Aguardando intervenção humana.'}
                            </div>

                            <div className="space-y-2">
                                <textarea
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="ADICIONAR_COMENTÁRIO_TÁTICO..."
                                    className="w-full bg-background border border-border p-4 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-primary min-h-[100px] resize-none"
                                />
                                <button
                                    onClick={() => updateMutation.mutate({ id, data: { notes: note } })}
                                    className="tactical-btn-primary w-full h-10 flex items-center justify-center gap-2 group"
                                >
                                    <Send className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                    <span>ENVIAR_AO_LOG</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
