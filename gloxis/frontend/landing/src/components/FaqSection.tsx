import { useState } from 'react'
import { HelpCircle, ChevronDown, PhoneCall } from 'lucide-react'

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const faqs = [
    {
      q: 'Quem tem direito a requerer o microcrédito estatal através do portal?',
      a: 'Todos os cidadãos angolanos com Bilhete de Identidade válido, maiores de 18 anos, empreendedores em nome individual ou PMEs legalmente constituídas na República de Angola.'
    },
    {
      q: 'Quais os comprovativos necessários para instrução do processo?',
      a: 'Bilhete de Identidade atualizado, comprovativo de residência, extrato bancário com IBAN e plano simplificado de aplicação dos fundos solicitados.'
    },
    {
      q: 'Qual é a autoridade responsável pela regulação dos encargos aplicados?',
      a: 'As condições financeiras e taxas bonificadas obedecem estritamente às diretivas do Banco Nacional de Angola (BNA) e aos normativos do Ministério das Finanças.'
    },
    {
      q: 'Como são efetuados os desembolsos e pagamentos de amortização?',
      a: 'Os desembolsos são transferidos diretamente para a conta bancária indicada pelo cidadão. As liquidações podem ser feitas via Kwik, Multicaixa ou débito autorizado.'
    },
    {
      q: 'O cidadão pode requerer a amortização antecipada do apoio concedido?',
      a: 'Sim, a liquidação antecipada é um direito garantido por lei sem aplicação de penalizações indevidas.'
    }
  ]

  return (
    <section id="faq" className="py-16 px-6 bg-zinc-50 border-b border-zinc-200" data-testid="faq-section">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-900 bg-zinc-200 border border-zinc-300 px-3 py-0.5 rounded inline-flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-zinc-700" />
            <span>Guia do Cidadão & Perguntas Frequentes</span>
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900">
            Informação Pública Transparente ao Cidadão
          </h2>
          <p className="text-zinc-600 text-xs sm:text-sm">
            Esclareça as suas dúvidas sobre o enquadramento legal, requisitos e tramitação de processos.
          </p>
        </div>

        {/* FAQ List */}
        <div className="space-y-2.5" data-testid="faq-list">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index
            return (
              <div
                key={index}
                data-testid={`faq-item-${index}`}
                className="bg-white border border-zinc-200 rounded overflow-hidden shadow-xs transition-all"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  data-testid={`faq-button-${index}`}
                  className="w-full flex justify-between items-center p-4 text-left text-xs sm:text-sm font-bold text-zinc-900 hover:text-zinc-700 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-zinc-900 shrink-0 transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div data-testid={`faq-answer-${index}`} className="px-4 pb-4 text-xs text-zinc-700 leading-relaxed border-t border-zinc-200 pt-3 bg-zinc-50 font-medium">
                    {faq.a}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Direct Contact Banner */}
        <div id="contacto" className="bg-zinc-900 text-white p-6 rounded flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm border border-zinc-800">
          <div>
            <h3 className="text-base font-extrabold text-white mb-0.5">Central de Atendimento Direto ao Cidadão</h3>
            <p className="text-xs text-zinc-300">Assistência na instrução de candidaturas e apoio a empreendedores.</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <a
              href="tel:+244222692000"
              data-testid="faq-call-center-btn"
              className="bg-white hover:bg-zinc-100 text-zinc-900 px-4 py-2.5 rounded font-extrabold text-xs flex items-center gap-2 transition-colors uppercase tracking-wider shadow-xs"
            >
              <PhoneCall className="w-4 h-4 text-zinc-900" />
              <span>Linha do Cidadão (+244 222 692 000)</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
