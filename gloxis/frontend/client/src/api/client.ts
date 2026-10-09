import { httpService } from '../services/httpService'

export { httpService }

const clientInstance = httpService.getClient()
export const api = Object.assign(clientInstance, {
  getApiUrl: (endpoint?: string | null) => httpService.getApiUrl(endpoint),
  getFileUrl: (path?: string | null) => httpService.getFileUrl(path),
  downloadFile: (endpoint: string, filename?: string) => httpService.downloadFile(endpoint, filename),
})

