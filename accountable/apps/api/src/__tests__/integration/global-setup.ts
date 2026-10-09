import type { TestServer } from './helpers/server.js';
import { startTestServer } from './helpers/server.js';
import { TEST_PORT } from './helpers/constants.js';

let server: TestServer | undefined;

export async function setup(): Promise<void> {
  server = await startTestServer(TEST_PORT);
}

export async function teardown(): Promise<void> {
  await server?.stop();
}
