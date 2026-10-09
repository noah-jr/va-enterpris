'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { Users, Globe, UserPlus, Fingerprint, Plus, Search, Trash2, Edit3, Save, X, Activity, Crosshair } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Map, MapMarker, MarkerContent } from "@/components/ui/map";
import { ProvinceBorders } from "@/components/map/ProvinceBorders";
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function DemographicsManagePage() {
    const [demographics, setDemographics] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showMapPicker, setShowMapPicker] = useState(false);
    const { toast } = useToast();

    // Form Stats
    const [formData, setFormData] = useState({
        regionName: '',
        regionType: 'MUNICIPAL',
        totalPopulation: 0,
        density: 0,
        growthRate: 0,
        birthRate: 0,
        lat: -12.1642,
        lng: 17.5691,
        province: 'Huíla',
        municipality: 'Lubango',
    });

    const fetchDemographics = async () => {
        try {
            const res = await api.get('/demographics');
            const data = (res as any).data?.demographics || (res as any).demographics || [];
            setDemographics(data);
        } catch (err) {
            toast({ title: "Erro de Malha", description: "Falha ao sincronizar censos MTNI", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDemographics();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/demographics/${editingId}`, formData);
                toast({ title: "Atualizado", description: "Malha demográfica nacional atualizada." });
            } else {
                await api.post('/demographics', formData);
                toast({ title: "Sincronizado", description: "Novo registo demográfico adicionado à malha nacional." });
            }
            setIsAdding(false);
            setEditingId(null);
            fetchDemographics();
            setFormData({
                regionName: '', regionType: 'MUNICIPAL', totalPopulation: 0, 
                density: 0, growthRate: 0, birthRate: 0,
                lat: -14.912, lng: 13.498, 
                province: 'Huíla', municipality: 'Lubango',
            });
        } catch (err) {
            toast({ title: "Erro no Registo", description: "Falha ao validar ponto demográfico.", variant: "destructive" });
        }
    };

    const handleEdit = (d: any) => {
        setFormData({
            regionName: d.regionName,
            regionType: d.regionType || 'MUNICIPAL',
            totalPopulation: d.totalPopulation || 0,
            density: d.density || 0,
            growthRate: d.growthRate || 0,
            birthRate: d.birthRate || 0,
            lat: d.lat || -14.912,
            lng: d.lng || 13.498,
            province: d.province || 'Huíla',
            municipality: d.municipality || 'Lubango'
        });
        setEditingId(d.id);
        setIsAdding(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Deseja remover este registo demográfico do monitoramento tático?')) return;
        try {
            await api.delete(`/demographics/${id}`);
            toast({ title: "Removido", description: "Registo demográfico desativado da rede MTNI." });
            fetchDemographics();
        } catch (err) {
            toast({ title: "Erro na Exclusão", description: "Operação financeira ou de rede negada.", variant: "destructive" });
        }
    };

    const filtered = demographics.filter(d => 
        d.regionName.toLowerCase().includes(search.toLowerCase()) || 
        d.regionType.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-8 w-full pb-20 p-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-border pb-8">
                <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-black font-mono uppercase tracking-[0.2em] text-orange-500">MONITORAMENTO DEMOGRÁFICO NACIONAL</span>
                    <h1 className="text-3xl font-black uppercase tracking-tighter text-foreground">Gestão de Malha Populacional MTNI</h1>
                </div>
                <button 
                    onClick={() => {
                        setEditingId(null);
                        setFormData({
                            regionName: '', regionType: 'MUNICIPAL', totalPopulation: 0, 
                            density: 0, growthRate: 0, birthRate: 0,
                            lat: -14.912, lng: 13.498, 
                            province: 'Huíla', municipality: 'Lubango',
                        });
                        setIsAdding(true);
                    }}
                    className="tactical-btn-primary px-8 text-[9px] flex items-center gap-2 bg-orange-600 hover:bg-orange-500"
                >
                    <UserPlus className="w-4 h-4" /> ADICIONAR REGISTO_DEMO
                </button>
            </div>

            <div className="flex flex-col gap-6">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40 text-orange-500" />
                    <input 
                        type="text" 
                        placeholder="Pesquisar região ou tipo..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-muted/30 border border-border pl-10 pr-4 py-2.5 text-[11px] font-black uppercase tracking-wider focus:outline-none focus:border-orange-500 font-mono transition-all"
                    />
                </div>

                <div className="border border-border bg-card overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-muted/50 border-b border-border">
                            <tr>
                                <th className="p-4 text-[9px] font-black uppercase tracking-widest opacity-50">Região / Ponto</th>
                                <th className="p-4 text-[9px] font-black uppercase tracking-widest opacity-50">Tipo Admin</th>
                                <th className="p-4 text-[9px] font-black uppercase tracking-widest opacity-50 text-center">População / Densidade</th>
                                <th className="p-4 text-[9px] font-black uppercase tracking-widest opacity-50 text-right">Acções</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                            {filtered.map((d) => (
                                <tr key={d.id} className="hover:bg-muted/10 transition-colors group">
                                    <td className="p-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[12px] font-black uppercase tracking-tight group-hover:text-orange-500 transition-colors uppercase">{d.regionName}</span>
                                            <span className="text-[8px] font-mono opacity-40 uppercase">GPS: {d.lat.toFixed(3)}, {d.lng.toFixed(3)}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="text-[10px] font-black border border-orange-500/30 px-2 py-0.5 bg-orange-500/5 text-orange-500 rounded-sm">{d.regionType}</span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center justify-center gap-4">
                                            <div className="flex flex-col items-center">
                                                <span className="text-[12px] font-black text-orange-500">{(d.totalPopulation / 1000).toFixed(1)}k</span>
                                                <span className="text-[7px] font-mono opacity-40 uppercase">Total</span>
                                            </div>
                                            <div className="flex flex-col items-center">
                                                <span className="text-[12px] font-black text-blue-500">{d.density}</span>
                                                <span className="text-[7px] font-mono opacity-40 uppercase">hab/km²</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button 
                                                onClick={() => handleEdit(d)}
                                                className="p-2 hover:bg-muted rounded-sm transition-all opacity-40 hover:opacity-100"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(d.id)}
                                                className="p-2 hover:bg-red-500/20 rounded-sm transition-all opacity-40 hover:opacity-100 text-red-400"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <AnimatePresence>
                {isAdding && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-card border border-border w-full max-w-2xl tactical-panel shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-orange-500" />
                            <div className="p-6 border-b border-border flex items-center justify-between">
                                <span className="text-[12px] font-black uppercase tracking-[0.2em] flex items-center gap-3 text-orange-500">
                                    <Activity className="w-5 h-5 animate-pulse" /> {showMapPicker ? 'SELEÇÃO GEOGRÁFICA DEMO' : (editingId ? 'EDITAR_MALHA_DEMOGRÁFICA_MTNI' : 'ADICIONAR_MALHA_DEMOGRÁFICA_MTNI')}
                                </span>
                                <button onClick={() => { setIsAdding(false); setShowMapPicker(false); }} className="text-foreground/40 hover:text-foreground">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {showMapPicker ? (
                                <div className="p-0 h-[450px] w-full relative">
                                    <Map
                                        center={[formData.lng, formData.lat]}
                                        zoom={14}
                                        onClick={(e: any) => {
                                            setFormData(prev => ({ ...prev, lat: e.lngLat.lat, lng: e.lngLat.lng }));
                                        }}
                                        styles={{ dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json", light: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json" }}
                                        className="cursor-crosshair w-full h-full border border-border"
                                    >
                                        <ProvinceBorders />
                                        <MapMarker latitude={formData.lat} longitude={formData.lng}>
                                            <MarkerContent>
                                                <div className="relative flex items-center justify-center">
                                                    <div className="absolute w-12 h-12 rounded-full border border-orange-500/50 animate-ping" />
                                                    <div className="w-4 h-4 rounded-full bg-orange-600 border border-white shadow-xl flex items-center justify-center z-10">
                                                        <div className="w-1 h-1 bg-white rounded-full" />
                                                    </div>
                                                </div>
                                            </MarkerContent>
                                        </MapMarker>
                                    </Map>
                                    
                                    <div className="absolute top-4 left-4 z-10 bg-background/90 backdrop-blur-md p-3 border border-orange-500/30 shadow-2xl flex flex-col gap-1">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-orange-500 flex items-center gap-2">
                                            <Crosshair className="w-3 h-3" /> Fixar Ponto Censorial Regional
                                        </span>
                                        <div className="text-[8px] font-mono opacity-50 uppercase flex justify-between gap-4 mt-2">
                                            <span>LAT: {formData.lat.toFixed(6)}</span>
                                            <span>LNG: {formData.lng.toFixed(6)}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 w-full max-w-sm px-4">
                                        <button 
                                            type="button" 
                                            onClick={() => setShowMapPicker(false)}
                                            className="w-full tactical-btn-primary bg-orange-600 hover:bg-orange-500 py-3 text-[10px] shadow-2xl"
                                        >
                                            CONFIRMAR LOCALIZAÇÃO DEMOGRÁFICA
                                        </button>
                                    </div>
                                </div>
                            ) : (
                            <form onSubmit={handleSave} className="p-8 space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="col-span-2">
                                        <label className="text-[8px] font-black font-mono uppercase tracking-widest opacity-40 mb-2 block text-orange-500/80">Identificação Regional</label>
                                        <input 
                                            required type="text" 
                                            value={formData.regionName}
                                            onChange={e => setFormData({...formData, regionName: e.target.value})}
                                            className="w-full bg-muted/30 border border-border px-4 py-2 text-[12px] focus:outline-none focus:border-orange-500 font-mono transition-all uppercase"
                                            placeholder="EX: BAIRRO DA CENTRAL"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[8px] font-black font-mono uppercase tracking-widest opacity-40 mb-2 block">Nível Administrativo</label>
                                        <select 
                                            value={formData.regionType}
                                            onChange={e => setFormData({...formData, regionType: e.target.value})}
                                            className="w-full bg-muted/30 border border-border px-4 py-2 text-[12px] focus:outline-none focus:border-orange-500 font-mono transition-all"
                                        >
                                            <option value="NACIONAL">NACIONAL (TOTALIZADOR)</option>
                                            <option value="PROVINCIAL">PROVINCIAL</option>
                                            <option value="MUNICIPAL">MUNICIPAL</option>
                                            <option value="COMUNA">COMUNA / DÍSTRITO</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[8px] font-black font-mono uppercase tracking-widest opacity-40 mb-2 block">População Estimada</label>
                                        <input 
                                            type="number" 
                                            value={formData.totalPopulation}
                                            onChange={e => setFormData({...formData, totalPopulation: parseInt(e.target.value)})}
                                            className="w-full bg-muted/30 border border-border px-4 py-2 text-[12px] focus:outline-none focus:border-orange-500 font-mono transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[8px] font-black font-mono uppercase tracking-widest opacity-40 mb-2 block">Densidade (hab/km²)</label>
                                        <input 
                                            type="number" step="any"
                                            value={formData.density}
                                            onChange={e => setFormData({...formData, density: parseFloat(e.target.value)})}
                                            className="w-full bg-muted/30 border border-border px-4 py-2 text-[12px] focus:outline-none focus:border-orange-500 font-mono transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[8px] font-black font-mono uppercase tracking-widest opacity-40 mb-2 block">Vetor LATITUDE</label>
                                        <input 
                                            required type="number" step="any"
                                            value={formData.lat}
                                            onChange={e => setFormData({...formData, lat: parseFloat(e.target.value)})}
                                            className="w-full bg-muted/30 border border-border px-4 py-2 text-[12px] focus:outline-none focus:border-orange-500 font-mono transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[8px] font-black font-mono uppercase tracking-widest opacity-40 mb-2 block">Vetor LONGITUDE</label>
                                        <input 
                                            required type="number" step="any"
                                            value={formData.lng}
                                            onChange={e => setFormData({...formData, lng: parseFloat(e.target.value)})}
                                            className="w-full bg-muted/30 border border-border px-4 py-2 text-[12px] focus:outline-none focus:border-orange-500 font-mono transition-all"
                                        />
                                    </div>

                                    <div className="col-span-2">
                                        <button 
                                            type="button" 
                                            onClick={() => setShowMapPicker(true)}
                                            className="w-full py-3 border border-orange-500/30 hover:bg-orange-500/10 transition-colors text-[9px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 text-orange-500"
                                        >
                                            <Crosshair className="w-4 h-4 text-orange-500" />
                                            CAPTURAR COORDENADAS VIA MAPA TÁTICO
                                        </button>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button 
                                        type="submit"
                                        className="tactical-btn-primary flex-1 py-3 text-[10px] bg-orange-600 hover:bg-orange-500"
                                    >
                                        RE-MAPEAR MALHA DEMOGRÁFICA
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setIsAdding(false)}
                                        className="tactical-btn px-8 py-3 text-[10px]"
                                    >
                                        ABORTAR
                                    </button>
                                </div>
                            </form>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
