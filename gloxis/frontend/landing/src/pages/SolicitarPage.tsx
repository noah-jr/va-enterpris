import { useState, useEffect } from 'react'
import { 
  CheckCircle2, ArrowRight, ArrowLeft, Landmark, 
  User, CreditCard, ShieldCheck, Send, AlertCircle, FileText, RefreshCw 
} from 'lucide-react'
import { httpService } from '../services/httpService'
import { CLIENT_PORTAL_URL } from '../config/env'

interface ProdutoBackend {
  id: number
  nome: string
  descricao: string | null
  taxaJurosMensal: number
  prazoMinimoMeses: number
  prazoMaximoMeses: number
  valorMinimo: number
  valorMaximo: number
  clausula: string
}

interface FormData {
  produtoId: number
  valor: number
  prazoMeses: number
  nomeCompleto: string
  biOuNif: string
  email: string
  telemovel: string
  profissao: string
  rendaMensal: number
  aceitaTermos: boolean
}

export function SolicitarPage() {
  const [step, setStep] = useState(1)
  const [produtos, setProdutos] = useState<ProdutoBackend[]>([])
  const [selectedProduto, setSelectedProduto] = useState<ProdutoBackend | null>(null)
  
  const [isLoadingProdutos, setIsLoadingProdutos] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [submittedProcessId, setSubmittedProcessId] = useState<string | null>(null)

  const [form, setForm] = useState<FormData>({
    produtoId: 0,
    valor: 1000000,
    prazoMeses: 24,
    nomeCompleto: '',
    biOuNif: '',
    email: '',
    telemovel: '',
    profissao: 'Trabalhador por Conta de Outrem',
    rendaMensal: 350000,
    aceitaTermos: false
  })

  // Fetch real credit products from backend
  const fetchProdutos = async () => {
    setIsLoadingProdutos(true)
    setApiError(null)
    try {
      const response = await httpService.get<ProdutoBackend[] | { data: ProdutoBackend[] }>('/produtos')
      const rawData = response.data as unknown
      let list: ProdutoBackend[] = []

      if (Array.isArray(rawData)) {
        list = rawData
      } else if (rawData && typeof rawData === 'object' && 'data' in rawData && Array.isArray((rawData as { data: ProdutoBackend[] }).data)) {
        list = (rawData as { data: ProdutoBackend[] }).data
      } else if (Array.isArray(response)) {
        list = response as unknown as ProdutoBackend[]
      }

      setProdutos(list)

      if (list.length > 0) {
        const initial = list[0]
        setSelectedProduto(initial)
        setForm((prev) => ({
          ...prev,
          produtoId: initial.id,
          valor: Math.max(initial.valorMinimo, Math.min(prev.valor, initial.valorMaximo)),
          prazoMeses: Math.max(initial.prazoMinimoMeses, Math.min(prev.prazoMeses, initial.prazoMaximoMeses))
        }))
      }
    } catch {
      setApiError('Não foi possível carregar os produtos de crédito do servidor. Por favor, tente novamente.')
    } finally {
      setIsLoadingProdutos(false)
    }
  }

  useEffect(() => {
    fetchProdutos()
  }, [])

  // Handle product selection change
  const handleProdutoChange = (id: number) => {
    const prod = produtos.find((p) => p.id === id) || null
    setSelectedProduto(prod)
    if (prod) {
      setForm((prev) => ({
        ...prev,
        produtoId: prod.id,
        valor: Math.max(prod.valorMinimo, Math.min(prev.valor, prod.valorMaximo)),
        prazoMeses: Math.max(prod.prazoMinimoMeses, Math.min(prev.prazoMeses, prod.prazoMaximoMeses))
      }))
    }
  }

  // Price Table calculation PMT = [P * i * (1+i)^n] / [(1+i)^n - 1]
  const taxaMensal = selectedProduto ? selectedProduto.taxaJurosMensal : 0.035
  const i = taxaMensal
  const n = form.prazoMeses
  const pmt = selectedProduto && n > 0
    ? Math.round((form.valor * (i * Math.pow(1 + i, n))) / (Math.pow(1 + i, n) - 1))
    : 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.aceitaTermos || isSubmitting) return

    setIsSubmitting(true)
    setApiError(null)

    try {
      const response = await httpService.post<{
        success: boolean
        data: { processNumber: string; id: number }
      }>('/solicitacoes/public', {
        produtoId: form.produtoId,
        valor: form.valor,
        prazoMeses: form.prazoMeses,
        nomeCompleto: form.nomeCompleto,
        biOuNif: form.biOuNif,
        email: form.email,
        telemovel: form.telemovel,
        profissao: form.profissao,
        rendaMensal: form.rendaMensal
      })

      const processId = response.data?.data?.processNumber || `GLX-2026-${response.data?.data?.id || 1000}`
      setSubmittedProcessId(processId)
      setStep(4)
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { error?: string } } }
      setApiError(errObj.response?.data?.error || 'Erro ao submeter a candidatura. Verifique a sua ligação.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#fafafa] py-16 px-4 sm:px-6 font-sans text-zinc-900 antialiased" data-testid="solicitar-page">
      <div className="max-w-3xl mx-auto space-y-10">
        
        {/* Ultra-Minimalist Page Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-zinc-200/80 rounded-full shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-zinc-900" />
            <span className="text-[11px] font-mono font-medium text-zinc-600 tracking-tight uppercase">
              Balcão Digital Regulamentado
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-zinc-900">
            Solicitação de Crédito
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 max-w-md mx-auto leading-relaxed">
            Instrução digital simples e transparente. Resposta analítica direta sem burocracia.
          </p>
        </div>

        {/* Global Error Banner */}
        {apiError && (
          <div className="bg-rose-50/80 border border-rose-200/80 text-rose-900 p-4 rounded-2xl flex items-center justify-between text-xs font-medium backdrop-blur-xs">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{apiError}</span>
            </div>
            <button
              onClick={fetchProdutos}
              className="px-3 py-1.5 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-all flex items-center gap-1 text-[11px] font-medium cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Recarregar</span>
            </button>
          </div>
        )}

        {/* Ultra-Minimalist Stepper */}
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 shadow-xs flex justify-between items-center text-xs">
          <div className={`flex items-center gap-2.5 transition-all ${step >= 1 ? 'text-zinc-900 font-semibold' : 'text-zinc-400 font-normal'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-mono transition-all ${step >= 1 ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-400'}`}>
              01
            </span>
            <span className="hidden sm:inline">Condições</span>
          </div>
          <div className="w-12 h-px bg-zinc-200/80" />
          <div className={`flex items-center gap-2.5 transition-all ${step >= 2 ? 'text-zinc-900 font-semibold' : 'text-zinc-400 font-normal'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-mono transition-all ${step >= 2 ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-400'}`}>
              02
            </span>
            <span className="hidden sm:inline">Identificação</span>
          </div>
          <div className="w-12 h-px bg-zinc-200/80" />
          <div className={`flex items-center gap-2.5 transition-all ${step >= 3 ? 'text-zinc-900 font-semibold' : 'text-zinc-400 font-normal'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-mono transition-all ${step >= 3 ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-400'}`}>
              03
            </span>
            <span className="hidden sm:inline">Confirmação</span>
          </div>
        </div>

        {/* Step 1: Product Selection & Amount */}
        {step === 1 && (
          <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 sm:p-8 space-y-8 shadow-xs transition-all" data-testid="step-1-container">
            <div className="flex items-center gap-3 border-b border-zinc-100 pb-4">
              <div className="w-8 h-8 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-900">
                <Landmark className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-zinc-900">1. Seleção do Produto & Simulação</h2>
                <p className="text-xs text-zinc-500">Escolha a modalidade de financiamento ajustada ao seu perfil.</p>
              </div>
            </div>

            {isLoadingProdutos ? (
              <div className="py-16 text-center text-zinc-400 space-y-3">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto text-zinc-900" />
                <p className="text-xs font-mono">Carregando catálogo de produtos de crédito...</p>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    Modalidade de Crédito *
                  </label>
                  <select
                    value={form.produtoId}
                    onChange={(e) => handleProdutoChange(Number(e.target.value))}
                    data-testid="select-produto"
                    className="w-full bg-zinc-50/50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-medium text-zinc-900 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-all cursor-pointer"
                  >
                    {produtos.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nome} — Taxa {(p.taxaJurosMensal * 100).toFixed(1)}%/mês
                      </option>
                    ))}
                  </select>
                  {selectedProduto && (
                    <p className="text-xs text-zinc-500 pt-1 leading-relaxed font-normal">
                      {selectedProduto.descricao}
                    </p>
                  )}
                </div>

                {selectedProduto && (
                  <>
                    <div className="space-y-3">
                      <div className="flex justify-between items-baseline">
                        <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                          Montante Pretendido
                        </label>
                        <span className="text-lg font-semibold text-zinc-900 font-mono tracking-tight">
                          {form.valor.toLocaleString('pt-AO')} Kz
                        </span>
                      </div>
                      <input
                        type="range"
                        min={selectedProduto.valorMinimo}
                        max={selectedProduto.valorMaximo}
                        step={50000}
                        value={form.valor}
                        onChange={(e) => setForm({ ...form, valor: Number(e.target.value) })}
                        data-testid="slider-valor"
                        className="w-full accent-zinc-900 cursor-pointer h-1.5 bg-zinc-100 rounded-lg"
                      />
                      <div className="flex justify-between text-[11px] text-zinc-400 font-mono">
                        <span>Min: {selectedProduto.valorMinimo.toLocaleString('pt-AO')} Kz</span>
                        <span>Max: {selectedProduto.valorMaximo.toLocaleString('pt-AO')} Kz</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-baseline">
                        <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                          Prazo de Pagamento
                        </label>
                        <span className="text-lg font-semibold text-zinc-900 font-mono tracking-tight">
                          {form.prazoMeses} Meses
                        </span>
                      </div>
                      <input
                        type="range"
                        min={selectedProduto.prazoMinimoMeses}
                        max={selectedProduto.prazoMaximoMeses}
                        step={1}
                        value={form.prazoMeses}
                        onChange={(e) => setForm({ ...form, prazoMeses: Number(e.target.value) })}
                        data-testid="slider-prazo"
                        className="w-full accent-zinc-900 cursor-pointer h-1.5 bg-zinc-100 rounded-lg"
                      />
                      <div className="flex justify-between text-[11px] text-zinc-400 font-mono">
                        <span>Min: {selectedProduto.prazoMinimoMeses} Meses</span>
                        <span>Max: {selectedProduto.prazoMaximoMeses} Meses</span>
                      </div>
                    </div>

                    {/* Ultra-Minimalist Estimate Summary Box */}
                    <div className="bg-zinc-900 text-white p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
                      <div className="space-y-1">
                        <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider block">
                          Prestação Mensal Estimada
                        </span>
                        <div className="text-2xl font-bold font-mono tracking-tight">
                          {pmt.toLocaleString('pt-AO')} Kz <span className="text-xs font-normal text-zinc-400">/ mês</span>
                        </div>
                      </div>
                      <button
                        onClick={() => setStep(2)}
                        data-testid="btn-next-step-1"
                        className="w-full sm:w-auto bg-white text-zinc-900 hover:bg-zinc-100 font-semibold text-xs px-6 py-3 rounded-xl flex items-center justify-center gap-2 uppercase tracking-wider transition-all cursor-pointer"
                      >
                        <span>Continuar</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Personal Identification */}
        {step === 2 && (
          <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 sm:p-8 space-y-8 shadow-xs transition-all" data-testid="step-2-container">
            <div className="flex items-center gap-3 border-b border-zinc-100 pb-4">
              <div className="w-8 h-8 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-900">
                <User className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-zinc-900">2. Identificação Oficial do Titular</h2>
                <p className="text-xs text-zinc-500">Insira os seus dados de identificação para abertura do processo.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="block text-zinc-500 uppercase tracking-wider font-medium">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nome idêntico ao Bilhete de Identidade"
                  value={form.nomeCompleto}
                  onChange={(e) => setForm({ ...form, nomeCompleto: e.target.value })}
                  data-testid="input-nome"
                  className="w-full bg-zinc-50/50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-medium text-zinc-900 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-zinc-500 uppercase tracking-wider font-medium">
                  B.I. ou NIF *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 004891234LA042"
                  value={form.biOuNif}
                  onChange={(e) => setForm({ ...form, biOuNif: e.target.value })}
                  data-testid="input-bi-nif"
                  className="w-full bg-zinc-50/50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-medium text-zinc-900 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-all font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-zinc-500 uppercase tracking-wider font-medium">
                  Telemóvel *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+244 923 000 000"
                  value={form.telemovel}
                  onChange={(e) => setForm({ ...form, telemovel: e.target.value })}
                  data-testid="input-telemovel"
                  className="w-full bg-zinc-50/50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-medium text-zinc-900 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-all font-mono"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="block text-zinc-500 uppercase tracking-wider font-medium">
                  Endereço de Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="exemplo@dominio.ao"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  data-testid="input-email"
                  className="w-full bg-zinc-50/50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-medium text-zinc-900 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-all"
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-6 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => setStep(1)}
                data-testid="btn-back-step-2"
                className="text-zinc-500 hover:text-zinc-900 font-semibold text-xs flex items-center gap-1.5 uppercase tracking-wider transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (form.nomeCompleto && form.biOuNif && form.telemovel) {
                    setStep(3)
                  }
                }}
                data-testid="btn-next-step-2"
                className="bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs px-6 py-3 rounded-xl flex items-center gap-2 uppercase tracking-wider cursor-pointer transition-all shadow-xs"
              >
                <span>Avançar para Dados Financeiros</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Financial Data & Official Legal Clause */}
        {step === 3 && (
          <form onSubmit={handleSubmit} className="bg-white border border-zinc-200/80 rounded-2xl p-6 sm:p-8 space-y-8 shadow-xs transition-all" data-testid="step-3-container">
            <div className="flex items-center gap-3 border-b border-zinc-100 pb-4">
              <div className="w-8 h-8 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-900">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-zinc-900">3. Dados Financeiros & Termos Legais</h2>
                <p className="text-xs text-zinc-500">Confirmação de rendimento e aceitação das cláusulas contratuais.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
              <div className="space-y-1.5">
                <label className="block text-zinc-500 uppercase tracking-wider font-medium">
                  Profissão / Atividade
                </label>
                <select
                  value={form.profissao}
                  onChange={(e) => setForm({ ...form, profissao: e.target.value })}
                  data-testid="select-profissao"
                  className="w-full bg-zinc-50/50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-medium text-zinc-900 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-all cursor-pointer"
                >
                  <option value="Trabalhador por Conta de Outrem">Trabalhador por Conta de Outrem</option>
                  <option value="Empresário em Nome Individual">Empresário em Nome Individual / PME</option>
                  <option value="Funcionário Público">Funcionário Público</option>
                  <option value="Reformado / Pensionista">Reformado / Pensionista</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-zinc-500 uppercase tracking-wider font-medium">
                  Rendimento Mensal (Kz)
                </label>
                <input
                  type="number"
                  min={50000}
                  step={10000}
                  value={form.rendaMensal}
                  onChange={(e) => setForm({ ...form, rendaMensal: Number(e.target.value) })}
                  data-testid="input-renda"
                  className="w-full bg-zinc-50/50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-medium text-zinc-900 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-all font-mono"
                />
              </div>
            </div>

            {/* Official Legal Clause Card fetched dynamically from Backend */}
            {selectedProduto && (
              <div className="p-5 bg-zinc-50 border border-zinc-200/80 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-zinc-900">
                  <FileText className="w-4 h-4 text-zinc-700" />
                  <span>Cláusula Regulamentar do Contrato ({selectedProduto.nome})</span>
                </div>
                <p className="text-[11px] text-zinc-600 leading-relaxed font-mono bg-white p-4 border border-zinc-200/80 rounded-xl">
                  {selectedProduto.clausula}
                </p>
              </div>
            )}

            <div className="pt-2">
              <label className="flex items-start gap-3 cursor-pointer text-xs font-normal text-zinc-600 leading-relaxed">
                <input
                  type="checkbox"
                  checked={form.aceitaTermos}
                  onChange={(e) => setForm({ ...form, aceitaTermos: e.target.checked })}
                  data-testid="checkbox-termos"
                  className="mt-0.5 accent-zinc-900 rounded"
                />
                <span>
                  Declaro sob compromisso de honra a exatidão das declarações efetuadas e aceito expressamente as{' '}
                  <a href="/termos" className="underline font-semibold text-zinc-900">Condições Gerais de Crédito BNA</a>.
                </span>
              </label>
            </div>

            <div className="flex justify-between items-center pt-6 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => setStep(2)}
                data-testid="btn-back-step-3"
                className="text-zinc-500 hover:text-zinc-900 font-semibold text-xs flex items-center gap-1.5 uppercase tracking-wider transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar</span>
              </button>

              <button
                type="submit"
                disabled={!form.aceitaTermos || isSubmitting}
                data-testid="btn-submit-processo"
                className={`font-semibold text-xs px-6 py-3 rounded-xl flex items-center gap-2 uppercase tracking-wider transition-all ${
                  form.aceitaTermos && !isSubmitting
                    ? 'bg-zinc-900 hover:bg-zinc-800 text-white cursor-pointer shadow-xs'
                    : 'bg-zinc-100 text-zinc-400 cursor-not-allowed border border-zinc-200/80'
                }`}
              >
                <span>{isSubmitting ? 'A Processar...' : 'Submeter Candidatura'}</span>
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* Step 4: Success & Confirmation */}
        {step === 4 && submittedProcessId && (
          <div className="bg-white border border-zinc-200/80 rounded-2xl p-8 sm:p-12 space-y-8 text-center shadow-xs animate-in fade-in" data-testid="success-container">
            <div className="w-14 h-14 bg-zinc-900 text-white rounded-2xl flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-7 h-7 text-emerald-400" />
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-mono font-medium text-zinc-400 uppercase tracking-widest block">
                Processo Submetido
              </span>
              <h2 className="text-2xl font-semibold text-zinc-900 tracking-tight">
                Candidatura Registada com Sucesso
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500 max-w-sm mx-auto leading-relaxed">
                A sua solicitação para <strong>{selectedProduto?.nome}</strong> no valor de{' '}
                <strong>{form.valor.toLocaleString('pt-AO')} Kz</strong> deu entrada no sistema.
              </p>
            </div>

            {/* Official Process Badge Box */}
            <div className="bg-zinc-50/80 border border-zinc-200/80 p-5 rounded-2xl inline-block text-left space-y-1.5 max-w-xs w-full">
              <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                Código de Referência
              </div>
              <div className="text-xl font-mono font-semibold text-zinc-900 tracking-wider" data-testid="process-number-display">
                {submittedProcessId}
              </div>
              <div className="text-[11px] text-zinc-500 font-normal">
                Conserve este identificador para acompanhamento.
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
              <a
                href={CLIENT_PORTAL_URL}
                data-testid="link-success-portal"
                className="bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs px-6 py-3 rounded-xl uppercase tracking-wider transition-all shadow-xs"
              >
                Aceder ao Portal
              </a>
              <a
                href="/"
                data-testid="link-success-home"
                className="border border-zinc-200 text-zinc-700 hover:bg-zinc-50 font-semibold text-xs px-6 py-3 rounded-xl uppercase tracking-wider transition-all"
              >
                Início
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
