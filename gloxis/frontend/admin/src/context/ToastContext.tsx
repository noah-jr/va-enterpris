import React, { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastItem {
  id: string
  type: ToastType
  title?: string
  message: string
  duration?: number
}

interface ToastContextProps {
  toast: {
    success: (message: string, title?: string, duration?: number) => void
    error: (message: string, title?: string, duration?: number) => void
    warning: (message: string, title?: string, duration?: number) => void
    info: (message: string, title?: string, duration?: number) => void
    show: (item: Omit<ToastItem, 'id'>) => void
    remove: (id: string) => void
  }
}

const ToastContext = createContext<ToastContextProps | undefined>(undefined)

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const show = useCallback(({ type, title, message, duration = 4000 }: Omit<ToastItem, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { id, type, title, message, duration }])

    if (duration > 0) {
      setTimeout(() => {
        remove(id)
      }, duration)
    }
  }, [remove])

  const success = useCallback((message: string, title?: string, duration?: number) => {
    show({ type: 'success', title: title || 'Sucesso', message, duration })
  }, [show])

  const error = useCallback((message: string, title?: string, duration?: number) => {
    show({ type: 'error', title: title || 'Erro', message, duration })
  }, [show])

  const warning = useCallback((message: string, title?: string, duration?: number) => {
    show({ type: 'warning', title: title || 'Aviso', message, duration })
  }, [show])

  const info = useCallback((message: string, title?: string, duration?: number) => {
    show({ type: 'info', title: title || 'Informação', message, duration })
  }, [show])

  return (
    <ToastContext.Provider value={{ toast: { success, error, warning, info, show, remove } }}>
      {children}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((item) => (
          <ToastCard key={item.id} item={item} onClose={() => remove(item.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useToastContext = (): ToastContextProps => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToastContext deve ser utilizado dentro de um ToastProvider')
  }
  return context
}

const ToastCard: React.FC<{ item: ToastItem; onClose: () => void }> = ({ item, onClose }) => {
  const styles: Record<ToastType, { bg: string; border: string; iconColor: string; titleColor: string; icon: React.ReactNode }> = {
    success: {
      bg: 'bg-white text-zinc-900 shadow-md',
      border: 'border-emerald-200/80',
      iconColor: 'text-emerald-600 bg-emerald-50',
      titleColor: 'text-zinc-900',
      icon: <CheckCircle2 className="w-5 h-5" />
    },
    error: {
      bg: 'bg-white text-zinc-900 shadow-md',
      border: 'border-rose-200/80',
      iconColor: 'text-rose-600 bg-rose-50',
      titleColor: 'text-zinc-900',
      icon: <XCircle className="w-5 h-5" />
    },
    warning: {
      bg: 'bg-white text-zinc-900 shadow-md',
      border: 'border-amber-200/80',
      iconColor: 'text-amber-600 bg-amber-50',
      titleColor: 'text-zinc-900',
      icon: <AlertTriangle className="w-5 h-5" />
    },
    info: {
      bg: 'bg-white text-zinc-900 shadow-md',
      border: 'border-sky-200/80',
      iconColor: 'text-sky-600 bg-sky-50',
      titleColor: 'text-zinc-900',
      icon: <Info className="w-5 h-5" />
    }
  }

  const currentStyle = styles[item.type]

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border ${currentStyle.border} ${currentStyle.bg} shadow-xl transform transition-all duration-300 animate-slide-in hover:scale-[1.02]`}
    >
      <div className={`p-2 rounded-lg ${currentStyle.iconColor} shrink-0 mt-0.5`}>
        {currentStyle.icon}
      </div>
      <div className="flex-1 min-w-0 pr-2">
        {item.title && <h4 className={`text-sm font-semibold mb-0.5 ${currentStyle.titleColor}`}>{item.title}</h4>}
        <p className="text-xs leading-relaxed opacity-90 break-words">{item.message}</p>
      </div>
      <button
        onClick={onClose}
        className="p-1 rounded-lg hover:bg-white/10 opacity-70 hover:opacity-100 transition-opacity text-current shrink-0"
        aria-label="Fechar"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
