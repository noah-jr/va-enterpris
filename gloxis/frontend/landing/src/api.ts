import { httpService } from './services/httpService'

export { httpService }
export const api = (httpService as any).client

