import React from 'react';
import { KeyRound, ShieldAlert, Layers, CheckCircle2 } from 'lucide-react';

export const SecuritySection: React.FC = () => {
  const values = [
    {
      icon: KeyRound,
      title: 'Segurança Não-Negociável',
      description:
        'As suas palavras-passe são protegidas com encriptação forte, as sessões expiram e renovam-se automaticamente, e tentativas de acesso suspeitas são bloqueadas em tempo real.',
    },
    {
      icon: ShieldAlert,
      title: 'Verificamos Sempre Quem Está a Aceder',
      description:
        'Nunca assumimos confiança automática: em cada pedido, confirmamos que a pessoa é realmente a dona daquele processo. Ninguém acede a algo só porque sabe onde procurar.',
    },
    {
      icon: Layers,
      title: 'Uma Base Sólida Para o Seu Negócio',
      description:
        'Construída para durar e evoluir com a sua empresa, com padrões rigorosos de qualidade que evitam falhas e mantêm tudo a funcionar de forma consistente.',
    },
  ];

  return (
    <section id="seguranca" className="py-20 sm:py-28 border-t border-zinc-200/80 dark:border-zinc-800/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl space-y-3 mb-16">
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-[11px] font-medium uppercase tracking-wider">
            Segurança
          </div>
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-900 dark:text-white tracking-tight">
            A segurança dos seus documentos é inegociável
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base leading-relaxed">
            Projetada para atender aos requisitos de conformidade de consultorias financeiras,
            gabinetes jurídicos e entidades corporativas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {values.map((value) => {
            const Icon = value.icon;
            return (
              <div key={value.title} className="p-6 rounded-lg border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-950">
                <div className="w-9 h-9 rounded-md bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 flex items-center justify-center mb-4">
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <h3 className="text-sm font-medium text-zinc-900 dark:text-white mb-2">{value.title}</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{value.description}</p>
              </div>
            );
          })}
        </div>

        <div className="p-6 sm:p-8 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-900/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Regulamento Geral de Proteção de Dados (RGPD)</span>
            </div>
            <h4 className="text-base font-semibold text-zinc-900 dark:text-white">
              Pronto para os requisitos regulamentares europeus
            </h4>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              O VA OneGest permite reter, apagar ou exportar os dados dos seus clientes conforme
              a lei exige, incluindo o direito ao esquecimento.
            </p>
          </div>

          <a
            href="#contacto"
            className="shrink-0 px-4 py-2 rounded-md bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 text-xs font-medium transition-colors"
          >
            Consultar Termos de Segurança
          </a>
        </div>
      </div>
    </section>
  );
};
