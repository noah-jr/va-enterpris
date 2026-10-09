"use client";

import { useState } from "react";
import { User, Mail, Phone, MapPin, Briefcase, Calendar, Heart, Save, Camera } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ProfileFormProps {
    initialData: any;
}

export default function ProfileForm({ initialData }: ProfileFormProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState(initialData);
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData((prev: any) => ({ ...prev, [name]: checked }));
        } else {
            setFormData((prev: any) => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(`/api/internautas/${initialData.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                toast.success('Perfil atualizado com sucesso!');
                router.refresh();
            } else {
                toast.error('Erro ao atualizar perfil');
            }
        } catch (error) {
            toast.error('Erro de conexão');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-12">
            <div className="grid md:grid-cols-2 gap-10">
                {/* Personal Intelligence section */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3 border-l-2 border-foreground pl-4">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] italic text-muted-foreground">Indentificação</h4>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Primeiro Nome</label>
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                className="w-full bg-foreground/5 border-border/40 rounded-2xl px-5 py-4 text-sm font-semibold focus:ring-1 focus:ring-foreground transition-all outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Apelido</label>
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                className="w-full bg-foreground/5 border-border/40 rounded-2xl px-5 py-4 text-sm font-semibold focus:ring-1 focus:ring-foreground transition-all outline-none"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Email de Referência</label>
                        <div className="relative">
                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                            <input
                                type="email"
                                value={formData.email}
                                disabled
                                className="w-full bg-foreground/[0.02] border-border/20 rounded-2xl px-14 py-4 text-sm font-medium text-muted-foreground/60 cursor-not-allowed italic"
                            />
                        </div>
                    </div>
                </div>

                {/* Logistics section */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3 border-l-2 border-foreground pl-4">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] italic text-muted-foreground">Logística & Geral</h4>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Contacto Telefónico</label>
                        <div className="relative">
                            <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone || ''}
                                onChange={handleChange}
                                className="w-full bg-foreground/5 border-border/40 rounded-2xl px-14 py-4 text-sm font-semibold focus:ring-1 focus:ring-foreground transition-all outline-none"
                                placeholder="+351 000 000 000"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Localização (Cidade)</label>
                        <input
                            type="text"
                            name="city"
                            value={formData.city || ''}
                            onChange={handleChange}
                            className="w-full bg-foreground/5 border-border/40 rounded-2xl px-5 py-4 text-sm font-semibold focus:ring-1 focus:ring-foreground transition-all outline-none"
                            placeholder="Sua cidade atual"
                        />
                    </div>
                </div>
            </div>

            <div className="pt-8 border-t border-border/40 flex flex-col md:flex-row justify-between items-center gap-6">
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest italic max-w-xs text-center md:text-left">
                    * Os seus dados estão protegidos sob a política de privacidade VA TECH. Pode solicitar a eliminação da conta a qualquer momento.
                </p>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full md:w-auto h-16 px-12 bg-foreground text-background rounded-3xl font-black text-xs uppercase tracking-[0.3em] hover:scale-[1.02] transition-all disabled:opacity-50 shadow-2xl shadow-foreground/20 flex items-center justify-center gap-4 group"
                >
                    {loading ? (
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-background border-t-transparent" />
                    ) : (
                        <>
                            Atualizar Perfil
                            <span className="group-hover:translate-x-2 transition-transform">→</span>
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
