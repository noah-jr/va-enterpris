import React, { useState } from 'react';
import { ShieldCheck, ExternalLink, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { apiPost, ApiRequestError } from '../lib/api';

interface FooterProps {
  clientUrl?: string;
}

export const Footer: React.FC<FooterProps> = ({
  clientUrl = 'http://localhost:5173/auth/login',
}) => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [newsletterError, setNewsletterError] = useState<string | null>(null);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubscribing(true);
    setNewsletterError(null);
    try {
      await apiPost('/newsletter', { email: newsletterEmail });
      setIsSubscribed(true);
    } catch (err) {
      const message =
        err instanceof ApiRequestError
          ? err.message
          : 'Não foi possível subscrever. Tente novamente.';
      setNewsletterError(message);
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <footer className="bg-white dark:bg-zinc-950 text-zinc-500 dark:text-zinc-400 text-xs relative overflow-hidden border-t border-zinc-200/80 dark:border-zinc-800/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          
          {/* Col 1 & 2: Brand Info */}
          <div className="lg:col-span-2 space-y-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center">
                <ShieldCheck className="w-4.5 h-4.5 text-white dark:text-zinc-950" />
              </div>
              <div>
                <div className="font-semibold text-base text-zinc-900 dark:text-white tracking-tight">
                  VA OneGest
                </div>
                <div className="text-[11px] text-zinc-400">
                  Custódia & Tramitação Documental B2B
                </div>
              </div>
            </div>

            <p className="text-zinc-500 dark:text-zinc-400 text-xs leading-relaxed max-w-sm">
              Plataforma empresarial para receber, organizar, analisar e despachar documentos dos seus clientes com segurança, permissões por função e um histórico completo de cada processo.
            </p>

            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-[11px] text-zinc-600 dark:text-zinc-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Sistemas operacionais</span>
              <span className="text-zinc-400">•</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono">SLA 99.98%</span>
            </div>

            <div className="pt-2 space-y-2 max-w-sm">
              <h4 className="font-medium text-zinc-900 dark:text-white text-xs uppercase tracking-wider">
                Fique Atualizado
              </h4>
              {isSubscribed ? (
                <div className="flex items-center gap-2 rounded-md border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-2 text-emerald-600 dark:text-emerald-400 text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Subscrito com sucesso!</span>
                </div>
              ) : (
                <form onSubmit={handleNewsletterSubmit} className="flex items-stretch gap-2">
                  <input
                    type="email"
                    required
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="o-seu-email@empresa.pt"
                    className="flex-1 min-w-0 px-3 py-2 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={isSubscribing}
                    aria-label="Subscrever newsletter"
                    className="shrink-0 px-3 py-2 rounded-md bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 transition-colors disabled:opacity-50 flex items-center justify-center"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
              {newsletterError && (
                <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400 text-[11px]">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{newsletterError}</span>
                </div>
              )}
            </div>
          </div>

          {/* Col 3: Plataforma */}
          <div className="space-y-2.5">
            <h4 className="font-medium text-zinc-900 dark:text-white text-xs uppercase tracking-wider">
              Plataforma
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <a href="#funcionalidades" className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                  Funcionalidades
                </a>
              </li>
              <li>
                <a href="#como-funciona" className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                  Fluxo de Tramitação
                </a>
              </li>
              <li>
                <a href="#seguranca" className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                  Segurança
                </a>
              </li>
              <li>
                <a href="#precos" className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                  Planos e Preços
                </a>
              </li>
              <li>
                <a href="#faq" className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                  Perguntas Frequentes
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Portais & Acesso */}
          <div className="space-y-2.5">
            <h4 className="font-medium text-zinc-900 dark:text-white text-xs uppercase tracking-wider">
              Acesso Direto
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <a
                  href={clientUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-zinc-900 dark:hover:text-white flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400 transition-colors"
                >
                  <span>Portal do Cliente</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              </li>
              <li>
                <a href="#contacto" className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                  Ambiente de Demonstração
                </a>
              </li>
            </ul>
          </div>

          {/* Col 5: Conformidade */}
          <div className="space-y-2.5">
            <h4 className="font-medium text-zinc-900 dark:text-white text-xs uppercase tracking-wider">
              Conformidade
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <a href="#" className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                  Regulamento RGPD / GDPR
                </a>
              </li>
              <li>
                <a href="#" className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                  Termos de Utilização B2B
                </a>
              </li>
              <li>
                <a href="#" className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                  Política de Privacidade
                </a>
              </li>
              <li>
                <a href="#" className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                  Livro de Reclamações Online
                </a>
              </li>
              <li>
                <a href="#" className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                  Relatório de Transparência
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-6 mt-2 border-t border-zinc-200/60 dark:border-zinc-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-400">
          <div>
            © 2026 VA OneGest. Todos os direitos reservados.
          </div>
          <div className="flex items-center gap-3">
            <span>Versão 2.4.0</span>
            <span>•</span>
            <span className="text-emerald-500 font-medium">Documentos Sempre Protegidos</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
