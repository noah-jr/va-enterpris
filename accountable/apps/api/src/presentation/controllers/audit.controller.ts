import type { FastifyRequest, FastifyReply } from 'fastify';
import { auditFilterSchema } from '@accountable/schemas';
import type { ListAuditLogsUseCase } from '../../application/use-cases/audit/index.js';

export class AuditController {
  constructor(private readonly listAuditLogsUseCase: ListAuditLogsUseCase) {}

  async list(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const query = auditFilterSchema.parse(request.query);
    const result = await this.listAuditLogsUseCase.execute(query);
    reply.status(200).send(result);
  }
}
