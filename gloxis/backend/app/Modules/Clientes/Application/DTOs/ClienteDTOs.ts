import type {
  DocumentoVO,
  EnderecoVO,
  ContaBancariaVO,
} from '../../Domain/ValueObjects/ClienteValueObjects.js'

export interface CreateClienteDTO {
  nome: string
  nif: string
  email?: string
  telefone?: string
  documentos?: DocumentoVO[]
  endereco?: EnderecoVO
  contaBancaria?: ContaBancariaVO
  userId?: number
  generatedPassword?: string
}

export interface UpdateClienteDTO {
  nome?: string
  nif?: string
  email?: string
  telefone?: string
  documentos?: DocumentoVO[]
  endereco?: EnderecoVO
  contaBancaria?: ContaBancariaVO
}

export interface ClienteFilterDTO {
  page?: number
  perPage?: number
  search?: string
  status?: string
  risco?: string
}

export interface ClienteKPIDTO {
  totalClientes: number
  clientesAtivos: number
  clientesNaListaNegra: number
  totalInadimplentes: number
}
