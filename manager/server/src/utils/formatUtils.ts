import { format } from 'date-fns';
import extenso from 'extenso';

/**
 * Utilitários de Formatação para o Backend OneGest
 * Segue as normas da AGT e padrões bancários de Angola.
 */

export class FormatUtils {
    
    /**
     * Formata moeda para Kz (pt-AO)
     */
    static formatCurrency(v: number): string {
        if (!v && v !== 0) return '0,00 Kz';
        const val = Number(v);

        // Se o valor for ABSURDAMENTE alto (acima de mil biliões), usamos formato compacto automaticamente
        if (Math.abs(val) >= 1_000_000_000_000_000) {
            return this.formatCurrencyCompact(val);
        }

        try {
            return new Intl.NumberFormat('pt-AO', { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2,
                useGrouping: true
            }).format(val) + ' Kz';
        } catch (e) {
            return val.toFixed(2).replace('.', ',') + ' Kz';
        }
    }

    static formatCurrencyCompact(v: number): string {
        const val = Number(v);
        if (val < 100_000_000 && val > -100_000_000) return this.formatCurrency(val);

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
    }

    /**
     * Formata data no padrão DD/MM/YYYY
     */
    static formatDate(date: Date | string | number): string {
        const d = new Date(date);
        return format(d, 'dd/MM/yyyy');
    }

    /**
     * Converte valor monetário para extenso (Português de Angola)
     */
    static formatExtenso(v: number): string {
        try {
            const integerPart = Math.floor(v);
            const decimalPart = Math.round((v - integerPart) * 100);
            
            let result = extenso(integerPart, { locale: 'pt' });
            result += integerPart === 1 ? ' Kwanza' : ' Kwanzas';
            
            if (decimalPart > 0) {
                result += ' e ' + extenso(decimalPart, { locale: 'pt' }) + (decimalPart === 1 ? ' Cêntimo' : ' Cêntimos');
            }
            
            return result.charAt(0).toUpperCase() + result.slice(1);
        } catch (e) {
            return '';
        }
    }

    /**
     * Formatação de NIF - Limpeza de caracteres não alfanuméricos
     */
    static formatNif(nif: string): string {
        return nif.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    }
}
