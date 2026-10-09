import { getSession as auth } from "@/lib/jwt";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ProfileSettings from "@/components/settings/ProfileSettings";
import SiteSettings from "@/components/settings/SiteSettings";
import StatsOverview from "@/components/settings/StatsOverview";
import ChatSettings from "@/components/settings/ChatSettings";

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    // Buscar dados do usuário atual
    const user = await prisma.user.findUnique({
        where: { email: session.user.email! }
    });

    if (!user) {
        redirect("/login");
    }

    // Buscar estatísticas
    const stats = {
        totalServices: await prisma.service.count(),
        activeServices: await prisma.service.count({ where: { active: true } }),
        totalPosts: await prisma.post.count(),
        publishedPosts: await prisma.post.count({ where: { published: true } }),
        totalContacts: await prisma.contact.count(),
        newContacts: await prisma.contact.count({ where: { status: 'NEW' } }),
        totalSubscribers: await prisma.newsletterSubscriber.count(),
        activeSubscribers: await prisma.newsletterSubscriber.count({ where: { active: true } }),
        totalUsers: await prisma.user.count(),
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
                <p className="text-muted-foreground">Gerencie as configurações do sistema e seu perfil.</p>
            </div>

            <Tabs defaultValue="profile" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="profile">Perfil</TabsTrigger>
                    <TabsTrigger value="site">Site</TabsTrigger>
                    <TabsTrigger value="chat">Chat & Bots</TabsTrigger>
                    <TabsTrigger value="stats">Estatísticas</TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-4">
                    <ProfileSettings user={user} />
                </TabsContent>

                <TabsContent value="site" className="space-y-4">
                    <SiteSettings />
                </TabsContent>

                <TabsContent value="chat" className="space-y-4">
                    <ChatSettings />
                </TabsContent>

                <TabsContent value="stats" className="space-y-4">
                    <StatsOverview stats={stats} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
