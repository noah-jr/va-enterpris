'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MoreVertical, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DropdownItem {
    label: string;
    action: () => void;
    icon?: React.ElementType;
    variant?: 'default' | 'danger' | 'warning';
}

interface TacticalDropdownProps {
    trigger?: React.ReactNode;
    items: DropdownItem[];
    align?: 'left' | 'right';
    className?: string;
}

export const TacticalDropdown = ({ trigger, items, align = 'right', className }: TacticalDropdownProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={containerRef} className={cn("relative inline-block", className)}>
            <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
                {trigger || (
                    <button className="p-2 border border-border bg-background hover:bg-muted/50 transition-all group">
                        <MoreVertical className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 group-hover:text-primary" />
                    </button>
                )}
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className={cn(
                            "absolute z-50 mt-2 min-w-[160px] bg-background border border-border shadow-2xl p-1",
                            align === 'right' ? "right-0" : "left-0"
                        )}
                    >
                        {/* Decorative Grid Background */}
                        <div className="absolute inset-0 bg-tactical-grid opacity-[0.05] pointer-events-none" />
                        
                        <div className="relative flex flex-col">
                            {items.map((item, i) => (
                                <button
                                    key={i}
                                    onClick={() => {
                                        item.action();
                                        setIsOpen(false);
                                    }}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-left hover:bg-primary hover:text-primary-foreground transition-all group",
                                        item.variant === 'danger' && "text-red-500 hover:bg-red-500",
                                        item.variant === 'warning' && "text-amber-500 hover:bg-amber-500"
                                    )}
                                >
                                    {item.icon && <item.icon className="w-3.5 h-3.5" />}
                                    <span className="flex-1">{item.label}</span>
                                    <div className="w-1 h-1 bg-current opacity-20" />
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
