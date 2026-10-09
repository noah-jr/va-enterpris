"use client";

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    Edit,
    Trash2,
    User,
    Mail,
    Phone,
    MapPin,
    Briefcase,
    Calendar,
    Heart,
    CheckCircle,
    XCircle,
    Info,
    MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Internauta {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    birthDate?: string;
    gender?: string;
    address?: string;
    city?: string;
    country?: string;
    postalCode?: string;
    occupation?: string;
    company?: string;
    interests?: string;
    howDidYouHear?: string;
    newsletter: boolean;
    termsAccepted: boolean;
    status: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export default function InternautaDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [internauta, setInternauta] = useState<Internauta | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInternauta();
    }, [id]);

    const fetchInternauta = async () => {
        try {
            const response = await fetch(`/api/internautas/${id}`);
            if (response.ok) {
                const data = await response.json();
                setInternauta(data);
            } else {
                toast.error('Internauta não encontrado');
                router.push('/internautas');
            }
        } catch (error) {
            console.error('Erro ao carregar internauta:', error);
            toast.error('Erro ao carregar internauta');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Tem certeza que deseja deletar este internauta?')) return;

        try {
            const response = await fetch(`/api/internautas/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                toast.success('Internauta deletado com sucesso');
                router.push('/internautas');
            } else {
                toast.error('Erro ao deletar internauta');
            }
        } catch (error) {
            console.error('Erro ao deletar:', error);
            toast.error('Erro ao deletar internauta');
        }
    };

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-10 w-10 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
                    <p className="text-sm text-muted-foreground animate-pulse">A carregar detalhes...</p>
                </div>
            </div>
        );
    }

    if (!internauta) return null;

    const InfoBlock = ({ icon: Icon, label, value }: { icon: any; label: string; value?: string }) => {
        if (!value) return null;
        return (
            <div className="flex items-start gap-4 p-5 bg-muted/20 border border-border/40 rounded-3xl transition-all hover:bg-muted/30">
                <div className="w-10 h-10 rounded-2xl bg-foreground/5 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-foreground" />
                </div>
                <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{label}</p>
                    <p className="text-sm font-semibold text-foreground tracking-tight">{value}</p>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <Link
                    href="/internautas"
                    className="group inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
                >
                    <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center group-hover:bg-muted transition-all">
                        <ArrowLeft className="w-4 h-4" />
                    </div>
                    Voltar à listagem
                </Link>

                <div className="flex gap-3 w-full sm:w-auto">
                    <Link
                        href={`/internautas/${internauta.id}/edit`}
                        className="admin-btn-secondary h-11 px-6 flex items-center gap-2 flex-1 sm:flex-none"
                    >
                        <Edit className="w-4 h-4" />
                        Editar Perfil
                    </Link>
                    <button
                        onClick={handleDelete}
                        className="admin-btn-danger h-11 px-6 flex items-center gap-2 bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white flex-1 sm:flex-none border-none shadow-none"
                    >
                        <Trash2 className="w-4 h-4" />
                        Eliminar
                    </button>
                </div>
            </div>

            {/* Profile Header Card */}
            <div className="admin-card p-1">
                <div className="p-8 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-[40px] bg-foreground/5 p-1">
                        <div className="w-full h-full rounded-[36px] bg-card border border-border flex items-center justify-center shadow-xl">
                            <span className="text-3xl md:text-4xl font-black tracking-tighter">
                                {internauta.firstName[0]}{internauta.lastName[0]}
                            </span>
                        </div>
                    </div>
                    <div className="flex-1 space-y-4">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-foreground drop-shadow-sm italic uppercase">
                                {internauta.firstName} {internauta.lastName}
                            </h1>
                            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
                                <span className={cn(
                                    "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] shadow-sm",
                                    internauta.status === 'ACTIVE' ? "bg-green-500 text-white" :
                                        internauta.status === 'INACTIVE' ? "bg-red-500 text-white" : "bg-amber-500 text-white"
                                )}>
                                    Status: {internauta.status}
                                </span>
                                {internauta.newsletter && (
                                    <span className="bg-foreground text-background px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em]">
                                        Assinante Newsletter
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Core Data */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="admin-card">
                        <div className="p-6 border-b border-border/40 bg-muted/5">
                            <h3 className="text-sm font-bold uppercase tracking-[0.3em] flex items-center gap-3 italic">
                                <Info className="w-4 h-4 text-foreground" />
                                BIOGRAFIA & CONTACTO
                            </h3>
                        </div>
                        <div className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <InfoBlock icon={Mail} label="Endereço de Email" value={internauta.email} />
                            <InfoBlock icon={Phone} label="Telefone / WhatsApp" value={internauta.phone} />
                            <InfoBlock icon={Briefcase} label="Ocupação Atual" value={internauta.occupation} />
                            <InfoBlock icon={Briefcase} label="Empresa / Instituição" value={internauta.company} />
                        </div>
                    </div>

                    <div className="admin-card">
                        <div className="p-6 border-b border-border/40 bg-muted/5">
                            <h3 className="text-sm font-bold uppercase tracking-[0.3em] flex items-center gap-3 italic">
                                <MapPin className="w-4 h-4 text-foreground" />
                                LOCALIZAÇÃO GEOGRÁFICA
                            </h3>
                        </div>
                        <div className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <InfoBlock icon={MapPin} label="Morada / Logradouro" value={internauta.address} />
                            <InfoBlock icon={MapPin} label="Localidade / Cidade" value={internauta.city} />
                            <InfoBlock icon={MapPin} label="País de Residência" value={internauta.country} />
                            <InfoBlock icon={MapPin} label="Código Postal" value={internauta.postalCode} />
                        </div>
                    </div>

                    {(internauta.interests || internauta.notes) && (
                        <div className="admin-card">
                            <div className="p-8 space-y-8">
                                {internauta.interests && (
                                    <div className="space-y-4">
                                        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                            <Heart className="w-4 h-4" /> Interesses Declarados
                                        </h4>
                                        <p className="text-sm border-l-2 border-foreground/10 pl-4 py-2 italic text-muted-foreground">
                                            {internauta.interests}
                                        </p>
                                    </div>
                                )}
                                {internauta.notes && (
                                    <div className="space-y-4">
                                        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                            <Edit className="w-4 h-4" /> Notas Administrativas
                                        </h4>
                                        <div className="p-6 rounded-3xl bg-muted/10 border border-border/40 text-sm">
                                            {internauta.notes}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Meta Data */}
                <div className="space-y-8">
                    <div className="admin-card overflow-hidden">
                        <div className="p-6 bg-foreground text-background">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.4em]">RESUMO DE ATIVIDADE</h4>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="flex justify-between items-center pb-4 border-b border-border/40">
                                <span className="text-xs font-semibold text-muted-foreground">Comentários</span>
                                <span className="text-xs font-bold">{(internauta as any)._count?.comments || 0}</span>
                            </div>
                            <div className="flex justify-between items-center pb-4 border-b border-border/40">
                                <span className="text-xs font-semibold text-muted-foreground">Favoritos/Likes</span>
                                <span className="text-xs font-bold">{(internauta as any)._count?.likes || 0}</span>
                            </div>
                            <div className="flex justify-between items-center pb-4 border-b border-border/40">
                                <span className="text-xs font-semibold text-muted-foreground">Log de Registo</span>
                                <span className="text-xs font-bold">{new Date(internauta.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between items-center pb-4 border-b border-border/40">
                                <span className="text-xs font-semibold text-muted-foreground">Última Atualização</span>
                                <span className="text-xs font-bold">{new Date(internauta.updatedAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-semibold text-muted-foreground">RGPD / Termos</span>
                                <span className={cn(
                                    "text-[9px] font-bold uppercase px-2 py-0.5 rounded-md",
                                    internauta.termsAccepted ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"
                                )}>
                                    {internauta.termsAccepted ? 'Aceite' : 'Pendente'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {(internauta as any).comments?.length > 0 && (
                        <div className="admin-card overflow-hidden">
                            <div className="p-6 bg-muted/5 border-b border-border/40">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                                    <MessageSquare className="w-3 h-3" />
                                    Últimos Comentários
                                </h4>
                            </div>
                            <div className="divide-y divide-border/40">
                                {(internauta as any).comments.map((comment: any) => (
                                    <div key={comment.id} className="p-4 hover:bg-muted/5 transition-colors">
                                        <p className="text-xs italic text-foreground/80 mb-2">"{comment.content}"</p>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[9px] font-bold uppercase text-muted-foreground">
                                                Em: {comment.post?.title || 'Artigo Removido'}
                                            </span>
                                            <span className="text-[9px] text-muted-foreground/60">
                                                {new Date(comment.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="admin-card p-8 bg-muted/5 border-dashed border-2 border-border/60">
                        <div className="flex flex-col items-center text-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-foreground/5 flex items-center justify-center">
                                <User className="w-6 h-6 text-foreground/40" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Canais de Aquisição</p>
                                <p className="text-sm font-bold tracking-tight">{internauta.howDidYouHear || 'Orgânico'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 text-center">
                        <p className="text-[9px] font-bold text-muted-foreground/30 uppercase tracking-[0.4em] leading-relaxed">
                            Acesso Restrito &bull; Segurança Interna VA TECH
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
