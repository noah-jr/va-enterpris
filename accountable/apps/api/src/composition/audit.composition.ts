import { ListAuditLogsUseCase } from '../application/use-cases/audit/index.js';
import { AuditController } from '../presentation/controllers/audit.controller.js';
import type { Infrastructure } from './infrastructure.js';

export function buildAuditController(infra: Infrastructure): AuditController {
  const listAuditLogsUseCase = new ListAuditLogsUseCase(infra.repositories.auditRepository);
  return new AuditController(listAuditLogsUseCase);
}
