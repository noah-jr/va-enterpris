'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, AlertTriangle, TrendingUp, Shield, Users, Route, Zap, Target, Activity, ChevronRight, RefreshCw, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

const RISK_ZONES = [
    { id: 'RZ-001', name: 'Roque Santeiro / Rangel', riskScore: 94, density: 95, traffic: 88, incidents: 7, trend: 'UP', factors: ['Alta Densidade', 'Tráfego Intenso', 'Histórico Elevado'], recommendation: 'Reforçar patrulha — mínimo 2 unidades nos horários 07h-10h e 17h-20h', color: 'bg-red-600' },
    { id: 'RZ-002', name: 'Cazenga / Palanca — Km 12', riskScore: 78, density: 88, traffic: 72, incidents: 4, trend: 'UP', factors: ['Densidade Alta', 'Poucos Recursos'], recommendation: 'Aumentar frequência de patrulha noturna — posicionamento proactivo', color: 'bg-orange-500' },
    { id: 'RZ-003', name: 'Auto-Estrada N1 — Km 35-42', riskScore: 65, density: 30, traffic: 95, incidents: 3, trend: 'STABLE', factors: ['Tráfego Congestionado', 'Zona de obras'], recommendation: 'Monitorar via CCTV — agente de trânsito em standby', color: 'bg-amber-500' },
    { id: 'RZ-004', name: 'Sambizanga — Zona Industrial', riskScore: 58, density: 82, traffic: 45, incidents: 2, trend: 'DOWN', factors: ['Alta Densidade'], recommendation: 'Manter presença regular — risco em declínio', color: 'bg-yellow-500' },
    { id: 'RZ-005', name: 'Viana — Cruzamento Principal', riskScore: 42, density: 55, traffic: 80, incidents: 1, trend: 'DOWN', factors: ['Volume de tráfego'], recommendation: 'Patrulha padrão — situação controlada', color: 'bg-emerald-500' },
];

const ALERTS = [
    { id: 'AI-001', type: 'PREDIÇÃO', severity: 'CRÍTICO', title: 'Risco Elevado Iminente — Rangel', desc: 'Com base em padrão histórico: sextas-feiras entre 17h-19h o setor Rangel apresenta pico de incidentes. Hoje é sexta-feira. Probabilidade: 87%.', time: '5 min', action: 'Deslocar Unidade GF-04 para posição preventiva' },
    { id: 'AI-002', type: 'CORRELAÇÃO', severity: 'ALTO', title: 'Triângulo de Risco Detectado', desc: 'Alta densidade (88%) + congestionamento (92%) + 3 incidentes nas últimas 2h na mesma zona. Combinação atípica detectada em Cazenga.', time: '12 min', action: 'Ativar protocolo DELTA-3 para a zona' },
    { id: 'AI-003', type: 'SUGESTÃO', severity: 'MÉDIO', title: 'Redistribuição Óptima de Agentes', desc: 'Análise de fluxo indica que a Unidade GF-07 (Talatona) pode cobrir também o sector Gamek sem comprometer resposta.', time: '28 min', action: 'Ampliar área de cobertura da GF-07' },
    { id: 'AI-004', type: 'ANOMALIA', severity: 'MÉDIO', title: 'Padrão de Frequência Rádio Anormal', desc: 'Sinais de rádio em frequência não registada detectados na zona de Sambizanga. Possível comunicação não autorizada.', time: '45 min', action: 'Investigar origem do sinal — coordenadas: -8.8150, 13.2500' },
    { id: 'AI-005', type: 'TENDÊNCIA', severity: 'BAIXO', title: 'Redução de 15% de Incidentes — Talatona', desc: 'Tendência positiva confirmada nas últimas 3 semanas. Reforço de patrulha preventiva nessa zona está a surtir efeito.', time: '1h 20min', action: 'Manter estratégia actual — resultados positivos' },
];

