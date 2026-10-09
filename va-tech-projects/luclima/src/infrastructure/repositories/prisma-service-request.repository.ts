import type {
    IServiceRequestRepository,
    CreateServiceRequestDTO,
    UpdateServiceRequestDTO,
    ServiceRequestFilters,
} from '@/domain/repositories';
import type { ServiceRequest } from '@/domain/entities';
import { prisma } from '../database/prisma';

export class PrismaServiceRequestRepository implements IServiceRequestRepository {
    async findById(id: string): Promise<ServiceRequest | null> {
        const request = await prisma.serviceRequest.findUnique({
            where: { id },
            include: {
                service: true,
                sector: true,
                assignedTo: true,
            },
        });

        return request as ServiceRequest | null;
    }

    async findAll(filters?: ServiceRequestFilters): Promise<ServiceRequest[]> {
        const where: any = {};

        if (filters?.status) {
            where.status = filters.status;
        }

        if (filters?.sectorId) {
            where.sectorId = filters.sectorId;
        }

        if (filters?.assignedToId) {
            where.assignedToId = filters.assignedToId;
        }

        const requests = await prisma.serviceRequest.findMany({
            where,
            include: {
                service: true,
                sector: true,
                assignedTo: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return requests as ServiceRequest[];
    }

    async create(data: CreateServiceRequestDTO): Promise<ServiceRequest> {
        const request = await prisma.serviceRequest.create({
            data: {
                name: data.name,
                email: data.email,
                phone: data.phone,
                description: data.description,
                attachment: data.attachment,
                serviceId: data.serviceId,
                sectorId: data.sectorId,
            },
            include: {
                service: true,
                sector: true,
            },
        });

        return request as ServiceRequest;
    }

    async update(id: string, data: UpdateServiceRequestDTO): Promise<ServiceRequest> {
        const updateData: Record<string, unknown> = {};
        if (data.status !== undefined) updateData.status = data.status;
        if (data.assignedToId !== undefined) {
            updateData.assignedToId = data.assignedToId;
        }

        const request = await prisma.serviceRequest.update({
            where: { id },
            data: updateData as Parameters<typeof prisma.serviceRequest.update>[0]['data'],
            include: {
                service: true,
                sector: true,
                assignedTo: true,
            },
        });

        return request as ServiceRequest;
    }

    async delete(id: string): Promise<void> {
        await prisma.serviceRequest.delete({
            where: { id },
        });
    }

    async count(filters?: ServiceRequestFilters): Promise<number> {
        const where: any = {};

        if (filters?.status) {
            where.status = filters.status;
        }

        if (filters?.sectorId) {
            where.sectorId = filters.sectorId;
        }

        if (filters?.assignedToId) {
            where.assignedToId = filters.assignedToId;
        }

        return prisma.serviceRequest.count({ where });
    }
}
