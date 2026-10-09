// Porta dedicada aos testes — não colide com um `pnpm dev` a correr na 3001.
// As variáveis de ambiente do processo têm precedência sobre o .env (ver env.ts).
export const TEST_PORT = Number(process.env.TEST_API_PORT ?? 3101);
export const BASE_URL = `http://127.0.0.1:${TEST_PORT}`;
export const MAILHOG_API = process.env.TEST_MAILHOG_API ?? 'http://127.0.0.1:8025/api/v2';

export const SEEDED_ADMIN = {
  email: 'admin@accountable.local',
  password: 'AccountableAdmin2026!',
};

export const SEEDED_CLIENT = {
  email: 'cliente@empresa.com',
  password: 'AccountableClient2026!',
};
