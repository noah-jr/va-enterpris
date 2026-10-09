/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  auth: {
    newAccount: {
      store: typeof routes['auth.new_account.store']
    }
    accessTokens: {
      store: typeof routes['auth.access_tokens.store']
      refresh: typeof routes['auth.access_tokens.refresh']
    }
    forgotPassword: typeof routes['auth.forgotPassword']
    resetPassword: typeof routes['auth.resetPassword']
  }
  profile: {
    profile: {
      show: typeof routes['profile.profile.show']
    }
    accessTokens: {
      destroy: typeof routes['profile.access_tokens.destroy']
    }
    generate2Fa: typeof routes['profile.generate2fa']
    enable2Fa: typeof routes['profile.enable2fa']
    disable2Fa: typeof routes['profile.disable2fa']
    generateApiKey: typeof routes['profile.generateApiKey']
    listApiKeys: typeof routes['profile.listApiKeys']
    revokeApiKey: typeof routes['profile.revokeApiKey']
  }
  solicitacaoCredito: {
    create: typeof routes['solicitacao_credito.create']
    index: typeof routes['solicitacao_credito.index']
    show: typeof routes['solicitacao_credito.show']
    updateStatus: typeof routes['solicitacao_credito.update_status']
    uploadDocumento: typeof routes['solicitacao_credito.upload_documento']
    listByCliente: typeof routes['solicitacao_credito.list_by_cliente']
  }
}
