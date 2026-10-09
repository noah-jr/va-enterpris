import { Router } from 'express';
import { SuperAdminController } from '../controllers/SuperAdminController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { rbacMiddleware } from '../middlewares/rbacMiddleware';
import { SystemSettingsController } from '../controllers/SystemSettingsController';
import { TicketController } from '../controllers/TicketController';
import { uploadAsset } from '../lib/uploadAsset';
import { BackupController } from '../controllers/BackupController';




const router = Router();

router.use(authMiddleware);
router.use(rbacMiddleware([], ['SUPER_ADMIN']));

router.get('/stats', SuperAdminController.getStats);
router.get('/companies', SuperAdminController.getAllCompanies);
router.post('/companies', SuperAdminController.createCompany);
router.get('/companies/:id', SuperAdminController.getCompanyDetails);
router.delete('/companies/:id', SuperAdminController.deleteCompany);
router.patch('/companies/:id/modules', SuperAdminController.updateCompanyModules);
router.post('/companies/:id/approve', SuperAdminController.approveCompany);
router.post('/companies/:id/toggle-status', SuperAdminController.toggleCompanyStatus);
router.post('/companies/:id/extend', SuperAdminController.extendCompanyExpiration);

router.get('/users', SuperAdminController.getAllUsers);
router.post('/users', SuperAdminController.createUser);
router.delete('/users/:id', SuperAdminController.deleteUser);
router.patch('/users/:id/role', SuperAdminController.updateUserRole);

router.get('/payment-methods', SuperAdminController.getPaymentMethods);
router.post('/payment-methods', SuperAdminController.createPaymentMethod);
router.patch('/payment-methods/:id/toggle', SuperAdminController.togglePaymentMethod);
router.post('/subscriptions', SuperAdminController.manageSubscription);
router.post('/subscriptions/:id', SuperAdminController.manageSubscription);
router.post('/subscriptions/:id/cancel', SuperAdminController.cancelSubscription);

router.get('/settings', SystemSettingsController.getAllSettings);
router.post('/settings', SystemSettingsController.updateSetting);
router.post('/settings/upload', uploadAsset, SystemSettingsController.uploadSettingImage);


router.get('/tickets', TicketController.list);
router.get('/contacts', TicketController.listContacts);
router.get('/subscribers', TicketController.listSubscribers);

// ── Backups & Restore ──────────────────────────────────────────────────────
router.get('/backups', BackupController.list);
router.post('/backups', BackupController.create);
router.post('/backups/:filename/restore', BackupController.restore);
router.delete('/backups/:filename', BackupController.delete);
router.get('/backups/:filename/download', BackupController.download);



// ── Central Accounting Audits ─────────────────────────────────────────────
router.get('/audits', SuperAdminController.listAudits);
router.post('/audits/:id/approve', SuperAdminController.approveAudit);
router.post('/audits/:id/reject', SuperAdminController.rejectAudit);

// ── Roles & Permissions (System Level) ───────────────────────────────────
router.get('/roles', SuperAdminController.getRoles);
router.post('/roles', SuperAdminController.createRole);
router.put('/roles/:id', SuperAdminController.updateRole);
router.delete('/roles/:id', SuperAdminController.deleteRole);
router.get('/permissions', SuperAdminController.getPermissions);

export { router as superAdminRoutes };
