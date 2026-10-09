// Único ponto de carregamento de .env (ver precedência em env.ts).
import './infrastructure/config/env.js';
import fastify from 'fastify';

import { assertSecureEnv } from './infrastructure/config/assert-secure-env.js';
import {
  isLocalEnvironment,
  parseTrustProxy,
  redactUrlSecrets,
} from './infrastructure/config/runtime.js';
import { buildInfrastructure } from './composition/infrastructure.js';
import { buildControllers } from './composition/controllers.js';
import { registerPlugins } from './presentation/register-plugins.js';
import { registerRoutes } from './presentation/register-routes.js';

async function bootstrap(): Promise<void> {
  assertSecureEnv();

  const isDev = isLocalEnvironment();

  const app = fastify({
    logger: {
      level: isDev ? 'debug' : 'info',
      transport: undefined,
      serializers: {
        req(request) {
          return {
            method: request.method,
            url: redactUrlSecrets(request.url),
            hostname: request.hostname,
            remoteAddress: request.ip,
          };
        },
      },
    },
    trustProxy: parseTrustProxy(),
  });

  await registerPlugins(app, isDev);

  const infra = buildInfrastructure();
  const controllers = buildControllers(infra);

  await registerRoutes(app, controllers, infra.tokenService, infra.localStorage);

  const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
  for (const signal of signals) {
    process.on(signal, async () => {
      app.log.info(`Recebido sinal ${signal}, a encerrar graciosamente...`);
      await app.close();
      await infra.prisma.$disconnect();
      process.exit(0);
    });
  }

  const port = parseInt(process.env.PORT || '3001', 10);
  const host = '0.0.0.0';

  try {
    await app.listen({ port, host });
    app.log.info(`VA OneGest API iniciada com sucesso em http://${host}:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

bootstrap().catch((err: unknown) => {
  console.error('Falha fatal ao iniciar a aplicação:', err);
  process.exit(1);
});
