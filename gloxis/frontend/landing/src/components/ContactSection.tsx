import { useState, type FormEvent } from 'react'
import { Send, Mail, Phone, MapPin, CheckCircle2, AlertCircle, Loader2, MessageSquare } from 'lucide-react'
import { api } from '../api'

export function ContactSection() {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    assunto: 'Linhas de Microcrédito Estatal',
    mensagem: ''
  })

  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [protocolo, setProtocolo] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSuccessMsg(null)
    setErrorMsg(null)

    try {
      const res = await api.post('/contacto', formData)
      if (res.data?.success) {
        setSuccessMsg(res.data.message || 'Mensagem enviada com sucesso!')
        setProtocolo(res.data.data?.protocolo || null)
        setFormData({
          nome: '',
          email: '',
          telefone: '',
          assunto: 'Linhas de Microcrédito Estatal',
          mensagem: ''
        })
      } else {
        setErrorMsg(res.data?.error || 'Não foi possível enviar a mensagem.')
      }
    } catch (err: any) {
      const apiError = err?.response?.data?.error || 'Falha de ligação ao servidor. Por favor, tente novamente.'
      setErrorMsg(apiError)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="contacto-form" className="py-16 px-6 bg-white border-b border-zinc-200" data-testid="contact-section">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-start">
        
        {/* Left Column: Institutional Info & Channels */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-900 bg-zinc-100 border border-zinc-300 px-3 py-0.5 rounded inline-flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-zinc-700" />
              <span>Canais de Atendimento Oficial</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 leading-tight">
              Fale com a Equipa de Apoio ao Cidadão
            </h2>
            <p className="text-zinc-600 text-xs sm:text-sm leading-relaxed font-medium">
              Envie-nos as suas dúvidas, pedidos de apoio a candidaturas ou questões sobre conformidade legal. Toda a comunicação é registada na área administrativa e notificada por e-mail.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex items-start gap-3.5 p-4 rounded border border-zinc-200 bg-zinc-50">
              <div className="p-2.5 bg-zinc-900 text-white rounded shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-zinc-900 uppercase">Linha Direta BNA / MINFIN</h4>
                <p className="text-xs text-zinc-600 font-semibold mt-0.5">+244 222 692 000</p>
                <p className="text-[10px] text-zinc-500 font-normal">Segunda a Sexta, das 08h00 às 16h30</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-4 rounded border border-zinc-200 bg-zinc-50">
              <div className="p-2.5 bg-zinc-900 text-white rounded shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-zinc-900 uppercase">Correio Eletrónico Institucional</h4>
                <p className="text-xs text-zinc-600 font-semibold mt-0.5">apoio@gloxis.gov.ao</p>
                <p className="text-[10px] text-zinc-500 font-normal">Resposta oficial no prazo máximo de 24 horas úteis</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-4 rounded border border-zinc-200 bg-zinc-50">
              <div className="p-2.5 bg-zinc-900 text-white rounded shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-zinc-900 uppercase">Sede Central do Balcão</h4>
                <p className="text-xs text-zinc-600 font-semibold mt-0.5">Torre Gloxis, Avenida 4 de Fevereiro</p>
                <p className="text-[10px] text-zinc-500 font-normal">Marginal de Luanda, República de Angola</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Contact Form */}
        <div className="lg:col-span-7 bg-zinc-50 p-6 sm:p-8 rounded border border-zinc-200 shadow-xs">
          <h3 className="text-lg font-extrabold text-zinc-900 mb-1">Formulário de Mensagem Direta</h3>
          <p className="text-xs text-zinc-600 mb-6 font-medium">
            Preencha os seus dados de contacto para dar entrada do pedido no sistema.
          </p>

          {successMsg && (
            <div data-testid="contact-success-alert" className="mb-6 p-4 bg-emerald-50 border border-emerald-300 rounded text-emerald-900 text-xs space-y-1">
              <div className="flex items-center gap-2 font-bold text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Submissão Registada com Sucesso!</span>
              </div>
              <p className="text-emerald-700">{successMsg}</p>
              {protocolo && (
                <p className="font-mono text-[11px] font-bold text-emerald-900 pt-1">
                  N.º de Protocolo: <span className="bg-emerald-200/70 px-1.5 py-0.5 rounded">{protocolo}</span>
                </p>
              )}
            </div>
          )}

          {errorMsg && (
            <div data-testid="contact-error-alert" className="mb-6 p-4 bg-rose-50 border border-rose-300 rounded text-rose-900 text-xs flex items-center gap-2 font-bold">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" data-testid="contact-form">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-900 uppercase tracking-tight mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  data-testid="contact-input-nome"
                  placeholder="Ex: Manuel António"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-zinc-300 rounded text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-900 uppercase tracking-tight mb-1">
                  Endereço de E-mail *
                </label>
                <input
                  type="email"
                  required
                  data-testid="contact-input-email"
                  placeholder="Ex: cidadao@exemplo.ao"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-zinc-300 rounded text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 font-medium"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-900 uppercase tracking-tight mb-1">
                  Número de Telemóvel
                </label>
                <input
                  type="tel"
                  data-testid="contact-input-telefone"
                  placeholder="Ex: 923 000 000"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-zinc-300 rounded text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-900 uppercase tracking-tight mb-1">
                  Assunto da Mensagem *
                </label>
                <select
                  data-testid="contact-select-assunto"
                  value={formData.assunto}
                  onChange={(e) => setFormData({ ...formData, assunto: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-zinc-300 rounded text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 font-medium"
                >
                  <option value="Linhas de Microcrédito Estatal">Linhas de Microcrédito Estatal</option>
                  <option value="Apoio a PMEs e Empreendedores">Apoio a PMEs e Empreendedores</option>
                  <option value="Acompanhamento de Candidatura">Acompanhamento de Candidatura</option>
                  <option value="Serviços Kwik & Multicaixa">Serviços Kwik & Multicaixa</option>
                  <option value="Reclamação ou Sugestão BNA">Reclamação ou Sugestão BNA</option>
                  <option value="Outro Assunto Geral">Outro Assunto Geral</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-900 uppercase tracking-tight mb-1">
                Mensagem Detalhada *
              </label>
              <textarea
                required
                rows={4}
                data-testid="contact-textarea-mensagem"
                placeholder="Escreva aqui a sua mensagem ou pedido de informação..."
                value={formData.mensagem}
                onChange={(e) => setFormData({ ...formData, mensagem: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-zinc-300 rounded text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              data-testid="contact-submit-btn"
              className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-extrabold text-xs py-3 px-6 rounded uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>A enviar mensagem ao Admin...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 text-white" />
                  <span>Enviar Mensagem & Notificar por E-mail</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
