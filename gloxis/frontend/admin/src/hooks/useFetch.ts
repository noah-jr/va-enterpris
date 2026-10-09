import { useState, useEffect, useCallback } from 'react'
import { httpService, type HttpServiceConfig } from '../services/httpService'
import { useToast } from './useToast'

export interface UseFetchOptions<T> extends HttpServiceConfig {
  autoFetch?: boolean
  initialData?: T | null
  showErrorToast?: boolean
  onSuccess?: (data: T) => void
  onError?: (errMessage: string) => void
}

export interface UseFetchResult<T> {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useFetch<T>(url: string, options: UseFetchOptions<T> = {}): UseFetchResult<T> {
  const {
    autoFetch = true,
    initialData = null,
    showErrorToast = true,
    onSuccess,
    onError,
    ...config
  } = options

  const [data, setData] = useState<T | null>(initialData)
  const [loading, setLoading] = useState<boolean>(autoFetch)
  const [error, setError] = useState<string | null>(null)
  const toast = useToast()

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await httpService.get<T>(url, config)
      setData(response.data)
      if (onSuccess) onSuccess(response.data)
    } catch (err: unknown) {
      const msg = httpService.extractErrorMessage(err)
      setError(msg)
      if (showErrorToast) {
        toast.error(msg, 'Erro ao carregar dados')
      }
      if (onError) onError(msg)
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, showErrorToast, toast])

  useEffect(() => {
    if (autoFetch) {
      fetchData()
    }
  }, [autoFetch, fetchData])

  return { data, loading, error, refetch: fetchData }
}
