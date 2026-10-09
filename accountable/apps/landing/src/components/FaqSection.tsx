import React, { useState } from 'react';
import { Plus } from 'lucide-react';

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Como é garantida a segurança dos ficheiros dos meus clientes?',
      a: 'Cada ficheiro é verificado assim que chega, para confirmar que é o tipo de documento que diz ser. Depois fica guardado num cofre digital encriptado, nunca dentro da base de dados, e só pode ser aberto através de uma ligação segura que expira ao fim de 15 minutos.',
    },
    {
      q: 'O que acontece se um cliente mal-intencionado tentar aceder a um documento por adivinhar o ID?',
      a: 'Nunca assumimos confiança automática. Em cada pedido de acesso, confirmamos se a pessoa autenticada é realmente a dona daquele processo. Tentativas não autorizadas são bloqueadas de imediato e ficam registadas no histórico de auditoria.',
    },
    {
      q: 'Como funciona a separação entre notas internas e respostas aos clientes?',
      a: 'O VA OneGest separa a comunicação em dois canais distintos: as mensagens trocadas com o cliente, e as notas internas, estritamente confidenciais, entre a sua equipa. Os clientes nunca conseguem ver as notas internas, seja lá por onde tentem.',
    },
    {
      q: 'Qual é a política de backups e recuperação em caso de desastre?',
      a: 'A plataforma faz cópias de segurança automáticas de todos os seus dados e documentos, e confirma que cada cópia está intacta. Tudo é gerido centralmente no painel de administração, sem esforço da sua parte.',
    },
    {
      q: 'A plataforma cumpre o Regulamento Geral de Proteção de Dados (RGPD)?',
      a: 'Sim. Recolhemos apenas os dados necessários, protegemos as palavras-passe com encriptação forte, mantemos sessões seguras, e oferecemos retenção controlada e apagamento definitivo de dados sempre que um cliente exerça o direito ao esquecimento.',
    },
    {
      q: 'Os meus clientes externos precisam de instalar algum software?',
      a: 'Não. Os clientes acedem diretamente através do Portal do Cliente Web responsivo (compatível com telemóvel, tablet e desktop), autenticando-se de forma simples e segura para submeter processos, consultar pareceres e descarregar respostas oficiais.',
    },
  ];

  return (
    <section id="faq" className="py-20 sm:py-28 relative border-t border-zinc-200/80 dark:border-zinc-800/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-4 space-y-3 lg:sticky lg:top-32 self-start">
            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-[11px] font-medium uppercase tracking-wider">
              Esclarecimentos
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-900 dark:text-white tracking-tight">
              Tem Dúvidas?
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
              Tudo o que precisa de saber sobre segurança, funcionamento e implementação do
              VA OneGest antes de agendar uma demonstração.
            </p>
          </div>

          <div className="lg:col-span-8 space-y-2.5">
            {faqs.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div
                  key={faq.q}
                  className={`rounded-lg border transition-colors overflow-hidden ${
                    isOpen
                      ? 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 shadow-sm'
                      : 'border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30 hover:border-zinc-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 focus:outline-none"
                  >
                    <span className="font-medium text-xs sm:text-sm text-zinc-900 dark:text-white">{faq.q}</span>
                    <span
                      className={`shrink-0 w-6 h-6 rounded-md flex items-center justify-center transition-all duration-200 ${
                        isOpen
                          ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 rotate-45'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed pt-1 border-t border-zinc-100 dark:border-zinc-900">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
