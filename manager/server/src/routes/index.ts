import { Router } from 'express'
import { clientRoutes } from './clientRoutes';
import { productRoutes } from './productRoutes';
import { supplierRoutes } from './supplierRoutes';
import { invoiceRoutes } from './invoiceRoutes';
import { settingsRoutes } from './settingsRoutes';
import { messageRoutes } from './messageRoutes';
import { dashboardRoutes } from './dashboardRoutes';
import { superAdminRoutes } from './superAdminRoutes';
import { hrRoutes } from './hrRoutes';
import { logisticsRoutes } from './logisticsRoutes';
import { financeRoutes } from './financeRoutes';
import { purchasingRoutes } from './purchasingRoutes';
import { payrollRoutes } from './payrollRoutes';
import { projectRoutes } from './projectRoutes';
import { reportRoutes } from './reportRoutes';
import { companyAdminRoutes } from './companyAdminRoutes';
import { strategyRoutes } from './strategyRoutes';
import { recruitmentRoutes } from './recruitmentRoutes';
import { trainingRoutes } from './trainingRoutes';
import { legalRoutes } from './legalRoutes';
import { posRoutes } from './posRoutes';
import { crmRoutes } from './crmRoutes';
import { riskRoutes } from './riskRoutes';
import { budgetRoutes } from './budgetRoutes';
import { fleetRoutes } from './fleetRoutes';
import { approvalRoutes } from './approvalRoutes';
import { kpiRoutes } from './kpiRoutes';
import { calendarRoutes } from './calendarRoutes';
import { expansionRoutes } from './expansionRoutes';
import { marketingRoutes } from './marketingRoutes';
import { inventoryRoutes } from './inventoryRoutes';
import { productionRoutes } from './productionRoutes';
import { assetRoutes } from './assetRoutes';
import { complianceRoutes } from './complianceRoutes';
import { documentRoutes } from './documentRoutes';
import { saftRoutes } from './saftRoutes';
import { treasuryRoutes } from './treasuryRoutes';
import { accountingRoutes } from './accountingRoutes';
import { searchRoutes } from './searchRoutes';
import { ticketRoutes } from './ticketRoutes';
import { maintenanceRoutes } from './maintenanceRoutes';
import { monitoringRoutes } from './monitoringRoutes';
import { hrAdvancedRoutes } from './hrAdvancedRoutes';
import { accountingCaseRoutes } from './accountingCaseRoutes';
import { trustedPartnerRoutes } from './trustedPartnerRoutes';

const route = Router()

// --- Core ---
route.use('/clients', clientRoutes);
route.use('/products', productRoutes);
route.use('/suppliers', supplierRoutes);
route.use('/invoices', invoiceRoutes);
route.use('/settings', settingsRoutes);
route.use('/messages', messageRoutes);
route.use('/dashboard', dashboardRoutes);
route.use('/admin', superAdminRoutes);

// --- RH & Recursos Humanos ---
route.use('/hr', hrRoutes);
route.use('/payrolls', payrollRoutes);
route.use('/payroll', payrollRoutes); // alias para compatibilidade

// --- Finanças & Contabilidade ---
route.use('/finance', financeRoutes);
route.use('/treasury', treasuryRoutes);
route.use('/accounting', accountingRoutes);
route.use('/accounting-cases', accountingCaseRoutes);
route.use('/budget', budgetRoutes);
route.use('/reports', reportRoutes);
route.use('/saft', saftRoutes);

// --- Operações & Logística ---
route.use('/purchasing', purchasingRoutes);
route.use('/logistics', logisticsRoutes);
route.use('/fleet', fleetRoutes);
route.use('/production', productionRoutes);
route.use('/inventory', inventoryRoutes);

// --- Manutenção (activos e registos) ---
route.use('/maintenance', maintenanceRoutes);
route.use('/assets', assetRoutes);

// --- Comercial & CRM ---
route.use('/crm', crmRoutes);
route.use('/crm-sales', crmRoutes);           // alias para /crm-sales no frontend

// --- Documentos & Legal ---
route.use('/documents', documentRoutes);
route.use('/legal', legalRoutes);

// --- KPIs & Estratégia ---
route.use('/kpis', kpiRoutes);
route.use('/strategy', strategyRoutes);
route.use('/projects', projectRoutes);

// --- RH Avançado ---
route.use('/recruitment', recruitmentRoutes);
route.use('/training', trainingRoutes);
route.use('/academy', trainingRoutes);        // alias para /academy no frontend
route.use('/hr-advanced', hrAdvancedRoutes);

// --- HSE & Compliance ---
route.use('/compliance-hse', complianceRoutes);
route.use('/hse', complianceRoutes);
route.use('/quality', complianceRoutes);
route.use('/risks', riskRoutes);

// --- Outros ---
route.use('/pos', posRoutes);
route.use('/approvals', approvalRoutes);
route.use('/calendar', calendarRoutes);
route.use('/expansion', expansionRoutes);
route.use('/marketing', marketingRoutes);
route.use('/company-admin', companyAdminRoutes);
route.use('/search', searchRoutes);
route.use('/tickets', ticketRoutes);
route.use('/monitoring', monitoringRoutes);
route.use('/trusted-partners', trustedPartnerRoutes);

export { route }