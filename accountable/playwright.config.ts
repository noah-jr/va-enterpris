import { defineConfig, devices } from '@playwright/test';

/**
 * Variáveis para a API durante os E2E. O ambiente do processo tem precedência
 * sobre apps/api/.env, por isso é possível apontar para serviços de teste
 * (p.ex. TEST_MINIO_PORT=9100) sem editar ficheiros.
 */
const apiEnv: Record<string, string> = {
  NODE_ENV: 'test',
  RATE_LIMIT_GLOBAL_MAX: '100000',
  RATE_LIMIT_AUTH_MAX: '100000',
  RATE_LIMIT_TOKEN_MAX: '100000',
  RATE_LIMIT_CONTACT_MAX: '100000',
  RATE_LIMIT_NEWSLETTER_MAX: '100000',
  RATE_LIMIT_UPLOAD_SESSION_CONTEXT_MAX: '100000',
  RATE_LIMIT_UPLOAD_SESSION_UPLOAD_MAX: '100000',
  RATE_LIMIT_UPLOAD_LINK_CONTEXT_MAX: '100000',
  RATE_LIMIT_UPLOAD_LINK_UPLOAD_MAX: '100000',
  ...(process.env.TEST_MINIO_PORT ? { MINIO_PORT: process.env.TEST_MINIO_PORT } : {}),
  ...(process.env.TEST_MINIO_ACCESS_KEY ? { MINIO_ACCESS_KEY: process.env.TEST_MINIO_ACCESS_KEY } : {}),
  ...(process.env.TEST_MINIO_SECRET_KEY ? { MINIO_SECRET_KEY: process.env.TEST_MINIO_SECRET_KEY } : {}),
};

export default defineConfig({
  testDir: './e2e',
  timeout: 45_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list']],
  use: {
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'client',
      testMatch: /client\/.*\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], channel: 'chrome', baseURL: 'http://localhost:5173' },
    },
    {
      name: 'admin',
      testMatch: /admin\/.*\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], channel: 'chrome', baseURL: 'http://localhost:5174' },
    },
    {
      name: 'landing',
      testMatch: /landing\/.*\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], channel: 'chrome', baseURL: 'http://localhost:5175' },
    },
  ],
  webServer: [
    {
      command: 'pnpm --filter api dev',
      url: 'http://localhost:3001/api/v1/health',
      reuseExistingServer: Boolean(process.env.E2E_REUSE_SERVERS),
      timeout: 60_000,
      cwd: '.',
      env: apiEnv,
    },
    {
      command: 'pnpm --filter client dev',
      url: 'http://localhost:5173',
      reuseExistingServer: Boolean(process.env.E2E_REUSE_SERVERS),
      timeout: 60_000,
      cwd: '.',
    },
    {
      command: 'pnpm --filter admin dev',
      url: 'http://localhost:5174',
      reuseExistingServer: Boolean(process.env.E2E_REUSE_SERVERS),
      timeout: 60_000,
      cwd: '.',
    },
    {
      command: 'pnpm --filter landing dev',
      url: 'http://localhost:5175',
      reuseExistingServer: Boolean(process.env.E2E_REUSE_SERVERS),
      timeout: 60_000,
      cwd: '.',
    },
  ],
});
