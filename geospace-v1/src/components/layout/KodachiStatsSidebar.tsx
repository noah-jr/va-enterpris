"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Shield, Cpu, HardDrive, Network, Lock, Wifi } from 'lucide-react';
import { cn } from '@/lib/utils';

export const KodachiStatsSidebar = () => {
    const [stats, setStats] = useState({
        cpu: 12,
        ram: 45,
        temp: 38,
        netUp: 1.2,
        netDown: 4.8,
    });

    useEffect(() => {
        const interval = setInterval(() => {
            setStats({
                cpu: Math.floor(Math.random() * 20) + 10,
                ram: 45 + (Math.random() > 0.5 ? 1 : -1),
                temp: 38 + Math.floor(Math.random() * 3),
                netUp: Number((Math.random() * 2).toFixed(1)),
                netDown: Number((Math.random() * 10).toFixed(1)),
            });
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const StatBar = ({ label, value, icon: Icon, color }: any) => (
        <div className="flex flex-col gap-1.5 px-4 mb-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    <Icon className={cn("w-3 h-3", color)} />
                    <span className="text-[7px] font-black font-mono tracking-widest text-foreground/40">{label}</span>
                </div>
                <span className={cn("text-[9px] font-black font-mono", color)}>{value}%</span>
            </div>
            <div className="h-1 w-full bg-muted/20 relative overflow-hidden">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    className={cn("absolute top-0 left-0 h-full", color.replace('text', 'bg'))}
                />
            </div>
        </div>
    );

    return (
        <div className="w-[180px] h-full bg-background border-l border-border flex flex-col pt-20 overflow-y-auto scrollbar-hide">
            <div className="px-4 py-2 border-b border-border/50 mb-6 flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-cyan-500" />
                <span className="text-[9px] font-black text-cyan-500 font-mono tracking-tighter uppercase">Kodachi_Engine</span>
            </div>

            <StatBar label="PROCESSAMENTO" value={stats.cpu} icon={Cpu} color="text-cyan-400" />
            <StatBar label="MEMÓRIA_VIVA" value={stats.ram} icon={HardDrive} color="text-emerald-400" />
            <StatBar label="TEMPERATURA" value={stats.temp} icon={Activity} color="text-amber-400" />

            <div className="mt-4 px-4">
                <div className="flex items-center gap-1.5 mb-2">
                    <Network className="w-3 h-3 text-cyan-500" />
                    <span className="text-[7px] font-black font-mono tracking-widest text-foreground/40 uppercase">Tráfego_Seguro</span>
                </div>
                <div className="bg-muted/10 p-2 border border-border/30">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-[6px] font-mono text-muted-foreground uppercase">Up: {stats.netUp} Mb/s</span>
                        <div className="w-10 h-0.5 bg-emerald-500/20 rounded-full" />
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-[6px] font-mono text-muted-foreground uppercase">Dn: {stats.netDown} Mb/s</span>
                        <div className="w-10 h-0.5 bg-cyan-500/20 rounded-full" />
                    </div>
                </div>
            </div>

            <div className="mt-auto p-4 border-t border-border/50 bg-muted/5">
                <div className="flex items-center gap-2 mb-2">
                    <Lock className="w-3 h-3 text-cyan-500" />
                    <span className="text-[7px] font-mono font-black text-cyan-500 tracking-[0.2em]">AES-256_TNL</span>
                </div>
                <div className="space-y-1">
                    <div className="flex justify-between items-center">
                        <span className="text-[5px] font-mono text-muted-foreground uppercase">Tor_Link:</span>
                        <span className="text-[5px] font-mono text-emerald-500">ACTIVE</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-[5px] font-mono text-muted-foreground uppercase">DNS_Crypt:</span>
                        <span className="text-[5px] font-mono text-emerald-500">ACTIVE</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-[5px] font-mono text-muted-foreground uppercase">Proxy_Ch:</span>
                        <span className="text-[5px] font-mono text-amber-500">PENDING</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
