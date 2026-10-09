import { useState } from 'react'
import { Link } from 'react-router'
import { 
  Landmark, CreditCard, Briefcase, Wallet, ShieldCheck, 
  ArrowRight, CheckCircle2 
} from 'lucide-react'

export function ProductsSection() {
  const [activeTab, setActiveTab] = useState('credito')

  const tabs = [
    { id: 'credito', label: 'Programas de Crédito', icon: Briefcase },
    { id: 'contas', label: 'Contas & Inclusão', icon: Landmark },
    { id: 'cartoes', label: 'Cartões Oficiais', icon: CreditCard },
    { id: 'poupanca', label: 'Aforro Estatal', icon: Wallet },
    { id: 'seguros', label: 'Proteção Social', icon: ShieldCheck },
  ]

  const productsData: Record<string, Array<{
    id: string
    title: string
    badge?: string
    desc: string
    specs: string[]
    ctaText: string
    ctaHref: string
  }>> = {
    credito: [
      {
        id: 'credito-pessoal',
        title: 'Microcrédito Pessoal Direto ao Cidadão',
        badge: 'Decreto Presidencial',
        desc: 'Linha de financiamento desmaterializada para apoio aos projetos dos cidadãos nacionais.',
        specs: ['Montante até Kz 10.000.000,00', 'Prazo de liquidação de 6 a 36 meses', 'Análise célere em 24h a 48h úteis'],
        ctaText: 'Simular Crédito Pessoal',
        ctaHref: '/solicitar'
      },
      {
        id: 'microcredito-pme',
        title: 'Microcrédito Express PME & Startups',
        badge: 'Fomento Produtivo',
        desc: 'Incentivo ao investimento empresarial, reforço de tesouraria e criação de postos de trabalho.',
        specs: ['Limites adaptados ao plano de negócio', 'Taxas bonificadas pelo Estado', 'Acompanhamento no Balcão Único'],
        ctaText: 'Solicitar Financiamento PME',
        ctaHref: '/solicitar'
      },
      {
        id: 'credito-habitacao',
        title: 'Crédito Habitação & Reformas Sociais',
        desc: 'Financiamento direcionado para aquisição ou remodelação da habitação própria e permanente.',
        specs: ['Prazos alargados de amortização', 'Isenção de certas taxas de emolumento', 'Garantia institucional estatal'],
        ctaText: 'Consultar Requisitos',
        ctaHref: '/solicitar'
      }
    ],
    contas: [
      {
        id: 'conta-ordem',
        title: 'Conta à Ordem Gloxis',
        badge: 'Serviço Público',
        desc: 'Conta universal para cidadãos angolanos mobilizável através da rede Multicaixa e Internet Banking.',
        specs: ['Sem comissão de abertura', 'Acesso imediato ao Balcão Digital', 'Conformidade integral com normativos BNA'],
        ctaText: 'Abrir Conta Online',
        ctaHref: '/solicitar'
      },
      {
        id: 'conta-salario',
        title: 'Conta Salário Domiciliada',
        desc: 'Domiciliação do vencimento de funcionários públicos e privados com facilidades de apoio.',
        specs: ['Prioridade na análise de crédito', 'Isenção de custos de manutenção', 'Acesso automático a adiantamentos'],
        ctaText: 'Domiciliar Salário',
        ctaHref: '/solicitar'
      },
      {
        id: 'conta-simplificada',
        title: 'Conta Simplificada de Inclusão BNA',
        desc: 'Abertura imediata mediante apresentação do Bilhete de Identidade no âmbito da inclusão financeira.',
        specs: ['Abertura sem depósitos mínimos', 'Limites operacionais BNA', 'Gratuitidade no processo de registo'],
        ctaText: 'Consultar Normativo',
        ctaHref: '/solicitar'
      }
    ],
    cartoes: [
      {
        id: 'cartao-multicaixa',
        title: 'Cartão Débito Multicaixa do Cidadão',
        badge: 'Rede EMIS',
        desc: 'O cartão oficial para levantamentos, pagamentos de serviços estatais e compras em Angola.',
        specs: ['Tecnologia Contactless', 'Segurança por código PIN', 'Válido em toda a rede nacional'],
        ctaText: 'Solicitar Cartão',
        ctaHref: '/solicitar'
      },
      {
        id: 'cartao-credito-express',
        title: 'Cartão Crédito Institucional',
        desc: 'Meio de pagamento diferido para despesas autorizadas de gestão e representação.',
        specs: ['Carência de juros até 45 dias', 'Supervisão do plafond autorizável', 'Relatórios integrados'],
        ctaText: 'Ver Condições',
        ctaHref: '/solicitar'
      },
      {
        id: 'cartao-kamba',
        title: 'Cartão Kamba de Mobilidade Internacional',
        desc: 'Para pagamentos em deslocações oficiais, missões no estrangeiro e transações internacionais.',
        specs: ['Rede internacional aceite', 'Carregamento facilitado em Kwanzas', 'Supervisão de despesas'],
        ctaText: 'Saber Mais',
        ctaHref: '/solicitar'
      }
    ],
    poupanca: [
      {
        id: 'deposito-prazo',
        title: 'Depósito a Prazo Tesouro Direto',
        badge: 'Garantia de Estado',
        desc: 'Aplicação de poupança com taxa fixa bonificada e proteção total do capital investido.',
        specs: ['Prazos estipulados de 90 a 365 dias', 'Pagamento periódico de rendimentos', 'Garantia institucional'],
        ctaText: 'Simular Aforro',
        ctaHref: '/solicitar'
      },
      {
        id: 'rendimento-crescente',
        title: 'Certificados de Rendimento Progressivo',
        desc: 'Quanto maior o tempo de retenção do capital, maior é o rendimento global acumulado.',
        specs: ['Rendimento semestral progressivo', 'Proteção contra flutuações', 'Resgate sob condições BNA'],
        ctaText: 'Consultar Condições',
        ctaHref: '/transparencia'
      },
      {
        id: 'poupanca-jovem',
        title: 'Conta Poupança Jovem & Futuro',
        desc: 'Fundo constituído para garantir a educação superior e emancipação dos jovens cidadãos.',
        specs: ['Incentivo fiscal e bonificação estatal', 'Sem encargos de manutenção', 'Reforços automáticos'],
        ctaText: 'Abrir Poupança Jovem',
        ctaHref: '/solicitar'
      }
    ],
    seguros: [
      {
        id: 'seguro-multirriscos',
        title: 'Seguro Multirriscos Social & Habitação',
        badge: 'Proteção Pública',
        desc: 'Proteção de habitações e recheios contra intempéries, sinistros e danos estruturais.',
        specs: ['Cobertura de danos de força maior', 'Assistência técnica permanente', 'Bonificação de prémios'],
        ctaText: 'Pedir Simulação',
        ctaHref: '/solicitar'
      },
      {
        id: 'seguro-automovel',
        title: 'Seguro Automóvel & Frota Estatal',
        desc: 'Garantia de responsabilidade civil obrigatória para viaturas de uso particular e público.',
        specs: ['Responsabilidade civil obrigatória', 'Danos próprios e cobertura total', 'Assistência em viagem'],
        ctaText: 'Pedir Cotação',
        ctaHref: '/solicitar'
      },
      {
        id: 'seguro-vida',
        title: 'Seguro de Vida & Proteção de Acidentes',
        desc: 'Amparo financeiro às famílias dos trabalhadores e cidadãos em situação de invalidez ou infortúnio.',
        specs: ['Indemnização direta aos herdeiros', 'Amortização automática de débitos', 'Subscrição facilitada'],
        ctaText: 'Consultar Guia',
        ctaHref: '/transparencia'
      }
    ]
  }

  return (
    <section className="py-16 px-6 bg-zinc-50 border-b border-zinc-200" data-testid="products-section">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-900 bg-zinc-200 border border-zinc-300 px-3 py-0.5 rounded">
            Catálogo Oficial de Programas e Apoios Institucionais
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900">
            Instrumentos de Fomento e Inclusão Financeira
          </h2>
          <p className="text-zinc-600 text-xs sm:text-sm">
            Consulte os programas públicos em conformidade com as diretivas do Ministério das Finanças e BNA.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex justify-center flex-wrap gap-2 border-b border-zinc-200 pb-3">
          {tabs.map((tab) => {
            const IconC = tab.icon
            const isSel = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                data-testid={`product-tab-${tab.id}`}
                className={`flex items-center gap-2 px-5 py-2.5 rounded text-xs font-bold transition-all cursor-pointer ${
                  isSel
                    ? 'bg-zinc-900 text-white shadow-xs border border-zinc-900'
                    : 'bg-white text-zinc-700 hover:bg-zinc-100 border border-zinc-300'
                }`}
              >
                <IconC className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Product Cards Matrix */}
        <div className="grid md:grid-cols-3 gap-6" data-testid="products-grid">
          {(productsData[activeTab] || []).map((p) => (
            <div
              key={p.id}
              data-testid={`product-card-${p.id}`}
              className="bg-white border border-zinc-200 rounded p-6 hover:shadow-md hover:border-zinc-900 transition-all flex flex-col justify-between relative group"
            >
              <div>
                {p.badge && (
                  <span className="inline-block bg-zinc-100 border border-zinc-200 text-zinc-700 text-[10px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wider mb-3">
                    {p.badge}
                  </span>
                )}

                <h3 className="text-lg font-bold text-zinc-900 mb-2 group-hover:text-zinc-700 transition-colors">
                  {p.title}
                </h3>

                <p className="text-zinc-600 text-xs leading-relaxed mb-5">
                  {p.desc}
                </p>

                <ul className="space-y-2 text-xs text-zinc-700 font-medium mb-6">
                  {p.specs.map((spec, sIdx) => (
                    <li key={sIdx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-zinc-900 shrink-0 mt-0.5" />
                      <span>{spec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                to={p.ctaHref}
                data-testid={`product-cta-${p.id}`}
                className="w-full bg-zinc-100 hover:bg-zinc-900 hover:text-white text-zinc-900 font-bold text-xs py-3 px-4 rounded transition-all flex items-center justify-center gap-2 group/btn uppercase tracking-wider border border-zinc-300"
              >
                <span>{p.ctaText}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
