import { useNavigate, Link } from 'react-router-dom';
import {
    ChevronRight,
    ShieldCheck,
    Zap,
    Globe,
    Users,
    ArrowRight,
    Star,
    CheckCircle2,
    Play,
    Cpu,
    Lock,
    Infinity,
    Sparkles,
    Fingerprint,
    Loader2,
    X,
    Mail,
    Phone,
    Send,
    CheckCircle
} from 'lucide-react';

import { authStore } from '../auth/authStore';
import { ChatBot } from '../components/ChatBot';
import { useEffect, useState } from 'react';
import api from '../api';

interface Plan {
    id: string;
    name: string;
    subtitle?: string;
    price: number;
    annualPrice: number;
    maxUsers: number;
    color?: string;
    popular?: boolean;
    features: string[];
    modules: string[];
}

export default function LandingPage() {
    const navigate = useNavigate();
    const isLoggedIn = authStore.isAuthenticated();
    const [scrolled, setScrolled] = useState(false);
    const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'ANNUAL'>('MONTHLY');
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loadingPlans, setLoadingPlans] = useState(true);
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
    const [contactForm, setContactForm] = useState({ name: '', email: '', company: '', phone: '', subject: '', message: '' });
    const [contactSent, setContactSent] = useState(false);
    const [contactLoading, setContactLoading] = useState(false);
    const [newsletterEmail, setNewsletterEmail] = useState('');
    const [newsletterSent, setNewsletterSent] = useState(false);
    const [newsletterLoading, setNewsletterLoading] = useState(false);
    const [heroImageUrl, setHeroImageUrl] = useState('/hero.png');
    const [trustedPartners, setTrustedPartners] = useState<any[]>([]);
    const [hideRegistration, setHideRegistration] = useState(false);
    const [waitlistActive, setWaitlistActive] = useState(false);
    const [stats, setStats] = useState<any>(null);

    const formatStat = (num: number) => {
        if (!num) return '0+';
        if (num >= 1000) return `${(num / 1000).toFixed(num % 1000 === 0 ? 0 : 1)}K+`;
        return `${num}+`;
    };

    const handleContact = async (e: React.FormEvent) => {
        e.preventDefault();
        setContactLoading(true);
        try {
            await api.post('/public/contact', contactForm);
            setContactSent(true);
            setContactForm({ name: '', email: '', company: '', phone: '', subject: '', message: '' });
        } catch { /* silent */ } finally { setContactLoading(false); }
    };

    const handleNewsletter = async (e: React.FormEvent) => {
        e.preventDefault();
        setNewsletterLoading(true);
        try {
            await api.post('/public/newsletter', { email: newsletterEmail });
            setNewsletterSent(true);
        } catch { /* silent */ } finally { setNewsletterLoading(false); }
    };

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);

        // Fetch plans from API
        api.get('/auth/plans')
            .then(res => {
                const data = Array.isArray(res.data) ? res.data : Object.values(res.data);
                setPlans(data.filter((p: any) => p.id !== 'TRIAL'));
            })
            .catch(err => console.error('Erro ao carregar planos:', err))
            .finally(() => setLoadingPlans(false));

        // Fetch public settings (Hero Image)
        api.get('/public/settings')
            .then(res => {
                if (res.data.HERO_IMAGE_URL) {
                    setHeroImageUrl(res.data.HERO_IMAGE_URL);
                }
                if (res.data.HIDE_REGISTRATION === 'true') {
                    setHideRegistration(true);
                }
                if (res.data.WAITLIST_ACTIVE === 'true') {
                    setWaitlistActive(true);
                }
            })
            .catch(err => console.error('Erro ao carregar configurações:', err));

        // Fetch Trusted Partners
        api.get('/public/trusted-partners')
            .then(res => setTrustedPartners(res.data))
            .catch(err => console.error('Erro ao carregar parceiros:', err));

        // Fetch Public Stats
        api.get('/auth/public-stats')
            .then(res => setStats(res.data))
            .catch(err => console.error('Erro ao carregar stats:', err));

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const maxDiscount = plans.reduce((max, p) => {
        if (!p.price || !p.annualPrice || p.price === 0) return max;
        const discount = Math.round((1 - (p.annualPrice / (p.price * 12))) * 100);
        return discount > max ? discount : max;
    }, 0) || 10;

    const fmt = (v: number) => new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', maximumFractionDigits: 0 }).format(v);

    return (
        <div className="min-h-screen bg-[#09090b] text-zinc-300 overflow-x-hidden selection:bg-indigo-500 selection:text-white font-sans">
            {/* Navigation */}
            <nav className={`fixed top-6 left-1/2 -translate-x-1/2 z-[1000] transition-all duration-500 w-[95%] max-w-7xl rounded-[20px] ${scrolled
                ? 'bg-zinc-900/80 backdrop-blur-xl border border-white/10 py-3 shadow-2xl shadow-black/50'
                : 'bg-transparent border-transparent py-5'
                }`}>
                <div className="mx-auto px-4 sm:px-8 flex items-center justify-between">
                    <div className="flex items-center gap-2 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        <img src="/logo_full.png" alt="VA ONEGEST" className="h-10 w-auto object-contain" />
                    </div>

                    <div className="hidden lg:flex items-center gap-5 sm:gap-10 text-[11px] font-bold text-zinc-500">
                        {['Soluções', 'Funcionalidades', 'Preçário', 'Contacto'].map(label => (
                            <a key={label} href={`#${label.toLowerCase()}`} className="hover:text-indigo-400 transition-all relative group">
                                {label}
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-500 transition-all group-hover:w-full" />
                            </a>
                        ))}
                    </div>


                    <div className="flex items-center gap-4">
                        {!isLoggedIn ? (
                            <>
                                <button onClick={() => navigate('/login')} className="hidden sm:block text-[11px] font-bold text-zinc-400 hover:text-white px-4 transition-colors">Entrar</button>
                                {!hideRegistration && (
                                    <button onClick={() => navigate(waitlistActive ? '/waitlist' : '/register')} className="bg-indigo-600 hover:bg-indigo-500 text-white !py-2.5 !px-6 !rounded-full !text-[11px] font-bold hover:scale-105 active:scale-95 transition-all">
                                        {waitlistActive ? 'Entrar na Waitlist' : 'Teste gratuito'}
                                    </button>
                                )}
                            </>
                        ) : (
                            <button onClick={() => navigate('/dashboard')} className="bg-indigo-600 hover:bg-indigo-500 text-white !py-2.5 !px-6 !rounded-full !text-[11px] font-bold flex items-center gap-2">
                                Painel de controlo <ArrowRight size={14} />
                            </button>
                        )}
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="relative min-h-screen flex items-center overflow-hidden">
                {/* Dark background - pure black for total effect */}
                <div className="absolute inset-0 bg-[#000000]" />

                {/* ── TOTAL BACKGROUND IMAGE ── */}
                <div
                    className="absolute inset-0 z-0 pointer-events-none"
                    style={{
                        backgroundImage: `url("${heroImageUrl}")`,
                        backgroundSize: 'contain',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat'
                    }}
                >

                    {/* Radial gradient for a 'total'
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000000_1000%)]" />
                     focused effect */}
                </div>

                {/* Content - Absolute Bottom Positioning */}
                <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 pt-32 pb-10 flex flex-col items-center justify-end text-center min-h-screen">
                    <div className="w-full flex flex-col items-center">



                        <div className="flex flex-col sm:flex-row items-start gap-4 animate-slide-up [animation-delay:300ms]">
                            {!hideRegistration && (
                                <button onClick={() => navigate(waitlistActive ? '/waitlist' : '/register')} className="group bg-white text-black px-8 py-4 rounded-full text-sm font-black flex items-center gap-3 hover:bg-indigo-500 hover:text-white transition-all duration-300">
                                    {waitlistActive ? 'Entrar na Waitlist' : 'Começar Agora'} <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            )}
                            <button
                                onClick={() => setIsVideoModalOpen(true)}
                                className="group px-8 py-4 rounded-full text-sm font-black flex items-center gap-3 text-white border border-white/10 hover:bg-white/5 transition-all"
                            >
                                <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-indigo-500 transition-colors">
                                    <Play size={12} fill="currentColor" />
                                </div>
                                Ver Demo
                            </button>
                        </div>

                        <div className="flex items-center gap-8 mt-14 animate-slide-up [animation-delay:450ms]">
                            {[
                                { value: stats?.companies ? formatStat(stats.companies) : '500+', label: 'Empresas Activas' },
                                { value: stats?.invoices ? formatStat(stats.invoices) : '50K+', label: 'Faturas Emitidas' },
                                { value: stats?.uptime || '99.9%', label: 'Uptime Garantido' },
                            ].map((s) => (
                                <div key={s.label} className="flex flex-col">
                                    <span className="text-2xl font-black text-white tracking-tight">{s.value}</span>
                                    <span className="text-[10px] font-bold text-zinc-500 mt-0.5">{s.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Scroll hint */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30 animate-bounce pointer-events-none z-10">
                    <span className="text-[9px] font-black text-zinc-400">Explorar</span>
                    <div className="w-px h-8 bg-gradient-to-b from-zinc-400 to-transparent" />
                </div>
            </header>

            {/* Video Modal */}
            {isVideoModalOpen && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 md:p-10">
                    <div className="absolute inset-0 z-0 bg-[var(--text-primary)]/5 backdrop-blur-sm" onClick={() => setIsVideoModalOpen(false)} />
                    <div className="relative w-full max-w-5xl aspect-video bg-zinc-900 rounded-3xl overflow-hidden border border-white/10 shadow-2xl animate-zoom-in">
                        <button
                            onClick={() => setIsVideoModalOpen(false)}
                            className="absolute top-6 right-6 z-10 p-3 rounded-full bg-black/20 text-white hover:bg-indigo-500 transition-colors"
                        >
                            <X size={20} />
                        </button>
                        <iframe
                            className="w-full h-full"
                            src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                            title="Product Demo"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>
                </div>
            )}

            <section id="soluções" className="py-20 border-y border-white/5 bg-zinc-900/40 overflow-hidden relative">
                {/* Background ambient glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-32 bg-indigo-500/5 blur-[100px] pointer-events-none"></div>

                <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
                    <p className="text-[10px] font-bold text-zinc-500 mb-12 uppercase tracking-widest">Empresas que confiam na nossa tecnologia</p>
                </div>

                <div className="relative flex overflow-hidden group w-full" style={{ maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)' }}>
                    <div className="animate-marquee flex items-center gap-x-24 px-12 opacity-50 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700">
                        {/* Duplicate content to create a seamless infinite scroll loop */}
                        {[...Array(2)].map((_, i) => (
                            <div key={`loop-${i}`} className="flex items-center gap-x-24 shrink-0">
                                {trustedPartners.length > 0 ? (
                                    trustedPartners.map((p) => (
                                        p.logoUrl ? (
                                            <img key={`${p.id}-${i}`} src={p.logoUrl} alt={p.name} className="h-10 object-contain max-w-[150px] shrink-0 hover:scale-110 hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-all duration-500 cursor-pointer" />
                                        ) : (
                                            <span key={`${p.id}-${i}`} className="text-xl sm:text-3xl font-black italic tracking-tighter text-white shrink-0 hover:scale-110 hover:text-indigo-400 hover:drop-shadow-[0_0_20px_rgba(99,102,241,0.5)] transition-all duration-500 cursor-pointer">{p.name}</span>
                                        )
                                    ))
                                ) : (
                                    <>
                                        <span className="text-xl sm:text-3xl font-black italic tracking-tighter text-white shrink-0 hover:scale-110 hover:text-indigo-400 hover:drop-shadow-[0_0_20px_rgba(99,102,241,0.5)] transition-all duration-500 cursor-pointer">ÓPTICA ZIDANE</span>
                                        <span className="text-xl sm:text-3xl font-black italic tracking-tighter text-white shrink-0 hover:scale-110 hover:text-indigo-400 hover:drop-shadow-[0_0_20px_rgba(99,102,241,0.5)] transition-all duration-500 cursor-pointer">FANARA</span>
                                        <span className="text-xl sm:text-3xl font-black italic tracking-tighter text-white shrink-0 hover:scale-110 hover:text-indigo-400 hover:drop-shadow-[0_0_20px_rgba(99,102,241,0.5)] transition-all duration-500 cursor-pointer">VA TECH</span>
                                        <span className="text-xl sm:text-3xl font-black italic tracking-tighter text-white shrink-0 hover:scale-110 hover:text-indigo-400 hover:drop-shadow-[0_0_20px_rgba(99,102,241,0.5)] transition-all duration-500 cursor-pointer">LUCLIMA</span>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Funcionalidades */}
            <section id="funcionalidades" className="py-32 relative">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col items-center text-center mb-24">
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight mb-6">Soluções integradas</h2>
                        <p className="max-w-2xl text-zinc-500 text-lg font-medium">Tudo o que a sua empresa precisa para crescer de forma organizada.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
                        {[
                            { icon: <Fingerprint className="text-indigo-400" />, title: 'Faturação certificada', desc: 'Emita faturas em segundos com total conformidade AGT e exportação de SAF-T AO.' },
                            { icon: <Cpu className="text-purple-400" />, title: 'Gestão de stocks', desc: 'Controlo total de inventário, vários armazéns e alertas de rutura.' },
                            { icon: <Infinity className="text-indigo-500" />, title: 'Tesouraria automática', desc: 'Fluxo de caixa em tempo real, reconciliação bancária e gestão de pagamentos.' },
                            { icon: <Users className="text-purple-500" />, title: 'Recursos humanos', desc: 'Folha de salários, gestão de contratos e portal do colaborador.' },
                            { icon: <Globe className="text-indigo-600" />, title: 'Logística e frotas', desc: 'Monitorização de veículos, gestão de motoristas e otimização de rotas.' },
                            { icon: <Lock className="text-zinc-400" />, title: 'Segurança total', desc: 'Criptografia de alto nível e cópias de segurança automáticas.' }
                        ].map((item, i) => (
                            <div key={i} className="bg-zinc-950/50 p-6 sm:p-12 rounded-[20px] border border-white/5 hover:border-indigo-500/30 hover:bg-zinc-900 transition-all duration-500 group">
                                <div className="kpi-icon bg-zinc-800 flex items-center justify-center mb-8 border border-white/5 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300">
                                    {item.icon}
                                </div>
                                <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 tracking-tight">{item.title}</h3>
                                <p className="text-zinc-500 leading-relaxed text-sm font-medium">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Preçário */}
            <section id="preçário" className="py-32 px-6 bg-gradient-to-b from-transparent to-zinc-950/50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-24">
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight mb-6">Planos e preços</h2>
                        <p className="max-w-xl mx-auto text-zinc-500 text-lg mb-12">Escolha o plano que melhor se adapta ao tamanho da sua empresa.</p>

                        {/* Toggle */}
                        <div className="flex items-center justify-center gap-6">
                            <span className={`text-xs font-bold ${billingCycle === 'MONTHLY' ? 'text-white' : 'text-zinc-600'}`}>Mensal</span>
                            <button onClick={() => setBillingCycle(c => c === 'MONTHLY' ? 'ANNUAL' : 'MONTHLY')} className="w-16 h-8 bg-zinc-800 rounded-full p-1 relative transition-colors hover:bg-zinc-700">
                                <div className={`absolute top-1 w-6 h-6 bg-indigo-500 rounded-full transition-all duration-300 ${billingCycle === 'ANNUAL' ? 'left-9' : 'left-1'}`} />
                            </button>
                            <div className="flex items-center gap-3">
                                <span className={`text-xs font-bold ${billingCycle === 'ANNUAL' ? 'text-indigo-400' : 'text-zinc-600'}`}>Anual</span>
                                <span className="bg-emerald-500/10 text-emerald-500 text-[10px] font-bold px-3 py-1 rounded-full border border-emerald-500/20">-{maxDiscount}% de desconto</span>
                            </div>
                        </div>
                    </div>

                    {loadingPlans ? (
                        <div className="py-40 flex flex-col items-center justify-center gap-6 opacity-40">
                            <Loader2 className="animate-spin text-indigo-500" size={40} />
                            <p className="text-xs font-bold uppercase text-zinc-500">A carregar planos...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
                            {plans.map((plan) => (
                                <div key={plan.id} className={`relative p-5 sm:p-10 rounded-[20px] border transition-all duration-500 flex flex-col group ${plan.popular ? 'bg-indigo-600 border-indigo-400 scale-105 z-10 text-white' : 'bg-zinc-950 border-white/5 hover:border-white/20'}`}>
                                    {plan.popular && (
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white text-indigo-600 text-[10px] font-bold px-4 py-1.5 rounded-full">
                                            Mais popular
                                        </div>
                                    )}
                                    <div className="mb-8">
                                        <h3 className="text-xl font-bold mb-2 text-white">{plan.name}</h3>
                                        <p className={`text-xs font-medium h-8 line-clamp-2 ${plan.popular ? 'text-indigo-100' : 'text-zinc-500'}`}>{plan.subtitle}</p>
                                    </div>
                                    <div className="mb-8">
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-3xl sm:text-4xl font-bold tracking-tighter text-white">
                                                {fmt(billingCycle === 'MONTHLY' ? plan.price : plan.annualPrice / 12)}
                                            </span>
                                            <span className={`text-xs font-bold ${plan.popular ? 'text-indigo-200' : 'text-zinc-600'}`}>/mês</span>
                                        </div>
                                        {billingCycle === 'ANNUAL' && (
                                            <p className="text-[10px] font-bold text-emerald-400 mt-2">Total anual: {fmt(plan.annualPrice)}</p>
                                        )}
                                    </div>
                                    <div className="space-y-4 mb-10 flex-1">
                                        {plan.features?.map((f, i) => (
                                            <div key={i} className="flex items-center gap-3">
                                                <div className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center ${plan.popular ? 'bg-indigo-400 text-indigo-900' : 'bg-zinc-800 text-indigo-400'}`}>
                                                    <CheckCircle2 size={10} />
                                                </div>
                                                <span className={`text-xs font-bold ${plan.popular ? 'text-indigo-50' : 'text-zinc-400'}`}>{f}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => {
                                            sessionStorage.setItem('selectedPlan', plan.id);
                                            sessionStorage.setItem('billingCycle', billingCycle);
                                            navigate(isLoggedIn ? '/subscription' : waitlistActive ? '/waitlist' : '/register');
                                        }}
                                        className={`w-full py-5 rounded-[12px] text-[11px] font-bold transition-all duration-300 ${plan.popular ? 'bg-white text-indigo-600 hover:scale-[1.02]' : 'bg-zinc-900 text-white hover:bg-indigo-600'} ${hideRegistration && !isLoggedIn && !waitlistActive ? 'hidden' : ''}`}
                                    >
                                        {isLoggedIn ? 'Mudar plano' : waitlistActive ? 'Entrar na Waitlist' : 'Ativar plano'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Contactos */}
            <section id="contacto" className="py-32 px-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-950/10 to-transparent pointer-events-none" />
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight mb-6">Contactos</h2>
                        <p className="text-zinc-500 text-lg max-w-xl mx-auto">A nossa equipa responde em menos de 24 horas. Estamos em Luanda, Talatona.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
                        {/* Info lateral */}
                        <div className="lg:col-span-2 flex flex-col gap-6">
                            {[
                                { icon: <Mail size={20} />, label: 'Email', value: 'suporte@va-onegest.co.ao' },
                                { icon: <Phone size={20} />, label: 'Telefone', value: '+244 944 000 000' },
                            ].map((item) => (
                                <div key={item.label} className="flex items-center gap-5 p-5 bg-zinc-900/60 border border-white/5 rounded-2xl">
                                    <div className="w-11 h-11 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center flex-shrink-0">{item.icon}</div>
                                    <div>
                                        <p className="text-[10px] font-bold text-zinc-500 uppercase mb-1">{item.label}</p>
                                        <p className="text-sm font-bold text-white">{item.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Formulário */}
                        <div className="lg:col-span-3 bg-zinc-900/40 border border-white/5 rounded-3xl p-6 sm:p-10">
                            {contactSent ? (
                                <div className="h-full flex flex-col items-center justify-center gap-5 py-16 text-center">
                                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                        <CheckCircle size={32} className="text-emerald-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-2">Mensagem enviada</h3>
                                        <p className="text-zinc-500 text-sm">A nossa equipa responderá em breve.</p>
                                    </div>
                                    <button onClick={() => setContactSent(false)} className="mt-2 text-indigo-400 text-sm font-bold hover:text-indigo-300 transition-colors">
                                        Enviar outra mensagem →
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleContact} className="space-y-5">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[10px] font-bold text-zinc-500 uppercase">Nome completo <span className="text-indigo-400">*</span></label>
                                            <input
                                                required
                                                value={contactForm.name}
                                                onChange={e => setContactForm(f => ({ ...f, name: e.target.value }))}
                                                placeholder="Nome completo"
                                                className="bg-zinc-950/60 border border-white/8 rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-zinc-700 outline-none focus:border-indigo-500 transition-all"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[10px] font-bold text-zinc-500 uppercase">Email <span className="text-indigo-400">*</span></label>
                                            <input
                                                required
                                                type="email"
                                                value={contactForm.email}
                                                onChange={e => setContactForm(f => ({ ...f, email: e.target.value }))}
                                                placeholder="exemplo@empresa.ao"
                                                className="bg-zinc-950/60 border border-white/8 rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-zinc-700 outline-none focus:border-indigo-500 transition-all"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[10px] font-bold text-zinc-500 uppercase">Empresa</label>
                                            <input
                                                value={contactForm.company}
                                                onChange={e => setContactForm(f => ({ ...f, company: e.target.value }))}
                                                placeholder="Nome da empresa"
                                                className="bg-zinc-950/60 border border-white/8 rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-zinc-700 outline-none focus:border-indigo-500 transition-all"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[10px] font-bold text-zinc-500 uppercase">Telefone</label>
                                            <input
                                                value={contactForm.phone}
                                                onChange={e => setContactForm(f => ({ ...f, phone: e.target.value }))}
                                                placeholder="+244 9XX XXX XXX"
                                                className="bg-zinc-950/60 border border-white/8 rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-zinc-700 outline-none focus:border-indigo-500 transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[10px] font-bold text-zinc-500 uppercase">Assunto</label>
                                        <div className="relative">
                                            <select
                                                value={contactForm.subject}
                                                onChange={e => setContactForm(f => ({ ...f, subject: e.target.value }))}
                                                className="w-full bg-zinc-950/60 border border-white/8 rounded-xl px-4 py-3.5 text-sm outline-none focus:border-indigo-500 transition-all appearance-none pr-10 cursor-pointer"
                                                style={{ color: contactForm.subject ? 'white' : '#3f3f46' }}
                                            >
                                                <option value="" disabled style={{ color: '#3f3f46', background: '#09090b' }}>Selecione um assunto</option>
                                                {[
                                                    'Apresentação do produto',
                                                    'Planos e subscrições',
                                                    'Faturação e pagamentos',
                                                    'Certificação AGT',
                                                    'Módulo de RH',
                                                    'Logística e frotas',
                                                    'Suporte técnico',
                                                    'Integrações e API',
                                                    'Parceria comercial',
                                                    'Outro',
                                                ].map(s => (
                                                    <option key={s} value={s} style={{ background: '#18181b', color: 'white' }}>{s}</option>
                                                ))}
                                            </select>
                                            <ChevronRight size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 rotate-90 pointer-events-none" />
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[10px] font-bold text-zinc-500 uppercase">Mensagem <span className="text-indigo-400">*</span></label>
                                        <textarea
                                            required
                                            rows={5}
                                            value={contactForm.message}
                                            onChange={e => setContactForm(f => ({ ...f, message: e.target.value }))}
                                            placeholder="Como podemos ajudar?"
                                            className="w-full bg-zinc-950/60 border border-white/8 rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-zinc-700 outline-none focus:border-indigo-500 transition-all resize-none"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={contactLoading}
                                        className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white py-4 rounded-xl text-[11px] font-bold flex items-center justify-center gap-2.5 transition-all active:scale-[0.98]"
                                    >
                                        {contactLoading
                                            ? <><Loader2 size={15} className="animate-spin" /> A enviar...</>
                                            : <><Send size={15} /> Enviar mensagem</>
                                        }
                                    </button>
                                </form>
                            )}
                        </div>

                    </div>
                </div>
            </section>

            {/* Newsletter */}
            <section className="py-20 px-6 bg-gradient-to-r from-indigo-600/20 via-purple-600/15 to-indigo-600/20 border-y border-white/5">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-4">Fique por dentro das novidades</h2>
                    <p className="text-zinc-400 text-base mb-10">Receba atualizações sobre novas funcionalidades e eventos diretamente no seu email.</p>
                    {newsletterSent ? (
                        <div className="flex items-center justify-center gap-3 text-emerald-400 font-bold text-sm">
                            <CheckCircle size={22} /> Subscrição efetuada com sucesso.
                        </div>
                    ) : (
                        <form onSubmit={handleNewsletter} className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
                            <input
                                required type="email"
                                value={newsletterEmail}
                                onChange={e => setNewsletterEmail(e.target.value)}
                                placeholder="O seu email"
                                className="flex-1 bg-zinc-950/60 border border-white/10 rounded-full px-6 py-4 text-sm text-white placeholder:text-zinc-600 outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                            <button type="submit" disabled={newsletterLoading} className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-8 py-4 rounded-full text-[11px] font-bold uppercase flex items-center gap-2 transition-all whitespace-nowrap">
                                {newsletterLoading ? <Loader2 size={14} className="animate-spin" /> : null} Subscrever
                            </button>
                        </form>
                    )}
                </div>
            </section>

            {/* Rodapé */}
            <footer className="py-24 border-t border-white/5 bg-[#09090b]">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-12 lg:gap-8">
                    <div className="col-span-2 lg:col-span-1">
                        <img src="/logo_full.png" alt="VA ONEGEST" className="h-10 w-auto mb-10" />
                        <p className="text-zinc-500 text-sm font-medium leading-relaxed max-w-xs mb-10">
                            Inteligência operacional ao serviço das empresas angolanas. O seu parceiro na era digital.
                        </p>
                    </div>
                    <div>
                        <h4 className="text-white text-[11px] font-bold uppercase mb-10">Soluções</h4>
                        <ul className="space-y-4 text-zinc-500 text-[10px] font-bold uppercase">
                            <li><a href="#" className="hover:text-indigo-400 transition-colors">Faturação</a></li>
                            <li><a href="#" className="hover:text-indigo-400 transition-colors">Contabilidade</a></li>
                            <li><a href="#" className="hover:text-indigo-400 transition-colors">Logística</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white text-[11px] font-bold uppercase mb-10">Recursos</h4>
                        <ul className="space-y-4 text-zinc-500 text-[10px] font-bold uppercase">
                            <li><a href="#" className="hover:text-indigo-400 transition-colors">Documentação</a></li>
                            <li><a href="#" className="hover:text-indigo-400 transition-colors">Ajuda</a></li>
                            <li><a href="#" className="hover:text-indigo-400 transition-colors">Academia VA</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white text-[11px] font-bold uppercase mb-10">Legal</h4>
                        <ul className="space-y-4 text-zinc-500 text-[10px] font-bold uppercase">
                            <li><Link to="/info/privacy" className="hover:text-indigo-400 transition-colors">Privacidade</Link></li>
                            <li><Link to="/info/terms" className="hover:text-indigo-400 transition-colors">Termos de uso</Link></li>
                            <li><span className="flex items-center gap-2 text-emerald-500 font-bold"><ShieldCheck size={14} /> Certificação AGT</span></li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto mt-20 pt-10 border-t border-white/5 text-[10px] text-center font-bold uppercase text-zinc-600">
                    © 2026 VA ONEGEST. Todos os direitos reservados.
                </div>
            </footer>

            {/* ChatBot de Suporte IA */}
            <ChatBot />
        </div>
    );
}
