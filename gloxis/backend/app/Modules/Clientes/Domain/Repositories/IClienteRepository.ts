import type {
  CreateClienteDTO,
  UpdateClienteDTO,
  ClienteFilterDTO,
  ClienteKPIDTO,
} from '../../Application/DTOs/ClienteDTOs.js'

export interface IClienteRepository {
  create(cliente: CreateClienteDTO): Promise<any>
  findById(id: number): Promise<any>
  findByNif(nif: string): Promise<any>
  update(id: number, payload: UpdateClienteDTO): Promise<any>
  delete(id: number): Promise<void>
  findAllWithRisk(
    params: ClienteFilterDTO
  ): Promise<{ data: any[]; meta?: Record<string, unknown> }>
  exportData(params: ClienteFilterDTO): Promise<any[]>
  getKpis(): Promise<ClienteKPIDTO>
  findByIdWithDetails(id: number): Promise<any>
  findByUserId(userId: number): Promise<any>
  findDashboardMetrics(userId: number): Promise<Record<string, unknown> | null>
}
