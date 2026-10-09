'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, User, Mail, Phone, MapPin, Briefcase, Calendar, Heart } from 'lucide-react';
import { toast } from 'sonner';

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
}

export default function EditInternautaPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        birthDate: '',
        gender: '',
        address: '',
        city: '',
        country: '',
        postalCode: '',
        occupation: '',
        company: '',
        interests: '',
        howDidYouHear: '',
        newsletter: true,
        termsAccepted: true,
        status: 'ACTIVE',
        notes: '',
    });

    useEffect(() => {
        fetchInternauta();
    }, [params.id]);

    const fetchInternauta = async () => {
        try {
            const response = await fetch(`/api/internautas/${params.id}`);
            if (response.ok) {
                const data: Internauta = await response.json();
                setFormData({
                    firstName: data.firstName,
                    lastName: data.lastName,
                    email: data.email,
                    phone: data.phone || '',
                    birthDate: data.birthDate ? data.birthDate.split('T')[0] : '',
                    gender: data.gender || '',
                    address: data.address || '',
                    city: data.city || '',
                    country: data.country || '',
                    postalCode: data.postalCode || '',
                    occupation: data.occupation || '',
                    company: data.company || '',
                    interests: data.interests || '',
                    howDidYouHear: data.howDidYouHear || '',
                    newsletter: data.newsletter,
                    termsAccepted: data.termsAccepted,
                    status: data.status,
                    notes: data.notes || '',
                });
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const response = await fetch(`/api/internautas/${params.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('Internauta atualizado com sucesso!');
                router.push(`/internautas/${params.id}`);
            } else {
                toast.error(data.error || 'Erro ao atualizar internauta');
            }
        } catch (error) {
            console.error('Erro ao atualizar internauta:', error);
            toast.error('Erro ao atualizar internauta');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b pb-8 border-border/40">
                <div>
                    <Link
                        href={`/internautas/${params.id}`}
                        className="group inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors mb-4"
                    >
                        <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center group-hover:bg-muted transition-all">
                            <ArrowLeft className="w-4 h-4" />
                        </div>
                        Voltar aos detalhes
                    </Link>
                    <h1 className="text-4xl font-black tracking-tighter uppercase italic flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-foreground flex items-center justify-center">
                            <User className="w-6 h-6 text-background" />
                        </div>
                        Editar Internauta
                    </h1>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Main Form Fields */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="admin-card">
                        <div className="p-6 border-b border-border/40 bg-muted/5">
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] flex items-center gap-3">
                                <User className="w-4 h-4" /> Informações Pessoais
                            </h3>
                        </div>
                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Primeiro Nome</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    required
                                    className="admin-form-input h-12"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Apelido</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    required
                                    className="admin-form-input h-12"
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email Principal</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="admin-form-input h-12 pl-12"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Telefone</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="admin-form-input h-12"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Género</label>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    className="admin-form-select h-12"
                                >
                                    <option value="">Selecione...</option>
                                    <option value="Masculino">Masculino</option>
                                    <option value="Feminino">Feminino</option>
                                    <option value="Outro">Outro</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="admin-card">
                        <div className="p-6 border-b border-border/40 bg-muted/5">
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] flex items-center gap-3">
                                <MapPin className="w-4 h-4" /> Localização & Endereço
                            </h3>
                        </div>
                        <div className="p-8 space-y-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Morada Completa</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    className="admin-form-input h-12"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Cidade</label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        className="admin-form-input h-12"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">País</label>
                                    <input
                                        type="text"
                                        name="country"
                                        value={formData.country}
                                        onChange={handleChange}
                                        className="admin-form-input h-12"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">C. Postal</label>
                                    <input
                                        type="text"
                                        name="postalCode"
                                        value={formData.postalCode}
                                        onChange={handleChange}
                                        className="admin-form-input h-12"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="admin-card">
                        <div className="p-6 border-b border-border/40 bg-muted/5">
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] flex items-center gap-3">
                                <Heart className="w-4 h-4" /> Interesses e Notas
                            </h3>
                        </div>
                        <div className="p-8 space-y-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Áreas de Interesse</label>
                                <textarea
                                    name="interests"
                                    value={formData.interests}
                                    onChange={handleChange}
                                    rows={4}
                                    className="admin-form-input min-h-[120px] py-4"
                                    placeholder="Ex: Tecnologia, Desenvolvimento, Marketing..."
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Notas Administrativas</label>
                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    rows={4}
                                    className="admin-form-input min-h-[120px] py-4 bg-muted/5 border-dashed"
                                    placeholder="Notas apenas visíveis para administradores..."
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Status & Options Sidebar */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="admin-card p-8 space-y-8 sticky top-8">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Status do Perfil</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="admin-form-select h-12 font-bold"
                                >
                                    <option value="ACTIVE">ATIVO</option>
                                    <option value="INACTIVE">INATIVO</option>
                                    <option value="PENDING">PENDENTE</option>
                                </select>
                            </div>

                            <div className="space-y-4 pt-4">
                                <label className="flex items-center gap-4 group cursor-pointer p-4 rounded-2xl bg-muted/20 border border-border/40 hover:bg-muted/40 transition-all">
                                    <input
                                        type="checkbox"
                                        name="newsletter"
                                        checked={formData.newsletter}
                                        onChange={handleChange}
                                        className="w-5 h-5 rounded-lg border-muted-foreground accent-foreground"
                                    />
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-widest">Newsletter</p>
                                        <p className="text-[10px] text-muted-foreground">Inscrição ativa</p>
                                    </div>
                                </label>

                                <label className="flex items-center gap-4 group cursor-pointer p-4 rounded-2xl bg-muted/20 border border-border/40 hover:bg-muted/40 transition-all">
                                    <input
                                        type="checkbox"
                                        name="termsAccepted"
                                        checked={formData.termsAccepted}
                                        onChange={handleChange}
                                        className="w-5 h-5 rounded-lg border-muted-foreground accent-foreground"
                                    />
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-widest">RGPD / Termos</p>
                                        <p className="text-[10px] text-muted-foreground">Conformidade aceite</p>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div className="space-y-4 pt-6 mt-6 border-t border-border/40">
                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full admin-btn-primary h-14 flex items-center justify-center gap-3 shadow-xl shadow-foreground/10"
                            >
                                {saving ? (
                                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-background border-t-transparent" />
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        Guardar Alterações
                                    </>
                                )}
                            </button>
                            <Link
                                href={`/internautas/${params.id}`}
                                className="w-full admin-btn-secondary h-12 flex items-center justify-center"
                            >
                                Descartar Alterações
                            </Link>
                        </div>

                        <div className="p-4 rounded-3xl bg-blue-500/5 border border-blue-500/10">
                            <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest mb-1 italic">Dica VA:</p>
                            <p className="text-[10px] text-blue-600/70 font-medium">As alterações feitas aqui refletem-se imediatamente na área do internauta.</p>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
