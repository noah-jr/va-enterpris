'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Shield, Signal, Cpu, Lock, Terminal, Activity } from 'lucide-react';

export default function DesignSystemPage() {
    return (
        <div className="flex flex-col gap-12 w-full pb-20 animate-in fade-in duration-500">

            {/* Tactical Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b-2 border-border pb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 opacity-[0.02] pointer-events-none font-black text-[120px] leading-none -translate-y-1/4 select-none uppercase tracking-tighter">Design_Sys</div>

                <div className="space-y-4 z-10">
                    <div className="flex items-center gap-3">
                        <div className="h-4 w-1 bg-foreground" />
                        <h1 className="text-4xl font-black tracking-tighter uppercase leading-[0.8] mb-0">Tactical Framework</h1>
                    </div>
                    <div className="flex gap-6 font-tactical">
                        <div className="flex items-center gap-2">
                            <span className="text-foreground font-black animate-pulse text-[8px]">●</span>
                            <span className="text-[9px] font-black uppercase tracking-[0.3em]">Module::Visual_Spec_v2.0</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground border-l border-border pl-6">
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] opacity-40">Monochromatic_Matrix</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2 z-10">
                    <button className="tactical-btn-primary px-8 text-[9px]">Export Spec</button>
                    <button className="tactical-btn px-8 text-[9px]">Terminal Mode</button>
                </div>
            </div>

            {/* Typography Section */}
            <section className="space-y-6">
                <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black font-tactical uppercase tracking-[0.4em] opacity-30">01 // Typography</span>
                    <div className="h-px flex-1 bg-border/20" />
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-px bg-border border border-border">
                    <div className="bg-card p-10 flex flex-col gap-8">
                        <div className="space-y-2">
                            <span className="text-[7px] font-black opacity-30 uppercase font-tactical tracking-widest">Display_XL</span>
                            <h2 className="text-6xl font-black uppercase tracking-tighter leading-none">c</h2>
                        </div>
                        <div className="space-y-2">
                            <span className="text-[7px] font-black opacity-30 uppercase font-tactical tracking-widest">Heading_L</span>
                            <h3 className="text-3xl font-black uppercase tracking-tight">Operational View</h3>
                        </div>
                        <div className="space-y-2">
                            <span className="text-[7px] font-black opacity-30 uppercase font-tactical tracking-widest">Heading_M</span>
                            <h4 className="text-xl font-black uppercase tracking-normal">Telemetry Hub</h4>
                        </div>
                    </div>
                    <div className="bg-muted/10 p-10 flex flex-col gap-8">
                        <div className="space-y-2">
                            <span className="text-[7px] font-black opacity-30 uppercase font-tactical tracking-widest">Code_Mono</span>
                            <p className="font-tactical text-xs font-black uppercase tracking-[0.2em] leading-relaxed">
                                System.Initialize(Node_Alpha); <br />
                                Mesh_Link: Connected_@256bit; <br />
                                Status: Nominal_Response_Center;
                            </p>
                        </div>
                        <div className="space-y-2">
                            <span className="text-[7px] font-black opacity-30 uppercase font-tactical tracking-widest">Body_Copy</span>
                            <p className="text-sm font-medium leading-relaxed opacity-60">
                                This framework prioritizes high data density and operational clarity.
                                By removing decorative elements and color distractions, we focus
                                the user on raw data hierarchy and system response urgency.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Action Components */}
            <section className="space-y-6">
                <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black font-tactical uppercase tracking-[0.4em] opacity-30">02 // Components</span>
                    <div className="h-px flex-1 bg-border/20" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Buttons Hub */}
                    <div className="tactical-panel p-8 space-y-8">
                        <span className="text-[8px] font-black uppercase tracking-[0.3em] font-tactical opacity-50 block mb-4 border-b border-border pb-2">Interaction_Nodes</span>
                        <div className="flex flex-col gap-3">
                            <button className="tactical-btn-primary w-full">Primary_Trigger</button>
                            <button className="tactical-btn w-full">Secondary_Action</button>
                            <div className="grid grid-cols-2 gap-2">
                                <button className="tactical-btn text-[7px]">Small_TX</button>
                                <button className="tactical-btn text-[7px] bg-muted/40 opacity-40 hover:opacity-100">Disabled_RX</button>
                            </div>
                        </div>
                    </div>

                    {/* Status Nodes */}
                    <div className="tactical-panel p-8 space-y-8">
                        <span className="text-[8px] font-black uppercase tracking-[0.3em] font-tactical opacity-50 block mb-4 border-b border-border pb-2">Status_Telemetry</span>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 h-10 px-4 border border-border bg-background">
                                <div className="status-pulse">
                                    <div className="ping" />
                                    <div className="dot" />
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-widest">LIVE</span>
                            </div>
                            <div className="flex items-center gap-3 h-10 px-4 border border-border bg-muted/20 opacity-40">
                                <div className="w-1.5 h-1.5 bg-foreground" />
                                <span className="text-[9px] font-black uppercase tracking-widest">IDLE</span>
                            </div>
                            <div className="col-span-2 flex items-center justify-between h-10 px-4 bg-foreground text-background">
                                <span className="text-[9px] font-black uppercase tracking-widest">Critical_Alert</span>
                                <Lock className="w-3 h-3" />
                            </div>
                        </div>
                    </div>

                    {/* Icon Symbols */}
                    <div className="tactical-panel p-8 space-y-8">
                        <span className="text-[8px] font-black uppercase tracking-[0.3em] font-tactical opacity-50 block mb-4 border-b border-border pb-2">Symbol_Glossary</span>
                        <div className="grid grid-cols-4 gap-4">
                            {[Shield, Signal, Cpu, Terminal, Activity, Lock].map((Icon, i) => (
                                <div key={i} className="aspect-square border border-border flex items-center justify-center hover:bg-foreground hover:text-background transition-colors group">
                                    <Icon className="w-4 h-4 opacity-40 group-hover:opacity-100" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Tactical Panels Grid */}
            <section className="space-y-6">
                <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black font-tactical uppercase tracking-[0.4em] opacity-30">03 // Layout Containers</span>
                    <div className="h-px flex-1 bg-border/20" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-px bg-border border border-border">
                    <div className="lg:col-span-8 bg-card p-12 h-[400px] relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-12 opacity-[0.03] space-y-4">
                            <div className="w-24 h-24 border border-foreground" />
                            <div className="text-[10px] font-tactical font-black uppercase">GRID_SEC_7</div>
                        </div>
                        <div className="max-w-md space-y-6">
                            <span className="inline-block px-2 py-0.5 boder border-foreground bg-foreground text-background text-[8px] font-black uppercase tracking-widest">Analysis_Module</span>
                            <h3 className="text-4xl font-black uppercase tracking-tighter leading-tight">Tactical Hub v2 Container</h3>
                            <p className="text-sm opacity-50 leading-relaxed font-medium">
                                Containers use zero border-radius and hairline borders to create a technical,
                                blueprint-like aesthetic. Backgrounds use very subtle grays or pure blacks
                                depending on the UI mode.
                            </p>
                        </div>
                    </div>
                    <div className="lg:col-span-4 bg-muted/20 p-12 flex flex-col justify-between">
                        <div className="space-y-4">
                            <div className="w-12 h-1 bg-foreground" />
                            <span className="text-[8px] font-black uppercase tracking-[0.5em] font-tactical opacity-40 block">Operational_Stats</span>
                            <div className="text-5xl font-black tracking-tighter">98%</div>
                        </div>
                        <div className="pt-8 border-t border-border mt-auto">
                            <button className="tactical-btn w-full">Execute_Deep_Scan</button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

