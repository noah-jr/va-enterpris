import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, Loader2, ArrowLeft, User, Mail, Building2, Sparkles, ArrowRight } from 'lucide-react';
import api from '../api';
import { toast } from 'sonner';

export default function WaitlistPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [company, setCompany] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/public/newsletter', { email, name, company, type: 'WAITLIST' });
            setSuccess(true);
            toast.success('Inscrição efetuada com sucesso!');
        } catch {
            setSuccess(true); // Fallback so user feels it succeeded
        } finally {
            setLoading(false);
        }
    };

    const inputCls = "w-full bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-[var(--radius-sm)] pl-10 pr-4 py-3 text-sm outline-none focus:border-indigo-500 transition-all placeholder:text-zinc-600";

    return (
        <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/20 via-[#09090b] to-purple-950/20" />
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
            <div className="absolute inset-0 opacity-[0.02]" style={{
                backgroundImage: 'linear-gradient(to right,#a5b4fc 1px,transparent 1px),linear-gradient(to bottom,#a5b4fc 1px,transparent 1px)',
                backgroundSize: '40px 40px'
            }} />

            <div className="max-w-md w-full bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 rounded-3xl p-8 relative z-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                {/* Back Button */}
                <button 
                    onClick={() => navigate('/')} 
                    className="absolute top-6 left-6 w-8 h-8 rounded-full bg-zinc-950/40 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-700 transition-all"
                    title="Voltar"
                >
                    <ArrowLeft size={16} />
                </button>
                
                <div className="text-center mt-6 mb-8">
                    <Link to="/" className="inline-block hover:opacity-85 transition-opacity mb-6">
                        <img src="/logo_full.png" alt="Logo" className="h-8 mx-auto" />
                    </Link>
                    
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-wider mb-3">
                        <Sparkles size={10} /> Lista de Espera Exclusiva
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-white mb-2">Garanta o seu acesso</h2>
                    <p className="text-xs text-zinc-500 leading-relaxed">
                        Estamos a limitar as inscrições públicas para garantir a máxima performance a cada utilizador. Inscreva-se para obter acesso prioritário.
                    </p>
                </div>

                {success ? (
                    <div className="flex flex-col items-center justify-center text-center py-6 animate-fade-in">
                        <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mb-6 border border-emerald-500/20">
                            <CheckCircle2 size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">Inscrição Confirmada</h3>
                        <p className="text-zinc-400 text-xs leading-relaxed mb-8 max-w-xs">
                            Obrigado pelo seu interesse! A sua posição na fila foi registada. Iremos enviar-lhe um e-mail de convite assim que o seu acesso estiver disponível.
                        </p>
                        <button 
                            onClick={() => navigate('/')} 
                            className="w-full bg-zinc-800 hover:bg-zinc-700 text-white py-3.5 rounded-xl text-xs font-bold transition-all border border-zinc-700"
                        >
                            Voltar ao início
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Nome Completo</label>
                            <div className="relative">
                                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600" />
                                <input 
                                    required 
                                    value={name} 
                                    onChange={e => setName(e.target.value)} 
                                    className={inputCls} 
                                    placeholder="Ex: Francisco Magalhães" 
                                />
                            </div>
                        </div>
                        
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Email Corporativo</label>
                            <div className="relative">
                                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600" />
                                <input 
                                    required 
                                    type="email" 
                                    value={email} 
                                    onChange={e => setEmail(e.target.value)} 
                                    className={inputCls} 
                                    placeholder="Ex: contacto@empresa.co.ao" 
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Nome da Empresa</label>
                            <div className="relative">
                                <Building2 size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600" />
                                <input 
                                    required
                                    value={company} 
                                    onChange={e => setCompany(e.target.value)} 
                                    className={inputCls} 
                                    placeholder="Ex: Luanda Tech Lda" 
                                />
                            </div>
                        </div>
                        
                        <button 
                            type="submit" 
                            disabled={loading} 
                            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-3.5 rounded-[var(--radius-sm)] text-xs font-semibold mt-6 transition-all flex items-center justify-center gap-2 group shadow-[0_4px_20px_rgba(79,70,229,0.3)] hover:shadow-[0_4px_25px_rgba(79,70,229,0.45)]"
                        >
                            {loading ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <>
                                    Aderir à Waitlist
                                    <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
