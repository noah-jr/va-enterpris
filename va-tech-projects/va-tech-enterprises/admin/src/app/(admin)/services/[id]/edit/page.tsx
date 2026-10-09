import ServiceForm from "@/components/ServiceForm";
import { PrismaServiceRepository } from "@/core/infrastructure/repositories/PrismaServiceRepository";
import { notFound } from "next/navigation";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function EditServicePage({ params }: PageProps) {
    const { id } = await params;
    const repo = new PrismaServiceRepository();
    const service = await repo.findById(id);

    if (!service) {
        notFound();
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Editar Serviço</h1>
                <p className="text-muted-foreground">Atualize as informações do serviço: {service.title}</p>
            </div>
            <ServiceForm service={service} />
        </div>
    );
}
