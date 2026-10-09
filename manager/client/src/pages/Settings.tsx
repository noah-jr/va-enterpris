import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import {
    Building2, Save, CreditCard, ShieldCheck, Shield, Globe, Smartphone, Mail, 
    MapPin, Fingerprint, Loader2, Key, X, Camera, Bell, Activity, CheckCircle, Crown, Users
} from 'lucide-react';
import api from '../api';
import { useMe } from '../auth/useAuth';

export default function Settings() {
    const { data: user } = useMe();
    const queryClient = useQueryClient();

    const [activeTab, setActiveTab] = useState('company');
    const [name, setName] = useState('');
    const [nif, setNif] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [logo, setLogo] = useState('');

    const { data: settingsData, isLoading } = useQuery({
        queryKey: ['settings'],
        queryFn: async () => (await api.get('/settings')).data
    });

    useEffect(() => {
        if (settingsData?.company) {
            setName(settingsData.company.name || '');
            setNif(settingsData.company.nif || '');
            setEmail(settingsData.company.email || '');
            setPhone(settingsData.company.phone || '');
            setAddress(settingsData.company.address || '');
            setLogo(settingsData.company.logo || '');
        }
    }, [settingsData]);

    const updateCompany = useMutation({
        mutationFn: (payload: any) => api.put('/settings/company', payload),
        onSuccess: () => {
            toast.success('Definições da empresa actualizadas.');
            queryClient.invalidateQueries({ queryKey: ['settings'] });
        },
        onError: (err: any) => toast.error(err.response?.data?.error || 'Erro ao guardar as definições.')
    });

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        updateCompany.mutate({ name, email, phone, address, logo, nif });
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogo(reader.result as string);
                toast.success('Logótipo anexado. Clique em Gravar para aplicar.');
            };
            reader.readAsDataURL(file);
        }
    };

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center gap-4 py-32 text-[var(--text-muted)] animate-pulse">
            <Loader2 size={18} className="animate-spin" />
            <span className="text-sm">A carregar definições...</span>
        </div>
    );

    const subscription = settingsData?.subscription;

    const TABS = [
        { id: 'company', label: 'Empresa', icon: <Building2 size={14} /> },
        { id: 'security', label: 'Segurança', icon: <ShieldCheck size={14} /> },
        { id: 'subscription', label: 'Licenciamento', icon: <CreditCard size={14} /> },
        { id: 'notifications', label: 'Notificações', icon: <Bell size={14} /> },
    ];

    const inpIcon = "premium-input text-sm !pl-9";

    return (
        <div className="space-y-6 pb-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-xl font-bold text-[var(--text-primary)]">Definições Globais</h1>
                    <p className="text-sm text-[var(--text-muted)] mt-0.5">Gira a identidade corporativa, segurança da conta e faturação.</p>
                </div>
                
                <div className="flex items-center gap-2">
                    <button 
                        onClick={handleSave}
                        disabled={updateCompany.isPending || activeTab !== 'company'}
                        className={`premium-button-primary !px-3 !py-2 ${activeTab !== 'company' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {updateCompany.isPending ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} 
                        <span className="text-sm hidden sm:inline">Guardar alterações</span>
                    </button>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { label: 'Plano atual', value: subscription?.plan || 'ENTERPRISE', icon: <Crown size={15} />, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10' },
                    { label: 'Estado conta', value: subscription?.status === 'ACTIVE' ? 'Ativa' : 'Pendente', icon: <CheckCircle size={15} />, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
                    { label: 'Privilégio', value: user?.role || 'User', icon: <Shield size={15} />, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
                    { label: 'Saúde sistema', value: '100%', icon: <Activity size={15} />, color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-500/10' },
                ].map((stat, i) => (
                    <div key={i} className="premium-card p-4 flex items-start gap-3">
                        <div className={`kpi-icon shrink-0 ${stat.color} ${stat.bg}`}>
                            {stat.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs text-[var(--text-muted)] mb-0.5 truncate">{stat.label}</p>
                            <p className="text-base font-bold text-[var(--text-primary)] tabular-nums leading-tight truncate">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Toolbar Tabs - Matching Dashboard Range Tabs */}
            <div className="flex items-center gap-0.5 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-[var(--radius-md)] p-0.5 w-fit">
                {TABS.map(tab => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-1.5 px-3 py-1 rounded-[var(--radius-sm)] text-xs font-bold transition-colors ${
                                isActive 
                                    ? 'bg-[var(--bg-secondary)] text-[var(--text-primary)]' 
                                    : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                            }`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Content Area */}
            <div className="premium-card flex flex-col p-4 sm:p-6 min-h-[400px]">
                {/* TAB: EMPRESA */}
                {activeTab === 'company' && (
                    <div className="space-y-6 max-w-3xl">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pb-6 border-b border-[var(--border-color)]">
                            <div className="relative group/logo shrink-0">
                                <div className="w-20 h-20 rounded-[var(--radius-lg)] border-2 border-dashed border-[var(--border-color)] bg-[var(--bg-primary)] flex items-center justify-center overflow-hidden transition-colors group-hover/logo:border-[var(--accent)]">
                                    {logo ? (
                                        <img src={logo} alt="Logo" className="w-full h-full object-contain p-1" />
                                    ) : (
                                        <Building2 size={24} className="text-[var(--text-muted)]" />
                                    )}
                                </div>
                                <label className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-slate-900/60 backdrop-blur-sm rounded-[var(--radius-lg)] opacity-0 group-hover/logo:opacity-100 transition-all cursor-pointer">
                                    <Camera size={16} className="text-white" />
                                    <span className="text-white text-[10px] font-bold uppercase">Alterar</span>
                                    <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                                </label>
                                {logo && (
                                    <button
                                        type="button"
                                        onClick={() => setLogo('')}
                                        className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover/logo:opacity-100 transition-opacity hover:bg-rose-600"
                                    >
                                        <X size={12} />
                                    </button>
                                )}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-bold text-[var(--text-primary)]">Logótipo oficial</h3>
                                <p className="text-xs text-[var(--text-muted)] mt-1 max-w-md">
                                    Recomendamos formato PNG transparente. Este logótipo será impresso nos documentos fiscais (Faturas, Recibos).
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-[var(--text-secondary)]">Designação Social</label>
                                <div className="relative">
                                    <Building2 size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                                    <input type="text" value={name} onChange={e => setName(e.target.value)} className={inpIcon} required placeholder="Nome legal da empresa" />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-[var(--text-secondary)]">Número de Identificação Fiscal (NIF)</label>
                                <div className="relative">
                                    <Fingerprint size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                                    <input type="text" value={nif} disabled className={`${inpIcon} opacity-60 bg-[var(--bg-primary)] cursor-not-allowed`} />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-[var(--text-secondary)]">Email Oficial</label>
                                <div className="relative">
                                    <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inpIcon} placeholder="geral@empresa.com" />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-[var(--text-secondary)]">Telefone</label>
                                <div className="relative">
                                    <Smartphone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                                    <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className={inpIcon} placeholder="+244 900 000 000" />
                                </div>
                            </div>

                            <div className="sm:col-span-2 space-y-1.5">
                                <label className="text-xs font-bold text-[var(--text-secondary)]">Sede Social / Morada</label>
                                <div className="relative">
                                    <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                                    <input type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="Endereço completo da sede" className={inpIcon} />
                                </div>
                            </div>
                        </form>
                    </div>
                )}

                {/* TAB: SECURITY */}
                {activeTab === 'security' && (
                    <div className="space-y-6 max-w-3xl">
                        <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-[var(--radius-md)] p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-500/20">
                                <span className="text-lg font-bold">{user?.name?.charAt(0) || 'U'}</span>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-bold text-[var(--text-primary)]">{user?.name}</h3>
                                <p className="text-xs text-[var(--text-muted)] mt-0.5 mb-2">{user?.email}</p>
                                <div className="flex flex-wrap gap-2">
                                    <span className="badge bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                                        Conta Ativa
                                    </span>
                                    <span className="badge bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-color)]">
                                        {user?.role || 'Utilizador'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="premium-card p-4 hover:border-emerald-500/50 transition-colors cursor-pointer group">
                                <div className="w-8 h-8 rounded-[var(--radius-md)] bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-3">
                                    <Key size={16} />
                                </div>
                                <h4 className="font-bold text-[var(--text-primary)] text-sm mb-1">Alterar Palavra-passe</h4>
                                <p className="text-xs text-[var(--text-muted)]">Atualize a sua credencial de acesso regularmente.</p>
                            </div>
                            <Link to="/roles" className="premium-card p-4 hover:border-[var(--accent)] transition-colors cursor-pointer block">
                                <div className="w-8 h-8 rounded-[var(--radius-md)] bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-3">
                                    <ShieldCheck size={16} />
                                </div>
                                <h4 className="font-bold text-[var(--text-primary)] text-sm mb-1">Matriz de Permissões</h4>
                                <p className="text-xs text-[var(--text-muted)]">Gira acessos e privilégios dos utilizadores.</p>
                            </Link>
                        </div>
                    </div>
                )}

                {/* TAB: SUBSCRIPTION */}
                {activeTab === 'subscription' && (
                    <div className="space-y-6 max-w-3xl">
                        <div className="bg-amber-50 dark:bg-amber-500/5 border border-amber-200/50 dark:border-amber-500/20 rounded-[var(--radius-md)] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-lg font-bold text-amber-600 dark:text-amber-400">
                                    {subscription?.plan || 'ENTERPRISE'}
                                </h3>
                                <p className="text-xs text-amber-800/60 dark:text-amber-200/60 mt-0.5">
                                    Acesso aos módulos base do VA ONEGEST.
                                </p>
                            </div>
                            <Link to="/subscription" className="premium-button-primary bg-amber-500 hover:bg-amber-600 text-white border-transparent !px-3 !py-2 text-sm shadow-none whitespace-nowrap">
                                <CreditCard size={15} className="mr-1.5" />
                                Gerir subscrição
                            </Link>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {[
                                { label: 'Ciclo', value: subscription?.billing || 'Mensal' },
                                { label: 'Início', value: subscription?.startDate ? new Date(subscription.startDate).toLocaleDateString('pt-PT') : '—' },
                                { label: 'Fim', value: subscription?.endDate ? new Date(subscription.endDate).toLocaleDateString('pt-PT') : '—' },
                                { label: 'Estado', value: subscription?.status === 'ACTIVE' ? 'Regularizado' : 'Pendente' },
                            ].map((stat, i) => (
                                <div key={i} className="premium-card p-3">
                                    <p className="text-[11px] text-[var(--text-muted)] mb-1">{stat.label}</p>
                                    <p className="text-sm font-bold text-[var(--text-primary)] truncate">{stat.value}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* TAB: NOTIFICATIONS */}
                {activeTab === 'notifications' && (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-12 h-12 rounded-[var(--radius-lg)] bg-[var(--bg-secondary)] flex items-center justify-center mb-3">
                            <Bell size={20} className="text-[var(--text-muted)]" />
                        </div>
                        <p className="text-sm font-bold text-[var(--text-primary)]">Notificações</p>
                        <p className="text-xs text-[var(--text-muted)] mt-1 max-w-xs">
                            As preferências de alerta detalhadas estarão disponíveis em breve.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
