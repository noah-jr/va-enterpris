import { getSession } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import ProfileForm from "@/components/internauta/ProfileForm";
import { redirect } from "next/navigation";
import { Settings, Shield, Bell } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function InternautaSettings() {
    const session = await getSession();
    if (!session || session.user.role !== 'INTERNAUTA') {
        redirect('/login-internauta');
    }

    const internauta = await prisma.internauta.findUnique({
        where: { id: session.user.id }
    });

    if (!internauta) {
        redirect('/login-internauta');
    }

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <header className="space-y-2 border-b pb-10 border-border/40">
                <div className="flex items-center gap-2 mb-2">
                    <div className="h-1 w-8 bg-foreground rounded-full" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">Definições</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic">
                    Configurações
                </h1>
                <p className="text-muted-foreground text-lg font-medium leading-relaxed max-w-md">
                    Personalize a sua experiência e gira a segurança da sua conta.
                </p>
            </header>

            <div className="grid lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8 space-y-10">
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-foreground/5 to-foreground/[0.02] rounded-[40px] blur opacity-25" />
                        <div className="relative bg-card/60 backdrop-blur-2xl p-8 md:p-12 rounded-[40px] border border-border/50 shadow-2xl">
                            <div className="flex items-center gap-4 mb-10">
                                <div className="w-12 h-12 rounded-2xl bg-foreground flex items-center justify-center">
                                    <Settings className="w-6 h-6 text-background" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black tracking-tighter uppercase italic leading-none">Dados de Perfil</h2>
                                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-[0.2em] mt-1">Informações básicas da conta</p>
                                </div>
                            </div>
                            <ProfileForm initialData={JSON.parse(JSON.stringify(internauta))} />
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-card/40 backdrop-blur-xl p-8 rounded-[40px] border border-border/40 space-y-6">
                        <h3 className="text-xs font-black uppercase tracking-widest italic flex items-center gap-2 text-muted-foreground">
                            <Shield className="w-4 h-4" /> Segurança
                        </h3>
                        <p className="text-sm text-muted-foreground/60 leading-relaxed">
                            Para alterar a sua palavra-passe ou gerir a autenticação de dois fatores, por favor contacte o nosso suporte.
                        </p>
                        <button disabled className="w-full py-4 rounded-2xl bg-foreground/5 text-muted-foreground font-bold text-xs uppercase tracking-widest cursor-not-allowed border border-border/20">
                            Alterar Password
                        </button>
                    </div>

                    <div className="bg-card/40 backdrop-blur-xl p-8 rounded-[40px] border border-border/40 space-y-6">
                        <h3 className="text-xs font-black uppercase tracking-widest italic flex items-center gap-2 text-muted-foreground">
                            <Bell className="w-4 h-4" /> Notificações
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between opacity-50 cursor-not-allowed">
                                <span className="text-sm font-bold uppercase tracking-tighter italic">Emails de Marketing</span>
                                <div className="w-10 h-6 bg-foreground rounded-full" />
                            </div>
                            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Brevemente disponível</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
