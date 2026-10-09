/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

const placeholder: any = {}

const routes = {
  'auth.new_account.store': {
    methods: ["POST"],
    pattern: '/api/v1/auth/signup',
    tokens: [{"old":"/api/v1/auth/signup","type":0,"val":"api","end":""},{"old":"/api/v1/auth/signup","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/signup","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/signup","type":0,"val":"signup","end":""}],
    types: placeholder as Registry['auth.new_account.store']['types'],
  },
  'auth.access_tokens.store': {
    methods: ["POST"],
    pattern: '/api/v1/auth/login',
    tokens: [{"old":"/api/v1/auth/login","type":0,"val":"api","end":""},{"old":"/api/v1/auth/login","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/login","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['auth.access_tokens.store']['types'],
  },
  'auth.access_tokens.refresh': {
    methods: ["POST"],
    pattern: '/api/v1/auth/refresh',
    tokens: [{"old":"/api/v1/auth/refresh","type":0,"val":"api","end":""},{"old":"/api/v1/auth/refresh","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/refresh","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/refresh","type":0,"val":"refresh","end":""}],
    types: placeholder as Registry['auth.access_tokens.refresh']['types'],
  },
  'auth.forgotPassword': {
    methods: ["POST"],
    pattern: '/api/v1/auth/forgot-password',
    tokens: [{"old":"/api/v1/auth/forgot-password","type":0,"val":"api","end":""},{"old":"/api/v1/auth/forgot-password","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/forgot-password","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/forgot-password","type":0,"val":"forgot-password","end":""}],
    types: placeholder as Registry['auth.forgotPassword']['types'],
  },
  'auth.resetPassword': {
    methods: ["POST"],
    pattern: '/api/v1/auth/reset-password',
    tokens: [{"old":"/api/v1/auth/reset-password","type":0,"val":"api","end":""},{"old":"/api/v1/auth/reset-password","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/reset-password","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/reset-password","type":0,"val":"reset-password","end":""}],
    types: placeholder as Registry['auth.resetPassword']['types'],
  },
  'profile.profile.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/account/profile',
    tokens: [{"old":"/api/v1/account/profile","type":0,"val":"api","end":""},{"old":"/api/v1/account/profile","type":0,"val":"v1","end":""},{"old":"/api/v1/account/profile","type":0,"val":"account","end":""},{"old":"/api/v1/account/profile","type":0,"val":"profile","end":""}],
    types: placeholder as Registry['profile.profile.show']['types'],
  },
  'profile.access_tokens.destroy': {
    methods: ["POST"],
    pattern: '/api/v1/account/logout',
    tokens: [{"old":"/api/v1/account/logout","type":0,"val":"api","end":""},{"old":"/api/v1/account/logout","type":0,"val":"v1","end":""},{"old":"/api/v1/account/logout","type":0,"val":"account","end":""},{"old":"/api/v1/account/logout","type":0,"val":"logout","end":""}],
    types: placeholder as Registry['profile.access_tokens.destroy']['types'],
  },
  'profile.generate2fa': {
    methods: ["POST"],
    pattern: '/api/v1/account/2fa/generate',
    tokens: [{"old":"/api/v1/account/2fa/generate","type":0,"val":"api","end":""},{"old":"/api/v1/account/2fa/generate","type":0,"val":"v1","end":""},{"old":"/api/v1/account/2fa/generate","type":0,"val":"account","end":""},{"old":"/api/v1/account/2fa/generate","type":0,"val":"2fa","end":""},{"old":"/api/v1/account/2fa/generate","type":0,"val":"generate","end":""}],
    types: placeholder as Registry['profile.generate2fa']['types'],
  },
  'profile.enable2fa': {
    methods: ["POST"],
    pattern: '/api/v1/account/2fa/enable',
    tokens: [{"old":"/api/v1/account/2fa/enable","type":0,"val":"api","end":""},{"old":"/api/v1/account/2fa/enable","type":0,"val":"v1","end":""},{"old":"/api/v1/account/2fa/enable","type":0,"val":"account","end":""},{"old":"/api/v1/account/2fa/enable","type":0,"val":"2fa","end":""},{"old":"/api/v1/account/2fa/enable","type":0,"val":"enable","end":""}],
    types: placeholder as Registry['profile.enable2fa']['types'],
  },
  'profile.disable2fa': {
    methods: ["POST"],
    pattern: '/api/v1/account/2fa/disable',
    tokens: [{"old":"/api/v1/account/2fa/disable","type":0,"val":"api","end":""},{"old":"/api/v1/account/2fa/disable","type":0,"val":"v1","end":""},{"old":"/api/v1/account/2fa/disable","type":0,"val":"account","end":""},{"old":"/api/v1/account/2fa/disable","type":0,"val":"2fa","end":""},{"old":"/api/v1/account/2fa/disable","type":0,"val":"disable","end":""}],
    types: placeholder as Registry['profile.disable2fa']['types'],
  },
  'profile.generateApiKey': {
    methods: ["POST"],
    pattern: '/api/v1/account/api-keys',
    tokens: [{"old":"/api/v1/account/api-keys","type":0,"val":"api","end":""},{"old":"/api/v1/account/api-keys","type":0,"val":"v1","end":""},{"old":"/api/v1/account/api-keys","type":0,"val":"account","end":""},{"old":"/api/v1/account/api-keys","type":0,"val":"api-keys","end":""}],
    types: placeholder as Registry['profile.generateApiKey']['types'],
  },
  'profile.listApiKeys': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/account/api-keys',
    tokens: [{"old":"/api/v1/account/api-keys","type":0,"val":"api","end":""},{"old":"/api/v1/account/api-keys","type":0,"val":"v1","end":""},{"old":"/api/v1/account/api-keys","type":0,"val":"account","end":""},{"old":"/api/v1/account/api-keys","type":0,"val":"api-keys","end":""}],
    types: placeholder as Registry['profile.listApiKeys']['types'],
  },
  'profile.revokeApiKey': {
    methods: ["DELETE"],
    pattern: '/api/v1/account/api-keys/:id',
    tokens: [{"old":"/api/v1/account/api-keys/:id","type":0,"val":"api","end":""},{"old":"/api/v1/account/api-keys/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/account/api-keys/:id","type":0,"val":"account","end":""},{"old":"/api/v1/account/api-keys/:id","type":0,"val":"api-keys","end":""},{"old":"/api/v1/account/api-keys/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['profile.revokeApiKey']['types'],
  },
  'solicitacao_credito.create': {
    methods: ["POST"],
    pattern: '/api/v1/solicitacoes',
    tokens: [{"old":"/api/v1/solicitacoes","type":0,"val":"api","end":""},{"old":"/api/v1/solicitacoes","type":0,"val":"v1","end":""},{"old":"/api/v1/solicitacoes","type":0,"val":"solicitacoes","end":""}],
    types: placeholder as Registry['solicitacao_credito.create']['types'],
  },
  'solicitacao_credito.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/solicitacoes',
    tokens: [{"old":"/api/v1/solicitacoes","type":0,"val":"api","end":""},{"old":"/api/v1/solicitacoes","type":0,"val":"v1","end":""},{"old":"/api/v1/solicitacoes","type":0,"val":"solicitacoes","end":""}],
    types: placeholder as Registry['solicitacao_credito.index']['types'],
  },
  'solicitacao_credito.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/solicitacoes/:id',
    tokens: [{"old":"/api/v1/solicitacoes/:id","type":0,"val":"api","end":""},{"old":"/api/v1/solicitacoes/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/solicitacoes/:id","type":0,"val":"solicitacoes","end":""},{"old":"/api/v1/solicitacoes/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['solicitacao_credito.show']['types'],
  },
  'solicitacao_credito.update_status': {
    methods: ["PATCH"],
    pattern: '/api/v1/solicitacoes/:id/status',
    tokens: [{"old":"/api/v1/solicitacoes/:id/status","type":0,"val":"api","end":""},{"old":"/api/v1/solicitacoes/:id/status","type":0,"val":"v1","end":""},{"old":"/api/v1/solicitacoes/:id/status","type":0,"val":"solicitacoes","end":""},{"old":"/api/v1/solicitacoes/:id/status","type":1,"val":"id","end":""},{"old":"/api/v1/solicitacoes/:id/status","type":0,"val":"status","end":""}],
    types: placeholder as Registry['solicitacao_credito.update_status']['types'],
  },
  'solicitacao_credito.upload_documento': {
    methods: ["POST"],
    pattern: '/api/v1/solicitacoes/:id/documentos',
    tokens: [{"old":"/api/v1/solicitacoes/:id/documentos","type":0,"val":"api","end":""},{"old":"/api/v1/solicitacoes/:id/documentos","type":0,"val":"v1","end":""},{"old":"/api/v1/solicitacoes/:id/documentos","type":0,"val":"solicitacoes","end":""},{"old":"/api/v1/solicitacoes/:id/documentos","type":1,"val":"id","end":""},{"old":"/api/v1/solicitacoes/:id/documentos","type":0,"val":"documentos","end":""}],
    types: placeholder as Registry['solicitacao_credito.upload_documento']['types'],
  },
  'solicitacao_credito.list_by_cliente': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/clientes/:clienteId/solicitacoes',
    tokens: [{"old":"/api/v1/clientes/:clienteId/solicitacoes","type":0,"val":"api","end":""},{"old":"/api/v1/clientes/:clienteId/solicitacoes","type":0,"val":"v1","end":""},{"old":"/api/v1/clientes/:clienteId/solicitacoes","type":0,"val":"clientes","end":""},{"old":"/api/v1/clientes/:clienteId/solicitacoes","type":1,"val":"clienteId","end":""},{"old":"/api/v1/clientes/:clienteId/solicitacoes","type":0,"val":"solicitacoes","end":""}],
    types: placeholder as Registry['solicitacao_credito.list_by_cliente']['types'],
  },
} as const satisfies Record<string, AdonisEndpoint>

export { routes }

export const registry = {
  routes,
  $tree: {} as ApiDefinition,
}

declare module '@tuyau/core/types' {
  export interface UserRegistry {
    routes: typeof routes
    $tree: ApiDefinition
  }
}
