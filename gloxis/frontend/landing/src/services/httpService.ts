import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'

export interface ApiResponse<T = unknown> {
  data: T
  message?: string
  status: number
  meta?: Record<string, unknown>
}

export interface HttpServiceConfig extends AxiosRequestConfig {
  silent?: boolean
}

const API_URL = import.meta.env.VITE_API_URL

export class HttpService {
  private client: AxiosInstance

  constructor(baseURL: string = API_URL) {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })

    this.setupInterceptors()
  }

  private setupInterceptors(): void {
    // Request Interceptor
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('token')
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error: unknown) => Promise.reject(error)
    )

    // Response Interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: unknown) => {
        return Promise.reject(error)
      }
    )
  }

  public async get<T>(url: string, config?: HttpServiceConfig): Promise<ApiResponse<T>> {
    const response = await this.client.get<T>(url, config)
    return this.formatResponse<T>(response)
  }

  public async post<T, D = unknown>(url: string, data?: D, config?: HttpServiceConfig): Promise<ApiResponse<T>> {
    const response = await this.client.post<T>(url, data, config)
    return this.formatResponse<T>(response)
  }

  public async put<T, D = unknown>(url: string, data?: D, config?: HttpServiceConfig): Promise<ApiResponse<T>> {
    const response = await this.client.put<T>(url, data, config)
    return this.formatResponse<T>(response)
  }

  public async patch<T, D = unknown>(url: string, data?: D, config?: HttpServiceConfig): Promise<ApiResponse<T>> {
    const response = await this.client.patch<T>(url, data, config)
    return this.formatResponse<T>(response)
  }

  public async delete<T>(url: string, config?: HttpServiceConfig): Promise<ApiResponse<T>> {
    const response = await this.client.delete<T>(url, config)
    return this.formatResponse<T>(response)
  }

  public async upload<T>(url: string, formData: FormData, config?: HttpServiceConfig): Promise<ApiResponse<T>> {
    const response = await this.client.post<T>(url, formData, {
      ...config,
      headers: {
        ...config?.headers,
        'Content-Type': 'multipart/form-data'
      }
    })
    return this.formatResponse<T>(response)
  }

  private formatResponse<T>(response: AxiosResponse): ApiResponse<T> {
    const responseData = response.data
    if (responseData && typeof responseData === 'object' && 'data' in responseData) {
      return {
        data: responseData.data as T,
        message: responseData.message,
        meta: responseData.meta,
        status: response.status
      }
    }
    return {
      data: responseData as T,
      status: response.status
    }
  }

  public extractErrorMessage(error: unknown): string {
    if (axios.isAxiosError(error)) {
      return error.response?.data?.message || error.response?.data?.error || error.message || 'Erro ao comunicar com o servidor'
    }
    if (error instanceof Error) {
      return error.message
    }
    return String(error)
  }
}

export const httpService = new HttpService()
