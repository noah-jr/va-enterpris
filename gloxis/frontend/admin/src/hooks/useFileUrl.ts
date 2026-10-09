import { useCallback } from 'react'
import { httpService } from '../services/httpService'

/**
 * Custom hook to resolve API URLs and static file assets.
 * Keeps UI components completely decoupled from direct API service calls.
 */
export function useFileUrl() {
  const getFileUrl = useCallback((path?: string | null): string => {
    return httpService.getFileUrl(path)
  }, [])

  const getApiUrl = useCallback((endpoint?: string | null): string => {
    return httpService.getApiUrl(endpoint)
  }, [])

  const downloadFile = useCallback(async (endpoint: string, filename?: string): Promise<void> => {
    return httpService.downloadFile(endpoint, filename)
  }, [])

  return {
    getFileUrl,
    getApiUrl,
    downloadFile
  }
}
