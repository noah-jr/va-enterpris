import { Product, Prisma } from '@prisma/client';
import prisma from '../lib/prisma';


export class ProductModel {
    static async getAllProducts(companyId: string): Promise<Product[]> {
        return prisma.product.findMany({
            where: { companyId },
        });
    }

    static async getProductById(id: string, companyId: string): Promise<Product | null> {
        return prisma.product.findFirst({
            where: { id, companyId },
        });
    }

    static async getProductByCode(code: string, companyId: string): Promise<Product | null> {
        return prisma.product.findFirst({
            where: { code, companyId },
        });
    }

    static async createProduct(data: Prisma.ProductUncheckedCreateInput): Promise<Product> {
        return prisma.product.create({
            data: data as any,
        });
    }

    static async updateProduct(id: string, companyId: string, data: Partial<Product>): Promise<Product | null> {
        const existing = await prisma.product.findFirst({ where: { id, companyId } });
        if (!existing) return null;

        return prisma.product.update({
            where: { id },
            data,
        });
    }

    static async deleteProduct(id: string, companyId: string): Promise<boolean> {
        const existing = await prisma.product.findFirst({ where: { id, companyId } });
        if (!existing) return false;

        await prisma.product.delete({ where: { id } });
        return true;
    }
}
