'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { AlertTriangle, Shield, Car, Flame, User, Plus, Search, Clock, ChevronDown, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

const MapComponent = dynamic(() => import('@/components/map/TacticalMap'), { ssr: false, loading: () => <div className="h-full w-full bg-muted/20 animate-pulse" /> });

const INCIDENT_TYPES = {
    SEGURANÇA: { label: 'Segurança', icon: Shield, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
    ACIDENTE: { label: 'Acidente', icon: Car, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
    INCÊNDIO: { label: 'Incêndio', icon: Flame, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
    OPERACIONAL: { label: 'Operacional', icon: AlertTriangle, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
    CIVIL: { label: 'Ocorrência Civil', icon: User, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
};

const STATUS_STYLES: Record<string, string> = {
    'ATIVO': 'text-red-400 border-red-500/30 bg-red-500/5',
    'EM_PROGRESSO': 'text-amber-400 border-amber-500/30 bg-amber-500/5',
    'RESOLVIDO': 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5',
    'ARQUIVADO': 'text-foreground/30 border-border bg-muted/10',
};



import api from '@/lib/axios';

import { useIncidents, useCreateIncident, useUpdateIncidentStatus } from '@/hooks/use-incidents';
import { useToast } from '@/hooks/use-toast';
import authService from '@/lib/services/auth.service';

const PRIORITIES = { ALTA: 'text-red-400 border-red-500/30', MEDIA: 'text-amber-400 border-amber-500/30', BAIXA: 'text-blue-400 border-blue-500/30' };

export default function IncidentsPage() {
    const { data, isLoading } = useIncidents();
    const incidents = (data as any[]) || [];
    const createMutation = useCreateIncident();
    const updateStatusMutation = useUpdateIncidentStatus();
    const { toast } = useToast();
    const user = authService.getUser();

    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('Todos');
    const [filterStatus, setFilterStatus] = useState('Todos');
    const [selectedIncident, setSelectedIncident] = useState<any | null>(null);
    const [mapCenter, setMapCenter] = useState<[number, number]>([-8.8383, 13.2344]);
    const [mapZoom, setMapZoom] = useState(12);
    const [showForm, setShowForm] = useState(false);

    // Form attributes
    const [formTitle, setFormTitle] = useState('');
    const [formType, setFormType] = useState('SEGURANÇA');
    const [formLocation, setFormLocation] = useState('');
    const [formDesc, setFormDesc] = useState('');
    const [formPriority, setFormPriority] = useState('MEDIA');
    const [formLat, setFormLat] = useState<number | null>(null);
    const [formLng, setFormLng] = useState<number | null>(null);

    const handleUseMyLocation = () => {
        if (!navigator.geolocation) {
            toast({ title: "Erro", description: "Geolocalização não suportada.", variant: "destructive" });
            return;
        }

        navigator.geolocation.getCurrentPosition((pos) => {
            setFormLat(pos.coords.latitude);
            setFormLng(pos.coords.longitude);
            setFormLocation(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
            toast({ title: "Localizado", description: "Sua posição foi detectada." });
        }, (err) => {
            toast({ title: "Erro", description: "Não foi possível obter sua localização.", variant: "destructive" });
        });
    };

    const handleReport = async () => {
        if (!formTitle || !formLocation) {
            toast({ title: "Erro", description: "Título e localização são obrigatórios.", variant: "destructive" });
            return;
        }

        const newCode = `INC-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`;
        const newIncident = {
            code: newCode,
            title: formTitle,
            type: formType,
            status: 'ATIVO',
            lat: formLat || -8.8383 + (Math.random() - 0.5) * 0.1,
            lng: formLng || 13.2344 + (Math.random() - 0.5) * 0.1,
            location: formLocation,
            priority: formPriority,
            description: formDesc,
            reporterId: user?.id
        };

        createMutation.mutate(newIncident, {
            onSuccess: () => {
                toast({ title: "Sucesso", description: "Incidente reportado com sucesso." });
                setShowForm(false);
                setFormTitle('');
                setFormLocation('');
                setFormDesc('');
            }
        });
    };

    const handleUpdateStatus = (id: string, status: string) => {
        updateStatusMutation.mutate({ id, status }, {
            onSuccess: () => {
                toast({ title: "Status Atualizado", description: `Incidente marcado como ${status.replace('_', ' ')}.` });
                setSelectedIncident((prev: any) => prev?.id === id ? { ...prev, status } : prev);
            }
        });
    };

    const filtered = incidents.filter((inc: any) => {
        const matchType = filterType === 'Todos' || inc.type === filterType;
        const matchStatus = filterStatus === 'Todos' || inc.status === filterStatus;
        const matchSearch = inc.title.toLowerCase().includes(search.toLowerCase()) || 
                          inc.location.toLowerCase().includes(search.toLowerCase()) || 
                          (inc.id && inc.id.toLowerCase().includes(search.toLowerCase())) ||
                          (inc.code && inc.code.toLowerCase().includes(search.toLowerCase()));
        return matchType && matchStatus && matchSearch;
    });

    const stats = {
        total: incidents.length,
        ativo: incidents.filter((i: any) => i.status === 'ATIVO').length,
        emProgresso: incidents.filter((i: any) => i.status === 'EM_PROGRESSO').length,
        resolvido: incidents.filter((i: any) => i.status === 'RESOLVIDO').length,
    };

    if (isLoading) {
        return <div className="p-20 text-center font-mono animate-pulse">CARREGANDO MALHA DE INCIDENTES...</div>;
    }

    return (
        <div className="flex flex-col gap-8 w-full pb-20">

            {/* Header */}
            <div className="border-b border-border pb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-center gap-3">
                    <div className="h-6 w-1.5 bg-yellow-500" />
                    <div>
                        <span className="text-[8px] font-black font-mono uppercase tracking-[0.4em] text-yellow-500/70 block">Layer 05 — Incidentes em Tempo Real</span>
                        <h1 className="text-3xl font-black tracking-tighter uppercase leading-none">Central de Incidentes</h1>
                    </div>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="tactical-btn-primary px-8 text-[9px] inline-flex items-center gap-2 self-start"
                >
                    <Plus className="w-3.5 h-3.5" /> Reportar Incidente
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border border border-border">
                {[
                    { label: 'Total Hoje', value: stats.total, color: 'text-foreground' },
                    { label: 'Ativos', value: stats.ativo, color: 'text-red-400' },
                    { label: 'Em Progresso', value: stats.emProgresso, color: 'text-amber-400' },
                    { label: 'Resolvidos', value: stats.resolvido, color: 'text-emerald-400' },
                ].map(s => (
                    <div key={s.label} className="bg-card p-6">
                        <div className={cn("text-3xl font-black tracking-tighter", s.color)}>{s.value}</div>
                        <div className="text-[8px] font-black uppercase tracking-widest opacity-40 font-mono mt-1">{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Type chips */}
            <div className="flex gap-2 flex-wrap">
                <button onClick={() => setFilterType('Todos')} className={cn("px-3 py-1.5 text-[8px] font-black uppercase tracking-widest border transition-all font-mono", filterType === 'Todos' ? "bg-foreground text-background border-foreground" : "border-border hover:bg-muted/30")}>
                    Todos
                </button>
                {Object.entries(INCIDENT_TYPES).map(([key, val]: [string, any]) => (
                    <button key={key} onClick={() => setFilterType(key)}
                        className={cn("px-3 py-1.5 text-[8px] font-black uppercase tracking-widest border transition-all font-mono flex items-center gap-1.5",
                            filterType === key ? `${val.color} ${val.border} ${val.bg}` : `border-border hover:bg-muted/30 ${val.color} opacity-60 hover:opacity-100`
                        )}
                    >
                        <val.icon className="w-3 h-3" /> {val.label}
                    </button>
                ))}
            </div>

            {/* Main */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-px bg-border border border-border min-h-[600px]">

                {/* Incident List */}
                <div className="xl:col-span-5 bg-card flex flex-col">
                    {/* Search Panel */}
                    <div className="p-4 border-b border-border space-y-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 opacity-30" />
                            <input
                                type="text"
                                placeholder="PESQUISAR INCIDENTE..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full bg-muted/30 border border-border pl-8 pr-4 py-2 text-[10px] font-black uppercase tracking-wider focus:outline-none focus:border-primary font-mono placeholder:opacity-30 transition-colors"
                            />
                        </div>
                        <div className="flex gap-1 flex-wrap">
                            {['Todos', 'ATIVO', 'EM_PROGRESSO', 'RESOLVIDO'].map(s => (
                                <button key={s} onClick={() => setFilterStatus(s)}
                                    className={cn("px-2 py-1 text-[7px] font-black uppercase tracking-wider border transition-all font-mono",
                                        filterStatus === s ? "bg-foreground text-background border-foreground" : "border-border hover:border-foreground/50"
                                    )}>{s.replace('_', ' ')}</button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto divide-y divide-border/30 scrollbar-hide">
                        {filtered.map((inc: any, idx: number) => {
                            const typeStyle = INCIDENT_TYPES[inc.type as keyof typeof INCIDENT_TYPES] || INCIDENT_TYPES.OPERACIONAL;
                            const isSelected = selectedIncident?.id === inc.id;
                            const time = new Date(inc.createdAt).toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' });
                            return (
                                <motion.div
                                    key={inc.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.04 }}
                                    onClick={() => {
                                        setSelectedIncident(inc);
                                        setMapCenter([inc.lat, inc.lng]);
                                        setMapZoom(15);
                                    }}
                                    className={cn("p-4 cursor-pointer transition-all", isSelected ? "bg-foreground text-background" : "hover:bg-muted/30")}
                                >
                                    <div className="flex gap-3">
                                        <div className={cn("p-2 border shrink-0 mt-0.5", typeStyle.bg, typeStyle.border)}>
                                            <typeStyle.icon className={cn("w-3.5 h-3.5", isSelected ? "text-background" : typeStyle.color)} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <span className="text-[11px] font-black uppercase tracking-tight leading-tight">{inc.title}</span>
                                                <span className={cn("text-[7px] font-black font-mono px-1.5 py-0.5 border shrink-0", isSelected ? "border-background/30 text-background" : STATUS_STYLES[inc.status])}>
                                                    {inc.status.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <div className="flex gap-3 mt-1">
                                                <span className={cn("text-[8px] font-mono opacity-50 truncate", isSelected ? "text-background" : "")}>{inc.location}</span>
                                            </div>
                                            <div className="flex gap-3 mt-1 items-center">
                                                <Clock className={cn("w-2.5 h-2.5 opacity-30", isSelected ? "text-background" : "")} />
                                                <span className={cn("text-[8px] font-mono opacity-40", isSelected ? "text-background" : "")}>{time}</span>
                                                <span className={cn("text-[7px] font-black font-mono px-1 border", isSelected ? "border-background/30 text-background" : (PRIORITIES as any)[inc.priority])}>
                                                    P_{inc.priority}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                    <div className="p-3 border-t border-border bg-muted/10">
                        <span className="text-[7px] font-black font-mono uppercase tracking-widest opacity-30">{filtered.length} de {incidents.length} incidentes</span>
                    </div>
                </div>

                {/* Map + Detail Panel */}
                <div className="xl:col-span-7 relative flex flex-col min-h-[400px]">
                    <div className="flex-1 relative">
                        <MapComponent center={mapCenter} zoom={mapZoom} incidents={filtered} />

                        {/* Selected Incident Detail */}
                        {selectedIncident && (() => {
                            const typeStyle = INCIDENT_TYPES[selectedIncident.type as keyof typeof INCIDENT_TYPES] || INCIDENT_TYPES.OPERACIONAL;
                            return (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="absolute bottom-4 left-4 right-4 z-10 bg-background/95 backdrop-blur-md border border-border p-5 shadow-2xl tactical-panel"
                                >
                                    <div className="flex items-start justify-between mb-3 border-b border-border/20 pb-3">
                                        <div className="flex items-center gap-3">
                                            <div className={cn("p-2 border", typeStyle.bg, typeStyle.border)}>
                                                <typeStyle.icon className={cn("w-4 h-4", typeStyle.color)} />
                                            </div>
                                            <div>
                                                <span className="text-[7px] font-mono font-black uppercase tracking-[0.4em] opacity-50 block">{selectedIncident.code || selectedIncident.id} — {selectedIncident.type}</span>
                                                <span className="text-[12px] font-black uppercase leading-tight block">{selectedIncident.title}</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="flex gap-1">
                                                {selectedIncident.status !== 'EM_PROGRESSO' && (
                                                    <button onClick={() => handleUpdateStatus(selectedIncident.id, 'EM_PROGRESSO')} className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-500 text-[8px] font-bold uppercase hover:bg-amber-500 hover:text-white transition-all">Atender</button>
                                                )}
                                                {selectedIncident.status !== 'RESOLVIDO' && (
                                                    <button onClick={() => handleUpdateStatus(selectedIncident.id, 'RESOLVIDO')} className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-[8px] font-bold uppercase hover:bg-emerald-500 hover:text-white transition-all">Resolver</button>
                                                )}
                                            </div>
                                            <button onClick={() => setSelectedIncident(null)} className="text-foreground/30 hover:text-foreground ml-2">✕</button>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground leading-relaxed mb-4">{selectedIncident.description || 'Sem descrição adicional.'}</p>
                                    <div className="grid grid-cols-3 gap-1">
                                        {[
                                            { label: 'Localização', value: selectedIncident.location },
                                            { label: 'Reportado por', value: selectedIncident.reporter?.name || 'Sistema' },
                                            { label: 'Data/Hora', value: new Date(selectedIncident.createdAt).toLocaleString('pt-AO') },
                                        ].map(d => (
                                            <div key={d.label} className="bg-muted/30 p-2 border border-border/20">
                                                <span className="text-[6px] font-mono opacity-40 block uppercase tracking-widest">{d.label}</span>
                                                <span className="text-[9px] font-black truncate block mt-0.5">{d.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            );
                        })()}
                    </div>
                </div>
            </div>

            {/* Report Form Modal */}
            {showForm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-card border border-border w-full max-w-lg tactical-panel shadow-2xl relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
                        
                        <div className="p-4 border-b border-border flex items-center justify-between bg-muted/20">
                            <span className="text-[10px] font-black font-mono uppercase tracking-[0.3em] flex items-center gap-2">
                                <AlertTriangle className="w-3 h-3 text-primary" /> Reportar Novo Incidente_Geospace
                            </span>
                            <button onClick={() => setShowForm(false)} className="text-foreground/40 hover:text-foreground">✕</button>
                        </div>
                        
                        <div className="p-6 space-y-5">
                            <div>
                                <label className="text-[7px] font-black font-mono uppercase tracking-widest opacity-50 block mb-2">Selecione o Sector / Natureza</label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5">
                                    {Object.entries(INCIDENT_TYPES).map(([key, val]: [string, any]) => (
                                        <button 
                                            key={key} 
                                            onClick={() => setFormType(key)}
                                            className={cn("p-2.5 border text-[7px] font-black font-mono uppercase flex items-center gap-1.5 transition-all", 
                                            formType === key ? `${val.border} ${val.bg} ${val.color} scale-[1.02]` : "border-border opacity-50 hover:opacity-100")}
                                        >
                                            <val.icon className="w-3.5 h-3.5" /> 
                                            <span className="truncate">{val.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[7px] font-black font-mono uppercase tracking-widest opacity-50 block mb-2">Título do Alerta</label>
                                    <input 
                                        type="text" 
                                        value={formTitle}
                                        onChange={e => setFormTitle(e.target.value)}
                                        className="w-full bg-muted/40 border border-border px-3 py-2 text-[11px] focus:outline-none focus:border-primary font-mono transition-colors uppercase" 
                                        placeholder="EX: SUSPEITO IDENTIFICADO" 
                                    />
                                </div>
                                <div>
                                    <label className="text-[7px] font-black font-mono uppercase tracking-widest opacity-50 block mb-2">Prioridade_OKUSANGA</label>
                                    <select 
                                        value={formPriority}
                                        onChange={e => setFormPriority(e.target.value)}
                                        className="w-full bg-muted/40 border border-border px-3 py-2 text-[11px] focus:outline-none focus:border-primary font-mono transition-colors"
                                    >
                                        <option value="BAIXA">PRIORIDADE BAIXA</option>
                                        <option value="MEDIA">PRIORIDADE MÉDIA</option>
                                        <option value="ALTA">PRIORIDADE CRÍTICA</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-[7px] font-black font-mono uppercase tracking-widest opacity-50 block mb-2">Vetor de Geolocation (Localização)</label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 opacity-30" />
                                        <input 
                                            type="text" 
                                            value={formLocation}
                                            onChange={e => setFormLocation(e.target.value)}
                                            className="w-full bg-muted/40 border border-border pl-10 pr-4 py-2 text-[11px] focus:outline-none focus:border-primary font-mono transition-colors" 
                                            placeholder="ENDEREÇO OU PONTO DE INTERESSE" 
                                        />
                                    </div>
                                    <button 
                                        onClick={handleUseMyLocation}
                                        className="px-4 border border-primary/30 bg-primary/10 text-primary text-[8px] font-black uppercase hover:bg-primary hover:text-white transition-all"
                                    >
                                        DETECTAR GPS
                                    </button>
                                </div>
                                {formLat && (
                                    <span className="text-[7px] font-mono opacity-40 mt-1 block tracking-wider">COORDENADAS SELECIONADAS: {formLat.toFixed(6)}, {formLng?.toFixed(6)}</span>
                                )}
                            </div>

                            <div>
                                <label className="text-[7px] font-black font-mono uppercase tracking-widest opacity-50 block mb-2">Relatório Sintético (Descrição)</label>
                                <textarea 
                                    rows={3}
                                    value={formDesc}
                                    onChange={e => setFormDesc(e.target.value)}
                                    className="w-full bg-muted/40 border border-border px-3 py-2 text-[11px] focus:outline-none focus:border-primary font-mono transition-colors resize-none" 
                                    placeholder="DETALHES ADICIONAIS DA OCORRÊNCIA..." 
                                />
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button 
                                    onClick={handleReport}
                                    disabled={createMutation.isPending}
                                    className="tactical-btn-primary flex-1 text-[9px] py-3 disabled:opacity-50"
                                >
                                    {createMutation.isPending ? 'SINCRONIZANDO_MALHA...' : 'SUBMETER ALERTA ESTRATÉGICO'}
                                </button>
                                <button onClick={() => setShowForm(false)} className="tactical-btn px-8 text-[9px] py-3 uppercase font-black">Abortar</button>
                            </div>
                        </div>

                        <div className="bg-muted/30 p-2 border-t border-border/30">
                            <span className="text-[6px] font-black font-mono uppercase tracking-[0.5em] opacity-30 text-center block animate-pulse">
                                Encrypted Secure Channel — Geospace Intelligence
                            </span>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}

