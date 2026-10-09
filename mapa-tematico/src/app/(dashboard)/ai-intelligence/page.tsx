'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, AlertTriangle, TrendingUp, Shield, Users, Route, Zap, Target, Activity, ChevronRight, RefreshCw, Clock, Database, Cpu } from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/axios';

const SEVERITY_STYLES: Record<string, string> = {
    'CRÍTICO': 'text-red-400 border-red-500/30 bg-red-500/5',
    'ALTO': 'text-orange-400 border-orange-500/30 bg-orange-500/5',
    'MÉDIO': 'text-amber-400 border-border bg-muted/20',
    'BAIXO': 'text-blue-400 border-blue-500/30 bg-blue-500/5',
};

const TYPE_STYLES: Record<string, string> = {
    'PREDIÇÃO': 'text-purple-400',
    'SAÚDE PÚBLICA': 'text-emerald-400',
    'SUGESTÃO': 'text-blue-400',
    'ANOMALIA': 'text-amber-400',
    'TENDÊNCIA': 'text-cyan-400',
};

export default function AiIntelligencePage() {
    const [riskZones, setRiskZones] = useState<any[]>([]);
    const [alerts, setAlerts] = useState<any[]>([]);
    const [metrics, setMetrics] = useState<any>({ processedPoints: 0, confidenceScore: 0 });
    const [selectedAlert, setSelectedAlert] = useState<any | null>(null);
    const [aiProcessing, setAiProcessing] = useState(true);
    const [lastAnalysis, setLastAnalysis] = useState(new Date());

    const fetchData = React.useCallback(async () => {
        setAiProcessing(true);
        try {
            const res: any = await api.get('/ai/intelligence');
            const { riskZones, alerts, metrics } = res || {};
            setRiskZones(riskZones || []);
            setAlerts(alerts || []);
            setMetrics(metrics || { processedPoints: 0, confidenceScore: 0 });
            setSelectedAlert(alerts?.[0] || null);
            setLastAnalysis(new Date());
        } catch (err) {
            console.error('Erro na análise IA:', err);
        } finally {
            setAiProcessing(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 60000); // Auto-refresh every minute
        return () => clearInterval(interval);
    }, [fetchData]);

    const handleRefresh = () => {
        fetchData();
    };

    const overallRisk = riskZones.length > 0 ? 
        Math.round(riskZones.reduce((s, z) => s + z.riskScore, 0) / riskZones.length) : 0;

    return (
        <div className="flex flex-col gap-8 w-full pb-20 p-8">
            {/* Header com Status do Motor */}
            <div className="border-b border-border pb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="absolute inset-0 bg-purple-500 blur-xl opacity-20 animate-pulse rounded-full" />
                        <Brain className="w-10 h-10 text-purple-500 relative" />
                    </div>
                    <div>
                        <span className="text-[10px] font-black font-mono uppercase tracking-[0.4em] text-purple-500 block underline underline-offset-4">Layer 06 — Motor Cognitivo MTNI</span>
                        <h1 className="text-4xl font-black tracking-tighter uppercase leading-none mt-1">Inteligência Estratégica</h1>
                    </div>
                </div>
                <div className="flex flex-col lg:items-end gap-3">
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <span className="text-[8px] font-mono opacity-40 block uppercase tracking-widest">Confiança da Análise</span>
                            <span className="text-xl font-black font-mono text-emerald-400 tabular-nums">{metrics.confidenceScore}%</span>
                        </div>
                        <div className="h-8 w-px bg-border shadow-[0_0_10px_rgba(0,0,0,0.5)]" />
                        <div className="text-right">
                            <span className="text-[8px] font-mono opacity-40 block uppercase tracking-widest">Pontos Geográficos</span>
                            <span className="text-xl font-black font-mono text-blue-400 tabular-nums">{metrics.processedPoints}</span>
                        </div>
                    </div>
                    <button
                        onClick={handleRefresh}
                        disabled={aiProcessing}
                        className="tactical-btn-primary px-8 text-[9px] flex items-center gap-3 disabled:opacity-50"
                    >
                        <RefreshCw className={cn("w-4 h-4", aiProcessing && "animate-spin")} />
                        {aiProcessing ? 'Sincronizando Malha IA...' : 'Re-Analisar Território'}
                    </button>
                </div>
            </div>

            {/* AI Global Status Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 tactical-panel border border-purple-500/20 bg-purple-500/5 p-8 flex flex-col md:flex-row items-center gap-8 shadow-inner overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 blur-[100px] pointer-events-none" />
                    <div className="relative shrink-0">
                        <Activity className={cn("w-16 h-16 text-purple-500", aiProcessing && "animate-pulse")} />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <span className="text-[11px] font-black font-mono uppercase tracking-[0.4em] text-purple-400 block mb-2">{aiProcessing ? 'Correlação em Curso' : 'Rede Neural Ativa'}</span>
                        <p className="text-lg font-black uppercase tracking-tight text-foreground/90 leading-tight">
                            {aiProcessing 
                                ? 'Consultando bancos de dados de Educação, Saúde e Sinistralidade para mapeamento de riscos...' 
                                : `O motor cognitivo detectou ${alerts.length} anomalias críticas que requerem intervenção logística imediata.`
                            }
                        </p>
                    </div>
                    <div className="shrink-0 flex flex-col items-center justify-center p-6 border border-purple-500/20 bg-black/40 rounded-sm min-w-[140px]">
                        <span className="text-[70px] font-black font-mono leading-none tracking-tighter text-purple-500 tabular-nums">{overallRisk}</span>
                        <span className="text-[8px] font-black font-mono opacity-40 uppercase tracking-[0.3em] mt-2">Score_Hipotético</span>
                    </div>
                </div>
                
                <div className="tactical-panel border border-border bg-card p-8 flex flex-col justify-between group overflow-hidden relative">
                    <Cpu className="absolute -bottom-8 -right-8 w-32 h-32 opacity-5 text-purple-500 group-hover:scale-110 transition-transform duration-700" />
                    <div>
                        <span className="text-[10px] font-black font-mono tracking-widest opacity-40 block mb-4 uppercase">Estado Global_IA</span>
                        <div className="space-y-4">
                            {[
                                { label: 'Saúde SNSI', status: '84%', color: 'bg-emerald-500' },
                                { label: 'Educação MTNI', status: '92%', color: 'bg-blue-500' },
                                { label: 'Segurança Civil', status: '12%', color: 'bg-red-500' }
                            ].map(sys => (
                                <div key={sys.label} className="space-y-1">
                                    <div className="flex justify-between text-[8px] font-black uppercase font-mono tracking-widest">
                                        <span>{sys.label}</span>
                                        <span>{sys.status}</span>
                                    </div>
                                    <div className="h-1 bg-border/40">
                                        <div className={cn("h-full", sys.color)} style={{ width: sys.status }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Modules Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-px bg-border border border-border">
                {/* Ranking de Risco Territorial */}
                <div className="bg-card flex flex-col min-h-[500px]">
                    <div className="px-8 py-5 border-b border-border bg-muted/20 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Target className="w-4 h-4 text-red-500" />
                            <span className="text-[11px] font-black font-mono uppercase tracking-[0.2em]">Malha de Risco Estimada via IA</span>
                        </div>
                        <span className="text-[8px] font-mono opacity-30 uppercase tracking-[0.2em]">Ranking Regional</span>
                    </div>
                    <div className="flex-1 divide-y divide-border/30 overflow-y-auto max-h-[600px] scrollbar-hide">
                        {riskZones.map((zone, idx) => (
                            <motion.div
                                key={zone.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="p-8 group hover:bg-muted/10 transition-colors"
                            >
                                <div className="flex items-start gap-6">
                                    <span className="text-[28px] font-black font-mono text-foreground/5 w-12 shrink-0 group-hover:text-purple-500/10 transition-colors">{idx + 1}</span>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between gap-4 mb-4">
                                            <div className="flex flex-col">
                                                <span className="text-lg font-black uppercase tracking-tight group-hover:text-purple-500 transition-colors">{zone.name}</span>
                                                <span className="text-[8px] font-mono opacity-30 mt-1 uppercase">Densidade: {zone.density} hab/km²</span>
                                            </div>
                                            <div className="text-right">
                                                <span className={cn("text-3xl font-black font-mono tabular-nums leading-none block", 
                                                    zone.riskScore > 75 ? 'text-red-500' : zone.riskScore > 50 ? 'text-orange-400' : 'text-emerald-500'
                                                )}>
                                                    {zone.riskScore}
                                                </span>
                                                <span className="text-[7px] font-black font-mono opacity-30 uppercase tracking-widest">Score_AI</span>
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-1 mb-4">
                                            {zone.factors.map((f: string) => (
                                                <span key={f} className="text-[8px] font-black font-mono px-3 py-1.5 bg-muted/30 border border-border/50 uppercase tracking-wider">{f}</span>
                                            ))}
                                        </div>

                                        <div className="flex items-center gap-4 text-[9px] font-mono opacity-40">
                                            <div className="flex items-center gap-1">
                                                <AlertTriangle className="w-3 h-3 text-red-500" />
                                                <span>{zone.incidents} Incidentes</span>
                                            </div>
                                            <div className={cn("font-black px-2 py-0.5 border border-border rounded-sm", 
                                                zone.trend === 'UP' ? 'text-red-400' : 'text-emerald-400'
                                            )}>
                                                TEDENCIA_{zone.trend}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Feed de Inteligência Cognitiva */}
                <div className="bg-card flex flex-col border-l border-border">
                    <div className="px-8 py-5 border-b border-border bg-muted/20 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Zap className="w-4 h-4 text-purple-400" />
                            <span className="text-[11px] font-black font-mono uppercase tracking-[0.2em]">Insights e Predições Cognitivas</span>
                        </div>
                        <span className="text-[7px] font-mono opacity-30 border border-border px-2 py-0.5 animate-pulse bg-purple-500/5 text-purple-500 uppercase">Live Analysis</span>
                    </div>
                    <div className="flex-1 flex flex-col">
                        <div className="divide-y divide-border/30 flex-1 overflow-y-auto max-h-[600px] scrollbar-hide">
                            {alerts.map((alert, idx) => {
                                const isSelected = selectedAlert?.id === alert.id;
                                return (
                                    <motion.div
                                        key={alert.id}
                                        onClick={() => setSelectedAlert(isSelected ? null : alert)}
                                        className={cn("p-6 cursor-pointer border-l-4 border-transparent transition-all", 
                                            isSelected ? "bg-foreground text-background border-purple-500" : "hover:bg-muted/10"
                                        )}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <span className={cn("text-[8px] font-black font-mono p-1 border", 
                                                            isSelected ? "border-background/30 text-background" : TYPE_STYLES[alert.type] || "text-foreground/40",
                                                            !isSelected && "bg-muted/30"
                                                        )}>{alert.type}</span>
                                                        <span className={cn("text-[8px] font-black font-mono px-2 py-1", 
                                                            isSelected ? "bg-background/20 text-background" : SEVERITY_STYLES[alert.severity]
                                                        )}>{alert.severity}</span>
                                                    </div>
                                                    <span className={cn("text-[9px] font-mono opacity-40", isSelected && "text-background/60")}>{alert.time}</span>
                                                </div>
                                                <h3 className="text-lg font-black uppercase tracking-tight leading-tight mb-2">{alert.title}</h3>
                                                <p className={cn("text-[11px] leading-relaxed", isSelected ? "text-background/80" : "text-muted-foreground")}>{alert.desc}</p>
                                                
                                                {isSelected && (
                                                    <motion.div 
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="mt-6 pt-6 border-t border-background/20"
                                                    >
                                                        <div className="mb-6 p-4 bg-background/5 border-l-2 border-purple-500/50">
                                                            <div className="flex items-center gap-2 mb-2 opacity-40">
                                                                <Brain className="w-3 h-3" />
                                                                <span className="text-[8px] font-black uppercase tracking-widest">Raciocínio Cognitivo</span>
                                                            </div>
                                                            <p className="text-[12px] font-medium leading-relaxed italic text-background/90">{alert.reasoning}</p>
                                                        </div>

                                                        <div className="flex items-center gap-1 mb-2">
                                                            <div className="w-4 h-[1px] bg-background/30" />
                                                            <span className="text-[9px] font-black uppercase tracking-widest text-background/40">Acção Sugerida via IA</span>
                                                        </div>
                                                        <div className="flex items-start gap-3 bg-background/5 p-4 border border-background/10">
                                                            <Shield className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                                                            <span className="text-[12px] font-black leading-tight">{alert.action}</span>
                                                        </div>
                                                        <button className="mt-4 w-full py-3 bg-background text-foreground text-[10px] font-black uppercase tracking-[0.2em] hover:bg-purple-500 hover:text-white transition-all flex flex-col items-center gap-1 group">
                                                            <span>EXECUTAR_PROTOCOLO: {alert.protocol}</span>
                                                            <span className="text-[7px] opacity-40 group-hover:opacity-100">AUTORIZAÇÃO_REQUERIDA_LAYER_06</span>
                                                        </button>
                                                    </motion.div>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Row: AI Log Pipeline */}
            <div className="tactical-panel border border-border bg-card p-6 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <Database className="w-6 h-6 text-blue-500" />
                    <div>
                        <span className="text-[10px] font-black font-mono uppercase tracking-widest text-blue-500/60 block">Fluxo de Dados</span>
                        <div className="flex items-center gap-3 mt-1">
                            <span className="text-[11px] font-black uppercase tracking-tight">Cincronização Automática com API de Terceiros Ativa</span>
                            <div className="flex items-center gap-1">
                                {[1,2,3,4,5].map(i => (
                                    <div key={i} className="w-1 h-3 bg-blue-500/20 rounded-full overflow-hidden">
                                        <motion.div 
                                            animate={{ y: [12, 0, 12] }}
                                            transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }}
                                            className="w-full h-full bg-blue-500" 
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <span className="text-[10px] font-black font-mono uppercase tracking-widest text-foreground/20 block font-mono">MDL_MTNI_COG_v1.0.4</span>
                </div>
            </div>
        </div>
    );
}
