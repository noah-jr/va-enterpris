import { getSession as auth } from "@/lib/jwt";
import { UserChat } from "@/components/UserChat";
import { MessageSquare } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
    const session = await auth();
    let userId = session?.user?.id;

    if (!userId && session?.user?.email) {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });
        if (user) {
            userId = user.id;
        }
    }

    return (
        <div className="space-y-6 h-full flex flex-col">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
                    <MessageSquare className="h-8 w-8 text-primary" /> Chat Interno
                </h1>
                <p className="text-muted-foreground">Comunicação direta entre administradores e equipa.</p>
            </div>

            <div className="flex-1 min-h-0">
                <UserChat currentUserId={userId || ""} />
            </div>
        </div>
    );
}

