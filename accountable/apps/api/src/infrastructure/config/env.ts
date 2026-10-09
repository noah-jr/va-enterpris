import { config } from 'dotenv';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Precedência (maior → menor):
//   1. variáveis de ambiente reais do processo (orquestrador, CI, testes)
//   2. apps/api/.env
//   3. .env na raiz do monorepo
// Os ficheiros .env nunca sobrepõem variáveis já definidas no processo.
const appEnvPath = resolve(__dirname, '../../../.env');
const rootEnvPath = resolve(__dirname, '../../../../../.env');

const processEnvSnapshot = { ...process.env };

if (existsSync(rootEnvPath)) {
  config({ path: rootEnvPath });
}

if (existsSync(appEnvPath)) {
  // override: o .env da app ganha ao da raiz…
  config({ path: appEnvPath, override: true });
} else {
  config();
}

// …mas nunca ao ambiente real do processo.
for (const [key, value] of Object.entries(processEnvSnapshot)) {
  if (value !== undefined) process.env[key] = value;
}
