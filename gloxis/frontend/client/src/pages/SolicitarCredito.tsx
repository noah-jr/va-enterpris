import { useState, useEffect, useRef } from 'react'
import { 
  CreditCard, CheckCircle, AlertCircle, 
  ChevronRight, Calculator, FileText, Search, Plus, FolderOpen, Upload
} from 'lucide-react'
import { useSolicitarCredito } from '../hooks/useSolicitarCredito'

function formatKz(v: number) {
  return `${Number(v || 0).toLocaleString('pt-AO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Kz`
}

// ─── Componente SearchableSelect ─────────────────────────────────────────────
function SearchableSelect({ 
  options, value, onChange, placeholder, onAddCustom, emptyText
}: { 
  options: { id: string | number, label: string, desc?: string }[], 
  value: string | number, 
  onChange: (val: string | number) => void,
  placeholder: string,
  onAddCustom?: (text: string) => void,
  emptyText?: string
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const filtered = options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()))
  const selected = options.find(o => o.id === value)

  return (
    <div className="relative" ref={ref}>
      <div 
        className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 px-3.5 py-2.5 text-xs flex items-center justify-between cursor-pointer transition-colors"
        onClick={() => setOpen(!open)}
      >
        <span className={selected ? 'text-zinc-900 dark:text-white font-bold' : 'text-zinc-400'}>{selected ? selected.label : placeholder}</span>
        <ChevronRight size={16} className={`text-zinc-400 transition-transform ${open ? 'rotate-90' : 'rotate-0'}`} />
      </div>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 z-50 overflow-hidden shadow-lg">
          <div className="p-2 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
            <Search size={14} className="text-zinc-400" />
            <input 
              autoFocus
              className="w-full text-xs bg-transparent text-zinc-900 dark:text-white focus:outline-none"
              placeholder="Pesquisar..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="max-h-60 overflow-y-auto">
            {filtered.length > 0 ? (
              filtered.map(o => (
                <div 
                  key={o.id} 
                  className={`p-3 cursor-pointer border-b border-zinc-100 dark:border-zinc-800/50 transition-colors ${
                    value === o.id ? 'bg-zinc-100 dark:bg-zinc-800' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                  }`}
                  onClick={() => { onChange(o.id); setOpen(false); setSearch('') }}
                >
                  <div className={`text-xs ${value === o.id ? 'font-extrabold text-zinc-900 dark:text-white' : 'font-semibold text-zinc-700 dark:text-zinc-300'}`}>{o.label}</div>
                  {o.desc && <div className="text-[11px] text-zinc-400 mt-0.5">{o.desc}</div>}
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-zinc-400 text-xs">
                {emptyText || 'Nenhum resultado encontrado.'}
                {onAddCustom && search && (
                  <button 
                    type="button"
                    className="mt-2.5 w-full py-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-bold uppercase tracking-wider"
                    onClick={() => { onAddCustom(search); setOpen(false); setSearch('') }}
                  >
                    <Plus size={14} className="inline mr-1" /> Adicionar "{search}"
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────────
export function SolicitarCredito() {
  const {
    navigate,
    step,
    setStep,
    produtos,
    meusDocs,
    simulacao,
    form,
    setForm,
    docSelecionadoId,
    setDocSelecionadoId,
    documentoFile,
    setDocumentoFile,
    modoUploadDoc,
    setModoUploadDoc,
    loadingSimular,
    loadingSolicitar,
    error,
    success,
    produto,
    simular,
    solicitar,
    handleAddProdutoSuggestion,
  } = useSolicitarCredito()

  if (step === 3 && success) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 max-w-md w-full text-center p-8 space-y-5 shadow-xs">
          <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle size={32} />
          </div>
          <h2 className="text-lg font-extrabold text-zinc-900 dark:text-white">Pedido Submetido com Sucesso!</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            A sua solicitação foi registrada no sistema e está em fase de análise pela equipa financeira.
          </p>

          <div className="bg-zinc-50 dark:bg-zinc-800/60 p-4 border border-zinc-200 dark:border-zinc-700/80 text-left space-y-2 text-xs">
            <div className="flex justify-between border-b border-zinc-200 dark:border-zinc-700 pb-2">
              <span className="text-zinc-500 dark:text-zinc-400">Produto</span>
              <span className="font-bold text-zinc-900 dark:text-white">{produto?.nome}</span>
            </div>
            <div className="flex justify-between border-b border-zinc-200 dark:border-zinc-700 pb-2">
              <span className="text-zinc-500 dark:text-zinc-400">Valor Solicitado</span>
              <span className="font-bold text-zinc-900 dark:text-white">{formatKz(Number(form.valor))}</span>
            </div>
            <div className="flex justify-between border-b border-zinc-200 dark:border-zinc-700 pb-2">
              <span className="text-zinc-500 dark:text-zinc-400">Parcelas</span>
              <span className="font-bold text-zinc-900 dark:text-white">{form.parcelas}x</span>
            </div>
            {simulacao && (
              <div className="flex justify-between pt-1">
                <span className="text-zinc-500 dark:text-zinc-400">Prestação Mensal</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatKz(simulacao.valorParcelaMensal)}</span>
              </div>
            )}
          </div>

          <button className="w-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 py-3 font-bold text-xs uppercase tracking-wider cursor-pointer" onClick={() => navigate('/creditos')}>
            Ver Meus Créditos
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div className="text-center border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <h1 className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-white">Pedir Crédito</h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Simule e submeta o seu pedido de financiamento rápido.</p>
      </div>

      {/* Steps Progress */}
      <div className="flex justify-center gap-3">
        {[
          { n: 1, label: 'Simular' },
          { n: 2, label: 'Confirmar' },
          { n: 3, label: 'Enviado' },
        ].map(({ n, label }, i) => (
          <div key={n} className="flex items-center gap-2">
            <div className={`w-7 h-7 flex items-center justify-center text-xs font-bold uppercase transition-all ${
              step >= n 
                ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900' 
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'
            }`}>
              {n}
            </div>
            <span className={`text-xs uppercase font-bold tracking-wider ${step >= n ? 'text-zinc-900 dark:text-white' : 'text-zinc-400'}`}>
              {label}
            </span>
            {i < 2 && <ChevronRight size={14} className="text-zinc-300 dark:text-zinc-700" />}
          </div>
        ))}
      </div>

      {error && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2 font-semibold">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Step 1 — Simulação */}
      {step === 1 && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 space-y-5 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <Calculator size={16} />
            <span>Dados da Simulação</span>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Produto de Crédito</label>
            <SearchableSelect 
              options={produtos.map(p => ({ id: p.id, label: p.nome, desc: `Taxa: ${p.taxaJurosMensal}% a.m. | Máx: ${formatKz(p.valorMaximo)}` }))}
              value={form.produtoId ? Number(form.produtoId) : ''}
              onChange={val => setForm(f => ({ ...f, produtoId: String(val) }))}
              placeholder="Pesquise ou selecione um produto..."
              onAddCustom={handleAddProdutoSuggestion}
            />
            {produto && (
              <p className="text-[11px] text-zinc-400 font-medium">
                Limites: {formatKz(produto.valorMinimo)} – {formatKz(produto.valorMaximo)} · {produto.prazoMinimoMeses}–{produto.prazoMaximoMeses} meses
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Valor Desejado (Kz)</label>
            <input
              type="number"
              value={form.valor}
              onChange={e => setForm(f => ({ ...f, valor: e.target.value }))}
              placeholder={produto ? `Ex: ${produto.valorMinimo}` : 'Ex: 100000'}
              className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3.5 py-2.5 text-sm font-mono font-bold text-zinc-900 dark:text-white focus:outline-none focus:border-zinc-900 dark:focus:border-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Número de Prestações (Meses)</label>
            <input
              type="number"
              value={form.parcelas}
              onChange={e => setForm(f => ({ ...f, parcelas: e.target.value }))}
              placeholder={produto ? `Ex: ${produto.prazoMinimoMeses}` : 'Ex: 12'}
              className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3.5 py-2.5 text-sm font-mono font-bold text-zinc-900 dark:text-white focus:outline-none focus:border-zinc-900 dark:focus:border-white"
            />
          </div>

          <button
            onClick={simular}
            disabled={loadingSimular}
            className="w-full bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 py-3 font-bold text-xs uppercase tracking-wider flex justify-center items-center gap-2 transition-all cursor-pointer shadow-xs disabled:opacity-50 mt-2"
          >
            {loadingSimular ? (
              <span>A simular...</span>
            ) : (
              <><Calculator size={16} /> Simular Agora</>
            )}
          </button>
        </div>
      )}

      {/* Step 2 — Confirmação */}
      {step === 2 && simulacao && (
        <div className="space-y-5">
          <div className="bg-zinc-900 dark:bg-zinc-800 text-white p-6 border border-zinc-800 space-y-4">
            <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-zinc-300 border-b border-zinc-800 pb-3">
              <FileText size={16} /> Resumo da Simulação
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-zinc-800/80 dark:bg-zinc-900/80 p-3.5 border border-zinc-700">
                <p className="text-[10px] text-zinc-400 uppercase font-bold">Prestação Mensal</p>
                <p className="text-lg font-extrabold text-white mt-1 font-mono">{formatKz(simulacao.valorParcelaMensal)}</p>
              </div>
              <div className="bg-zinc-800/80 dark:bg-zinc-900/80 p-3.5 border border-zinc-700">
                <p className="text-[10px] text-zinc-400 uppercase font-bold">Total a Pagar</p>
                <p className="text-lg font-extrabold text-white mt-1 font-mono">{formatKz(simulacao.totalGeralPagar)}</p>
              </div>
            </div>

            <div className="space-y-2 text-xs bg-zinc-800/40 p-3 border border-zinc-700/60 font-medium">
              <div className="flex justify-between">
                <span className="text-zinc-400">Produto</span>
                <span className="font-bold">{produto?.nome}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Valor Solicitado</span>
                <span className="font-bold">{formatKz(Number(form.valor))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Prazo</span>
                <span className="font-bold">{form.parcelas} meses</span>
              </div>
              <div className="flex justify-between border-t border-zinc-700 pt-2 text-amber-400 font-bold">
                <span>Total de Juros</span>
                <span>{formatKz(simulacao.jurosTotalPagar)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">Documento de Identificação (Obrigatório)</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Anexe o seu BI ou documento de identificação da empresa para validação rápida.
            </p>

            <div className="flex gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
              <button 
                className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider cursor-pointer ${
                  !modoUploadDoc 
                    ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900' 
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
                }`} 
                onClick={() => setModoUploadDoc(false)}
              >
                <FolderOpen size={13} className="inline mr-1.5" /> Do Arquivo
              </button>
              <button 
                className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider cursor-pointer ${
                  modoUploadDoc 
                    ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900' 
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
                }`} 
                onClick={() => setModoUploadDoc(true)}
              >
                <Upload size={13} className="inline mr-1.5" /> Novo Ficheiro
              </button>
            </div>

            {!modoUploadDoc ? (
              <div>
                <SearchableSelect 
                  options={meusDocs.map(d => ({ id: d.id, label: d.titulo, desc: d.caminho.split('.').pop()?.toUpperCase() }))}
                  value={docSelecionadoId ? Number(docSelecionadoId) : ''}
                  onChange={val => setDocSelecionadoId(String(val))}
                  placeholder="Pesquise ou selecione um documento do arquivo..."
                  emptyText="Não tem documentos no arquivo. Mude para a aba 'Novo Ficheiro'."
                />
              </div>
            ) : (
              <div className="border-2 border-dashed border-zinc-200 dark:border-zinc-700 p-6 text-center bg-zinc-50 dark:bg-zinc-800/40">
                <input 
                  type="file" 
                  accept=".pdf,image/*"
                  onChange={e => setDocumentoFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                  <Upload size={22} className="text-zinc-400 mb-2" />
                  {documentoFile ? (
                    <span className="text-xs font-bold text-zinc-900 dark:text-white">{documentoFile.name}</span>
                  ) : (
                    <>
                      <span className="text-xs font-bold text-zinc-900 dark:text-white">Clique para seleccionar ficheiro</span>
                      <span className="text-[10px] text-zinc-400 mt-1 uppercase font-bold">PDF, PNG ou JPG (Max. 10MB)</span>
                    </>
                  )}
                </label>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="flex-1 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 py-3 font-bold text-xs uppercase tracking-wider cursor-pointer"
            >
              Voltar
            </button>
            <button
              onClick={solicitar}
              disabled={loadingSolicitar}
              className="flex-[2] bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 py-3 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
            >
              {loadingSolicitar ? (
                <span>A processar...</span>
              ) : (
                <><CreditCard size={16} /> Confirmar Pedido</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
