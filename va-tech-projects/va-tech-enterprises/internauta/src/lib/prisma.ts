import { PrismaClient, Prisma } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: ReturnType<typeof createPrismaClient> };

function createPrismaClient() {
    const prisma = new PrismaClient();

    // Models that should properly hard delete (indexes or join tables where soft delete breaks logic)
    const HARD_DELETE_MODELS = ['PostLike', 'ServiceFeature', 'VerificationToken'];

    // Unique fields that need to be renamed to avoid collisions on re-creation
    const UNIQUE_FIELDS: Record<string, string[]> = {
        User: ['email'],
        Internauta: ['email'],
        Post: ['slug'],
        Project: ['slug'],
        Service: ['slug'],
        Sector: ['name'],
        NewsletterSubscriber: ['email'],
        WhatsAppConfig: ['phoneNumber']
    };

    return prisma.$extends({
        query: {
            $allModels: {
                async delete({ model, args, query }) {
                    if (HARD_DELETE_MODELS.includes(model)) {
                        return query(args);
                    }

                    const data: any = { deleted: true };

                    // The user requested to stick to simple soft delete for now,
                    // so the unique field mangling logic is commented out as per instructions.
                    // if (UNIQUE_FIELDS[model]) {
                    //     const timestamp = Date.now();
                    //     // We need to fetch the record first to get current values if we are appending
                    //     // But args.where might be enough? No, we need the current value to append to.
                    //     // Actually, simplified approach: just append timestamp to the value if we knew it?
                    //     // We don't know the value. 
                    //     // Strategy: We can't easily mangle without fetching.
                    //     // For now, let's just Soft Delete. If user complains about re-creating, we'll fix then.
                    //     // Mangle requires a read-before-write which changes atomicity. 
                    //     // User request was "simple column deleted".
                    //     // Let's stick to simple soft delete. 
                    // }

                    return (prisma as any)[model].update({
                        ...args,
                        data,
                    });
                },
                async deleteMany({ model, args, query }) {
                    if (HARD_DELETE_MODELS.includes(model)) {
                        return query(args);
                    }
                    return (prisma as any)[model].updateMany({
                        ...args,
                        data: { deleted: true },
                    });
                },
                async findUnique({ model, args, query }) {
                    if ((args.where as any)?.deleted === undefined) {
                        args.where = { ...args.where, deleted: false } as any;
                    }
                    return (prisma as any)[model].findFirst(args);
                },
                async findFirst({ model, args, query }) {
                    if ((args.where as any)?.deleted === undefined) {
                        args.where = { ...args.where, deleted: false } as any;
                    }
                    return query(args);
                },
                async findMany({ model, args, query }) {
                    if ((args.where as any)?.deleted === undefined) {
                        args.where = { ...args.where, deleted: false } as any;
                    }
                    return query(args);
                },
                async count({ model, args, query }) {
                    if ((args.where as any)?.deleted === undefined) {
                        args.where = { ...args.where, deleted: false } as any;
                    }
                    return query(args);
                },
            },
        },
    });
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
