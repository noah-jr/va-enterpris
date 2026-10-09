import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Building2, User, Mail, Lock, Eye, EyeOff, ArrowRight,
    CheckCircle2, Shield, Zap, BarChart3,
    Check, Loader2, ShieldCheck
} from 'lucide-react';
import { useRegisterSaaS } from '../auth/useAuth';
import api, { lookupTaxpayer } from '../api';
import { toast } from 'sonner';

const FEATURES = [
    { icon: <Zap size={15} className="text-indigo-400" />,        text: 'Faturação ilimitada'          },
    { icon: <Shield size={15} className="text-emerald-400" />,    text: 'Dados seguros e encriptados'  },
    { icon: <BarChart3 size={15} className="text-blue-400" />,    text: 'Relatórios em tempo real'     },
    { icon: <CheckCircle2 size={15} className="text-purple-400"/>, text: 'Suporte prioritário 24/7'    },
];

export default function RegisterPage() {
    const navigate = useNavigate();
    sessionStorage.removeItem('selectedPlan');
    sessionStorage.removeItem('billingCycle');

    const [form, setForm] = useState({
        companyName: '',
        companyNif:  '',
        companyPhone:'',
        companyAddress:'',
        userName:    '',
        userEmail:   '',
        password:    '',
        plan:        'TRIAL'
    });
    const [showPwd,     setShowPwd]     = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const register = useRegisterSaaS();

    const [publicSettings, setPublicSettings] = useState<any>(null);
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await api.get('/public/settings');
                setPublicSettings(response.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchSettings();
    }, []);

    if (publicSettings?.HIDE_REGISTRATION === 'true') {
        return (
            <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-6 text-white">
                <div className="max-w-md w-full bg-zinc-900 border border-white/10 rounded-3xl p-8 text-center relative overflow-hidden">
                    <img src="/logo_full.png" alt="Logo" className="h-8 mx-auto mb-8" />
                    <h2 className="text-2xl font-bold tracking-tight mb-2">Registo Temporariamente Fechado</h2>
                    <p className="text-sm text-zinc-500 mb-8">
                        O registo automático está desativado. Poderá contactar-nos ou entrar para a nossa lista de espera para priorizar a criação da sua conta.
                    </p>
                    {publicSettings?.WAITLIST_ACTIVE === 'true' ? (
                        <button onClick={() => navigate('/waitlist')} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3.5 rounded-xl text-[11px] font-bold transition-all mb-4">
                            Aderir à Lista de Espera (Waitlist)
                        </button>
                    ) : null}
                    <button onClick={() => navigate('/login')} className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-3.5 rounded-xl text-[11px] font-bold transition-all">
                        Voltar para Iniciar Sessão
                    </button>
                </div>
            </div>
        );
    }

    const handleTaxpayerLookup = async (nifValue: string) => {
        if (!nifValue || nifValue.length < 9) return;
        setIsSearching(true);
        try {
            const { data } = await lookupTaxpayer(nifValue);
            if (data) {
                const companyName = data.companyName || data.name || data.gsmc || '';
                const email = (data.email || '').toLowerCase();
                const phone = data.lxfs || data.telefone || '';
                const address = data.nsrdz || data.addressDbb || '';
                
                let ownerName = '';
                const ownerNif = data.nsrfrdb || data.nsrcwfzr;
                
                // Se o NIF do dono estiver disponível, tenta pesquisar o nome dele
                if (ownerNif) {
                    try {
                        const { data: ownerData } = await lookupTaxpayer(ownerNif);
                        if (ownerData) {
                            ownerName = ownerData.companyName || ownerData.name || ownerData.gsmc || '';
                        }
                    } catch {
                        // ignore
                    }
                }

                setForm(prev => ({ 
                    ...prev, 
                    companyName: companyName || prev.companyName,
                    companyPhone: phone || prev.companyPhone,
                    companyAddress: address || prev.companyAddress,
                    userEmail: email || prev.userEmail,
                    userName: ownerName || prev.userName
                }));
                toast.success('Dados preenchidos automaticamente.');
            }
        } catch { /* silent */ } finally {
            setIsSearching(false);
        }
    };

    const update = (field: keyof typeof form) =>
        (e: React.ChangeEvent<HTMLInputElement>) =>
            setForm(prev => ({ ...prev, [field]: e.target.value }));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        register.mutate(form);
    };

    const inputCls = "w-full bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-[var(--radius-sm)] px-4 py-2.5 text-sm outline-none focus:border-indigo-500 transition-all placeholder:text-zinc-600";
    const inputWithIconCls = `${inputCls} pl-10`;

    return (
        <div className="min-h-screen bg-[#09090b] flex">

            {/* ── Left Panel ── */}
            <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden flex-col justify-between p-12">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-[#09090b] to-purple-950" />
                <div className="absolute top-0 left-0 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
                <div className="absolute inset-0 opacity-[0.03]" style={{
                    backgroundImage: 'linear-gradient(to right,#a5b4fc 1px,transparent 1px),linear-gradient(to bottom,#a5b4fc 1px,transparent 1px)',
                    backgroundSize: '40px 40px'
                }} />

                <Link to="/" className="relative hover:opacity-80 transition-opacity">
                    <img src="/logo_full.png" alt="VA ONEGEST" className="h-10 w-auto object-contain" />
                </Link>

                <div className="relative space-y-8">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-5">
                            14 dias grátis · Sem cartão
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-3">
                            Comece hoje,<br />
                            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                                cresça amanhã.
                            </span>
                        </h1>
                        <p className="text-zinc-400 leading-relaxed text-sm">
                            A plataforma de gestão empresarial mais avançada de Angola. Configure em minutos.
                        </p>
                    </div>

                    <div className="space-y-2.5">
                        {FEATURES.map(({ icon, text }) => (
                            <div key={text} className="flex items-center gap-3">
                                <div className="w-7 h-7 rounded-[var(--radius-sm)] bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                                    {icon}
                                </div>
                                <span className="text-zinc-300 text-sm">{text}</span>
                            </div>
                        ))}
                    </div>

                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-[var(--radius-md)] p-4">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-semibold text-emerald-400">
                                Período de utilização
                            </span>
                            <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                                <Check size={11} className="text-white" />
                            </div>
                        </div>
                        <p className="text-white font-semibold mb-0.5">14 dias de teste gratuito</p>
                        <p className="text-zinc-500 text-xs">Após este período, escolha um plano para continuar.</p>
                    </div>
                </div>

                <p className="relative text-zinc-700 text-xs">© 2026 VA ONEGEST · Todos os direitos reservados</p>
            </div>

            {/* ── Painel Direito - Formulário ── */}
            <div className="w-full lg:w-7/12 flex items-center justify-center p-4 sm:p-8 overflow-y-auto">
                <div className="w-full max-w-lg py-8">

                    <Link to="/" className="flex mb-8 lg:hidden hover:opacity-80 transition-opacity">
                        <img src="/logo.png" alt="VA ONEGEST" className="h-10 w-auto object-contain" />
                    </Link>

                    <div className="mb-7">
                        <h2 className="text-2xl font-bold text-white mb-1.5">Criar conta</h2>
                        <p className="text-zinc-500 text-sm">
                            Preencha os dados para iniciar os seus{' '}
                            <span className="text-emerald-400 font-medium">14 dias de teste gratuito</span>.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* Empresa */}
                        <div className="bg-zinc-900/60 border border-zinc-800 rounded-[var(--radius-md)] p-5 space-y-4">
                            <p className="text-xs font-semibold text-zinc-500 flex items-center gap-2">
                                <Building2 size={13} /> Dados da empresa
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="flex items-center justify-between text-sm font-medium text-zinc-400">
                                        NIF da empresa
                                        {isSearching && <Loader2 size={12} className="animate-spin text-indigo-400" />}
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="reg-companyNif"
                                            type="text"
                                            value={form.companyNif}
                                            onChange={e => setForm(p => ({ ...p, companyNif: e.target.value.toUpperCase() }))}
                                            onBlur={e => handleTaxpayerLookup(e.target.value)}
                                            placeholder="5000000000"
                                            required
                                            className={`${inputCls} pr-10`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleTaxpayerLookup(form.companyNif)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-indigo-400 transition-colors"
                                        >
                                            <ShieldCheck size={14} />
                                        </button>
                                    </div>
                                </div>
                                <div className="sm:col-span-2 space-y-1.5">
                                    <label className="block text-sm font-medium text-zinc-400">Nome da empresa</label>
                                    <input
                                        id="reg-companyName"
                                        type="text"
                                        value={form.companyName}
                                        onChange={update('companyName')}
                                        placeholder="Nome da empresa"
                                        required
                                        className={inputCls}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Administrador */}
                        <div className="bg-zinc-900/60 border border-zinc-800 rounded-[var(--radius-md)] p-5 space-y-4">
                            <p className="text-xs font-semibold text-zinc-500 flex items-center gap-2">
                                <User size={13} /> Dados do administrador
                            </p>
                            <div className="space-y-3">
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-medium text-zinc-400">Nome completo</label>
                                    <div className="relative">
                                        <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600" />
                                        <input id="reg-userName" type="text" value={form.userName} onChange={update('userName')} placeholder="Nome completo" required className={inputWithIconCls} />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-medium text-zinc-400">Email</label>
                                    <div className="relative">
                                        <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600" />
                                        <input id="reg-userEmail" type="email" autoComplete="email" value={form.userEmail} onChange={update('userEmail')} placeholder="exemplo@empresa.co.ao" required className={inputWithIconCls} />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-medium text-zinc-400">Palavra-passe</label>
                                    <div className="relative">
                                        <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600" />
                                        <input
                                            id="reg-password"
                                            type={showPwd ? 'text' : 'password'}
                                            autoComplete="new-password"
                                            value={form.password}
                                            onChange={update('password')}
                                            placeholder="Mínimo 8 caracteres"
                                            minLength={8}
                                            required
                                            className={`${inputWithIconCls} pr-12`}
                                        />
                                        <button type="button" onClick={() => setShowPwd(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-300 transition-colors">
                                            {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <p className="text-xs text-zinc-600 text-center">
                            Ao criar conta, aceita os nossos{' '}
                            <span className="text-indigo-400 cursor-pointer hover:underline">Termos de Serviço</span>
                            {' '}e a nossa{' '}
                            <span className="text-indigo-400 cursor-pointer hover:underline">Política de Privacidade</span>.
                        </p>

                        <button
                            id="register-submit"
                            type="submit"
                            disabled={register.isPending}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-[var(--radius-sm)] px-4 py-3.5 flex items-center justify-center gap-2 transition-all group"
                        >
                            {register.isPending ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    Ativar 14 dias gratuitos
                                    <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-sm text-zinc-600 mt-5">
                        Já tem conta?{' '}
                        <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                            Iniciar sessão
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