const SEVERITY_STYLES: Record<string, string> = {
    'CRÍTICO': 'text-red-400 border-red-500/30 bg-red-500/5',
    'ALTO': 'text-orange-400 border-orange-500/30 bg-orange-500/5',
    'MÉDIO': 'text-amber-400 border-amber-500/30 bg-amber-500/5',
    'BAIXO': 'text-blue-400 border-blue-500/30 bg-blue-500/5',
};

const TYPE_STYLES: Record<string, string> = {
    'PREDIÇÃO': 'text-purple-400',
    'CORRELAÇÃO': 'text-red-400',
    'SUGESTÃO': 'text-emerald-400',
    'ANOMALIA': 'text-amber-400',
    'TENDÊNCIA': 'text-blue-400',
};

const PATROL_RECOMMENDATIONS = [
    { from: 'GF-04', to: 'Sector Rangel', reason: 'Pico previsto às 17h', urgency: 'URGENTE', time: '14:30' },
    { from: 'GF-07', to: 'Cobertura Gamek', reason: 'Expansão de zona', urgency: 'NORMAL', time: '15:00' },
    { from: 'GF-02', to: 'Auto-Estrada N1', reason: 'Apoio a congestionamento', urgency: 'NORMAL', time: '16:15' },
];

import api from '@/lib/axios';

