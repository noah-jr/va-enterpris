import { Calculator, ArrowRight, ShieldCheck, Info } from 'lucide-react'
import { Link } from 'react-router'
import { useSimulador } from '../hooks/useSimulador'

export function Simulador() {
  const {
    valor,
    setValor,
    parcelas,
    setParcelas,
    resultado,
    loading,
    handleSimular,
  } = useSimulador()

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <h1 className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-white">Simulador de Crédito</h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Calcule as suas mensalidades e condições de reembolso com transparência total.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Container */}
        <form onSubmit={handleSimular} className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 space-y-5 shadow-xs">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
              Montante Solicitado (Kz)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 font-mono text-xs font-bold">Kz</span>
              <input
                type="number"
                value={valor}
                onChange={e => setValor(Number(e.target.value))}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 pl-10 pr-4 py-2.5 font-mono text-lg font-bold text-zinc-900 dark:text-white focus:outline-none focus:border-zinc-900 dark:focus:border-white transition-colors"
                placeholder="100000"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
              Prazo de Reembolso
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[3, 6, 9, 12].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setParcelas(p)}
                  className={`py-2.5 text-xs font-bold uppercase tracking-wider border cursor-pointer transition-all ${
                    parcelas === p
                      ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white'
                      : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                  }`}
                >
                  {p} Meses
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 py-3 font-bold text-xs uppercase tracking-wider flex justify-center items-center gap-2 transition-all cursor-pointer shadow-xs disabled:opacity-50"
          >
            {loading ? (
              <span>A calcular...</span>
            ) : (
              <>
                <Calculator className="w-4 h-4" />
                <span>Simular Condições</span>
              </>
            )}
          </button>
        </form>

        {/* Result Container */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          {resultado ? (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 space-y-5 animate-in fade-in duration-300 shadow-xs flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Resultado Estimado</span>
                </div>

                <div className="space-y-4 mt-4">
                  <div className="bg-zinc-50 dark:bg-zinc-800/60 p-3.5 border border-zinc-200/80 dark:border-zinc-700/80">
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider">Prestação Mensal</p>
                    <p className="text-xl font-extrabold text-zinc-900 dark:text-white mt-1 font-mono">
                      Kz {resultado.valorParcelaMensal.toLocaleString('pt-AO', { minimumFractionDigits: 2 })}
                    </p>
                  </div>

                  <div className="bg-zinc-50 dark:bg-zinc-800/60 p-3.5 border border-zinc-200/80 dark:border-zinc-700/80">
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider">Total a Pagar</p>
                    <p className="text-base font-bold text-zinc-900 dark:text-white mt-1 font-mono">
                      Kz {resultado.totalGeralPagar.toLocaleString('pt-AO', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </div>

              <Link
                to="/solicitar"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xs"
              >
                <span>Solicitar Este Crédito</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col items-center justify-center text-center space-y-3 flex-1">
              <Info className="w-8 h-8 text-zinc-400 dark:text-zinc-600" />
              <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">Calculadora Financeira</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs leading-relaxed">
                Insira o montante e o prazo pretendido à esquerda para visualizar instantaneamente o montante das parcelas.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
