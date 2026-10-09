import { PrismaServiceRepository } from "@/core/infrastructure/repositories/PrismaServiceRepository";
import { ListServices } from "@/core/application/use-cases/services/ListServices";
import ServicesView from "./ServicesView";

export const dynamic = 'force-dynamic';

export default async function ServicesPage() {
    const repo = new PrismaServiceRepository();
    const useCase = new ListServices(repo);
    const services = await useCase.execute();

    return <ServicesView services={services} />;
}
