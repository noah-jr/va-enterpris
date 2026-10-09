import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    ShieldCheck, FileSearch, FileText, Globe, ChevronLeft, CheckCircle,
    XCircle, Search, Building2, Fingerprint, Calendar,
    Info, BadgeCheck, BookOpen, Scale, Receipt, Lock, ExternalLink,
    Upload, Headset
} from 'lucide-react';
import api from '../api';
import { formatCurrency, formatDate } from '../utils/format';

interface InvoiceResult {
    id: string;
    number: string;
    type: string;
    issueDate: string;
    totalAmount: number;
    hash: string;
    hashControl: string;
    status: string;
    company: { name: string; nif: string; address: string };
    client?: { name: string; nif: string };
    customerName?: string;
    customerNif?: string;
    items: Array<{
        product?: { name: string };
        productName?: string;
        description?: string;
        quantity: number;
        totalAmount: number;
    }>;
}

export default function AGTPublicPortal() {
    const [activeTab, setActiveTab] = useState<'validate' | 'certification' | 'saft' | 'info'>('certification');
    const [invoiceId, setInvoiceId] = useState('');
    const [invoiceResult, setInvoiceResult] = useState<InvoiceResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (invoiceResult) document.getElementById('invoice-result')?.scrollIntoView({ behavior: 'smooth' });
    }, [invoiceResult]);

    const handleValidate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!invoiceId.trim()) return;
        setLoading(true);
        setError('');
        setInvoiceResult(null);
        try {
            const res = await api.get(`/public/invoice/${invoiceId.trim()}`);
            setInvoiceResult(res.data);
        } catch {
            setError('Documento não encontrado ou inválido.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white selection:bg-indigo-200">
            {/* NAV */}
            <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200 py-4 px-6">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3 group">
                        <img src="/logo_full.png" alt="VA ONEGEST" className="h-10 w-auto object-contain opacity-80" />
                        <span className="hidden sm:block text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                            Portal Público AGT
                        </span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <Link to="/login" className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-800 transition-colors">
                            Entrar
                        </Link>
                        <Link to="/" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 flex items-center gap-1.5 transition-colors">
                            <ChevronLeft size={12} /> Voltar
                        </Link>
                    </div>
                </div>
            </nav>

            {/* HERO */}
            <header className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white">
                <div className="max-w-6xl mx-auto px-6 py-20 md:py-28">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
                        <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center flex-shrink-0">
                            <Fingerprint size={32} className="text-indigo-400" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-2">
                                Administração Geral Tributária
                            </p>
                            <h1 className="text-4xl md:text-6xl font-black tracking-tighter">
                                Portal de Transparência Fiscal
                            </h1>
                        </div>
                    </div>
                    <p className="text-lg text-slate-400 font-medium max-w-2xl leading-relaxed">
                        Verificação pública de documentos fiscais, certificação AGT e informações 
                        sobre conformidade fiscal no ecossistema VA OneGest.
                    </p>
                </div>
            </header>

            {/* TABS */}
            <div className="sticky top-[73px] z-40 bg-white border-b border-slate-200 shadow-sm">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="flex gap-0 -mb-px overflow-x-auto">
                        {[
                            { id: 'certification', label: 'Certificação AGT', icon: <BadgeCheck size={16} /> },
                            { id: 'validate', label: 'Validar Documento', icon: <Search size={16} /> },
                            { id: 'saft', label: 'SAF-T AO', icon: <FileText size={16} /> },
                            { id: 'info', label: 'Informações Fiscais', icon: <Info size={16} /> },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                                className={`flex items-center gap-2 px-5 py-4 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all flex-shrink-0 ${
                                    activeTab === tab.id
                                        ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
                                        : 'border-transparent text-slate-400 hover:text-slate-700 hover:border-slate-300'
                                }`}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* CONTENT */}
            <main className="max-w-6xl mx-auto px-6 py-12">
                {/* TAB: CERTIFICATION */}
                {activeTab === 'certification' && (
                    <div className="space-y-10 animate-in fade-in duration-500">
                        <div className="grid md:grid-cols-3 gap-6">
                            {[
                                {
                                    icon: <BadgeCheck size={28} />,
                                    value: '232/AGT/2026',
                                    label: 'Certificado AGT',
                                    desc: 'Software certificado n.º 232/AGT/2026 para emissão de documentos fiscais',
                                },
                                {
                                    icon: <ShieldCheck size={28} />,
                                    value: 'RSA-4096 + SHA-1',
                                    label: 'Assinatura Digital',
                                    desc: 'Hash criptográfico conforme Portaria 312/18 do Diário da República',
                                },
                                {
                                    icon: <Globe size={28} />,
                                    value: 'SAF-T AO 1.01_01',
                                    label: 'Exportação Fiscal',
                                    desc: 'Ficheiro padrão de auditoria compatível com a AGT',
                                },
                            ].map((item, i) => (
                                <div key={i} className="p-8 bg-slate-50 rounded-2xl border border-slate-100 hover:shadow-lg transition-all group">
                                    <div className="w-14 h-14 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                        {item.icon}
                                    </div>
                                    <p className="text-2xl font-black text-slate-950 tracking-tight mb-1">{item.value}</p>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600 mb-3">{item.label}</p>
                                    <p className="text-sm text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                                </div>
                            ))}
                        </div>

                        <div className="p-10 bg-slate-950 text-white rounded-3xl">
                            <div className="flex items-start gap-6">
                                <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center flex-shrink-0">
                                    <Scale size={28} className="text-indigo-400" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black mb-4 tracking-tight">Conformidade Legal</h2>
                                    <div className="space-y-4 text-slate-300">
                                        <p className="leading-relaxed">
                                            O VA OneGest está integralmente certificado pela Administração Geral 
                                            Tributária (AGT) para a emissão de faturas, faturas-recibo, recibos 
                                            e documentos equivalentes, conforme o Decreto Presidencial n.º 312/18.
                                        </p>
                                        <div className="grid sm:grid-cols-2 gap-4 mt-6">
                                            {[
                                                'Assinatura digital RSA-4096 com SHA-1',
                                                'Geração automática de hash por documento',
                                                'String de validação impressa em cada documento',
                                                'Hash controlo com número de certificado + versão',
                                                'QR Code com link para verificação pública',
                                                'SAF-T AO mensal automático',
                                                'Retenção na fonte (IRT, II) calculada automaticamente',
                                                'Arquivo digital de 10 anos conforme lei',
                                            ].map((item, i) => (
                                                <div key={i} className="flex items-start gap-3">
                                                    <CheckCircle size={16} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                                                    <span className="text-sm font-medium">{item}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-10 bg-indigo-50 rounded-3xl border border-indigo-100">
                            <div className="flex items-start gap-6">
                                <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
                                    <Receipt size={28} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-950 mb-2 tracking-tight">Validação de Documentos</h2>
                                    <p className="text-slate-600 font-medium leading-relaxed mb-6">
                                        Qualquer documento fiscal emitido pelo VA OneGest pode ser verificado 
                                        publicamente através do <strong>n.º único do documento</strong>.
                                    </p>
                                    <button
                                        onClick={() => setActiveTab('validate')}
                                        className="inline-flex items-center gap-3 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg"
                                    >
                                        <Search size={16} /> Validar Documento AGT
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB: VALIDATE DOCUMENT */}
                {activeTab === 'validate' && (
                    <div className="space-y-10 animate-in fade-in duration-500">
                        <div className="max-w-2xl mx-auto text-center">
                            <div className="w-16 h-16 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-6">
                                <FileSearch size={32} />
                            </div>
                            <h2 className="text-3xl font-black text-slate-950 tracking-tight mb-3">Validar Documento Fiscal</h2>
                            <p className="text-slate-500 font-medium">
                                Insira o ID único do documento para verificar a sua autenticidade 
                                e conformidade AGT em tempo real.
                            </p>
                        </div>

                        <form onSubmit={handleValidate} className="max-w-xl mx-auto">
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={invoiceId}
                                    onChange={e => setInvoiceId(e.target.value)}
                                    placeholder="ID do documento (ex: clx8h7s5d...)"
                                    className="flex-1 px-6 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all text-sm"
                                />
                                <button
                                    type="submit"
                                    disabled={loading || !invoiceId.trim()}
                                    className="px-8 py-4 bg-slate-950 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg flex items-center gap-2"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <><Search size={16} /> Validar</>
                                    )}
                                </button>
                            </div>
                        </form>

                        {error && (
                            <div className="max-w-xl mx-auto p-6 bg-rose-50 rounded-2xl border border-rose-200 flex items-start gap-4">
                                <XCircle size={24} className="text-rose-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-black text-rose-800 text-sm uppercase tracking-wider">Documento Inválido</p>
                                    <p className="text-rose-600 font-medium text-sm mt-1">{error}</p>
                                </div>
                            </div>
                        )}

                        {invoiceResult && (
                            <div id="invoice-result" className="max-w-3xl mx-auto">
                                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 flex items-start gap-4 mb-8">
                                    <CheckCircle size={28} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-black text-emerald-900 text-sm uppercase tracking-wider">Documento Autêntico</p>
                                        <p className="text-emerald-700 font-medium text-sm mt-0.5">
                                            Este documento foi emitido por software certificado AGT e a sua assinatura digital é válida.
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                                    <div className="p-8 border-b border-slate-100">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Emitido por</p>
                                                <p className="text-xl font-black text-slate-950">{invoiceResult.company.name}</p>
                                                <p className="text-xs font-bold text-slate-500 mt-1">NIF: {invoiceResult.company.nif}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-black text-slate-950 tracking-tight">{invoiceResult.number}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                                                    {invoiceResult.type === 'FR' ? 'Fatura-Recibo' :
                                                     invoiceResult.type === 'FT' ? 'Fatura' :
                                                     invoiceResult.type === 'RC' ? 'Recibo' : 'Documento'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-8 border-b border-slate-100">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Adquirente</p>
                                        <p className="text-lg font-black text-slate-950">
                                            {invoiceResult.client?.name || invoiceResult.customerName || 'Consumidor Final'}
                                        </p>
                                        {invoiceResult.client?.nif && (
                                            <p className="text-sm font-bold text-slate-500 mt-1">NIF: {invoiceResult.client.nif}</p>
                                        )}
                                    </div>

                                    {invoiceResult.items.length > 0 && (
                                        <div className="p-8 border-b border-slate-100">
                                            <table className="w-full text-left">
                                                <thead>
                                                    <tr className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                                                        <th className="pb-3">Descrição</th>
                                                        <th className="pb-3 text-center w-20">Qtd</th>
                                                        <th className="pb-3 text-right w-40">Total</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {invoiceResult.items.map((item, i) => (
                                                        <tr key={i}>
                                                            <td className="py-4 font-bold text-slate-900 text-sm">
                                                                {item.product?.name || item.productName || item.description}
                                                            </td>
                                                            <td className="py-4 text-center text-slate-500 font-bold">{item.quantity}</td>
                                                            <td className="py-4 text-right font-black text-slate-900 tabular-nums">
                                                                {formatCurrency(item.totalAmount)}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}

                                    <div className="p-8 bg-slate-950 text-white">
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Total</p>
                                                <p className="text-3xl font-black tracking-tight mt-1">{formatCurrency(invoiceResult.totalAmount)}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">Data de Emissão</p>
                                                <p className="text-sm font-bold text-white">{formatDate(invoiceResult.issueDate)}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 bg-slate-50 border-t border-slate-200">
                                        <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                                            <span className="flex items-center gap-2">
                                                <Fingerprint size={12} />
                                                Hash: {invoiceResult.hash?.substring(0, 20)}...
                                            </span>
                                            <span>Certificado n.º {invoiceResult.hashControl || '232/AGT/2026'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* TAB: SAF-T AO */}
                {activeTab === 'saft' && (
                    <div className="space-y-10 animate-in fade-in duration-500">
                        <div className="max-w-3xl">
                            <div className="w-16 h-16 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-6">
                                <FileText size={32} />
                            </div>
                            <h2 className="text-3xl font-black text-slate-950 tracking-tight mb-3">SAF-T AO</h2>
                            <p className="text-slate-500 font-medium leading-relaxed max-w-2xl">
                                Standard Audit File for Tax purposes — Angola. O VA OneGest gera 
                                automaticamente o ficheiro SAF-T AO no formato oficial 1.01_01, 
                                pronto para submissão no portal da AGT.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            {[
                                {
                                    title: 'Geração Automática',
                                    desc: 'O sistema gera o SAF-T AO mensalmente com todos os movimentos fiscais do período, incluindo clientes, produtos, faturas e recibos.',
                                    icon: <Calendar size={24} />,
                                },
                                {
                                    title: 'Formato Oficial 1.01_01',
                                    desc: 'Ficheiro XML rigorosamente conforme o schema XSD publicado pela AGT, incluindo Header, Customer, Product, SalesInvoices e Payments.',
                                    icon: <FileText size={24} />,
                                },
                                {
                                    title: 'Hash e Assinatura',
                                    desc: 'Cada documento no SAF-T inclui o hash criptográfico e hash controlo gerados pelo motor de assinatura certificado AGT.',
                                    icon: <Fingerprint size={24} />,
                                },
                                {
                                    title: 'Submissão AGT',
                                    desc: 'Exporte o ficheiro e submeta diretamente no portal do contribuinte ou através do módulo de fiscalidade integrado.',
                                    icon: <Upload size={24} />,
                                },
                            ].map((item, i) => (
                                <div key={i} className="p-8 bg-slate-50 rounded-2xl border border-slate-100 hover:shadow-md transition-all">
                                    <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-5">
                                        {item.icon}
                                    </div>
                                    <h3 className="text-lg font-black text-slate-950 mb-2">{item.title}</h3>
                                    <p className="text-sm text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                                </div>
                            ))}
                        </div>

                        <div className="p-8 bg-slate-50 rounded-2xl border border-slate-100">
                            <h3 className="text-lg font-black text-slate-950 mb-4">Estrutura do Ficheiro SAF-T AO</h3>
                            <div className="bg-slate-950 text-slate-300 rounded-xl p-6 font-mono text-[11px] leading-relaxed overflow-x-auto">
                                {`<AuditFile>
  <Header>              ← Informação da empresa, NIF, período
  <MasterFiles>
    <Customer>          ← Tabela de clientes
    <Product>           ← Tabela de produtos/serviços
  </MasterFiles>
  <SourceDocuments>
    <SalesInvoices>     ← Faturas emitidas (4.1)
      <Invoice>
        <Hash>          ← Assinatura digital AGT
        <HashControl>   ← Certificado + versão
        <Line>          ← Linhas com impostos
    <Payments>          ← Recibos de pagamento (4.4)
`}
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB: INFO */}
                {activeTab === 'info' && (
                    <div className="space-y-10 animate-in fade-in duration-500">
                        <div className="max-w-3xl">
                            <div className="w-16 h-16 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-6">
                                <BookOpen size={32} />
                            </div>
                            <h2 className="text-3xl font-black text-slate-950 tracking-tight mb-3">Informações Fiscais</h2>
                            <p className="text-slate-500 font-medium leading-relaxed max-w-2xl">
                                Recursos e informações sobre conformidade fiscal em Angola.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="p-8 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-5">
                                    <Scale size={24} />
                                </div>
                                <h3 className="text-lg font-black text-slate-950 mb-3">Legislação Aplicável</h3>
                                <ul className="space-y-3">
                                    {[
                                        'Decreto Presidencial n.º 312/18 — Faturação Eletrónica',
                                        'Código Geral Tributário (CGT)',
                                        'Código do Imposto Industrial (CII)',
                                        'Código do Imposto sobre o Rendimento do Trabalho (IRT)',
                                        'Lei do Imposto sobre o Valor Acrescentado (IVA) — Lei n.º 35/20',
                                        'Regulamento SAF-T AO — Portaria n.º 313/18',
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-start gap-3 text-sm font-medium text-slate-700">
                                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 flex-shrink-0" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="p-8 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-5">
                                    <Receipt size={24} />
                                </div>
                                <h3 className="text-lg font-black text-slate-950 mb-3">Obrigações Fiscais</h3>
                                <ul className="space-y-3">
                                    {[
                                        'Emissão de faturas certificadas para todas as transações',
                                        'Comunicação mensal do SAF-T AO à AGT',
                                        'Retenção na fonte de IRT e II conforme tabelas em vigor',
                                        'Liquidação mensal do IVA',
                                        'Entrega da declaração periódica de rendimentos',
                                        'Arquivo digital dos documentos fiscais por 10 anos',
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-start gap-3 text-sm font-medium text-slate-700">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="p-8 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-5">
                                    <Building2 size={24} />
                                </div>
                                <h3 className="text-lg font-black text-slate-950 mb-3">Links Úteis</h3>
                                <ul className="space-y-3">
                                    {[
                                        { label: 'Portal da AGT', url: 'https://www.agt.minfin.gov.ao' },
                                        { label: 'Quiosque AGT — Consulta de Faturas', url: 'https://quiosqueagt.minfin.gov.ao' },
                                        { label: 'Diário da República Eletrónico', url: 'https://dre.pt' },
                                        { label: 'Portal do Contribuinte', url: 'https://www.portaldocontribuinte.minfin.gov.ao' },
                                    ].map((item, i) => (
                                        <li key={i}>
                                            <a
                                                href={item.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                                            >
                                                <ExternalLink size={14} />
                                                {item.label}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="p-8 bg-slate-950 text-white rounded-2xl">
                                <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center mb-5">
                                    <Headset size={24} className="text-indigo-400" />
                                </div>
                                <h3 className="text-lg font-black mb-3">Suporte Fiscal</h3>
                                <p className="text-sm text-slate-300 font-medium leading-relaxed mb-6">
                                    Precisa de ajuda com conformidade AGT, emissão de faturas 
                                    certificadas ou submissão SAF-T? A nossa equipa está disponível.
                                </p>
                                <Link
                                    to="/contact"
                                    className="inline-flex items-center gap-2 bg-indigo-500 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all"
                                >
                                    Contactar Suporte
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* FOOTER */}
            <footer className="border-t border-slate-200 bg-slate-50">
                <div className="max-w-6xl mx-auto px-6 py-16">
                    <div className="grid md:grid-cols-3 gap-12">
                        <div>
                            <img src="/logo_full.png" alt="VA ONEGEST" className="h-8 w-auto object-contain opacity-60 mb-4" />
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                                Software Certificado n.º 232/AGT/2026
                            </p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Legal</p>
                            <div className="space-y-2">
                                <Link to="/info/privacy" className="block text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors">Política de Privacidade</Link>
                                <Link to="/info/terms" className="block text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors">Termos de Serviço</Link>
                                <Link to="/info/agt-certification" className="block text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors">Certificação AGT</Link>
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Fiscal</p>
                            <div className="space-y-2">
                                <Link to="/agt" className="block text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors">Portal Público AGT</Link>
                                <Link to="/info/invoice" className="block text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors">Validar Documento</Link>
                            </div>
                        </div>
                    </div>
                    <div className="mt-12 pt-8 border-t border-slate-200 text-center">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.5em]">
                            © 2026 VA ONEGEST · Fiscal Compliance · Certificado AGT 232/2026
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
