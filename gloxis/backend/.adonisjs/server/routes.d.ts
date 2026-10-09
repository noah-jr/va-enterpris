import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'auth.new_account.store': { paramsTuple?: []; params?: {} }
    'auth.access_tokens.store': { paramsTuple?: []; params?: {} }
    'auth.access_tokens.refresh': { paramsTuple?: []; params?: {} }
    'auth.forgotPassword': { paramsTuple?: []; params?: {} }
    'auth.resetPassword': { paramsTuple?: []; params?: {} }
    'profile.profile.show': { paramsTuple?: []; params?: {} }
    'profile.access_tokens.destroy': { paramsTuple?: []; params?: {} }
    'profile.generate2fa': { paramsTuple?: []; params?: {} }
    'profile.enable2fa': { paramsTuple?: []; params?: {} }
    'profile.disable2fa': { paramsTuple?: []; params?: {} }
    'profile.generateApiKey': { paramsTuple?: []; params?: {} }
    'profile.listApiKeys': { paramsTuple?: []; params?: {} }
    'profile.revokeApiKey': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'solicitacao_credito.create': { paramsTuple?: []; params?: {} }
    'solicitacao_credito.index': { paramsTuple?: []; params?: {} }
    'solicitacao_credito.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'solicitacao_credito.update_status': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'solicitacao_credito.upload_documento': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'solicitacao_credito.list_by_cliente': { paramsTuple: [ParamValue]; params: {'clienteId': ParamValue} }
  }
  GET: {
    'profile.profile.show': { paramsTuple?: []; params?: {} }
    'profile.listApiKeys': { paramsTuple?: []; params?: {} }
    'solicitacao_credito.index': { paramsTuple?: []; params?: {} }
    'solicitacao_credito.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'solicitacao_credito.list_by_cliente': { paramsTuple: [ParamValue]; params: {'clienteId': ParamValue} }
  }
  HEAD: {
    'profile.profile.show': { paramsTuple?: []; params?: {} }
    'profile.listApiKeys': { paramsTuple?: []; params?: {} }
    'solicitacao_credito.index': { paramsTuple?: []; params?: {} }
    'solicitacao_credito.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'solicitacao_credito.list_by_cliente': { paramsTuple: [ParamValue]; params: {'clienteId': ParamValue} }
  }
  POST: {
    'auth.new_account.store': { paramsTuple?: []; params?: {} }
    'auth.access_tokens.store': { paramsTuple?: []; params?: {} }
    'auth.access_tokens.refresh': { paramsTuple?: []; params?: {} }
    'auth.forgotPassword': { paramsTuple?: []; params?: {} }
    'auth.resetPassword': { paramsTuple?: []; params?: {} }
    'profile.access_tokens.destroy': { paramsTuple?: []; params?: {} }
    'profile.generate2fa': { paramsTuple?: []; params?: {} }
    'profile.enable2fa': { paramsTuple?: []; params?: {} }
    'profile.disable2fa': { paramsTuple?: []; params?: {} }
    'profile.generateApiKey': { paramsTuple?: []; params?: {} }
    'solicitacao_credito.create': { paramsTuple?: []; params?: {} }
    'solicitacao_credito.upload_documento': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  DELETE: {
    'profile.revokeApiKey': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  PUT: {
  }
  PATCH: {
    'solicitacao_credito.update_status': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}