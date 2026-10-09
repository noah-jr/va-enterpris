'use client';

import React from 'react';
import { motion } from 'framer-motion';

export const SystemStatus = () => {
    return (
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/50 backdrop-blur-sm border border-white/40 shadow-sm">
            <span className="relative flex h-2 w-2">
                <motion.span
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"
                />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
            </span>
            <span className="text-xs font-semibold text-slate-600 tracking-tight">GEOSPACE System v1.0</span>
        </div>
    );
};
