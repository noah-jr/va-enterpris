import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check, X } from 'lucide-react';

interface Option {
    label: string;
    value: string | number;
}

interface SearchableSelectProps {
    options: Option[];
    value?: string | number;
    onChange: (value: any) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    className?: string;
    disabled?: boolean;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
    options,
    value,
    onChange,
    placeholder = "Selecionar opção...",
    searchPlaceholder = "Pesquisar...",
    className = "",
    disabled = false
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const selectedOption = options.find(opt => opt.value === value);

    const filteredOptions = options.filter(opt =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const handleSelect = (option: Option) => {
        onChange(option.value);
        setIsOpen(false);
        setSearchTerm("");
    };

    return (
        <div className={`relative w-full ${className}`} ref={containerRef}>
            <button
                type="button"
                disabled={disabled}
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`flex items-center justify-between w-full premium-input !py-2.5 text-left transition-all ${
                    isOpen ? 'border-[var(--accent)] ring-1 ring-[var(--accent)]/10' : ''
                } ${disabled ? 'opacity-50 cursor-not-allowed bg-[var(--bg-primary)]' : 'cursor-pointer'}`}
            >
                <span className={`truncate ${!selectedOption ? 'text-[var(--text-muted)]' : 'text-[var(--text-primary)] font-medium'}`}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown 
                    size={16} 
                    className={`text-[var(--text-muted)] transition-transform duration-200 ${isOpen ? 'rotate-180 text-[var(--accent)]' : ''}`} 
                />
            </button>

            {isOpen && (
                <div className="absolute z-[100] w-full mt-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl shadow-xl animate-fade-in overflow-hidden">
                    <div className="p-2 border-b border-[var(--border-color)]/50 flex items-center gap-2 bg-[var(--bg-primary)]/30">
                        <Search size={14} className="text-[var(--text-muted)] shrink-0 ml-1" />
                        <input
                            ref={inputRef}
                            type="text"
                            className="w-full bg-transparent border-none outline-none text-xs font-medium py-1 placeholder:text-[var(--text-muted)]/50"
                            placeholder={searchPlaceholder}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <button onClick={() => setSearchTerm("")} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                                <X size={12} />
                            </button>
                        )}
                    </div>

                    <div className="max-h-[240px] overflow-y-auto no-scrollbar py-1">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => handleSelect(option)}
                                    className={`flex items-center justify-between w-full px-4 py-2.5 text-xs text-left transition-colors ${
                                        option.value === value 
                                            ? 'bg-[var(--accent)]/5 text-[var(--accent)] font-bold' 
                                            : 'text-[var(--text-secondary)] hover:bg-[var(--bg-primary)]'
                                    }`}
                                >
                                    <span className="truncate">{option.label}</span>
                                    {option.value === value && <Check size={14} className="shrink-0" />}
                                </button>
                            ))
                        ) : (
                            <div className="px-4 py-8 text-center">
                                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
                                    Nenhum resultado encontrado
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
