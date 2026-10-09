'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { GraduationCap, MapPin, Users, CheckCircle, Plus, Search, Trash2, Edit3, Save, X, Crosshair } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Map, MapMarker, MarkerContent } from "@/components/ui/map";
import { ProvinceBorders } from "@/components/map/ProvinceBorders";
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function EducationManagePage() {
    const [schools, setSchools] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showMapPicker, setShowMapPicker] = useState(false);
    const { toast } = useToast();

    // Form Stats
    const [formData, setFormData] = useState({
        name: '',
        level: 'SECUNDÁRIO',
        lat: -12.1642,
        lng: 17.5691,
        studentsCount: 0,
        teachersCount: 0,
        passRate: 0,
        province: 'Luanda',
        municipality: 'Luanda',
        commune: 'Ingombota',
        infrastructure: 'BOA'
    });

    const fetchSchools = async () => {
        try {
            const res = await api.get('/education');
            const data = (res as any).data?.schools || (res as any).schools || [];
            setSchools(data);
        } catch (err) {
            toast({ title: "Erro de Malha", description: "Falha ao sincronizar base MTNI", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSchools();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/education/${editingId}`, formData);
                toast({ title: "Atualizado", description: "Unidade escolar atualizada na malha MTNI." });
            } else {
                await api.post('/education', formData);
                toast({ title: "Sincronizado", description: "Nova unidade escolar registada na malha MTNI." });
            }
            setIsAdding(false);
            setEditingId(null);
            fetchSchools();
            setFormData({
                name: '', level: 'SECUNDÁRIO', lat: -12.1642, lng: 17.5691,
                studentsCount: 0, teachersCount: 0, passRate: 0,
                province: 'Luanda', municipality: 'Luanda', commune: 'Ingombota',
                infrastructure: 'BOA'
            });
        } catch (err) {
            toast({ title: "Erro no Registo", description: "Não foi possível validar a unidade.", variant: "destructive" });
        }
    };

    const handleEdit = (school: any) => {
        setFormData({
            name: school.name,
            level: school.level || 'SECUNDÁRIO',
            lat: school.lat || -12.1642,
            lng: school.lng || 17.5691,
            studentsCount: school.studentsCount || 0,
            teachersCount: school.teachersCount || 0,
            passRate: school.passRate || 0,
            province: school.province || 'Luanda',
            municipality: school.municipality || 'Luanda',
            commune: school.commune || 'Ingombota',
            infrastructure: school.infrastructure || 'BOA'
        });
        setEditingId(school.id);
        setIsAdding(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Deseja realmente remover esta unidade da malha estratégica?')) return;
        try {
            // We need a DELETE /api/v1/education/[id] - I'll create it next
            await api.delete(`/education/${id}`);
            toast({ title: "Removido", description: "Unidade escolar desativada da monitorização." });
            fetchSchools();
        } catch (err) {
            toast({ title: "Erro na Exclusão", description: "Operação não autorizada ou falha de rede.", variant: "destructive" });
        }
    };

    const filtered = schools.filter(s => 
        s.name.toLowerCase().includes(search.toLowerCase()) || 
        s.province.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-8 w-full pb-20 p-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-border pb-8">
                <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-black font-mono uppercase tracking-[0.2em] text-primary">MAPA TEMÁTICO NACIONAL INTELIGENTE</span>
                    <h1 className="text-3xl font-black uppercase tracking-tighter text-foreground">Gestão de Infraestruturas Escolares</h1>
                </div>
                <button 
                    onClick={() => {
                        setEditingId(null);
                        setFormData({
                            name: '', level: 'SECUNDÁRIO', lat: -12.1642, lng: 17.5691,
                            studentsCount: 0, teachersCount: 0, passRate: 0,
                            province: 'Luanda', municipality: 'Luanda', commune: 'Ingombota',
                            infrastructure: 'BOA'
                        });
                        setIsAdding(true);
                    }}
                    className="tactical-btn-primary px-8 text-[9px] flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" /> ADICIONAR UNIDADE_MTNI
                </button>
            </div>

            <div className="flex flex-col gap-6">
                {/* Search Bar */}
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
                    <input 
                        type="text" 
                        placeholder="Pesquisar por nome ou província..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-muted/30 border border-border pl-10 pr-4 py-2.5 text-[11px] font-black uppercase tracking-wider focus:outline-none focus:border-primary font-mono transition-all"
                    />
                </div>

                {/* Table Area */}
                <div className="border border-border bg-card overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-muted/50 border-b border-border">
                            <tr>
                                <th className="p-4 text-[9px] font-black uppercase tracking-widest opacity-50">Unidade / Código</th>
                                <th className="p-4 text-[9px] font-black uppercase tracking-widest opacity-50">Localização</th>
                                <th className="p-4 text-[9px] font-black uppercase tracking-widest opacity-50 text-center">Métricas</th>
                                <th className="p-4 text-[9px] font-black uppercase tracking-widest opacity-50 text-right">Acções</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                            {filtered.map((school) => (
                                <tr key={school.id} className="hover:bg-muted/10 transition-colors group">
                                    <td className="p-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[12px] font-black uppercase tracking-tight group-hover:text-primary transition-colors">{school.name}</span>
                                            <span className="text-[8px] font-mono opacity-40 uppercase">{school.code} // {school.level}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-[10px] font-mono opacity-60 uppercase">
                                        {school.province}, {school.municipality}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center justify-center gap-4">
                                            <div className="flex flex-col items-center">
                                                <span className="text-[12px] font-black text-blue-500">{school.studentsCount}</span>
                                                <span className="text-[7px] font-mono opacity-40">ALUNOS</span>
                                            </div>
                                            <div className="flex flex-col items-center">
                                                <span className="text-[12px] font-black text-emerald-500">{school.passRate}%</span>
                                                <span className="text-[7px] font-mono opacity-40">APROV.</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button 
                                                onClick={() => handleEdit(school)}
                                                className="p-2 hover:bg-muted rounded-sm transition-all opacity-40 hover:opacity-100"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(school.id)}
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

            {/* Modal de Adição/Edição */}
            <AnimatePresence>
                {isAdding && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md p-4">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-card border border-border w-full max-w-2xl tactical-panel shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
                            <div className="p-6 border-b border-border flex items-center justify-between">
                                <span className="text-[12px] font-black uppercase tracking-[0.2em] flex items-center gap-3">
                                    <GraduationCap className="w-5 h-5 text-primary" /> {showMapPicker ? 'SELEÇÃO GEOGRÁFICA TÁTICA' : (editingId ? 'EDITAR_UNIDADE_ESCOLAR_MTNI' : 'REGISTO_UNIDADE_ESCOLAR_MTNI')}
                                </span>
                                <button onClick={() => { setIsAdding(false); setShowMapPicker(false); }} className="text-foreground/40 hover:text-foreground group">
                                    <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
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
                                                    <div className="absolute w-12 h-12 rounded-full border border-blue-500/50 animate-ping" />
                                                    <div className="w-4 h-4 rounded-full bg-blue-600 border border-white shadow-xl flex items-center justify-center z-10">
                                                        <div className="w-1 h-1 bg-white rounded-full" />
                                                    </div>
                                                </div>
                                            </MarkerContent>
                                        </MapMarker>
                                    </Map>
                                    
                                    <div className="absolute top-4 left-4 z-10 bg-background/90 backdrop-blur-md p-3 border border-border shadow-2xl flex flex-col gap-1">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                            <Crosshair className="w-3 h-3" /> Clique no mapa para definir o ponto
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
                                            className="w-full tactical-btn-primary py-3 text-[10px] shadow-2xl"
                                        >
                                            CONFIRMAR POSIÇÃO GEOMÉTRICA
                                        </button>
                                    </div>
                                </div>
                            ) : (
                            <form onSubmit={handleSave} className="p-8 space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="col-span-2">
                                        <label className="text-[8px] font-black font-mono uppercase tracking-widest opacity-40 mb-2 block">Nome Completo da Instituição</label>
                                        <input 
                                            required
                                            type="text" 
                                            value={formData.name}
                                            onChange={e => setFormData({...formData, name: e.target.value})}
                                            className="w-full bg-muted/30 border border-border px-4 py-2 text-[12px] focus:outline-none focus:border-primary font-mono transition-all"
                                            placeholder="EX: ESCOLA PRIMÁRIA Nº 4022"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[8px] font-black font-mono uppercase tracking-widest opacity-40 mb-2 block">Província</label>
                                        <input 
                                            required
                                            type="text" 
                                            value={formData.province}
                                            onChange={e => setFormData({...formData, province: e.target.value})}
                                            className="w-full bg-muted/30 border border-border px-4 py-2 text-[12px] focus:outline-none focus:border-primary font-mono transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[8px] font-black font-mono uppercase tracking-widest opacity-40 mb-2 block">Município</label>
                                        <input 
                                            required
                                            type="text" 
                                            value={formData.municipality}
                                            onChange={e => setFormData({...formData, municipality: e.target.value})}
                                            className="w-full bg-muted/30 border border-border px-4 py-2 text-[12px] focus:outline-none focus:border-primary font-mono transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[8px] font-black font-mono uppercase tracking-widest opacity-40 mb-2 block">Latitude (WGS84)</label>
                                        <input 
                                            required type="number" step="any"
                                            value={formData.lat}
                                            onChange={e => setFormData({...formData, lat: parseFloat(e.target.value)})}
                                            className="w-full bg-muted/30 border border-border px-4 py-2 text-[12px] focus:outline-none focus:border-primary font-mono transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[8px] font-black font-mono uppercase tracking-widest opacity-40 mb-2 block">Longitude (WGS84)</label>
                                        <input 
                                            required type="number" step="any"
                                            value={formData.lng}
                                            onChange={e => setFormData({...formData, lng: parseFloat(e.target.value)})}
                                            className="w-full bg-muted/30 border border-border px-4 py-2 text-[12px] focus:outline-none focus:border-primary font-mono transition-all"
                                        />
                                    </div>

                                    <div className="col-span-2">
                                        <button 
                                            type="button" 
                                            onClick={() => setShowMapPicker(true)}
                                            className="w-full py-3 border border-border hover:bg-muted/50 transition-colors text-[9px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2"
                                        >
                                            <Crosshair className="w-4 h-4 text-primary" />
                                            CAPTURAR COORDENADAS VIA MAPA GEOGRÁFICO
                                        </button>
                                    </div>

                                    <div>
                                        <label className="text-[8px] font-black font-mono uppercase tracking-widest opacity-40 mb-2 block">Nº de Alunos</label>
                                        <input 
                                            type="number" 
                                            value={formData.studentsCount}
                                            onChange={e => setFormData({...formData, studentsCount: parseInt(e.target.value)})}
                                            className="w-full bg-muted/30 border border-border px-4 py-2 text-[12px] focus:outline-none focus:border-primary font-mono transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[8px] font-black font-mono uppercase tracking-widest opacity-40 mb-2 block">Nível de Ensino</label>
                                        <select 
                                            value={formData.level}
                                            onChange={e => setFormData({...formData, level: e.target.value})}
                                            className="w-full bg-muted/30 border border-border px-4 py-2 text-[12px] focus:outline-none focus:border-primary font-mono transition-all"
                                        >
                                            <option value="PRIMÁRIO">ENSINO PRIMÁRIO</option>
                                            <option value="SECUNDÁRIO">ENSINO SECUNDÁRIO</option>
                                            <option value="SUPERIOR">ENSINO SUPERIOR</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button 
                                        type="submit"
                                        className="tactical-btn-primary flex-1 py-3 text-[10px]"
                                    >
                                        CONFIRMAR INTEGRALIDADE DOS DADOS
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
