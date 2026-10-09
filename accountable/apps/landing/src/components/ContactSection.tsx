import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, ShieldCheck, MessageCircle, AlertCircle } from 'lucide-react';
import { apiPost, ApiRequestError } from '../lib/api';

const WHATSAPP_NUMBER = '244934819272';
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Olá! Gostaria de saber mais sobre o VA OneGest.')}`;

const VOLUME_TO_MESSAGE_PREFIX: Record<string, string> = {
  '1-100': 'Volume estimado: até 100 processos / mês.',
  '100-500': 'Volume estimado: 100 a 500 processos / mês.',
  '500-2500': 'Volume estimado: 500 a 2.500 processos / mês.',
  '2500+': 'Volume estimado: mais de 2.500 processos / mês.',
};

export const ContactSection: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    volume: '100-500',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    const volumePrefix = VOLUME_TO_MESSAGE_PREFIX[formData.volume] ?? '';
    const trimmedMessage = formData.message.trim();
    const composedMessage = [volumePrefix, trimmedMessage].filter(Boolean).join(' ');
    const finalMessage = composedMessage.length >= 10
      ? composedMessage
      : `${composedMessage} Aguardamos o vosso contacto para mais detalhes.`;

    try {
      await apiPost('/contact', {
        name: formData.name,
        email: formData.email,
        company: formData.company || undefined,
        phone: formData.phone || undefined,
        message: finalMessage,
      });
      setIsSubmitted(true);
    } catch (err) {
      const message =
        err instanceof ApiRequestError
          ? err.message
          : 'Não foi possível enviar o seu pedido. Tente novamente mais tarde.';
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contacto" className="py-20 sm:py-28 relative border-t border-zinc-200/80 dark:border-zinc-800/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30 p-6 sm:p-10 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

            {/* Left Column: Information & Trust */}
            <div className="lg:col-span-5 space-y-5">
              <div className="inline-flex items-center px-2.5 py-0.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-[11px] font-medium uppercase tracking-wider">
                Contacto Institucional
              </div>

              <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-900 dark:text-white tracking-tight">
                Pronto para Elevar a Segurança dos Seus Processos?
              </h2>

              <p className="text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm leading-relaxed">
                Agende uma demonstração técnica guiada com os nossos especialistas ou solicite um ambiente de testes piloto para a sua organização.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm">
                  <div className="p-2 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[11px] text-zinc-400">Email</div>
                    <div className="font-medium text-zinc-900 dark:text-white">vatechcode@gmail.com</div>
                    <div className="text-[10px] text-zinc-500">Resposta em até 24h</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm">
                  <div className="p-2 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[11px] text-zinc-400">Telefone</div>
                    <div className="font-medium text-zinc-900 dark:text-white">+244 934 819 272</div>
                    <div className="text-[10px] text-zinc-500">Seg-Sex, 9h às 18h</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm">
                  <div className="p-2 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[11px] text-zinc-400">Escritório</div>
                    <div className="font-medium text-zinc-900 dark:text-white">Kikagil, Luanda, Angola</div>
                    <div className="text-[10px] text-zinc-500">Visitas por marcação</div>
                  </div>
                </div>

                <a
                  href={WHATSAPP_LINK}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm hover:text-zinc-900 dark:hover:text-white transition-colors"
                >
                  <div className="p-2 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-emerald-500">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[11px] text-zinc-400">WhatsApp</div>
                    <div className="font-medium text-zinc-900 dark:text-white">Falar connosco agora</div>
                  </div>
                </a>
              </div>

              <div className="pt-2 flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Acordo de Confidencialidade (NDA) disponível mediante solicitação.</span>
              </div>
            </div>

            {/* Right Column: Form */}
            <div className="lg:col-span-7">
              <div className="p-6 sm:p-8 rounded-lg border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 relative shadow-sm">
                
                {isSubmitted ? (
                  <div className="py-10 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-medium text-zinc-900 dark:text-white">
                      Pedido de Demonstração Recebido!
                    </h3>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
                      Obrigado pelo seu contacto. A nossa equipa entrará em contacto através do email indicado nas próximas horas.
                    </p>
                    <div className="pt-3">
                      <button
                        type="button"
                        onClick={() => {
                          setIsSubmitted(false);
                          setFormData({ name: '', email: '', company: '', phone: '', volume: '100-500', message: '' });
                        }}
                        className="px-4 py-2 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-200 transition-colors"
                      >
                        Enviar Nova Mensagem
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                          Nome Completo *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Ex: Dra. Ana Silva"
                          className="w-full px-3 py-2 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                          Email Institucional *
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="nome@empresa.pt"
                          className="w-full px-3 py-2 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                          Organização / Empresa *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.company}
                          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                          placeholder="Sociedade de Advogados / Consultora"
                          className="w-full px-3 py-2 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                          Volume Estimado de Processos
                        </label>
                        <select
                          value={formData.volume}
                          onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
                          className="w-full px-3 py-2 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
                        >
                          <option value="1-100">Até 100 processos / mês</option>
                          <option value="100-500">100 a 500 processos / mês</option>
                          <option value="500-2500">500 a 2.500 processos / mês</option>
                          <option value="2500+">Mais de 2.500 processos / mês</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                          Telefone (opcional)
                        </label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+351 912 345 678"
                          className="w-full px-3 py-2 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                        Requisitos ou Questões Específicas
                      </label>
                      <textarea
                        rows={3}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Descreva eventuais integrações necessárias (ERP, faturação, autenticação federada)..."
                        className="w-full px-3 py-2 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors resize-none"
                      />
                    </div>

                    {submitError && (
                      <div className="flex items-start gap-2.5 rounded-md border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 px-3 py-2 text-xs text-red-600 dark:text-red-400">
                        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                        <span>{submitError}</span>
                      </div>
                    )}

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-2.5 px-4 rounded-md bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 font-medium text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <span>A enviar pedido...</span>
                        ) : (
                          <>
                            <span>Solicitar Agendamento de Demonstração</span>
                            <Send className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>

                    <p className="text-[10px] text-zinc-400 text-center">
                      Os seus dados são tratados exclusivamente para o contacto institucional nos termos da nossa Política de Privacidade.
                    </p>
                  </form>
                )}

              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};
