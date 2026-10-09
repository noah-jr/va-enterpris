export interface DocumentoVO {
  tipo: string
  numero: string
  url?: string
  dataEmissao?: string
  dataValidade?: string
}

export interface EnderecoVO {
  provincia: string
  municipio: string
  bairro: string
  rua?: string
  numeroCasa?: string
}

export interface ContaBancariaVO {
  banco: string
  iban: string
  numeroConta?: string
  titular?: string
}
