/**
 * Utilitários de Formatação para o Ecossistema OneGest
 * Garante consistência visual em Angola (pt-AO)
 */

/**
 * Formata moeda para Kz (pt-AO) com protecção contra valores astronómicos
 */
export const formatCurrency = (v: number | string | undefined | null): string => {
    if (v === undefined || v === null || v === '') return '0,00 Kz';
    
    let val = typeof v === 'string' ? parseFloat(v) : v;
    
    // Se o valor for ABSURDAMENTE alto (acima de mil biliões), usamos formato compacto automaticamente
    if (Math.abs(val) >= 1_000_000_000_000_000) {
        return formatCurrencyCompact(val);
    }

    try {
        const formatted = new Intl.NumberFormat('pt-AO', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
            useGrouping: true
        }).format(val);
        return `${formatted} Kz`;
    } catch (e) {
        return `${val.toFixed(2).replace('.', ',')} Kz`;
    }
};

/**
 * Formata moeda de forma compacta (ex: 1.2M Kz)
 */
export const formatCurrencyCompact = (v: number | string | undefined | null): string => {
    const val = typeof v === 'string' ? parseFloat(v) : (v || 0);
    
    // Fallback para valores normais inferiores a 100 Milhões
    if (val < 100_000_000 && val > -100_000_000) return formatCurrency(val);

    try {
        const formatted = new Intl.NumberFormat('pt-AO', {
            notation: 'compact',
            compactDisplay: 'short',
            maximumFractionDigits: 1
        }).format(val);
        return `${formatted} Kz`;
    } catch (e) {
        return `${val.toExponential(1)} Kz`;
    }
};

export const formatDate = (date: string | Date | undefined | null) => {
    if (!date) return '---';
    const d = new Date(date);
    return new Intl.DateTimeFormat('pt-AO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }).format(d);
};

export const formatDateTime = (date: string | Date | undefined | null) => {
    if (!date) return '---';
    const d = new Date(date);
    return new Intl.DateTimeFormat('pt-AO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    }).format(d);
};

export const formatNumber = (v: number | string | undefined | null) => {
    const val = typeof v === 'string' ? parseFloat(v) : (v || 0);
    return new Intl.NumberFormat('pt-AO', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(val);
};
