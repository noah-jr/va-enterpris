import { Incident, School, Hospital, DemographicData, User, AuditLog } from "@prisma/client";
import prisma from "@/lib/prisma";
import { GenericPrismaRepository } from "./GenericRepository";
import { 
    IIncidentRepository, 
    ISchoolRepository, 
    IHospitalRepository, 
    IDemographicRepository,
    IUserRepository,
    IAuditLogRepository
} from "@/core/domain/repositories/interfaces";

// No local prisma creation

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

// SchoolRepository.ts
export class PrismaSchoolRepository extends GenericPrismaRepository<School> implements ISchoolRepository {
    constructor() {
        super(prisma.school);
    }

    async findByProvince(province: string): Promise<School[]> {
        return prisma.school.findMany({ where: { province } });
    }
}

// HospitalRepository.ts
export class PrismaHospitalRepository extends GenericPrismaRepository<Hospital> implements IHospitalRepository {
    constructor() {
        super(prisma.hospital);
    }

    async findByProvince(province: string): Promise<Hospital[]> {
        return prisma.hospital.findMany({ where: { province } });
    }
}

// DemographicRepository.ts
export class PrismaDemographicRepository extends GenericPrismaRepository<DemographicData> implements IDemographicRepository {
    constructor() {
        super(prisma.demographicData);
    }

    async findByRegion(regionName: string, regionType: string): Promise<DemographicData[]> {
        return prisma.demographicData.findMany({ where: { regionName, regionType } });
    }
}

// UserRepository.ts
export class PrismaUserRepository extends GenericPrismaRepository<User> implements IUserRepository {
    constructor() {
        super(prisma.user);
    }

    async findByEmail(email: string): Promise<User | null> {
        return prisma.user.findUnique({ where: { email } });
    }

    async findByEmailOrName(identifier: string): Promise<User | null> {
        return prisma.user.findFirst({
            where: {
                OR: [
                    { email: identifier },
                    { name: identifier }
                ]
            }
        });
    }
}

// AuditLogRepository.ts
export class PrismaAuditLogRepository extends GenericPrismaRepository<AuditLog> implements IAuditLogRepository {
    constructor() {
        super(prisma.auditLog);
    }

    async findByUser(userId: string): Promise<AuditLog[]> {
        return prisma.auditLog.findMany({ where: { userId } });
    }
}
