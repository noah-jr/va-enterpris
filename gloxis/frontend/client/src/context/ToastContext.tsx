import React, { useState, useCallback } from 'react'
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react'
import { ToastContext } from './ToastContext'
import type { ToastType, ToastItem } from './ToastContext'

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

const ToastCard: React.FC<{ item: ToastItem; onClose: () => void }> = ({ item, onClose }) => {
  const styles: Record<ToastType, { bg: string; border: string; iconColor: string; titleColor: string; icon: React.ReactNode }> = {
    success: {
      bg: 'bg-emerald-950/90 text-emerald-100 backdrop-blur-md shadow-emerald-900/20',
      border: 'border-emerald-500/40',
      iconColor: 'text-emerald-400 bg-emerald-500/10',
      titleColor: 'text-emerald-200',
      icon: <CheckCircle2 className="w-5 h-5" />
    },
    error: {
      bg: 'bg-rose-950/90 text-rose-100 backdrop-blur-md shadow-rose-900/20',
      border: 'border-rose-500/40',
      iconColor: 'text-rose-400 bg-rose-500/10',
      titleColor: 'text-rose-200',
      icon: <XCircle className="w-5 h-5" />
    },
    warning: {
      bg: 'bg-amber-950/90 text-amber-100 backdrop-blur-md shadow-amber-900/20',
      border: 'border-amber-500/40',
      iconColor: 'text-amber-400 bg-amber-500/10',
      titleColor: 'text-amber-200',
      icon: <AlertTriangle className="w-5 h-5" />
    },
    info: {
      bg: 'bg-sky-950/90 text-sky-100 backdrop-blur-md shadow-sky-900/20',
      border: 'border-sky-500/40',
      iconColor: 'text-sky-400 bg-sky-500/10',
      titleColor: 'text-sky-200',
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
