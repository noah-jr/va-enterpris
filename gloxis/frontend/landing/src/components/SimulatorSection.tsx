import { useState } from 'react'
import { Link } from 'react-router'
import { api } from '../api'
import { Calculator, ArrowRight, Info, ShieldCheck } from 'lucide-react'

interface Produto {
  id: number
  nome: string
  taxaJurosMensal: number
  valorMinimo: number
  valorMaximo: number
  prazoMinimoMeses: number
  prazoMaximoMeses: number
}

interface SimulacaoResult {
  valorParcelaMensal: number
  totalGeralPagar: number
  jurosTotalPagar: number
}

function formatKz(v: number) {
  return `Kz ${Number(v || 0).toLocaleString('pt-AO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

interface SimulatorProps {
  produtos: Produto[]
}

export function SimulatorSection({ produtos }: SimulatorProps) {
  const [produtoId, setProdutoId] = useState<string>('1')
  const [valor, setValor] = useState<number>(500000)
  const [parcelas, setParcelas] = useState<number>(12)
  const [simulacao, setSimulacao] = useState<SimulacaoResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const produtoSelecionado = produtos.find((p) => p.id === Number(produtoId))

  const handleSimular = async () => {
    if (!produtoId) {
      setError('Por favor, selecione o programa estatal.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await api.post('/simulador', {
        produtoId: Number(produtoId),
        valor,
        parcelas,
      })
      setSimulacao(res.data)
    } catch {
      // Fallback calculation under BNA regulated rate
      const taxa = produtoSelecionado?.taxaJurosMensal || 2.0
      const i = taxa / 100
      const n = parcelas
      const pmt = (valor * i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1)
      const total = pmt * n
      const juros = total - valor

      setSimulacao({
        valorParcelaMensal: Math.round(pmt),
        totalGeralPagar: Math.round(total),
        jurosTotalPagar: Math.round(juros)
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="simulador" className="py-16 px-6 bg-zinc-50 border-b border-zinc-200" data-testid="simulator-section">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-900 bg-zinc-200 border border-zinc-300 px-3 py-0.5 rounded inline-flex items-center gap-1.5">
            <Calculator className="w-3.5 h-3.5 text-zinc-700" />
            <span>Simulador Oficial de Encargos Financeiros</span>
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900">
            Cálculo Transparente sob Normativos do BNA
          </h2>
          <p className="text-zinc-600 text-xs sm:text-sm">
            Consulte a estimativa de amortização do seu programa financeiro com isenção total de comissões não regulamentadas.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-6 items-start">
          
          {/* Controls Box */}
          <div className="lg:col-span-7 bg-white p-6 rounded border border-zinc-200 shadow-xs space-y-5">
            
            {/* Produto Selector */}
            <div>
              <label className="block text-xs font-extrabold text-zinc-900 uppercase tracking-wider mb-1.5">
                1. Selecione o Programa de Apoio Estatal
              </label>
              <select
                value={produtoId}
                data-testid="simulador-produto-select"
                onChange={(e) => {
                  setProdutoId(e.target.value)
                  const p = produtos.find((x) => x.id === Number(e.target.value))
                  if (p) {
                    setValor(p.valorMinimo || 100000)
                    setParcelas(p.prazoMinimoMeses || 6)
                  }
                }}
                className="w-full bg-zinc-50 border border-zinc-300 rounded px-3.5 py-2.5 text-zinc-900 focus:outline-none focus:border-zinc-900 text-xs font-bold"
              >
                {produtos.length > 0 ? (
                  produtos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nome} (Taxa Estatal Bonificada {p.taxaJurosMensal}% a.m.)
                    </option>
                  ))
                ) : (
                  <>
                    <option value="1">Microcrédito Pessoal Direto ao Cidadão (2.0% a.m.)</option>
                    <option value="2">Microcrédito Express PME & Startups (1.8% a.m.)</option>
                    <option value="3">Crédito Habitação Social (1.5% a.m.)</option>
                  </>
                )}
              </select>
            </div>

            {/* Slider 1: Montante */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-extrabold text-zinc-900 uppercase tracking-wider">
                  2. Montante Solicitado
                </span>
                <span data-testid="valor-display" className="font-extrabold text-sm text-zinc-900 bg-zinc-100 border border-zinc-300 px-2.5 py-0.5 rounded">
                  {formatKz(valor)}
                </span>
              </div>
              <input
                type="range"
                data-testid="valor-range-input"
                min={produtoSelecionado?.valorMinimo || 50000}
                max={produtoSelecionado?.valorMaximo || 10000000}
                step={50000}
                value={valor}
                onChange={(e) => setValor(Number(e.target.value))}
                className="w-full h-1.5 bg-zinc-200 rounded appearance-none cursor-pointer accent-zinc-900"
              />
            </div>

            {/* Slider 2: Prazo */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-extrabold text-zinc-900 uppercase tracking-wider">
                  3. Prazo de Liquidação
                </span>
                <span data-testid="prazo-display" className="font-extrabold text-sm text-zinc-900 bg-zinc-100 border border-zinc-300 px-2.5 py-0.5 rounded">
                  {parcelas} Meses
                </span>
              </div>
              <input
                type="range"
                data-testid="prazo-range-input"
                min={produtoSelecionado?.prazoMinimoMeses || 3}
                max={produtoSelecionado?.prazoMaximoMeses || 36}
                step={1}
                value={parcelas}
                onChange={(e) => setParcelas(Number(e.target.value))}
                className="w-full h-1.5 bg-zinc-200 rounded appearance-none cursor-pointer accent-zinc-900"
              />
            </div>

            {error && (
              <p className="text-red-600 text-xs bg-red-50 p-2.5 rounded border border-red-200">
                {error}
              </p>
            )}

            <button
              onClick={handleSimular}
              disabled={loading}
              data-testid="btn-simular-calcular"
              className="w-full bg-zinc-900 hover:bg-zinc-800 text-white py-3.5 rounded font-extrabold text-xs shadow-xs transition-all flex items-center justify-center gap-2 uppercase tracking-wider cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Calcular Amortização Oficial</span>
                  <ArrowRight className="w-3.5 h-3.5 text-white" />
                </>
              )}
            </button>
          </div>

          {/* Result Card */}
          <div className="lg:col-span-5 h-full" data-testid="simulador-result-container">
            {simulacao ? (
              <div className="bg-white border-2 border-zinc-900 rounded p-6 shadow-md space-y-5 animate-in fade-in duration-300">
                <div className="text-center pb-4 border-b border-zinc-200">
                  <p className="text-xs font-extrabold uppercase tracking-wider text-zinc-500 mb-1">
                    Encargo Mensal Estimado
                  </p>
                  <p data-testid="resultado-parcela" className="text-2xl sm:text-3xl font-extrabold text-zinc-900">
                    {formatKz(simulacao.valorParcelaMensal)}
                  </p>
                  <p className="text-[11px] text-zinc-700 font-bold mt-1 inline-flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-zinc-900" /> Taxa Bonificada Regulada BNA
                  </p>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-zinc-100">
                    <span className="text-zinc-600">Financiamento Solicitado:</span>
                    <span className="font-bold text-zinc-900">{formatKz(valor)}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-zinc-100">
                    <span className="text-zinc-600">Período de Liquidação:</span>
                    <span className="font-bold text-zinc-900">{parcelas} Meses</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-zinc-100">
                    <span className="text-zinc-600">Juros Totais Regulares:</span>
                    <span className="font-bold text-zinc-900">{formatKz(simulacao.jurosTotalPagar)}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-zinc-100">
                    <span className="text-zinc-600 font-bold">Total Geral do Processo:</span>
                    <span className="font-extrabold text-xs text-zinc-900">
                      {formatKz(simulacao.totalGeralPagar)}
                    </span>
                  </div>
                </div>

                <Link
                  to="/solicitar"
                  data-testid="btn-simulador-candidatar"
                  className="block w-full text-center bg-zinc-900 hover:bg-zinc-800 text-white font-extrabold text-xs py-3 rounded shadow-xs transition-all uppercase tracking-wider"
                >
                  Submeter Candidatura Oficial
                </Link>
              </div>
            ) : (
              <div className="bg-white border border-zinc-300 border-dashed rounded p-6 h-full flex flex-col items-center justify-center text-center space-y-3 text-zinc-400 min-h-[320px]">
                <div className="w-12 h-12 rounded bg-zinc-100 border border-zinc-300 flex items-center justify-center text-zinc-900">
                  <Info className="w-6 h-6" />
                </div>
                <h4 className="font-extrabold text-zinc-900 text-sm">Aguardando Parâmetros</h4>
                <p className="text-xs text-zinc-500 max-w-xs">
                  Selecione a modalidade para gerar a ficha informativa oficial.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
