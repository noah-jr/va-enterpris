import { useContext } from 'react'
import { ToastContext } from '../context/ToastContext'

export const useToastContext = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToastContext deve ser utilizado dentro de um ToastProvider')
  }
  return context
}

export const useToast = () => {
  const { toast } = useToastContext()
  return toast
}
