import { useToastContext } from '../context/ToastContext'

export const useToast = () => {
  const { toast } = useToastContext()
  return toast
}
