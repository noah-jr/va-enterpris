import { Link } from 'react-router'
import { UserPlus, Calculator, CreditCard, Zap, FileSearch, ArrowRightLeft } from 'lucide-react'

export function QuickActions() {
  const actions = [
    {
      id: 'abertura-conta',
      title: 'Abertura de Candidatura',
      subtitle: 'Submeter processo oficial',
      icon: UserPlus,
      href: '/solicitar'
    },
    {
      id: 'simulador-credito',
      title: 'Simulador de Apoios',
      subtitle: 'Calcular encargos e taxas',
      icon: Calculator,
      href: '/solicitar'
    },
    {
      id: 'credito-express',
      title: 'Crédito PME & Startups',
      subtitle: 'Linha de fomento rápido',
      icon: Zap,
      href: '/solicitar'
    },
    {
      id: 'cartao-multicaixa',
      title: 'Cartão do Cidadão',
      subtitle: 'Meios de pagamento EMIS',
      icon: CreditCard,
      href: '/solicitar'
    },
    {
      id: 'servico-kwik',
      title: 'Rede Estatal Kwik',
      subtitle: 'Pagamentos de emolumentos',
      icon: ArrowRightLeft,
      href: '/solicitar'
    },
    {
      id: 'validar-documentos',
      title: 'Validar Documentos',
      subtitle: 'Verificação com chancela QR',
      icon: FileSearch,
      href: '/transparencia'
    }
  ]

  return (
    <section className="bg-white border-b border-zinc-200 py-4 px-6 relative z-20 -mt-4 max-w-7xl mx-auto rounded shadow-xs" data-testid="quick-actions">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {actions.map((act) => {
          const IconComp = act.icon
          return (
            <Link
              key={act.id}
              to={act.href}
              data-testid={`quick-action-${act.id}`}
              className="p-3 rounded border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 transition-all group flex flex-col items-center text-center bg-white"
            >
              <div className="w-10 h-10 rounded bg-zinc-100 text-zinc-900 flex items-center justify-center mb-2 border border-zinc-200 group-hover:bg-zinc-900 group-hover:text-white transition-colors">
                <IconComp className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold text-zinc-900 mb-0.5 group-hover:text-zinc-700 transition-colors uppercase tracking-tight">
                {act.title}
              </h4>
              <p className="text-[10px] text-zinc-500 font-medium">{act.subtitle}</p>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
