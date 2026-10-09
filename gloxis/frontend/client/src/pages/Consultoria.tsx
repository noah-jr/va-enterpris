import { HeadphonesIcon, Video, Phone, MessageSquare, CheckCircle, AlertCircle, Calendar } from 'lucide-react'
import { useConsultoria } from '../hooks/useConsultoria'

const TIPOS = [
  { id: 'VIDEOCHAMADA', label: 'Videochamada', icon: Video, desc: 'Reunião por vídeo com um consultor' },
  { id: 'CHAMADA', label: 'Chamada de Voz', icon: Phone, desc: 'Contacto telefónico directo' },
  { id: 'PRESENCIAL', label: 'Presencial', icon: Calendar, desc: 'Visita às nossas instalações' },
  { id: 'MENSAGEM', label: 'Mensagem', icon: MessageSquare, desc: 'Consulta escrita com resposta em 24h' },
]

const ASSUNTOS = [
  'Consulta sobre Crédito', 'Renegociação de Contrato', 'Esclarecimento de Dívida',
  'Plano de Pagamento', 'Informação de Produto', 'Outro',
]

export function Consultoria() {
  const {
    tipo,
    setTipo,
    assunto,
    setAssunto,
    descricao,
    setDescricao,
    data,
    setData,
    hora,
    setHora,
    enviando,
    success,
    setSuccess,
    error,
    handleSubmit,
  } = useConsultoria()

  if (success) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 max-w-md w-full text-center p-8 space-y-5 shadow-xs">
          <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle size={32} />
          </div>
          <h2 className="text-lg font-extrabold text-zinc-900 dark:text-white">Pedido Submetido com Sucesso!</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            O seu pedido de consultoria foi recebido pela equipa Gloxis. Entraremos em contacto em até <strong>24 horas úteis</strong>.
          </p>
          <button className="w-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 py-3 font-bold text-xs uppercase tracking-wider cursor-pointer" onClick={() => setSuccess(false)}>
            Submeter Outro Pedido
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <h1 className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-white">Consultoria Financeira</h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Agende uma sessão com os nossos especialistas financeiros dedicados.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-8 space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2 font-semibold">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Tipo de consultoria */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">Tipo de Sessão</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {TIPOS.map(t => (
                <div
                  key={t.id}
                  onClick={() => setTipo(t.id)}
                  className={`p-3.5 border cursor-pointer transition-all space-y-1.5 ${
                    tipo === t.id
                      ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white'
                      : 'bg-zinc-50 dark:bg-zinc-800/40 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700/80 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <t.icon size={17} className={tipo === t.id ? 'text-white dark:text-zinc-900' : 'text-zinc-500'} />
                    <span className="text-xs font-bold">{t.label}</span>
                  </div>
                  <p className={`text-[11px] ${tipo === t.id ? 'text-zinc-300 dark:text-zinc-600' : 'text-zinc-400'}`}>{t.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Assunto e descrição */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">Detalhes do Pedido</h3>
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Assunto</label>
              <select className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-2.5 text-xs text-zinc-900 dark:text-white font-medium" value={assunto} onChange={e => setAssunto(e.target.value)} required>
                <option value="">Selecione o assunto...</option>
                {ASSUNTOS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Descrição</label>
              <textarea
                className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-2.5 text-xs text-zinc-900 dark:text-white resize-y"
                rows={4}
                placeholder="Descreva o seu pedido com detalhe..."
                value={descricao}
                onChange={e => setDescricao(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Data / hora */}
          {(tipo === 'VIDEOCHAMADA' || tipo === 'CHAMADA' || tipo === 'PRESENCIAL') && (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">Disponibilidade Preferida</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Data</label>
                  <input type="date" className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-2.5 text-xs text-zinc-900 dark:text-white font-mono" value={data} onChange={e => setData(e.target.value)} min={new Date().toISOString().split('T')[0]} />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Hora</label>
                  <input type="time" className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-2.5 text-xs text-zinc-900 dark:text-white font-mono" value={hora} onChange={e => setHora(e.target.value)} min="08:00" max="18:00" />
                </div>
              </div>
              <p className="text-[11px] text-zinc-400 font-medium">Horário de atendimento: Segunda a Sexta, 08h–18h.</p>
            </div>
          )}

          <button type="submit" className="w-full bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 py-3 font-bold text-xs uppercase tracking-wider flex justify-center items-center gap-2 transition-all cursor-pointer shadow-xs disabled:opacity-50" disabled={enviando}>
            {enviando ? (
              <span>A submeter...</span>
            ) : (
              <><HeadphonesIcon size={16} /> Submeter Pedido de Consultoria</>
            )}
          </button>
        </form>

        {/* Info sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-zinc-900 dark:bg-zinc-800 text-white p-6 border border-zinc-800 space-y-3">
            <div className="w-10 h-10 bg-zinc-800 dark:bg-zinc-700 flex items-center justify-center text-white mb-2">
              <HeadphonesIcon size={20} />
            </div>
            <h3 className="font-extrabold text-sm uppercase tracking-wider">Consultor Dedicado</h3>
            <p className="text-xs text-zinc-300 dark:text-zinc-400 leading-relaxed">
              A sua solicitação será atribuída a um consultor especializado nas suas necessidades financeiras.
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">Contacto Directo</h4>
            <div className="space-y-2 text-xs">
              {[
                ['Suporte Geral', 'suporte@gloxis.com'],
                ['WhatsApp', '+244 923 000 000'],
                ['Horário', 'Seg–Sex: 08h–18h'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between border-b border-zinc-100 dark:border-zinc-800 pb-1.5">
                  <span className="text-zinc-400">{k}</span>
                  <span className="font-bold text-zinc-900 dark:text-white">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
