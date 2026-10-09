import {
  ListClientsUseCase,
  GetClientUseCase,
  BlockClientUseCase,
  UnblockClientUseCase,
} from '../application/use-cases/clients/index.js';
import { ClientController } from '../presentation/controllers/client.controller.js';
import type { Infrastructure } from './infrastructure.js';

export function buildClientController(infra: Infrastructure): ClientController {
  const { clientRepository, auditRepository } = infra.repositories;

  const listClientsUseCase = new ListClientsUseCase(clientRepository);
  const getClientUseCase = new GetClientUseCase(clientRepository);
  const blockClientUseCase = new BlockClientUseCase(clientRepository, auditRepository, infra.unitOfWork, infra.repositories.refreshSessionRepository);
  const unblockClientUseCase = new UnblockClientUseCase(clientRepository, auditRepository, infra.unitOfWork);

  return new ClientController({
    listClientsUseCase,
    getClientUseCase,
    blockClientUseCase,
    unblockClientUseCase,
  });
}
