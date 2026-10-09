import { useState, useEffect, useCallback } from 'react';
import {
    ShieldCheck, Download, FileText, Calendar, Building2,
    AlertCircle, Loader2, CheckCircle2, TrendingUp, Users,
    Package, ReceiptText, XCircle, RefreshCw, ChevronRight,
    ArrowUpRight, Info
} from 'lucide-react';
import { formatCurrency } from '../utils/format';
import api from '../api';
import { toast } from 'sonner';
import { SearchableSelect } from '../components/SearchableSelect';

interface FiscalSummary {
    year: number;
    certificateNumber: string;
    invoiceCount: number;
    clientCount: number;
    productCount: number;
    totalRevenue: number;
    totalVatCharged: number;
    totalVatDeductible: number;
    stampTax: number;
    netVatDue: number;
    cancelledInvoices: number;
    activeInvoices: number;
}

const formatKz = (value: number) => formatCurrency(value);

export default function FiscalModule() {
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState<number | undefined>(undefined); // undefined = Ano Inteiro
    const [isExporting, setIsExporting] = useState(false);
    const [summary, setSummary] = useState<FiscalSummary | null>(null);
    const [isLoadingSummary, setIsLoadingSummary] = useState(false);

    const fetchSummary = useCallback(async () => {
        setIsLoadingSummary(true);
        try {
            const response = await api.get('/saft/summary', { 
                params: { year, month } 
            });
            setSummary(response.data);
        } catch (error) {
            console.error('Error fetching fiscal summary:', error);
            toast.error('Erro ao carregar resumo fiscal.');
        } finally {
            setIsLoadingSummary(false);
        }
    }, [year, month]);

    useEffect(() => {
        fetchSummary();
    }, [fetchSummary]);

    const handleExportSaft = async () => {
        setIsExporting(true);
        try {
            const response = await api.get('/saft/export', {
                params: { year, month },
                responseType: 'blob'
            });

            const monthStr = month ? `_M${String(month).padStart(2, '0')}` : '';
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `SAFT_AO_${year}${monthStr}.xml`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            toast.success('Ficheiro SAF-T exportado com sucesso!');
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Erro ao gerar ficheiro SAF-T.');
        } finally {
            setIsExporting(false);
        }
    };

    const currentYear = new Date().getFullYear();
    const availableYears = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

    return (
        <div className="space-y-8 pb-20 animate-fade-in text-left">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-xl font-bold text-[var(--text-primary)]">Módulo Fiscal</h1>
                    <p className="text-sm text-[var(--text-muted)] mt-0.5">Gestão de obrigações tributárias e conformidade institucional.</p>
                </div>
                <div className="flex items-center gap-3">
                     <button
                        onClick={fetchSummary}
                        disabled={isLoadingSummary}
                        className="p-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl hover:text-[var(--accent)] transition-all"
                    >
                        <RefreshCw size={18} className={isLoadingSummary ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Stats Strip */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {isLoadingSummary ? (
                    [...Array(4)].map((_, i) => (
                        <div key={i} className="premium-card h-24 animate-pulse opacity-50" />
                    ))
                ) : summary ? (
                    [
                        { label: 'Faturas Emitidas', value: summary.activeInvoices.toString(), icon: ReceiptText, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
                        { label: 'Faturas Anuladas', value: summary.cancelledInvoices.toString(), icon: XCircle, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-500/10' },
                        { label: 'Total Clientes', value: summary.clientCount.toString(), icon: Users, color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-500/10' },
                        { label: 'Catálogo Fiscal', value: summary.productCount.toString(), icon: Package, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10' },
                    ].map((stat, i) => (
                        <div key={i} className="premium-card p-4 flex items-start gap-3">
                            <div className={`kpi-icon shrink-0 ${stat.color} ${stat.bg}`}>
                                <stat.icon size={15} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs text-[var(--text-muted)] mb-0.5 truncate">{stat.label}</p>
                                <p className="text-base font-bold text-[var(--text-primary)] tabular-nums leading-tight">{stat.value}</p>
                            </div>
                        </div>
                    ))
                ) : null}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Export Card */}
                <div className="lg:col-span-2 premium-card p-8 bg-[var(--bg-secondary)] relative overflow-hidden flex flex-col justify-between border-none shadow-sm">
                    <div className="absolute top-0 right-0 p-10 opacity-[0.03] text-[var(--accent)] pointer-events-none rotate-12">
                        <ShieldCheck size={180} />
                    </div>

                    <div className="space-y-8 relative z-10">
                        <div className="flex items-start gap-6">
                            <div className="w-14 h-14 bg-[var(--accent)]/10 text-[var(--accent)] rounded-2xl flex items-center justify-center border border-[var(--accent)]/20 shadow-inner">
                                <FileText size={28} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-[var(--text-primary)]">Ficheiro SAF-T (AO)</h3>
                                <p className="text-sm text-[var(--text-secondary)] font-medium opacity-60 max-w-md leading-relaxed mt-2">
                                    Geração de ficheiro padrão de auditoria fiscal compatível com a norma 1.01_01 da AGT.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase px-1 tracking-wider">Ano Fiscal</label>
                                <SearchableSelect 
                                    options={availableYears.map(y => ({ label: y.toString(), value: y }))}
                                    value={year}
                                    onChange={val => setYear(val)}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase px-1 tracking-wider">Mês de Referência</label>
                                <SearchableSelect 
                                    options={[
                                        { label: 'Ano Inteiro', value: '' },
                                        ...['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                                            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
                                        ].map((m, i) => ({ label: m, value: i + 1 }))
                                    ]}
                                    value={month || ''}
                                    onChange={val => setMonth(val === '' ? undefined : val)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-6 pt-8 border-t border-[var(--border-color)]/20 relative z-10">
                        <div className="flex items-start gap-3 bg-amber-500/5 border border-amber-500/10 p-3 rounded-xl max-w-sm">
                            <Info size={16} className="text-amber-500 shrink-0 mt-0.5" />
                            <p className="text-[10px] font-medium text-amber-600/80 leading-relaxed italic">
                                Valide os dados institucionais nas definições antes da exportação oficial.
                            </p>
                        </div>
                        
                        <button
                            onClick={handleExportSaft}
                            disabled={isExporting}
                            className="premium-button-primary !py-4 !px-8 w-full sm:w-auto shadow-xl shadow-[var(--accent)]/20"
                        >
                            {isExporting ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : (
                                <Download size={18} />
                            )}
                            {isExporting ? 'Processando XML...' : 'Gerar Ficheiro SAF-T'}
                        </button>
                    </div>
                </div>

                {/* Side Info Cards */}
                <div className="space-y-6">
                    {/* Software Certificate */}
                    <div className="premium-card p-8 bg-emerald-500/5 border-emerald-500/10 group overflow-hidden relative">
                         <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                            <CheckCircle2 size={60} className="text-emerald-500" />
                        </div>
                        <div className="flex items-center gap-2 text-emerald-600 mb-6">
                            <ShieldCheck size={16} />
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Selo Institucional</span>
                        </div>
                        <div className="space-y-1">
                            {isLoadingSummary ? (
                                <div className="h-8 bg-emerald-500/10 rounded-lg animate-pulse w-32" />
                            ) : (
                                <p className="text-2xl font-bold text-[var(--text-primary)]">{summary?.certificateNumber ?? '—'}</p>
                            )}
                            <p className="text-[10px] font-medium text-[var(--text-secondary)] opacity-50 uppercase tracking-wider">Software Certificado AGT</p>
                        </div>
                    </div>

                    {/* Tax Summary */}
                    <div className="premium-card p-8 bg-[var(--bg-secondary)] space-y-8">
                        <div className="flex items-center justify-between border-b border-[var(--border-color)]/20 pb-4">
                            <h4 className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em]">Resumo Tributário</h4>
                            <span className="text-[9px] font-bold text-[var(--accent)] uppercase opacity-60">
                                {month ? `${['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ'][month-1]}` : 'ANUAL'}
                            </span>
                        </div>

                        <div className="space-y-5">
                            {[
                                { label: 'IVA Liquidado', value: summary?.totalVatCharged ?? 0, color: 'text-[var(--text-primary)]' },
                                { label: 'IVA Dedutível', value: summary?.totalVatDeductible ?? 0, color: 'text-rose-500' },
                                { label: 'Imposto de Selo', value: summary?.stampTax ?? 0, color: 'text-[var(--text-secondary)]' },
                            ].map((item, i) => (
                                <div key={i} className="flex justify-between items-end">
                                    <span className="text-[11px] font-medium text-[var(--text-secondary)] opacity-60 uppercase tracking-tight">{item.label}</span>
                                    <span className={`text-sm font-bold ${item.color} tabular-nums tracking-tight`}>{formatKz(item.value)}</span>
                                </div>
                            ))}
                        </div>

                        <div className="pt-6 border-t border-[var(--border-color)]/20 flex flex-col gap-2">
                             <div className="flex justify-between items-end mb-2">
                                <span className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">IVA a Pagar</span>
                                <span className="text-xl font-bold text-emerald-500 tabular-nums tracking-tighter">
                                    {summary ? formatKz(summary.netVatDue) : '—'}
                                </span>
                            </div>
                            <button className="w-full text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--accent)] flex items-center justify-center gap-2 hover:translate-x-1 transition-transform pt-2">
                                Ver Detalhes do Apuramento <ArrowUpRight size={12} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Verification Footer */}
            <div className="flex flex-col items-center justify-center gap-4 mt-16 opacity-30 group hover:opacity-100 transition-opacity duration-700">
                <div className="flex items-center gap-6 grayscale group-hover:grayscale-0 transition-all">
                    <div className="bg-[var(--text-primary)] text-[var(--bg-primary)] px-4 py-1.5 rounded font-bold text-lg italic tracking-tighter shadow-sm">AGT</div>
                    <div className="h-4 w-px bg-[var(--border-color)]" />
                    <p className="text-[9px] font-medium text-[var(--text-secondary)] max-w-[240px] uppercase tracking-[0.1em] leading-relaxed">
                        Transmissão certificada via VA-TRUST GATEWAY • Encriptação de ciclo soberano.
                    </p>
                </div>
            </div>
        </div>
    );
}
