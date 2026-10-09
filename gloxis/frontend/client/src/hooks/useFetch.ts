import { useState, useEffect, useCallback, useRef } from 'react'
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

  const optionsRef = useRef({ onSuccess, onError, config })
  useEffect(() => {
    optionsRef.current = { onSuccess, onError, config }
  })

  const [data, setData] = useState<T | null>(initialData)
  const [loading, setLoading] = useState<boolean>(autoFetch)
  const [error, setError] = useState<string | null>(null)
  const toast = useToast()

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await httpService.get<T>(url, optionsRef.current.config)
      setData(response.data)
      if (optionsRef.current.onSuccess) optionsRef.current.onSuccess(response.data)
    } catch (err: unknown) {
      const msg = httpService.extractErrorMessage(err)
      setError(msg)
      if (showErrorToast) {
        toast.error(msg, 'Erro ao carregar dados')
      }
      if (optionsRef.current.onError) optionsRef.current.onError(msg)
    } finally {
      setLoading(false)
    }
  }, [url, showErrorToast, toast])

  useEffect(() => {
    if (autoFetch) {
      fetchData()
    }
  }, [autoFetch, fetchData])

  return { data, loading, error, refetch: fetchData }
}
