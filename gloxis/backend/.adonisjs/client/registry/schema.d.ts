/* eslint-disable prettier/prettier */
/// <reference path="../manifest.d.ts" />

import type { ExtractBody, ExtractErrorResponse, ExtractQuery, ExtractQueryForGet, ExtractResponse } from '@tuyau/core/types'
import type { InferInput, SimpleError } from '@vinejs/vine/types'

export type ParamValue = string | number | bigint | boolean

export interface Registry {
  'auth.new_account.store': {
    methods: ["POST"]
    pattern: '/api/v1/auth/signup'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/user').signupValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/user').signupValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/new_account_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/new_account_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'auth.access_tokens.store': {
    methods: ["POST"]
    pattern: '/api/v1/auth/login'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/user').loginValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/user').loginValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/access_tokens_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/access_tokens_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'auth.access_tokens.refresh': {
    methods: ["POST"]
    pattern: '/api/v1/auth/refresh'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/access_tokens_controller').default['refresh']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/access_tokens_controller').default['refresh']>>>
    }
  }
  'auth.forgotPassword': {
    methods: ["POST"]
    pattern: '/api/v1/auth/forgot-password'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'auth.resetPassword': {
    methods: ["POST"]
    pattern: '/api/v1/auth/reset-password'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'profile.profile.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/account/profile'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['show']>>>
    }
  }
  'profile.access_tokens.destroy': {
    methods: ["POST"]
    pattern: '/api/v1/account/logout'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/access_tokens_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/access_tokens_controller').default['destroy']>>>
    }
  }
  'profile.generate2fa': {
    methods: ["POST"]
    pattern: '/api/v1/account/2fa/generate'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'profile.enable2fa': {
    methods: ["POST"]
    pattern: '/api/v1/account/2fa/enable'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'profile.disable2fa': {
    methods: ["POST"]
    pattern: '/api/v1/account/2fa/disable'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'profile.generateApiKey': {
    methods: ["POST"]
    pattern: '/api/v1/account/api-keys'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'profile.listApiKeys': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/account/api-keys'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'profile.revokeApiKey': {
    methods: ["DELETE"]
    pattern: '/api/v1/account/api-keys/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'solicitacao_credito.create': {
    methods: ["POST"]
    pattern: '/api/v1/solicitacoes'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#modules/SolicitacaoCredito/Interface/Controllers/SolicitacaoCreditoController').default['create']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#modules/SolicitacaoCredito/Interface/Controllers/SolicitacaoCreditoController').default['create']>>>
    }
  }
  'solicitacao_credito.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/solicitacoes'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#modules/SolicitacaoCredito/Interface/Controllers/SolicitacaoCreditoController').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#modules/SolicitacaoCredito/Interface/Controllers/SolicitacaoCreditoController').default['index']>>>
    }
  }
  'solicitacao_credito.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/solicitacoes/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#modules/SolicitacaoCredito/Interface/Controllers/SolicitacaoCreditoController').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#modules/SolicitacaoCredito/Interface/Controllers/SolicitacaoCreditoController').default['show']>>>
    }
  }
  'solicitacao_credito.update_status': {
    methods: ["PATCH"]
    pattern: '/api/v1/solicitacoes/:id/status'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#modules/SolicitacaoCredito/Interface/Controllers/SolicitacaoCreditoController').default['updateStatus']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#modules/SolicitacaoCredito/Interface/Controllers/SolicitacaoCreditoController').default['updateStatus']>>>
    }
  }
  'solicitacao_credito.upload_documento': {
    methods: ["POST"]
    pattern: '/api/v1/solicitacoes/:id/documentos'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#modules/SolicitacaoCredito/Interface/Controllers/SolicitacaoCreditoController').default['uploadDocumento']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#modules/SolicitacaoCredito/Interface/Controllers/SolicitacaoCreditoController').default['uploadDocumento']>>>
    }
  }
  'solicitacao_credito.list_by_cliente': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/clientes/:clienteId/solicitacoes'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { clienteId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#modules/SolicitacaoCredito/Interface/Controllers/SolicitacaoCreditoController').default['listByCliente']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#modules/SolicitacaoCredito/Interface/Controllers/SolicitacaoCreditoController').default['listByCliente']>>>
    }
  }
}
