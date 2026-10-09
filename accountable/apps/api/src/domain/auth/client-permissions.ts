/**
 * Permissões fixas de um cliente. Clientes não têm roles configuráveis — o acesso
 * aos seus próprios dados é garantido por verificações de ownership nos use-cases.
 */
export const CLIENT_ROLE = 'CLIENT';

export const DEFAULT_CLIENT_PERMISSIONS: readonly string[] = [
  'documents:create',
  'documents:read',
  'files:upload',
  'files:download',
  'messages:send',
  'messages:read',
  'tickets:create',
  'tickets:read',
  'tickets:reply',
];
