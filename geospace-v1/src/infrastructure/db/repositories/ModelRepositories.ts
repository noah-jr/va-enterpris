import { Unit, Incident, Road, PrismaClient } from "@prisma/client";
import { GenericPrismaRepository } from "./GenericRepository";
import { IUnitRepository, IIncidentRepository, IRoadRepository } from "@/core/domain/repositories/interfaces";

const prisma = new PrismaClient();

// UnitRepository.ts
export class PrismaUnitRepository extends GenericPrismaRepository<Unit> implements IUnitRepository {
    constructor() {
        super(prisma.unit);
    }

    async findBySector(sector: string): Promise<Unit[]> {
        return prisma.unit.findMany({ where: { sector } });
    }

    async updateStatus(id: string, status: string): Promise<Unit> {
        return prisma.unit.update({
            where: { id },
            data: { status }
        });
    }
}

// IncidentRepository.ts
export class PrismaIncidentRepository extends GenericPrismaRepository<Incident> implements IIncidentRepository {
    constructor() {
        super(prisma.incident);
    }

    async findActive(): Promise<Incident[]> {
        return prisma.incident.findMany({ where: { status: 'ATIVO' } });
    }

    async findPriority(priority: string): Promise<Incident[]> {
        return prisma.incident.findMany({ where: { priority } });
    }
}

// RoadRepository.ts
export class PrismaRoadRepository extends GenericPrismaRepository<Road> implements IRoadRepository {
    constructor() {
        super(prisma.road);
    }

    async findByStatus(status: string): Promise<Road[]> {
        return prisma.road.findMany({ where: { status } });
    }
}
