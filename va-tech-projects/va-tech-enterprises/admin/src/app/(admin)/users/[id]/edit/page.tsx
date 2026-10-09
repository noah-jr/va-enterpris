import UserForm from "@/components/UserForm";
import { PrismaUserRepository } from "@/core/infrastructure/repositories/PrismaUserRepository";
import { notFound } from "next/navigation";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function EditUserPage({ params }: PageProps) {
    const { id } = await params;
    const repo = new PrismaUserRepository();
    const user = await repo.findById(id);

    if (!user) {
        notFound();
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Editar Usuário</h1>
                <p className="text-muted-foreground">Atualize as permissões ou senha.</p>
            </div>
            <UserForm user={user} />
        </div>
    );
}
