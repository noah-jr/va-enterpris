import { createContext } from 'react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastItem {
  id: string
  type: ToastType
  title?: string
  message: string
  duration?: number
}

export interface ToastContextProps {
  toast: {
    success: (message: string, title?: string, duration?: number) => void
    error: (message: string, title?: string, duration?: number) => void
    warning: (message: string, title?: string, duration?: number) => void
    info: (message: string, title?: string, duration?: number) => void
    show: (item: Omit<ToastItem, 'id'>) => void
    remove: (id: string) => void
  }
}

export const ToastContext = createContext<ToastContextProps | undefined>(undefined)
