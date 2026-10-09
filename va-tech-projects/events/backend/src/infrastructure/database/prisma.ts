import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import mariadb from 'mariadb';
import dotenv from 'dotenv';

dotenv.config();

const url = new URL(process.env.DATABASE_URL as string);

const poolConfig = {
    host: url.hostname,
    port: parseInt(url.port),
    user: url.username,
    password: url.password,
    database: url.pathname.substring(1),
    connectionLimit: 5,
};

// In Prisma 7, the adapter might want the config or a pool depending on version.
// Let's try to satisfy the requirement of "string | PoolConfig"
const adapter = new PrismaMariaDb(poolConfig as any);

export const prisma = new PrismaClient({
    adapter,
    log: ['query', 'info', 'warn', 'error'],
} as any);
