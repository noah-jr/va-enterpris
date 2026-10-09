import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { Phone, Mail, MapPin, ShieldCheck, FileText, Send, CheckCircle2, Loader2 } from 'lucide-react'
import { CLIENT_PORTAL_URL } from '../config/env'
import { api } from '../api'

export function Footer() {
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [statusMsg, setStatusMsg] = useState<string | null>(null)

  const handleNewsletterSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!newsletterEmail) return
    setLoading(true)
    setStatusMsg(null)

    try {
      const res = await api.post('/newsletter', { email: newsletterEmail })
      if (res.data?.success) {
        setStatusMsg('Subscrição efetuada com sucesso!')
        setNewsletterEmail('')
      } else {
        setStatusMsg('Ocorreu um erro ao subscrever.')
      }
    } catch {
      setStatusMsg('Erro de ligação ao servidor.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <footer className="bg-zinc-900 text-white text-xs pt-14 pb-8 border-t border-zinc-800" data-testid="footer-section">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-10">
        
        {/* Col 1: Brand & Institutional Info */}
        <div className="lg:col-span-2 space-y-3.5">
          <div className="flex items-center gap-3">
            <img 
              src="/logo.png" 
              alt="Gloxis Financial Services" 
              className="h-10 w-auto object-contain brightness-0 invert" 
            />
            <div className="border-l border-zinc-700 pl-3">
              <p className="font-extrabold text-white uppercase text-[11px]">Gloxis Financial Services S.A.</p>
              <p className="text-[10px] text-zinc-400 font-semibold">Instituição Regulada BNA</p>
            </div>
          </div>

          <p className="text-zinc-400 text-xs leading-relaxed max-w-sm font-normal">
            Instituição Financeira de Microcrédito autorizada e regulada pelo Banco Nacional de Angola (BNA) no âmbito dos Programas Nacionais de Inclusão Financeira.
          </p>

          {/* Newsletter Box */}
          <div className="pt-2 max-w-sm space-y-2">
            <p className="text-[11px] font-bold text-zinc-300 uppercase">Subscrever Alertas & Normativos BNA</p>
            {statusMsg && (
              <p className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>{statusMsg}</span>
              </p>
            )}
            <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
              <input
                type="email"
                required
                data-testid="footer-newsletter-input"
                placeholder="Introduza o seu e-mail..."
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="bg-zinc-800 border border-zinc-700 rounded px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 flex-1 font-medium"
              />
              <button
                type="submit"
                disabled={loading}
                data-testid="footer-newsletter-btn"
                className="bg-white hover:bg-zinc-100 text-zinc-900 font-extrabold px-3 py-1.5 rounded text-xs uppercase tracking-wider flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              </button>
            </form>
          </div>

          <div className="pt-2 text-[11px] text-zinc-400 space-y-1 font-medium">
            <p className="flex items-center gap-2 text-zinc-300 font-bold">
              <ShieldCheck className="w-4 h-4 text-zinc-300" />
              <span>Chancela BNA / MINFIN Registo N.º 0048-26</span>
            </p>
            <p className="flex items-center gap-2 text-zinc-400">
              <FileText className="w-3.5 h-3.5 text-zinc-400" />
              <span>Conformidade com o Decreto Presidencial n.º 142/24</span>
            </p>
            <p className="text-zinc-500">NIF Estatal: 5417009812 | Registo Comercial N.º 0048-26</p>
          </div>
        </div>

        {/* Col 2: Programas Estatais */}
        <div className="space-y-2.5">
          <h4 className="font-extrabold text-xs text-white uppercase tracking-wider">Programas Públicos</h4>
          <ul className="space-y-2 text-zinc-400 font-medium">
            <li><Link to="/solicitar" data-testid="footer-link-credito-pessoal" className="hover:text-white transition-colors">Microcrédito ao Cidadão</Link></li>
            <li><Link to="/solicitar" data-testid="footer-link-credito-pme" className="hover:text-white transition-colors">Linha de Fomento PME</Link></li>
            <li><Link to="/solicitar" data-testid="footer-link-habitacao" className="hover:text-white transition-colors">Apoio à Habitação Social</Link></li>
            <li><Link to="/solicitar" data-testid="footer-link-contas" className="hover:text-white transition-colors">Contas de Inclusão BNA</Link></li>
            <li><Link to="/solicitar" data-testid="footer-link-cartoes" className="hover:text-white transition-colors">Cartão do Cidadão EMIS</Link></li>
          </ul>
        </div>

        {/* Col 3: Serviços Públicos */}
        <div className="space-y-2.5">
          <h4 className="font-extrabold text-xs text-white uppercase tracking-wider">Serviços Digitais</h4>
          <ul className="space-y-2 text-zinc-400 font-medium">
            <li><a href={CLIENT_PORTAL_URL} data-testid="footer-link-directo" className="hover:text-white transition-colors">Balcão Único Digital</a></li>
            <li><Link to="/solicitar" data-testid="footer-link-kwik" className="hover:text-white transition-colors">Rede Estatal Kwik</Link></li>
            <li><Link to="/transparencia" data-testid="footer-link-validar" className="hover:text-white transition-colors">Validar Documentos Oficial</Link></li>
            <li><Link to="/transparencia" data-testid="footer-link-seguranca" className="hover:text-white transition-colors">Alertas de Segurança BNA</Link></li>
            <li><a href={CLIENT_PORTAL_URL} data-testid="footer-link-portal" className="hover:text-white transition-colors">Portal do Cidadão</a></li>
          </ul>
        </div>

        {/* Col 4: Contactos Oficiais */}
        <div className="space-y-2.5">
          <h4 className="font-extrabold text-xs text-white uppercase tracking-wider">Atendimento Oficial</h4>
          <ul className="space-y-2 text-zinc-400 font-medium">
            <li className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-zinc-400" />
              <a href="tel:+244222692000" data-testid="footer-phone-link" className="hover:text-white">+244 222 692 000</a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-zinc-400" />
              <a href="mailto:apoio@gloxis.gov.ao" data-testid="footer-email-link" className="hover:text-white">apoio@gloxis.gov.ao</a>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
              <span>Torre Gloxis, Avenida 4 de Fevereiro, Marginal de Luanda, Angola</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Copyright Bar */}
      <div className="border-t border-zinc-800 pt-6">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-[11px] text-zinc-400">
          <p>© {new Date().getFullYear()} Gloxis Financial Services S.A.</p>
          <div className="flex space-x-5 font-semibold">
            <Link to="/termos" data-testid="footer-termos-link" className="hover:text-white transition-colors">Termos de Uso</Link>
            <Link to="/transparencia" data-testid="footer-privacidade-link" className="hover:text-white transition-colors">Portal da Transparência</Link>
            <Link to="/transparencia" data-testid="footer-precario-link" className="hover:text-white transition-colors">Normativos BNA</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