export default function AiIntelligencePage() {
    const [riskZones, setRiskZones] = useState<any[]>([]);
    const [alerts, setAlerts] = useState<any[]>([]);
    const [selectedAlert, setSelectedAlert] = useState<any | null>(null);
    const [aiProcessing, setAiProcessing] = useState(true);
    const [lastAnalysis, setLastAnalysis] = useState(new Date());

    const fetchData = React.useCallback(async () => {
        setAiProcessing(true);
        try {
            const data: any = await api.get('/ai/intelligence');
            setRiskZones(data.riskZones || []);
            setAlerts(data.alerts || []);
            setSelectedAlert(data.alerts?.[0] || null);
            setLastAnalysis(new Date());
        } catch (err) {
            console.error('Erro na análise IA:', err);
        } finally {
            setAiProcessing(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleRefresh = () => {
        fetchData();
    };

    const overallRisk = riskZones.length > 0 ? 
        Math.round(riskZones.reduce((s, z) => s + z.riskScore, 0) / riskZones.length) : 0;

    return (
        <div className="flex flex-col gap-8 w-full pb-20">

            {/* Header */}
            <div className="border-b border-border pb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-center gap-3">
                    <div className="h-6 w-1.5 bg-purple-500" />
                    <div>
                        <span className="text-[8px] font-black font-mono uppercase tracking-[0.4em] text-purple-500/70 block">Layer 06 — Motor de Inteligência Artificial</span>
                        <h1 className="text-3xl font-black tracking-tighter uppercase leading-none">OKUSANGA Intelligence</h1>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-[8px] font-mono opacity-40">
                        <Clock className="w-3 h-3" />
                        Última análise: {lastAnalysis.toLocaleTimeString([], { hour12: false })}
                    </div>
                    <button
                        onClick={handleRefresh}
                        disabled={aiProcessing}
                        className="tactical-btn px-6 text-[9px] inline-flex items-center gap-2 disabled:opacity-50"
                    >
                        <RefreshCw className={cn("w-3.5 h-3.5", aiProcessing && "animate-spin")} />
                        {aiProcessing ? 'Analisando...' : 'Re-Analisar'}
                    </button>
                </div>
            </div>

            {/* AI Status Banner */}
            <div className={cn(
                "tactical-panel border border-purple-500/30 bg-purple-500/5 p-5 flex items-center gap-4 transition-all",
                aiProcessing && "border-blue-500/30 bg-blue-500/5"
            )}>
                <div className="relative">
                    <Brain className={cn("w-8 h-8", aiProcessing ? "text-blue-400" : "text-purple-400")} />
                    {aiProcessing && (
                        <div className="absolute inset-0 animate-ping">
                            <Brain className="w-8 h-8 text-blue-400 opacity-30" />
                        </div>
                    )}
                </div>
                <div className="flex-1">
                    <span className="text-[9px] font-black font-mono uppercase tracking-[0.3em] text-purple-400/70 block">{aiProcessing ? 'Motor IA a processar...' : 'Motor IA Operacional'}</span>
                    <span className="text-[13px] font-black uppercase tracking-tight">
                        {aiProcessing ? 'Correlacionando dados territoriais...' : `Análise Preditiva Ativa — ${alerts.length} alertas gerados`}
                    </span>
                </div>
                <div className="text-right">
                    <div className={cn("text-4xl font-black tabular-nums", overallRisk >= 70 ? 'text-orange-400' : overallRisk >= 40 ? 'text-amber-400' : 'text-emerald-400')}>
                        {overallRisk}
                    </div>
                    <span className="text-[7px] font-mono opacity-40 uppercase tracking-widest">Índice de Risco Territorial</span>
                </div>
            </div>

            {/* Top Row: Risk Zones + AI Alerts */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-px bg-border border border-border">

                {/* Risk Zones Heatbar */}
                <div className="xl:col-span-5 bg-card flex flex-col">
                    <div className="px-5 py-4 border-b border-border bg-muted/20 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Target className="w-3.5 h-3.5 text-red-400" />
                            <span className="text-[9px] font-black font-mono uppercase tracking-widest">Zonas de Risco — Ranking IA</span>
                        </div>
                        <span className="text-[7px] font-mono opacity-30">Score 0-100</span>
                    </div>
                    <div className="flex-1 divide-y divide-border/30">
                        {riskZones.map((zone, idx) => (
                            <motion.div
                                key={zone.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.07 }}
                                className="p-5"
                            >
                                <div className="flex items-start gap-3">
                                    <span className="text-[20px] font-black font-mono text-foreground/10 w-8 shrink-0 leading-none mt-1">{idx + 1}</span>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <span className="text-[11px] font-black uppercase tracking-tight leading-tight">{zone.name}</span>
                                            <span className={cn("text-[16px] font-black tabular-nums shrink-0",
                                                zone.riskScore >= 80 ? 'text-red-400' : zone.riskScore >= 60 ? 'text-orange-400' : zone.riskScore >= 40 ? 'text-amber-400' : 'text-emerald-400'
                                            )}>
                                                {zone.riskScore}
                                            </span>
                                        </div>

                                        {/* Risk Score Bar */}
                                        <div className="h-2 bg-border/30 mb-2">
                                            <div
                                                className={cn("h-full transition-all", zone.color)}
                                                style={{ width: `${zone.riskScore}%`, opacity: 0.8 }}
                                            />
                                        </div>

                                        <div className="flex gap-3 text-[8px] font-mono opacity-40">
                                            <span>Dens: {zone.density}%</span>
                                            <span>Traf: {zone.traffic}%</span>
                                            <span>Inc: {zone.incidents}</span>
                                            <span className={cn("font-black", zone.trend === 'UP' ? 'text-red-400' : zone.trend === 'DOWN' ? 'text-emerald-400' : 'text-foreground/40')}>
                                                {zone.trend === 'UP' ? '↑' : zone.trend === 'DOWN' ? '↓' : '→'}
                                            </span>
                                        </div>

                                        <div className="flex gap-1 mt-2 flex-wrap">
                                            {zone.factors.map((f: any) => (
                                                <span key={f} className="text-[7px] font-black font-mono px-1.5 py-0.5 border border-border bg-muted/20">{f}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* AI Alerts */}
                <div className="xl:col-span-7 bg-card flex flex-col">
                    <div className="px-5 py-4 border-b border-border bg-muted/20 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Zap className="w-3.5 h-3.5 text-purple-400" />
                            <span className="text-[9px] font-black font-mono uppercase tracking-widest">Alertas e Insights de IA</span>
                        </div>
                        <span className="text-[7px] font-mono opacity-30">{alerts.length} alertas activos</span>
                    </div>
                    <div className="flex flex-col flex-1">
                        <div className="divide-y divide-border/30 flex-1">
                            {alerts.map((alert, idx) => {
                                const riskZone = riskZones.find((f: any) => f.id === alert.id);
                                const isSelected = selectedAlert?.id === alert.id;
                                return (
                                    <motion.div
                                        key={alert.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: idx * 0.08 }}
                                        onClick={() => setSelectedAlert(isSelected ? null : alert)}
                                        className={cn("p-4 cursor-pointer transition-all", isSelected ? "bg-foreground text-background" : "hover:bg-muted/20")}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={cn("text-[7px] font-black font-mono", isSelected ? "text-background/60" : TYPE_STYLES[alert.type] || "text-foreground/40")}>{alert.type}</span>
                                                    <span className={cn("text-[7px] font-black font-mono px-1.5 py-0.5 border", isSelected ? "border-background/30 text-background" : SEVERITY_STYLES[alert.severity])}>
                                                        {alert.severity}
                                                    </span>
                                                    <span className={cn("text-[7px] font-mono opacity-30 ml-auto", isSelected ? "text-background" : "")}>{alert.time}</span>
                                                </div>
                                                <span className="text-[11px] font-black uppercase tracking-tight leading-tight block mb-1">{alert.title}</span>
                                                <p className={cn("text-[9px] leading-relaxed", isSelected ? "text-background/70" : "text-muted-foreground")}>{alert.desc}</p>

                                                {isSelected && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        className="mt-3 pt-3 border-t border-background/20"
                                                    >
                                                        <div className="flex items-start gap-2">
                                                            <ChevronRight className="w-3 h-3 text-background/60 shrink-0 mt-0.5" />
                                                            <span className="text-[9px] font-black text-background/80">{alert.action}</span>
                                                        </div>
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

            {/* Patrol Recommendations */}
            <div className="tactical-panel bg-card border border-border">
                <div className="px-6 py-4 border-b border-border bg-muted/20 flex items-center gap-2">
                    <Route className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[9px] font-black font-mono uppercase tracking-widest">Sugestões de Patrulhamento — IA</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border">
                    {PATROL_RECOMMENDATIONS.map((rec, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-card p-6"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[10px] font-black font-mono text-primary">{rec.from}</span>
                                <span className={cn("text-[7px] font-black font-mono px-1.5 py-0.5 border",
                                    rec.urgency === 'URGENTE' ? 'text-red-400 border-red-500/30 bg-red-500/5' : 'text-blue-400 border-blue-500/30 bg-blue-500/5'
                                )}>
                                    {rec.urgency}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-4 h-px bg-border" />
                                <ChevronRight className="w-3 h-3 text-primary" />
                                <span className="text-[12px] font-black uppercase tracking-tight">{rec.to}</span>
                            </div>
                            <div className="flex gap-3 text-[8px] font-mono opacity-40">
                                <span>{rec.reason}</span>
                                <span className="ml-auto">{rec.time}</span>
                            </div>
                            <button className="mt-3 w-full tactical-btn text-[8px] hover:bg-emerald-500 hover:border-emerald-500 hover:text-white">
                                Confirmar Deslocamento
                            </button>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* AI Model metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border border border-border">
                {[
                    { label: 'Precisão Preditiva', value: '91.4%', sub: 'Últimos 30 dias', color: 'text-purple-400' },
                    { label: 'Alertas Correctos', value: '234/257', sub: 'Desde activação', color: 'text-emerald-400' },
                    { label: 'Tempo de Resposta IA', value: '0.3s', sub: 'Média de análise', color: 'text-blue-400' },
                    { label: 'Dados Processados/dia', value: '1.2M', sub: 'Pontos geoespaciais', color: 'text-amber-400' },
                ].map(m => (
                    <div key={m.label} className="bg-card p-6">
                        <div className={cn("text-3xl font-black tracking-tighter", m.color)}>{m.value}</div>
                        <div className="text-[8px] font-black uppercase tracking-widest opacity-40 font-mono mt-1">{m.label}</div>
                        <div className="text-[7px] opacity-30 font-mono mt-0.5">{m.sub}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
