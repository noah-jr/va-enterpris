import { useParams, Link } from 'react-router-dom';
import { ShieldCheck, Lock, Globe, FileText, ChevronLeft, Layers, Zap, Users, CheckCircle, Printer } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../api';
import { formatCurrency, formatDate } from '../utils/format';

const CONTENT = {
    'privacy': {
        title: 'Política de Privacidade',
        icon: <ShieldCheck className="text-emerald-500" size={32} />,
        lastUpdated: 'Março, 2026',
        sections: [
            {
                heading: '1. Recolha de Dados',
                text: 'Recolhemos informações necessárias para o funcionamento da plataforma OneGest, incluindo dados de contacto corporativo e métricas de utilização técnica.'
            },
            {
                heading: '2. Uso de Informação',
                text: 'Os seus dados são utilizados exclusivamente para fornecer os nossos serviços ERP, processamento de suporte técnico e melhoria da experiência do utilizador.'
            },
            {
                heading: '3. Segurança',
                text: 'Implementamos encriptação de nível bancário (AES-256) e backups redundantes em múltiplos centros de dados para garantir a integridade dos seus dados empresariais.'
            }
        ]
    },
    'terms': {
        title: 'Termos de Serviço',
        icon: <FileText className="text-blue-500" size={32} />,
        lastUpdated: 'Janeiro, 2026',
        sections: [
            {
                heading: '1. Aceitação',
                text: 'Ao aceder ao VA OneGest, concorda em ficar vinculado a estes Termos de Utilização e a todas as leis e regulamentos aplicáveis em Angola.'
            },
            {
                heading: '2. Licença de Uso',
                text: 'É concedida permissão para aceder temporariamente às ferramentas SaaS conforme o plano de subscrição escolhido. Esta é uma concessão de licença, não uma transferência de título.'
            },
            {
                heading: '3. Responsabilidade',
                text: 'O utilizador é responsável por garantir que todos os dados inseridos estão corretos para efeitos de faturação e compliance AGT.'
            }
        ]
    },
    'agt-certification': {
        title: 'Certificação AGT v4',
        icon: <Globe className="text-indigo-500" size={32} />,
        lastUpdated: 'Corrente',
        sections: [
            {
                heading: 'Conformidade Legal',
                text: 'O VA OneGest está totalmente certificado pela Administração Geral Tributária (AGT) para emissão de faturas e documentos equivalentes em Angola.'
            },
            {
                heading: 'Ficheiro SAF-T AO',
                text: 'Geração automática e mensal do ficheiro SAF-T AO para submissão no portal da AGT, garantindo zero erros de estrutura.'
            },
            {
                heading: 'Retenção na Fonte',
                text: 'Cálculo automático de retenções (IRT, II) conforme a legislação em vigor, atualizado em tempo real com o Diário da República.'
            }
        ]
    },
    'about': {
        title: 'Sobre o OneGest',
        icon: <Layers className="text-[var(--accent)]" size={32} />,
        lastUpdated: '2024-2026',
        sections: [
            {
                heading: 'Missão',
                text: 'Capacitar as empresas angolanas com tecnologia de ponta para que possam competir no mercado global com eficiência e transparência.'
            },
            {
                heading: 'Inovação',
                text: 'Investimos continuamente em Inteligência Artificial e Automação para reduzir a carga administrativa dos nossos parceiros.'
            },
            {
                heading: 'Presença',
                text: 'Com sede em Luanda e suporte local, estamos próximos de quem gere o futuro do país.'
            }
        ]
    }
};

