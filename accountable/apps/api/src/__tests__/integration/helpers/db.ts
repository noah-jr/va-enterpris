import '../../../infrastructure/config/env.js';
import { PrismaClient } from '@prisma/client';

/**
 * Acesso direto à base de dados para asserções que a API não expõe
 * (p.ex. confirmar que tokens nunca são guardados em claro).
 */
export const db = new PrismaClient();
