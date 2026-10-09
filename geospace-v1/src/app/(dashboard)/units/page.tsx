'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { MapPin, Shield, Building2, Wifi, WifiOff, Plus, Filter, Search, ChevronRight, Zap, Loader2 } from 'lucide-react';
import { useUnits, useCreateUnit } from '@/hooks/use-units';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const MapComponent = dynamic(() => import('@/components/map/TacticalMap'), { ssr: false, loading: () => <div className="h-full w-full bg-muted/20 animate-pulse" /> });

const TYPE_ICONS: any = {
    'FRONTEIRA': Shield,
    'AGENCIA': Building2,
    'ESTRATEGICA': Zap,
    'PRIVADA': Building2,
};

const TYPE_COLORS: any = {
    'FRONTEIRA': 'text-emerald-400',
    'AGENCIA': 'text-blue-400',
    'ESTRATEGICA': 'text-amber-400',
    'PRIVADA': 'text-purple-400',
};

const STATUS_STYLES: Record<string, string> = {
    'OPERACIONAL': 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5',
    'DEGRADADO': 'text-amber-400 border-amber-500/30 bg-amber-500/5',
    'INATIVO': 'text-red-400 border-red-500/30 bg-red-500/5',
};



export default function UnitsPage() {
    const { data, isLoading } = useUnits();
    const units = (data as any[]) || [];
    const createMutation = useCreateUnit();
    const { toast } = useToast();

    const [selectedType, setSelectedType] = useState<string>('Todos');
    const [selectedStatus, setSelectedStatus] = useState<string>('Todos');
    const [search, setSearch] = useState('');
    const [selectedUnit, setSelectedUnit] = useState<any | null>(null);
    const [mapCenter, setMapCenter] = useState<[number, number]>([-8.8383, 13.2344]);
    const [mapZoom, setMapZoom] = useState(12);
    const [showForm, setShowForm] = useState(false);

    // Form attributes
    const [formName, setFormName] = useState('');
    const [formCode, setFormCode] = useState('');
    const [formUnitType, setFormUnitType] = useState('FRONTEIRA');
    const [formSector, setFormSector] = useState('');
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
            toast({ title: "Localizado", description: `Coordenadas capturadas: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}` });
        }, (err) => {
            toast({ title: "Erro", description: "Não foi possível obter sua localização.", variant: "destructive" });
        });
    };

    const handleCreateUnit = () => {
        if (!formName || !formCode || !formSector) {
            toast({ title: "Erro", description: "Todos os campos são obrigatórios.", variant: "destructive" });
            return;
        }

        createMutation.mutate({
            name: formName,
            code: formCode,
            type: formUnitType,
            sector: formSector,
            status: 'OPERACIONAL',
            lat: formLat || -8.8383 + (Math.random() - 0.5) * 0.2,
            lng: formLng || 13.2344 + (Math.random() - 0.5) * 0.2,
            agentsCount: 0
        }, {
            onSuccess: () => {
                toast({ title: "Sucesso", description: "Unidade registada com sucesso." });
                setShowForm(false);
                setFormName('');
                setFormCode('');
                setFormSector('');
            }
        });
    };

    const filtered = units.filter((u: any) => {
        const matchType = selectedType === 'Todos' || u.type === selectedType;
        const matchStatus = selectedStatus === 'Todos' || u.status === selectedStatus;
        const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.code.toLowerCase().includes(search.toLowerCase());
        return matchType && matchStatus && matchSearch;
    });

    const stats = {
        total: units.length,
        operational: units.filter((u: any) => u.status === 'OPERACIONAL').length,
        degraded: units.filter((u: any) => u.status === 'DEGRADADO').length,
        inactive: units.filter((u: any) => u.status === 'INATIVO').length,
    };

    if (isLoading) return (
        <div className="flex h-[80vh] items-center justify-center flex-col gap-4">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <span className="text-[10px] font-black font-mono uppercase tracking-[0.4em] opacity-40">Sincronizando Malha OKUSANGA...</span>
        </div>
    );

    return (
        <div className="flex flex-col gap-8 w-full pb-20">

            {/* Header */}
            <div className="border-b border-border pb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-3">
                        <div className="h-6 w-1.5 bg-emerald-500" />
                        <div>
                            <span className="text-[8px] font-black font-mono uppercase tracking-[0.4em] text-emerald-500/70 block">Layer 01 — Pontos das Unidades</span>
                            <h1 className="text-3xl font-black tracking-tighter uppercase leading-none">Unidades de Terreno</h1>
                        </div>
                    </div>
                </div>
                <button 
                    onClick={() => setShowForm(true)}
                    className="tactical-btn-primary px-8 text-[9px] inline-flex items-center gap-2 self-start"
                >
                    <Plus className="w-3.5 h-3.5" /> Registar Nova Unidade
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border border border-border">
                {[
                    { label: 'Total de Unidades', value: stats.total, color: 'text-foreground' },
                    { label: 'Operacionais', value: stats.operational, color: 'text-emerald-400' },
                    { label: 'Degradadas', value: stats.degraded, color: 'text-amber-400' },
                    { label: 'Inativas', value: stats.inactive, color: 'text-red-400' },
                ].map(s => (
                    <div key={s.label} className="bg-card p-6">
                        <div className={cn("text-3xl font-black tracking-tighter", s.color)}>{s.value}</div>
                        <div className="text-[8px] font-black uppercase tracking-widest opacity-40 font-mono mt-1">{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-px bg-border border border-border min-h-[600px]">

                {/* List Panel */}
                <div className="xl:col-span-4 bg-card flex flex-col">

                    {/* Filters */}
                    <div className="p-4 border-b border-border space-y-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 opacity-30" />
                            <input
                                type="text"
                                placeholder="PESQUISAR UNIDADE..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full bg-muted/30 border border-border pl-8 pr-4 py-2 text-[10px] font-black uppercase tracking-wider focus:outline-none focus:border-primary transition-colors placeholder:opacity-30 font-mono"
                            />
                        </div>
                        <div className="flex gap-1 flex-wrap">
                            {['Todos', 'OPERACIONAL', 'DEGRADADO', 'INATIVO'].map(s => (
                                <button
                                    key={s}
                                    onClick={() => setSelectedStatus(s)}
                                    className={cn(
                                        "px-2 py-1 text-[7px] font-black uppercase tracking-wider border transition-all font-mono",
                                        selectedStatus === s ? "bg-foreground text-background border-foreground" : "border-border hover:border-foreground/50"
                                    )}
                                >{s}</button>
                            ))}
                        </div>
                        <div className="flex gap-1 flex-wrap">
                            {['Todos', 'FRONTEIRA', 'AGENCIA', 'ESTRATEGICA', 'PRIVADA'].map(t => (
                                <button
                                    key={t}
                                    onClick={() => setSelectedType(t)}
                                    className={cn(
                                        "px-2 py-1 text-[7px] font-black uppercase tracking-wider border transition-all font-mono",
                                        selectedType === t ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary/50"
                                    )}
                                >{t}</button>
                            ))}
                        </div>
                    </div>

                    {/* Unit List */}
                    <div className="flex-1 overflow-y-auto divide-y divide-border/30 scrollbar-hide">
                        {filtered.map((unit: any, idx: number) => {
                            const Icon = TYPE_ICONS[unit.type] || MapPin;
                            const isSelected = selectedUnit?.id === unit.id;
                            return (
                                <motion.div
                                    key={unit.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.03 }}
                                    onClick={() => {
                                        setSelectedUnit(unit);
                                        setMapCenter([unit.lat, unit.lng]);
                                        setMapZoom(16);
                                    }}
                                    className={cn(
                                        "p-4 cursor-pointer transition-all group flex gap-3 items-start",
                                        isSelected ? "bg-foreground text-background" : "hover:bg-muted/30"
                                    )}
                                >
                                    <div className={cn("p-2 border shrink-0", isSelected ? "border-background/20 bg-background/10" : "border-border bg-muted/20")}>
                                        <Icon className={cn("w-3.5 h-3.5", isSelected ? "text-background" : TYPE_COLORS[unit.type])} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <span className="text-[11px] font-black uppercase tracking-tight truncate leading-none">{unit.name}</span>
                                            <span className={cn("text-[7px] font-black font-mono px-1.5 py-0.5 border shrink-0", isSelected ? "border-background/30 text-background" : STATUS_STYLES[unit.status])}>
                                                {unit.status}
                                            </span>
                                        </div>
                                        <div className="flex gap-3 mt-1.5">
                                            <span className={cn("text-[8px] font-mono opacity-50", isSelected ? "text-background" : "text-muted-foreground")}>{unit.code}</span>
                                            {unit.agentsCount > 0 && (
                                                <span className={cn("text-[8px] font-mono opacity-50", isSelected ? "text-background" : "text-muted-foreground")}>
                                                    {unit.agentsCount} agentes
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    <div className="p-3 border-t border-border bg-muted/10">
                        <span className="text-[7px] font-black font-mono uppercase tracking-widest opacity-30">
                            {filtered.length} de {units.length} unidades
                        </span>
                    </div>
                </div>

                {/* Map Panel */}
                <div className="xl:col-span-8 relative min-h-[400px]">
                    <MapComponent
                        center={mapCenter}
                        zoom={mapZoom}
                        units={filtered}
                    />

                    {/* Selected Unit Overlay */}
                    {selectedUnit && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute bottom-6 left-6 z-10 bg-background/95 backdrop-blur-md border border-border p-5 shadow-2xl tactical-panel min-w-[280px]"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <span className="text-[7px] font-mono font-black uppercase tracking-[0.4em] text-primary/60 block">{selectedUnit.code || selectedUnit.id}</span>
                                    <span className="text-[13px] font-black uppercase tracking-tight leading-tight block mt-0.5">{selectedUnit.name}</span>
                                </div>
                                <button onClick={() => setSelectedUnit(null)} className="text-foreground/30 hover:text-foreground text-sm ml-3">✕</button>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="bg-muted/30 p-2">
                                    <span className="text-[7px] font-mono opacity-40 block">Tipo</span>
                                    <span className="text-[9px] font-black">{selectedUnit.type}</span>
                                </div>
                                <div className="bg-muted/30 p-2">
                                    <span className="text-[7px] font-mono opacity-40 block">Setor</span>
                                    <span className="text-[9px] font-black">{selectedUnit.sector}</span>
                                </div>
                                <div className="bg-muted/30 p-2">
                                    <span className="text-[7px] font-mono opacity-40 block">Agentes</span>
                                    <span className="text-[9px] font-black">{selectedUnit.agentsCount}</span>
                                </div>
                                <div className="bg-muted/30 p-2">
                                    <span className="text-[7px] font-mono opacity-40 block">Atualizado</span>
                                    <span className="text-[9px] font-black">{new Date(selectedUnit.lastUpdate).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <div className={cn("mt-3 px-3 py-1.5 text-center text-[8px] font-black font-mono border", STATUS_STYLES[selectedUnit.status])}>
                                ESTADO: {selectedUnit.status}
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Registration Form Modal */}
            {showForm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-card border border-border w-full max-w-md tactical-panel shadow-2xl relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500" />
                        
                        <div className="p-4 border-b border-border flex items-center justify-between bg-muted/20">
                            <span className="text-[10px] font-black font-mono uppercase tracking-[0.3em] flex items-center gap-2">
                                <Shield className="w-3 h-3 text-emerald-500" /> Registar Nova Unidade_Tática
                            </span>
                            <button onClick={() => setShowForm(false)} className="text-foreground/40 hover:text-foreground">✕</button>
                        </div>
                        
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="text-[7px] font-black font-mono uppercase tracking-widest opacity-50 block mb-2">Nome da Unidade</label>
                                <input 
                                    type="text" 
                                    value={formName}
                                    onChange={e => setFormName(e.target.value)}
                                    className="w-full bg-muted/40 border border-border px-3 py-2 text-[11px] focus:outline-none focus:border-emerald-500 font-mono transition-colors uppercase" 
                                    placeholder="EX: HUB VIANA 01" 
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[7px] font-black font-mono uppercase tracking-widest opacity-50 block mb-2">Código Identificador</label>
                                    <input 
                                        type="text" 
                                        value={formCode}
                                        onChange={e => setFormCode(e.target.value)}
                                        className="w-full bg-muted/40 border border-border px-3 py-2 text-[11px] focus:outline-none focus:border-emerald-500 font-mono transition-colors uppercase" 
                                        placeholder="EX: GF-402" 
                                    />
                                </div>
                                <div>
                                    <label className="text-[7px] font-black font-mono uppercase tracking-widest opacity-50 block mb-2">Sector / Região</label>
                                    <input 
                                        type="text" 
                                        value={formSector}
                                        onChange={e => setFormSector(e.target.value)}
                                        className="w-full bg-muted/40 border border-border px-3 py-2 text-[11px] focus:outline-none focus:border-emerald-500 font-mono transition-colors uppercase" 
                                        placeholder="EX: VIANA" 
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[7px] font-black font-mono uppercase tracking-widest opacity-50 block mb-2">Posicionamento GPS</label>
                                <button 
                                    type="button"
                                    onClick={handleUseMyLocation}
                                    className="w-full py-2 border border-emerald-500/30 bg-emerald-500/10 text-emerald-500 text-[8px] font-black uppercase hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center gap-2"
                                >
                                    <MapPin className="w-3 h-3" /> {formLat ? `CAPTURADO: ${formLat.toFixed(4)}, ${formLng?.toFixed(4)}` : 'USAR MINHA LOCALIZAÇÃO ATUAL'}
                                </button>
                            </div>

                            <div>
                                <label className="text-[7px] font-black font-mono uppercase tracking-widest opacity-50 block mb-2">Tipo de Unidade Estática</label>
                                <div className="grid grid-cols-2 gap-1.5">
                                    {['FRONTEIRA', 'AGENCIA', 'ESTRATEGICA', 'PRIVADA'].map(t => (
                                        <button 
                                            key={t} 
                                            onClick={() => setFormUnitType(t)}
                                            className={cn("p-2 border text-[7px] font-black font-mono uppercase flex items-center justify-center transition-all", 
                                            formUnitType === t ? "border-emerald-500 bg-emerald-500/10 text-emerald-500" : "border-border opacity-50 hover:opacity-100")}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-2 pt-4">
                                <button 
                                    onClick={handleCreateUnit}
                                    disabled={createMutation.isPending}
                                    className="tactical-btn-primary flex-1 text-[9px] py-3 disabled:opacity-50"
                                >
                                    {createMutation.isPending ? 'REGISTANDO...' : 'CONFIRMAR REGISTO NO SISTEMA'}
                                </button>
                                <button onClick={() => setShowForm(false)} className="tactical-btn px-6 text-[9px] py-3 uppercase font-black">Cancelar</button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
