import { spawn, type ChildProcess } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const apiRoot = path.resolve(__dirname, '../../../../');
const mainEntry = path.join(apiRoot, 'src/main.ts');

export interface TestServer {
  baseUrl: string;
  stop: () => Promise<void>;
}

async function waitForHealth(baseUrl: string, timeoutMs: number): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  let lastError: unknown;

  while (Date.now() < deadline) {
    try {
      const res = await fetch(`${baseUrl}/api/v1/health`);
      if (res.ok) return;
    } catch (err) {
      lastError = err;
    }
    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  throw new Error(`API não ficou disponível em ${baseUrl} a tempo. Último erro: ${String(lastError)}`);
}

export async function startTestServer(port: number): Promise<TestServer> {
  const baseUrl = `http://127.0.0.1:${port}`;

  const child: ChildProcess = spawn(
    process.execPath,
    [path.join(apiRoot, 'node_modules/tsx/dist/cli.mjs'), mainEntry],
    {
      cwd: apiRoot,
      env: {
        ...process.env,
        PORT: String(port),
        NODE_ENV: 'test',
        // Os testes fazem centenas de pedidos a partir do mesmo IP: limites altos só aqui.
        RATE_LIMIT_GLOBAL_MAX: '100000',
        RATE_LIMIT_AUTH_MAX: '100000',
        RATE_LIMIT_TOKEN_MAX: '100000',
        RATE_LIMIT_UPLOAD_LINK_CONTEXT_MAX: '100000',
        RATE_LIMIT_UPLOAD_LINK_UPLOAD_MAX: '100000',
        RATE_LIMIT_UPLOAD_SESSION_CONTEXT_MAX: '100000',
        RATE_LIMIT_UPLOAD_SESSION_UPLOAD_MAX: '100000',
        RATE_LIMIT_CONTACT_MAX: '100000',
        RATE_LIMIT_NEWSLETTER_MAX: '100000',
        // Permite apontar para um MinIO/serviços dedicados a testes sem editar o .env.
        ...(process.env.TEST_MINIO_PORT ? { MINIO_PORT: process.env.TEST_MINIO_PORT } : {}),
        ...(process.env.TEST_MINIO_ACCESS_KEY ? { MINIO_ACCESS_KEY: process.env.TEST_MINIO_ACCESS_KEY } : {}),
        ...(process.env.TEST_MINIO_SECRET_KEY ? { MINIO_SECRET_KEY: process.env.TEST_MINIO_SECRET_KEY } : {}),
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );

  let output = '';
  child.stdout?.on('data', (chunk: Buffer) => {
    output += chunk.toString();
  });
  child.stderr?.on('data', (chunk: Buffer) => {
    output += chunk.toString();
  });

  const exitPromise = new Promise<never>((_resolve, reject) => {
    child.once('exit', (code) => {
      if (code !== null && code !== 0) {
        reject(new Error(`Servidor de teste terminou com código ${code}.\nOutput:\n${output}`));
      }
    });
  });

  try {
    await Promise.race([waitForHealth(baseUrl, 20_000), exitPromise]);
  } catch (err) {
    child.kill('SIGTERM');
    throw err;
  }

  const stop = async (): Promise<void> => {
    if (child.exitCode !== null) return;
    child.kill('SIGTERM');
    await new Promise<void>((resolve) => {
      child.once('exit', () => resolve());
      setTimeout(() => {
        child.kill('SIGKILL');
        resolve();
      }, 5000);
    });
  };

  return { baseUrl, stop };
}
