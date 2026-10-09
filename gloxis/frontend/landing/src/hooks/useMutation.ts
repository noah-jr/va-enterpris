import { useState, useCallback } from 'react'
import { httpService } from '../services/httpService'
import { useToast } from './useToast'

export interface UseMutationOptions<TData, TVariables> {
  onSuccess?: (data: TData, variables: TVariables) => void
  onError?: (errMessage: string, variables: TVariables) => void
  successMessage?: string
  showSuccessToast?: boolean
  showErrorToast?: boolean
}

export interface UseMutationResult<TData, TVariables> {
  mutate: (variables: TVariables) => Promise<TData | null>
  loading: boolean
  error: string | null
  data: TData | null
  reset: () => void
}

export function useMutation<TData, TVariables = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: UseMutationOptions<TData, TVariables> = {}
): UseMutationResult<TData, TVariables> {
  const {
    onSuccess,
    onError,
    successMessage,
    showSuccessToast = true,
    showErrorToast = true
  } = options

  const [data, setData] = useState<TData | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const toast = useToast()

  const reset = useCallback(() => {
    setData(null)
    setLoading(false)
    setError(null)
  }, [])

  const mutate = useCallback(
    async (variables: TVariables): Promise<TData | null> => {
      setLoading(true)
      setError(null)
      try {
        const result = await mutationFn(variables)
        setData(result)

        if (showSuccessToast && successMessage) {
          toast.success(successMessage)
        }

        if (onSuccess) {
          onSuccess(result, variables)
        }

        return result
      } catch (err: unknown) {
        const msg = httpService.extractErrorMessage(err)
        setError(msg)

        if (showErrorToast) {
          toast.error(msg)
        }

        if (onError) {
          onError(msg, variables)
        }

        return null
      } finally {
        setLoading(false)
      }
    },
    [mutationFn, onSuccess, onError, successMessage, showSuccessToast, showErrorToast, toast]
  )

  return { mutate, loading, error, data, reset }
}
