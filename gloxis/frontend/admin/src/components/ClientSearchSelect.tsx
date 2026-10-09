import { useState, useEffect, useRef } from 'react'
import { Search, X, Check, Loader2, ChevronDown } from 'lucide-react'
import { api } from '../api/client'
import { Avatar } from './Avatar'

export interface ClienteOption {
  id: number
  nome: string
  nif: string
  email?: string
  telefone?: string
  risco?: 'BAIXO' | 'MEDIO' | 'ALTO'
  scoreCredito?: number
  fotografia?: string
  logotipo?: string
}

interface ClientSearchSelectProps {
  value: number | string | null
  onChange: (cliente: ClienteOption | null) => void
  placeholder?: string
  label?: string
  required?: boolean
  disabled?: boolean
  error?: string
  className?: string
}

export function ClientSearchSelect({
  value,
  onChange,
  placeholder = "Pesquisar por Nome, NIF, E-mail ou Telefone...",
  label,
  required = false,
  disabled = false,
  error,
  className = ""
}: ClientSearchSelectProps) {
  const [query, setQuery] = useState('')
  const [options, setOptions] = useState<ClienteOption[]>([])
  const [selectedClient, setSelectedClient] = useState<ClienteOption | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Carregar dados iniciais e quando 'value' muda externamente
  useEffect(() => {
    if (value) {
      // Se tivermos um ID numérico, buscar o cliente específico do backend se não tivermos selecionado ainda
      if (typeof value === 'number' || (typeof value === 'string' && value.trim() !== '' && !isNaN(Number(value)))) {
        const clienteId = Number(value)
        if (!selectedClient || selectedClient.id !== clienteId) {
          api.get(`/clientes/${clienteId}`)
            .then(res => {
              const data = res.data.data !== undefined ? res.data.data : res.data
              if (data && data.id) {
                setSelectedClient(data)
              }
            })
            .catch(() => {})
        }
      }
    } else {
      setSelectedClient(null)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  // Pesquisa com Debounce no backend
  useEffect(() => {
    if (!isOpen) return

    const timer = setTimeout(() => {
      setLoading(true)
      api.get('/clientes', { params: { search: query, perPage: 15 } })
        .then(res => {
          const payload = res.data
          const items = Array.isArray(payload) ? payload : (payload.data || [])
          setOptions(items)
        })
        .catch(err => {
          console.error("Erro na busca remota de clientes:", err)
          setOptions([])
        })
        .finally(() => setLoading(false))
    }, 250)

    return () => clearTimeout(timer)
  }, [query, isOpen])

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (client: ClienteOption) => {
    setSelectedClient(client)
    onChange(client)
    setIsOpen(false)
    setQuery('')
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedClient(null)
    onChange(null)
    setQuery('')
  }

  const getRiscoBadge = (risco?: string) => {
    switch (risco) {
      case 'BAIXO': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
      case 'MEDIO': return 'bg-amber-500/10 text-amber-400 border-amber-500/30'
      case 'ALTO': return 'bg-rose-500/10 text-rose-400 border-rose-500/30'
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/30'
    }
  }

  return (
    <div className={`relative w-full ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-1.5 flex items-center justify-between">
          <span>{label} {required && <span className="text-red-400">*</span>}</span>
          {selectedClient && (
            <span className="text-[10px] text-blue-400 font-mono font-normal">
              #CLI-{selectedClient.id} • NIF: {selectedClient.nif}
            </span>
          )}
        </label>
      )}

      {/* TRIGGER BUTTON / INPUT */}
      <div 
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full bg-[var(--color-background)] border rounded-xl px-3 py-2.5 text-xs text-white flex items-center justify-between cursor-pointer transition-all ${
          error ? 'border-red-500' : isOpen ? 'border-[var(--color-primary)] ring-1 ring-[var(--color-primary)]/50' : 'border-[var(--color-border)] hover:border-white/20'
        } ${disabled ? 'opacity-50 cursor-not-allowed bg-black/40' : ''}`}
      >
        {selectedClient ? (
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <Avatar src={selectedClient.fotografia || selectedClient.logotipo} name={selectedClient.nome} size="sm" />
            <div className="flex items-center gap-2 truncate">
              <span className="font-bold text-white truncate">{selectedClient.nome}</span>
              <span className="text-[10px] font-mono text-[var(--color-text-muted)] shrink-0">({selectedClient.nif})</span>
              {selectedClient.risco && (
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border shrink-0 ${getRiscoBadge(selectedClient.risco)}`}>
                  {selectedClient.risco}
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
            <Search className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
            <span className="truncate">{placeholder}</span>
          </div>
        )}

        <div className="flex items-center gap-1 shrink-0 ml-2">
          {selectedClient && !disabled && (
            <button 
              type="button" 
              onClick={handleClear} 
              className="p-1 hover:bg-white/10 rounded-full text-[var(--color-text-muted)] hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <ChevronDown className={`w-3.5 h-3.5 text-[var(--color-text-muted)] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {error && <p className="text-[10px] text-red-400 mt-1">{error}</p>}

      {/* DROPDOWN MENU */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
          
          {/* SEARCH INPUT */}
          <div className="p-2 border-b border-[var(--color-border)] bg-black/40 flex items-center gap-2">
            <Search className="w-4 h-4 text-[var(--color-text-muted)] shrink-0 ml-2" />
            <input 
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Pesquisar por Nome, NIF, E-mail..."
              className="w-full bg-transparent text-xs text-white placeholder:text-[var(--color-text-muted)] focus:outline-none py-1.5"
            />
            {loading && <Loader2 className="w-3.5 h-3.5 text-[var(--color-primary)] animate-spin shrink-0 mr-2" />}
          </div>

          {/* LIST OF CLIENTS */}
          <div className="max-h-60 overflow-y-auto divide-y divide-[var(--color-border)]/50">
            {loading && options.length === 0 ? (
              <div className="py-6 text-center text-xs text-[var(--color-text-muted)] flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[var(--color-primary)]" /> A pesquisar na base de dados...
              </div>
            ) : options.length === 0 ? (
              <div className="py-6 text-center text-xs text-[var(--color-text-muted)]">
                Nenhum cliente encontrado com "{query}".
              </div>
            ) : (
              options.map(client => {
                const isSelected = selectedClient?.id === client.id
                return (
                  <div
                    key={client.id}
                    onClick={() => handleSelect(client)}
                    className={`p-3 flex items-center justify-between cursor-pointer transition-colors ${
                      isSelected 
                        ? 'bg-[var(--color-primary)]/15 text-white' 
                        : 'hover:bg-white/5 text-white/90'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar src={client.fotografia || client.logotipo} name={client.nome} size="sm" />
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-white truncate flex items-center gap-2">
                          {client.nome}
                          {client.risco && (
                            <span className={`px-1.5 py-0.2 rounded text-[8px] font-bold border ${getRiscoBadge(client.risco)}`}>
                              {client.risco}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-[var(--color-text-muted)] font-mono truncate mt-0.5">
                          NIF: {client.nif} {client.telefone ? `• Tel: ${client.telefone}` : ''} {client.email ? `• ${client.email}` : ''}
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <Check className="w-4 h-4 text-[var(--color-primary)] shrink-0 ml-2" />
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
