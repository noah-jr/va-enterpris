import { prisma } from "@/lib/prisma";
import { User } from "@prisma/client";
import bcrypt from "bcryptjs";

export class PrismaUserRepository {
    async findAll(): Promise<User[]> {
        return prisma.user.findMany({
            orderBy: { createdAt: 'desc' }
        });
    }

    async findById(id: string): Promise<User | null> {
        return prisma.user.findUnique({ where: { id } });
    }

    async create(data: any): Promise<User> {
        const hashedPassword = await bcrypt.hash(data.password, 10);
        return prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                password: hashedPassword,
                role: data.role || 'ADMIN',
                image: data.image
            }
        });
    }

    async update(id: string, data: any): Promise<User> {
        const updateData: any = {
            name: data.name,
            email: data.email,
            role: data.role,
            image: data.image
        };

        if (data.password && data.password.trim() !== "") {
            updateData.password = await bcrypt.hash(data.password, 10);
        }

        // Remover undefined
        Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

        return prisma.user.update({
            where: { id },
            data: updateData
        });
    }

    async delete(id: string): Promise<void> {
        await prisma.user.delete({ where: { id } });
    }
}
