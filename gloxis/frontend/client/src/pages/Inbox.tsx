import { Mail, MailOpen, Send, Plus, X, Paperclip, RefreshCw, MessageSquare, AlertCircle } from 'lucide-react'
import { useInbox } from '../hooks/useInbox'
import type { MensagemInbox } from '../types'

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'agora mesmo'
  if (m < 60) return `há ${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `há ${h}h`
  return new Date(d).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' })
}

export function Inbox() {
  const {
    mensagens,
    loading,
    showModal,
    setShowModal,
    selected,
    setSelected,
    assunto,
    setAssunto,
    conteudo,
    setConteudo,
    anexo,
    setAnexo,
    enviando,
    error,
    setError,
    carregar,
    marcarLida,
    handleEnviar,
    unreadCount,
  } = useInbox()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-white">Caixa de Mensagens</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            {unreadCount > 0 ? <strong className="text-rose-600 dark:text-rose-400">{unreadCount} não lida{unreadCount > 1 ? 's' : ''} · </strong> : ''}
            Comunicação directa com a equipa Gloxis.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 px-3 py-2 text-xs font-bold uppercase tracking-wider cursor-pointer transition-all" onClick={carregar} disabled={loading}>
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          </button>
          <button className="bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-xs px-4 py-2 uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer" onClick={() => setShowModal(true)}>
            <Plus size={15} /> Nova Mensagem
          </button>
        </div>
      </div>

      {/* Split view */}
      <div className={`grid grid-cols-1 ${selected ? 'md:grid-cols-12' : ''} gap-6`}>
        {/* Message list */}
        <div className={`${selected ? 'md:col-span-5' : 'w-full'} bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-2xs`}>
          {loading ? (
            <div className="flex justify-center p-12">
              <div className="spinner" />
            </div>
          ) : mensagens.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 mx-auto">
                <MessageSquare size={24} />
              </div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Sem mensagens</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Envie uma mensagem para a equipa Gloxis.</p>
              <button className="inline-flex items-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold text-xs px-4 py-2 uppercase tracking-wider mt-2 cursor-pointer" onClick={() => setShowModal(true)}>
                <Plus size={14} /> Nova Mensagem
              </button>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {mensagens.map((msg: MensagemInbox) => (
                <div
                  key={msg.id}
                  onClick={() => marcarLida(msg)}
                  className={`p-3.5 cursor-pointer transition-colors border-l-2 ${
                    selected?.id === msg.id 
                      ? 'bg-zinc-100 dark:bg-zinc-800 border-zinc-900 dark:border-white' 
                      : msg.lida 
                      ? 'bg-white dark:bg-zinc-900 border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800/40' 
                      : 'bg-zinc-50 dark:bg-zinc-800/60 border-indigo-600 dark:border-indigo-400 font-bold'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="w-7 h-7 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300 shrink-0">
                        {msg.lida ? <MailOpen size={14} /> : <Mail size={14} className="text-indigo-600 dark:text-indigo-400" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`text-xs truncate ${msg.lida ? 'font-medium text-zinc-700 dark:text-zinc-300' : 'font-extrabold text-zinc-900 dark:text-white'}`}>
                          {msg.assunto}
                        </p>
                        <p className="text-[11px] text-zinc-400 truncate">{msg.conteudo}</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-zinc-400 font-mono shrink-0">{timeAgo(msg.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Message detail */}
        {selected && (
          <div className="md:col-span-7 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 space-y-4 shadow-2xs">
            <div className="flex justify-between items-start border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-zinc-900 dark:text-white">{selected.assunto}</h3>
                <p className="text-xs text-zinc-400 mt-1">
                  De: <strong className="text-zinc-700 dark:text-zinc-300">{selected.remetenteNome}</strong> · {timeAgo(selected.created_at)}
                </p>
              </div>
              <button onClick={() => setSelected(null)} className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 text-xs leading-relaxed text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap border border-zinc-200/80 dark:border-zinc-700/80 font-mono">
              {selected.conteudo}
            </div>
            {selected.documentoId && (
              <div className="p-3 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center gap-2 text-xs text-zinc-800 dark:text-zinc-200">
                <Paperclip size={14} className="text-zinc-900 dark:text-white" />
                <span className="font-bold">Documento anexado (ID: {selected.documentoId})</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* New Message Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-full max-w-md p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-zinc-900 dark:text-white">Nova Mensagem</h2>
              <button onClick={() => { setShowModal(false); setError('') }} className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2 font-semibold">
                <AlertCircle size={15} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleEnviar} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Assunto</label>
                <input
                  className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-2 text-xs text-zinc-900 dark:text-white"
                  placeholder="Descreva o motivo..."
                  value={assunto}
                  onChange={e => setAssunto(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Mensagem</label>
                <textarea
                  className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-2 text-xs text-zinc-900 dark:text-white resize-y"
                  rows={5}
                  placeholder="Escreva a sua mensagem..."
                  value={conteudo}
                  onChange={e => setConteudo(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Anexo <span className="text-zinc-400 font-normal">(opcional)</span></label>
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-bold uppercase tracking-wider cursor-pointer">
                  <Paperclip size={13} />
                  {anexo ? anexo.name : 'Ficheiro (PDF, JPG, PNG)'}
                  <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={e => setAnexo(e.target.files?.[0] || null)} />
                </label>
                {anexo && (
                  <button type="button" onClick={() => setAnexo(null)} className="ml-2 text-rose-600 text-xs font-bold cursor-pointer inline-flex items-center gap-1">
                    <X size={12} /> Remover
                  </button>
                )}
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" className="flex-1 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 py-2.5 text-xs font-bold uppercase tracking-wider cursor-pointer" onClick={() => { setShowModal(false); setError('') }}>Cancelar</button>
                <button type="submit" className="flex-1 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50" disabled={enviando}>
                  {enviando ? (
                    <span>A enviar...</span>
                  ) : (
                    <><Send size={14} /> Enviar Mensagem</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
