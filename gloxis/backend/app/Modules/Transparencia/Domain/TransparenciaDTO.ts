export interface MetricaDTO {
  id?: number
  chave: string
  label: string
  val: string
  ordem?: number
}

export interface DocumentoDTO {
  id?: number
  title: string
  date: string
  size?: string | null
  categoria?: string
  fileUrl: string
  ordem?: number
  ativo?: boolean
}

export interface TransparenciaPublicResponse {
  metricas: MetricaDTO[]
  documentos: DocumentoDTO[]
}
