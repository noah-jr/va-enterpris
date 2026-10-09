import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    subtitle?: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
    type?: 'SIDE' | 'CENTER';
    width?: 'sm' | 'md' | 'lg' | 'xl' | '3xl' | 'full';
}

const WIDTH_CLASSES = {
    sm:   'max-w-md',
    md:   'max-w-lg',
    lg:   'max-w-2xl',
    xl:   'max-w-4xl',
    '3xl': 'max-w-5xl',
    full: 'max-w-6xl'
};

export const Modal = ({
    isOpen,
    onClose,
    title,
    subtitle,
    icon,
    children,
    type  = 'CENTER',
    width = 'md'
}: ModalProps) => {

    /* Prevent body scroll when open */
    useEffect(() => {
        const main = document.querySelector('main');
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            if (main) main.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
            if (main) main.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = '';
            if (main) main.style.overflow = 'auto';
        };
    }, [isOpen]);

    /* Close on Escape */
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    if (!isOpen) return null;

    const modalContent = (
        <div className={`fixed inset-0 z-[2000] flex ${
            type === 'SIDE'
                ? 'justify-end'
                : 'items-center justify-center p-4 sm:p-6'
        }`}>
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 transition-opacity"
                onClick={onClose}
            />

            {/* Panel */}
            <div className={`
                relative z-10 bg-[var(--bg-primary)] border border-[var(--border-color)] w-full shadow-2xl
                ${WIDTH_CLASSES[width]}
                ${type === 'SIDE'
                    ? 'h-[100dvh] flex flex-col animate-in slide-in-from-right duration-200'
                    : 'rounded-[var(--radius-lg)] max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200'
                }
            `}>
                {/* Header */}
                <div className="px-5 py-5 border-b border-[var(--border-color)] flex items-center justify-between shrink-0 bg-[var(--bg-primary)]">
                    <div className="flex items-center gap-3 min-w-0">
                        {icon && (
                            <div className="w-8 h-8 rounded-[var(--radius-md)] bg-[var(--accent-soft)] flex items-center justify-center text-[var(--accent)] shrink-0">
                                {icon}
                            </div>
                        )}
                        <div className="min-w-0">
                            {subtitle && (
                                <p className="text-[10px] font-500 text-[var(--text-muted)] uppercase tracking-wider mb-0.5">
                                    {subtitle}
                                </p>
                            )}
                            {title && (
                                <h2 className="text-base font-600 text-[var(--text-primary)] truncate">{title}</h2>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-7 h-7 rounded-[var(--radius-md)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)] transition-colors shrink-0 ml-3"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto no-scrollbar">
                    {children}
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
};
