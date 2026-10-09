import { Router } from 'express';
import { CompanyAdminController } from '../controllers/CompanyAdminController';
import { RolesController } from '../controllers/RoleController';
import { rbacMiddleware } from '../middlewares/rbacMiddleware';

const router = Router();

// Allow only ADMIN or SUPER_ADMIN for company management
router.use(rbacMiddleware([], ['ADMIN', 'SUPER_ADMIN']));

router.get('/users', CompanyAdminController.getUsers);
router.post('/users', CompanyAdminController.createUser);
router.put('/users/:id', CompanyAdminController.updateUser);
router.delete('/users/:id', CompanyAdminController.deleteUser);
router.patch('/users/:id/toggle', CompanyAdminController.toggleUserStatus);
router.get('/audit-logs', CompanyAdminController.getAuditLogs);
router.get('/subscription', CompanyAdminController.getSubscriptionInfo);
router.get('/plans', CompanyAdminController.getPlans);

// Identidades, Perfis e Permissões
router.get('/roles', RolesController.getRoles);
router.post('/roles', RolesController.createRole);
router.put('/roles/:id', RolesController.updateRole);
router.delete('/roles/:id', RolesController.deleteRole);
router.get('/permissions', RolesController.getPermissions);

router.post('/setup-demo', CompanyAdminController.setupDemoData);
router.post('/upgrade-plan', CompanyAdminController.upgradePlan);
router.post('/cancel-subscription', CompanyAdminController.cancelSubscription);
router.put('/profile', CompanyAdminController.updateCompanyProfile);


export { router as companyAdminRoutes };
