import { Router } from 'express';
import { SaftController } from '../controllers/SaftController';
import { rbacMiddleware } from '../middlewares/rbacMiddleware';

const router = Router();

// Exportação do ficheiro SAF-T(AO) - suporta filtragem por ano e mês
// GET /saft/export?year=2026&month=3
router.get('/export', rbacMiddleware(['invoices:view']), SaftController.exportSaft);

// Resumo fiscal com dados dinâmicos das faturas reais
// GET /saft/summary?year=2026&month=3
router.get('/summary', rbacMiddleware(['invoices:view']), SaftController.getFiscalSummary);

// Validação/teste de assinatura hash de um documento
// POST /saft/validate-hash
router.post('/validate-hash', rbacMiddleware(['invoices:view']), SaftController.validateHash);

export { router as saftRoutes };
