import { AsyncLocalStorage } from 'node:async_hooks';
import type { Prisma, PrismaClient } from '@prisma/client';
import type { IUnitOfWork } from '../../application/contracts/index.js';

interface TransactionScope {
  tx: Prisma.TransactionClient;
  compensations: Array<() => Promise<void>>;
}

const transactionScope = new AsyncLocalStorage<TransactionScope>();

/**
 * Devolve um PrismaClient que encaminha cada chamada para o cliente transacional
 * ativo (se houver) ou para o cliente base. Assim os repositórios existentes
 * participam em transações sem precisarem de receber `tx` explicitamente.
 */
export function createTransactionAwarePrisma(base: PrismaClient): PrismaClient {
  return new Proxy(base, {
    get(target, prop, receiver) {
      const scope = transactionScope.getStore();
      if (scope && typeof prop === 'string' && !prop.startsWith('$')) {
        return Reflect.get(scope.tx, prop);
      }
      return Reflect.get(target, prop, receiver);
    },
  });
}

export class PrismaUnitOfWork implements IUnitOfWork {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly options: { timeoutMs: number; maxWaitMs: number } = {
      timeoutMs: 60_000,
      maxWaitMs: 10_000,
    },
  ) {}

  async run<T>(work: () => Promise<T>): Promise<T> {
    if (transactionScope.getStore()) {
      return work();
    }

    const compensations: Array<() => Promise<void>> = [];
    try {
      return await this.prisma.$transaction(
        (tx) => transactionScope.run({ tx, compensations }, work),
        { timeout: this.options.timeoutMs, maxWait: this.options.maxWaitMs },
      );
    } catch (error) {
      for (const compensate of compensations.reverse()) {
        try {
          await compensate();
        } catch {
          // Compensação best-effort: o erro original é o que interessa ao chamador.
        }
      }
      throw error;
    }
  }

  onRollback(compensation: () => Promise<void>): void {
    const scope = transactionScope.getStore();
    if (!scope) {
      throw new Error('onRollback só pode ser usado dentro de IUnitOfWork.run().');
    }
    scope.compensations.push(compensation);
  }
}
