'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { HeartPulse, MapPin, BedDouble, Activity, Plus, Search, Trash2, Edit3, Save, X, Hospital, Crosshair } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Map, MapMarker, MarkerContent } from "@/components/ui/map";
import { ProvinceBorders } from "@/components/map/ProvinceBorders";
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function HealthManagePage() {
    const [hospitals, setHospitals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showMapPicker, setShowMapPicker] = useState(false);
    const { toast } = useToast();

    // Form Stats
    const [formData, setFormData] = useState({
        name: '',
        type: 'HOSPITAL_GERAL',
        lat: -12.1642,
        lng: 17.5691,
        bedCapacity: 0,
        currentPatients: 0,
        province: 'Huambo',
        municipality: 'Huambo',
        commune: 'Bairro de Luz',
    });

    const fetchHospitals = async () => {
        try {
            const res = await api.get('/health');
            const data = (res as any).data?.hospitals || (res as any).hospitals || [];
            setHospitals(data);
        } catch (err) {
            toast({ title: "Erro de Malha", description: "Falha ao sincronizar rede hospitalar MTNI", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHospitals();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/health/${editingId}`, formData);
                toast({ title: "Atualizado", description: "Unidade hospitalar atualizada na rede SNS_MTNI." });
            } else {
                await api.post('/health', formData);
                toast({ title: "Sincronizado", description: "Nova unidade hospitalar registada no SNS_MTNI." });
            }
            setIsAdding(false);
            setEditingId(null);
            fetchHospitals();
            setFormData({
                name: '', type: 'HOSPITAL_GERAL', lat: -12.1791, lng: 15.1911,
                bedCapacity: 0, currentPatients: 0,
                province: 'Huambo', municipality: 'Huambo', commune: 'Bairro de Luz',
            });
        } catch (err) {
            toast({ title: "Erro no Registo", description: "Falha ao validar unidade hospitalar.", variant: "destructive" });
        }
    };

    const handleEdit = (h: any) => {
        setFormData({
            name: h.name,
            type: h.type || 'HOSPITAL_GERAL',
            lat: h.lat || -12.1791,
            lng: h.lng || 15.1911,
            bedCapacity: h.bedCapacity || 0,
            currentPatients: h.currentPatients || 0,
            province: h.province || 'Huambo',
            municipality: h.municipality || 'Huambo',
            commune: h.commune || 'Bairro de Luz'
        });
        setEditingId(h.id);
        setIsAdding(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Deseja remover esta unidade hospitalar do monitoramento nacional?')) return;
        try {
            await api.delete(`/health/${id}`);
            toast({ title: "Removido", description: "Unidade hospitalar desativada da rede MTNI." });
            fetchHospitals();
        } catch (err) {
            toast({ title: "Erro na Exclusão", description: "Falha ao desativar unidade.", variant: "destructive" });
        }
    };

    const filtered = hospitals.filter(h => 
        h.name.toLowerCase().includes(search.toLowerCase()) || 
        h.province.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-8 w-full pb-20 p-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-border pb-8">
                <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-black font-mono uppercase tracking-[0.2em] text-emerald-500">SISTEMA NACIONAL DE SAÚDE INTEGRADO</span>
                    <h1 className="text-3xl font-black uppercase tracking-tighter text-foreground">Gestão de Unidades Médicas MTNI</h1>
                </div>
                <button 
                    onClick={() => {
                        setEditingId(null);
                        setFormData({
                            name: '', type: 'HOSPITAL_GERAL', lat: -12.1791, lng: 15.1911,
                            bedCapacity: 0, currentPatients: 0,
                            province: 'Huambo', municipality: 'Huambo', commune: 'Bairro de Luz',
                        });
                        setIsAdding(true);
                    }}
                    className="tactical-btn-primary px-8 text-[9px] flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500"
                >
                    <Plus className="w-4 h-4" /> REGISTAR UNIDADE_SNS
                </button>
            </div>

            <div className="flex flex-col gap-6">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40 text-emerald-500" />
                    <input 
                        type="text" 
                        placeholder="Pesquisar hospital ou província..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-muted/30 border border-border pl-10 pr-4 py-2.5 text-[11px] font-black uppercase tracking-wider focus:outline-none focus:border-emerald-500 font-mono transition-all"
                    />
                </div>

                <div className="border border-border bg-card overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-muted/50 border-b border-border">
                            <tr>
                                <th className="p-4 text-[9px] font-black uppercase tracking-widest opacity-50">Unidade Hospitalar</th>
                                <th className="p-4 text-[9px] font-black uppercase tracking-widest opacity-50">Localização Estratégica</th>
                                <th className="p-4 text-[9px] font-black uppercase tracking-widest opacity-50 text-center">Ocupação / Camas</th>
                                <th className="p-4 text-[9px] font-black uppercase tracking-widest opacity-50 text-right">Acções</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                            {filtered.map((h) => (
                                <tr key={h.id} className="hover:bg-muted/10 transition-colors group">
                                    <td className="p-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[12px] font-black uppercase tracking-tight group-hover:text-emerald-500 transition-colors uppercase">{h.name}</span>
                                            <span className="text-[8px] font-mono opacity-40 uppercase">{h.code} // {h.type.replace('_', ' ')}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-[10px] font-mono opacity-60 uppercase">
                                        {h.province}, {h.municipality}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center justify-center gap-4">
                                            <div className="flex flex-col items-center">
                                                <span className="text-[12px] font-black text-emerald-500">{h.currentPatients}</span>
                                                <span className="text-[7px] font-mono opacity-40 uppercase">Pacientes</span>
                                            </div>
                                            <div className="flex flex-col items-center">
                                                <span className="text-[12px] font-black text-red-500">{h.bedCapacity}</span>
                                                <span className="text-[7px] font-mono opacity-40 uppercase">Leitos</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button 
                                                onClick={() => handleEdit(h)}
                                                className="p-2 hover:bg-muted rounded-sm transition-all opacity-40 hover:opacity-100"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(h.id)}
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
                            <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500" />
                            <div className="p-6 border-b border-border flex items-center justify-between">
                                <span className="text-[12px] font-black uppercase tracking-[0.2em] flex items-center gap-3 text-emerald-500">
                                    <HeartPulse className="w-5 h-5" /> {showMapPicker ? 'SELEÇÃO GEOGRÁFICA SNS' : (editingId ? 'EDITAR_UNIDADE_SNS_MTNI' : 'REGISTO_UNIDADE_SAÚDE_SNS_MTNI')}
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
                                                    <div className="absolute w-12 h-12 rounded-full border border-emerald-500/50 animate-ping" />
                                                    <div className="w-4 h-4 rounded-full bg-emerald-600 border border-white shadow-xl flex items-center justify-center z-10">
                                                        <div className="w-1 h-1 bg-white rounded-full" />
                                                    </div>
                                                </div>
                                            </MarkerContent>
                                        </MapMarker>
                                    </Map>
                                    
                                    <div className="absolute top-4 left-4 z-10 bg-background/90 backdrop-blur-md p-3 border border-emerald-500/30 shadow-2xl flex flex-col gap-1">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 flex items-center gap-2">
                                            <Crosshair className="w-3 h-3" /> Fixar Ponto Geográfico Hospitalar
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
                                            className="w-full tactical-btn-primary bg-emerald-600 hover:bg-emerald-500 py-3 text-[10px] shadow-2xl"
                                        >
                                            CONFIRMAR LOCALIZAÇÃO CLÍNICA
                                        </button>
                                    </div>
                                </div>
                            ) : (
                            <form onSubmit={handleSave} className="p-8 space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="col-span-2">
                                        <label className="text-[8px] font-black font-mono uppercase tracking-widest opacity-40 mb-2 block text-emerald-500/80">Denominação Clínica</label>
                                        <input 
                                            required type="text" 
                                            value={formData.name}
                                            onChange={e => setFormData({...formData, name: e.target.value})}
                                            className="w-full bg-muted/30 border border-border px-4 py-2 text-[12px] focus:outline-none focus:border-emerald-500 font-mono transition-all uppercase"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[8px] font-black font-mono uppercase tracking-widest opacity-40 mb-2 block">Tipo de Unidade</label>
                                        <select 
                                            value={formData.type}
                                            onChange={e => setFormData({...formData, type: e.target.value})}
                                            className="w-full bg-muted/30 border border-border px-4 py-2 text-[12px] focus:outline-none focus:border-emerald-500 font-mono transition-all"
                                        >
                                            <option value="HOSPITAL_GERAL">HOSPITAL GERAL</option>
                                            <option value="CENTRO_SAUDE">CENTRO DE SAÚDE</option>
                                            <option value="POSTO_SAUDE">POSTO DE SAÚDE (A)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[8px] font-black font-mono uppercase tracking-widest opacity-40 mb-2 block">Camas Totais</label>
                                        <input 
                                            type="number" 
                                            value={formData.bedCapacity}
                                            onChange={e => setFormData({...formData, bedCapacity: parseInt(e.target.value)})}
                                            className="w-full bg-muted/30 border border-border px-4 py-2 text-[12px] focus:outline-none focus:border-emerald-500 font-mono transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[8px] font-black font-mono uppercase tracking-widest opacity-40 mb-2 block">Província</label>
                                        <input 
                                            required type="text" 
                                            value={formData.province}
                                            onChange={e => setFormData({...formData, province: e.target.value})}
                                            className="w-full bg-muted/30 border border-border px-4 py-2 text-[12px] focus:outline-none focus:border-emerald-500 font-mono transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[8px] font-black font-mono uppercase tracking-widest opacity-40 mb-2 block">Município</label>
                                        <input 
                                            required type="text" 
                                            value={formData.municipality}
                                            onChange={e => setFormData({...formData, municipality: e.target.value})}
                                            className="w-full bg-muted/30 border border-border px-4 py-2 text-[12px] focus:outline-none focus:border-emerald-500 font-mono transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[8px] font-black font-mono uppercase tracking-widest opacity-40 mb-2 block text-emerald-500/80">LATITUDE_WGS</label>
                                        <input 
                                            required type="number" step="any"
                                            value={formData.lat}
                                            onChange={e => setFormData({...formData, lat: parseFloat(e.target.value)})}
                                            className="w-full bg-muted/30 border border-border px-4 py-2 text-[12px] focus:outline-none focus:border-emerald-500 font-mono transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[8px] font-black font-mono uppercase tracking-widest opacity-40 mb-2 block text-emerald-500/80">LONGITUDE_WGS</label>
                                        <input 
                                            required type="number" step="any"
                                            value={formData.lng}
                                            onChange={e => setFormData({...formData, lng: parseFloat(e.target.value)})}
                                            className="w-full bg-muted/30 border border-border px-4 py-2 text-[12px] focus:outline-none focus:border-emerald-500 font-mono transition-all"
                                        />
                                    </div>

                                    <div className="col-span-2">
                                        <button 
                                            type="button" 
                                            onClick={() => setShowMapPicker(true)}
                                            className="w-full py-3 border border-emerald-500/30 hover:bg-emerald-500/10 transition-colors text-[9px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 text-emerald-500"
                                        >
                                            <Crosshair className="w-4 h-4 text-emerald-500" />
                                            CAPTURAR COORDENADAS VIA MAPA TÁTICO
                                        </button>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button 
                                        type="submit"
                                        className="tactical-btn-primary flex-1 py-3 text-[10px] bg-emerald-600 hover:bg-emerald-500"
                                    >
                                        AUTORIZAR INGRESSO NO SNS_MTNI
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
