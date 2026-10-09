export interface User {
  id?: number
  fullName?: string
  email?: string
  role?: string
}

export interface MensagemInbox {
  id: number
  assunto: string
  conteudo: string
  remetenteNome: string
  remetenteTipo?: string
  destinatarioNome?: string
  destinatarioTipo?: string
  lida: number | boolean
  documentoId?: number
  created_at: string
  updated_at?: string
}

export interface FaturaItem {
  id: number
  numeroFatura: string
  clienteId?: number
  valorTotal: number
  dataEmissao: string
  dataVencimento: string
  status: string
  created_at?: string
}

export interface CreditoParcela {
  id: number
  solicitacaoId: number
  numeroParcela: number
  valor: number
  dataVencimento: string
  status: 'PENDENTE' | 'PAGO' | 'ATRASADO'
  dataPagamento?: string
}

export interface CreditoTimeline {
  parcelas: CreditoParcela[]
  totalPago: number
  totalPendente: number
}

export interface SolicitacaoCredito {
  id: number
  clienteId: number
  valorSolicitado: number
  numParcelas: number
  finalidade?: string
  status: string
  created_at: string
  taxaJurosMensal?: number
  valorTotalGeral?: number
  parcelaMensal?: number
}

export interface DocumentoItem {
  id: number
  nome: string
  tipo: string
  url: string
  status: string
  dataUpload: string
  clienteId?: number
}

export interface UserPerfil {
  id: number
  fullName: string
  email: string
  nif?: string
  phone?: string
  endereco?: string
  tipo?: string
  created_at?: string
}
