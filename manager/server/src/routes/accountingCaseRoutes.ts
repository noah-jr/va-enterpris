import { Router } from 'express';
import { AccountingCaseController } from '../controllers/AccountingCaseController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { rbacMiddleware } from '../middlewares/rbacMiddleware';
import { uploadAccountingDoc } from '../lib/uploadAccountingDoc';

const router = Router();
router.use(authMiddleware);

// ── Resumo ──────────────────────────────────────────────────────────────────
router.get('/summary',          rbacMiddleware(['finance:view']), AccountingCaseController.getSummary);
router.get('/analytics',        rbacMiddleware(['finance:view']), AccountingCaseController.getAnalytics);
router.get('/balance-sheet',    rbacMiddleware(['finance:view']), AccountingCaseController.getBalanceSheet);
router.get('/income-statement', rbacMiddleware(['finance:view']), AccountingCaseController.getIncomeStatement);
router.get('/trial-balance',    rbacMiddleware(['finance:view']), AccountingCaseController.getTrialBalance);

// ── Plano de Contas ─────────────────────────────────────────────────────────
router.get('/chart',        rbacMiddleware(['finance:view']),   AccountingCaseController.getChartOfAccounts);
router.post('/chart',       rbacMiddleware(['finance:create']), AccountingCaseController.createAccount);

// ── Diário ─────────────────────────────────────────────────────────────────
router.get('/journal',           rbacMiddleware(['finance:view']),   AccountingCaseController.listJournalEntries);
router.post('/journal',          rbacMiddleware(['finance:create']), AccountingCaseController.createJournalEntry);
router.patch('/journal/:id/post',rbacMiddleware(['finance:update']), AccountingCaseController.postJournalEntry);

// ── Processos ───────────────────────────────────────────────────────────────
router.get('/config/required-documents', rbacMiddleware(['finance:view']), AccountingCaseController.getRequiredDocumentsConfig);
router.put('/config/required-documents', rbacMiddleware(['finance:update']), AccountingCaseController.updateRequiredDocumentsConfig);
router.get('/',             rbacMiddleware(['finance:view']),   AccountingCaseController.listCases);
router.get('/:id',          rbacMiddleware(['finance:view']),   AccountingCaseController.getCase);
router.post('/',            rbacMiddleware(['finance:create']), AccountingCaseController.createCase);
router.patch('/:id/status', rbacMiddleware(['finance:update']), AccountingCaseController.updateCaseStatus);
router.post('/:id/ai-analyze', rbacMiddleware(['finance:update']), AccountingCaseController.generateAIAnalysis);
router.get('/:caseId/export', rbacMiddleware(['finance:view']), AccountingCaseController.exportAuditArchive);

// ── Documentos ──────────────────────────────────────────────────────────────
router.post('/:caseId/documents',
    rbacMiddleware(['finance:create']),
    uploadAccountingDoc,
    AccountingCaseController.uploadDocument
);
router.patch('/documents/:docId/review',
    rbacMiddleware(['finance:update']),
    AccountingCaseController.reviewDocument
);
router.delete('/documents/:docId',
    rbacMiddleware(['finance:delete']),
    AccountingCaseController.deleteDocument
);

// ── Mensagens ───────────────────────────────────────────────────────────────
router.post('/:caseId/messages', rbacMiddleware(['finance:view']), AccountingCaseController.sendMessage);

export { router as accountingCaseRoutes };