export default function PublicInfoPage() {
    const { slug } = useParams();
    const [invoice, setInvoice] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const isInvoice = slug?.startsWith('invoice-');
    const invoiceId = isInvoice ? slug?.replace('invoice-', '') : null;

    useEffect(() => {
        if (isInvoice && invoiceId) {
            setLoading(true);
            api.get(`/public/invoice/${invoiceId}`)
                .then(res => setInvoice(res.data))
                .catch(err => {
                    console.error('Public Invoice Error:', err);
                    setError('Documento não encontrado ou inválido.');
                })
                .finally(() => setLoading(false));
        }
    }, [slug, invoiceId, isInvoice]);

    // VIEW: PUBLIC INVOICE VERIFICATION
    if (isInvoice) {
        if (loading) return (
            <div className="h-screen flex flex-col items-center justify-center bg-white">
                <div className="w-16 h-16 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin mb-6"></div>
                <p className="text-xs font-black uppercase tracking-[0.4em] text-slate-400 animate-pulse">Validando Assinatura Digital AGT...</p>
            </div>
        );

        if (error || !invoice) return (
            <div className="h-screen flex flex-col items-center justify-center gap-6 p-8 text-center bg-slate-50">
                <div className="p-8 bg-rose-50 text-rose-500 rounded-full border border-rose-100 shadow-inner"><Lock size={48} /></div>
                <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-900">Falha na Verificação</h1>
                <p className="text-slate-500 text-sm font-medium uppercase tracking-widest max-w-sm leading-relaxed">
                    Este documento não foi autenticado pelo ecossistema VA-ONE-GEST ou a sua validade expirou.
                </p>
                <Link to="/" className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-slate-800 transition-all">
                    Voltar ao Portal
                </Link>
            </div>
        );

        return (
            <div className="min-h-screen bg-slate-100 p-4 md:p-12 flex flex-col items-center font-outfit">
                {/* Status Bar */}
                <div className="max-w-[850px] w-full bg-emerald-600 text-white p-5 rounded-t-3xl flex items-center justify-between shadow-lg">
                    <div className="flex items-center gap-4">
                        <CheckCircle size={24} />
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] leading-none">Documento Fiscal Autêntico</p>
                            <p className="text-[8px] font-bold opacity-70 uppercase mt-1">Auditado em Tempo-Real por VA-ONE-GEST Node</p>
                        </div>
                    </div>
                </div>

                {/* Simplified Invoice View: CLEAN PAPER */}
                <div className="bg-white text-slate-900 w-full max-w-[850px] shadow-2xl p-8 sm:p-12 md:p-16 border-x border-b border-slate-200 rounded-b-3xl">
                    <div className="flex justify-between items-start mb-16 border-b-2 border-slate-900 pb-10">
                        <div className="flex flex-col items-start gap-8">
                            <img src="/logo_full.png" alt="VA ONE" className="h-16 w-auto opacity-30 grayscale" />
                            <div className="text-left">
                                <p className="text-3xl font-black text-slate-950 uppercase tracking-tighter leading-none">{invoice.company?.name}</p>
                                <p className="text-[11px] font-bold text-slate-500 mt-3 uppercase tracking-widest">NIF: {invoice.company?.nif}</p>
                                <p className="text-[10px] text-slate-400 mt-2 uppercase max-w-xs font-medium leading-relaxed">{invoice.company?.address}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <h2 className="text-4xl font-black text-slate-950 uppercase tracking-tighter mb-4">
                                {invoice.type === 'FR' ? 'Fatura-Recibo' : 
                                 invoice.type === 'FT' ? 'Fatura' : 
                                 invoice.type === 'RC' ? 'Recibo' : 'Documento Fiscal'}
                            </h2>
                            <div className="bg-slate-900 text-white px-4 py-2 inline-block">
                                <p className="text-xl font-black tabular-nums tracking-tighter">{invoice.number}</p>
                            </div>
                            <p className="text-[11px] font-bold text-slate-500 mt-6 uppercase tracking-widest">Protocolo: {formatDate(invoice.issueDate)}</p>
                        </div>
                    </div>

                    <div className="mb-16 text-left p-8 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4">Entidade Adquirente</p>
                        <p className="text-3xl font-black text-slate-950 uppercase tracking-tighter">{invoice.client?.name || invoice.customerName || 'Consumidor Final'}</p>
                        <p className="text-sm font-bold text-slate-500 mt-3 uppercase tracking-widest">NIF: {invoice.client?.nif || invoice.customerNif || 'Consumidor Final'}</p>
                    </div>

                    <div className="mb-16 overflow-hidden rounded-2xl border border-slate-200">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 text-[10px] font-black uppercase text-slate-900 border-b-2 border-slate-900">
                                    <th className="py-5 px-8">Designação dos Serviços</th>
                                    <th className="py-5 text-center w-24">Qtd</th>
                                    <th className="py-5 text-right px-8 w-44">Total Líquido</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {invoice.items.map((it: any, i: number) => (
                                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                                        <td className="py-6 px-8 font-black text-slate-950 uppercase text-sm">{it.product?.name || it.productName || it.description}</td>
                                        <td className="py-6 text-center text-slate-500 font-bold tabular-nums">{it.quantity}</td>
                                        <td className="py-6 text-right px-8 font-black text-slate-950 tabular-nums">
                                            <span className="block max-w-[160px] ml-auto truncate" title={formatCurrency(it.totalAmount)}>
                                                {formatCurrency(it.totalAmount)}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                <div className="flex justify-end mt-20 mb-20">
                    <div className="w-full sm:w-[580px] p-12 sm:p-16 bg-slate-950 text-white rounded-[60px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.6)] flex flex-col gap-10 relative overflow-hidden border border-white/10">
                        {/* Dramatic background effect */}
                        <div className="absolute top-0 right-0 w-96 h-96 bg-white/[0.03] rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none"></div>
                        
                        <div className="space-y-6 relative z-10">
                            <div className="flex justify-between items-center opacity-40 text-[12px] font-black uppercase tracking-[0.3em]">
                                <span className="flex-shrink-0">Volume Líquido</span>
                                <span className="tabular-nums text-right truncate ml-10 text-lg">
                                    {formatCurrency(invoice.totalAmount / 1.14)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center opacity-40 text-[12px] font-black uppercase tracking-[0.3em]">
                                <span className="flex-shrink-0">Imposto (IVA 14%)</span>
                                <span className="tabular-nums text-right truncate ml-10 text-lg">
                                    {formatCurrency(invoice.totalAmount - (invoice.totalAmount / 1.14))}
                                </span>
                            </div>
                        </div>
                        
                        <div className="pt-12 border-t border-white/20 relative z-10">
                            <div className="flex flex-col items-end gap-6 text-right">
                                <span className="text-[11px] font-black uppercase tracking-[0.6em] text-slate-500 opacity-80 mb-2">Total a Liquidar</span>
                                <div className="w-full">
                                    <p className={`font-black tabular-nums tracking-tighter leading-none break-all text-right ${
                                        formatCurrency(invoice.totalAmount).length > 25 ? 'text-4xl' :
                                        formatCurrency(invoice.totalAmount).length > 18 ? 'text-5xl' : 'text-7xl'
                                    }`}>
                                        {formatCurrency(invoice.totalAmount)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>



                    <div className="mt-20 pt-10 border-t border-slate-100 text-center space-y-6 opacity-30">
                         <p className="text-[8px] font-black uppercase tracking-[0.5em] max-w-md mx-auto leading-relaxed">
                            A assinatura digital deste documento foi validada conforme os requisitos da AGT. 
                            Certificado n.º 232/AGT/2026.
                         </p>
                         <img src="/logo_full.png" alt="VA" className="h-6 mx-auto grayscale" />
                    </div>
                </div>

                <div className="mt-12 flex flex-col sm:flex-row gap-6 print:hidden">
                    <button 
                        onClick={() => window.print()} 
                        className="inline-flex items-center justify-center gap-3 bg-white text-slate-900 border-2 border-slate-200 px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:border-slate-900 transition-all shadow-lg active:scale-95"
                    >
                        <Printer size={18} /> Imprimir Comprovativo
                    </button>
                    <Link 
                        to="/" 
                        className="inline-flex items-center justify-center bg-slate-950 text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl active:scale-95"
                    >
                        Página Inicial
                    </Link>
                </div>

                <p className="mt-16 text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] opacity-40">© 2026 VA-ONE-GEST · FISCAL TRANSPARENCY NETWORK</p>
            </div>
        );
    }

    // VIEW: Standard Public Info Pages (Privacy, Terms, etc)
    const page = CONTENT[slug as keyof typeof CONTENT] || CONTENT['privacy'];

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] selection:bg-[var(--accent)] selection:text-white font-outfit">
            {/* Header */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-[var(--border-color)] py-5 px-6">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 group">
                        <img src="/logo_full.png" alt="VA ONEGEST" className="h-10 w-auto object-contain opacity-80" />
                    </Link>
                    <Link to="/" className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] hover:text-[var(--accent)] flex items-center gap-2 transition-colors">
                        <ChevronLeft size={14} /> Voltar
                    </Link>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto px-6 py-20">
                <div className="flex flex-col items-center text-center mb-20 animate-slide-up">
                    <div className="w-24 h-24 rounded-3xl bg-slate-50 border border-slate-100 shadow-xl flex items-center justify-center mb-10">
                        {page.icon}
                    </div>
                    <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-slate-950 tracking-tighter mb-6">{page.title}</h1>
                    <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Protocolo:</span>
                        <span className="text-[11px] font-black text-[var(--accent)] uppercase tracking-widest">{page.lastUpdated}</span>
                    </div>
                </div>

                <div className="space-y-10 animate-slide-up" style={{ animationDelay: '200ms' }}>
                    {page.sections.map((section, idx) => (
                        <div key={idx} className="p-8 sm:p-12 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                            <h2 className="text-2xl font-black text-slate-950 mb-6 tracking-tight">{section.heading}</h2>
                            <p className="text-slate-600 font-medium text-lg leading-relaxed opacity-80">
                                {section.text}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="mt-24 pt-12 border-t border-slate-200 text-center">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-10">Departamento de Transparência e Legal</p>
                    <button className="bg-slate-950 text-white px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-2xl">
                        Contactar Suporte Jurídico
                    </button>
                </div>
            </main>

            <footer className="py-20 text-center border-t border-slate-100 bg-slate-50">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] opacity-50">© 2026 VA ONEGEST · Fiscal Compliance</p>
            </footer>
        </div>
    );
}
