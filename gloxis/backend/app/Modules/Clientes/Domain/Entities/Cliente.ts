import type {
  DocumentoVO,
  EnderecoVO,
  ContaBancariaVO,
} from '../ValueObjects/ClienteValueObjects.js'

export class Cliente {
  public readonly id: number
  public nome: string
  public nif: string
  public email?: string
  public telefone?: string
  public risco?: string
  public scoreCredito?: number
  public documentos: DocumentoVO[]
  public endereco: EnderecoVO
  public contaBancaria?: ContaBancariaVO

  constructor(
    id: number,
    nome: string,
    nif: string,
    documentos: DocumentoVO[],
    endereco: EnderecoVO,
    contaBancaria?: ContaBancariaVO,
    email?: string,
    telefone?: string,
    risco?: string,
    scoreCredito?: number
  ) {
    this.id = id
    this.nome = nome
    this.nif = nif
    this.documentos = documentos
    this.endereco = endereco
    this.contaBancaria = contaBancaria
    this.email = email
    this.telefone = telefone
    this.risco = risco
    this.scoreCredito = scoreCredito
  }
}
