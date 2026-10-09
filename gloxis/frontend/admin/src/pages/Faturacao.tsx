import { 
  Receipt, Search, Plus, Trash2, ShieldCheck, 
  DollarSign, CheckCircle2, AlertTriangle, Filter, Eye, 
  ArrowUpRight, X
} from 'lucide-react'
import { useState } from 'react'
import { ClientSearchSelect } from '../components/ClientSearchSelect'
import { PaginationControl } from '../components/PaginationControl'
import { useFaturacao } from '../hooks/useFaturacao'

export function Faturacao() {
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  const {
    loading,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    kpis,
    showNewModal,
    setShowNewModal,
    selectedCliente,
    clienteNome,
    setClienteNome,
    clienteNif,
    setClienteNif,
    tipoDocumento,
    setTipoDocumento,
    isSaving,
    itens,
    setSelectedFaturaView,
    subtotal,
    handleAddItem,
    handleRemoveItem,
    handleItemChange,
    handleDelete,
    handleUpdateStatus,
    handleSelectClient,
    handleCreateSubmit,
    filtered,
  } = useFaturacao()

  const totalItems = filtered.length
  const totalPages = Math.ceil(totalItems / perPage) || 1
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage)

  return (
    <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 pb-12 space-y-6 animate-in fade-in duration-300">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2.5">
            <Receipt className="w-6 h-6 text-zinc-800 dark:text-zinc-200" /> Faturação Fiscal Certificada AGT
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-0.5">
            Emissão de faturas (FT), faturas-recibo (FR), notas de crédito (NC) e certificação digital.
          </p>
        </div>

        <button 
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 px-3.5 py-1.5 font-bold uppercase tracking-wider transition-colors shadow-2xs text-xs cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> Emitir Novo Documento Fiscal
        </button>
      </div>

      {/* KPIS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        <div className="bg-white dark:bg-zinc-900 p-4 border border-zinc-200 dark:border-zinc-800 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Volume Faturado Total</p>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white mt-0.5 font-mono">
                Kz {Number(kpis.valorFaturadoTotal || 0).toLocaleString('pt-AO')}
              </h3>
            </div>
            <div className="w-9 h-9 bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 flex items-center justify-center border border-zinc-200 dark:border-zinc-700">
              <DollarSign className="w-4.5 h-4.5" />
            </div>
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-2 flex items-center gap-1 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400" /> Total bruto faturado no sistema
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 border border-zinc-200 dark:border-zinc-800 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Total de Faturas</p>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white mt-0.5 font-mono">{kpis.totalFaturas || 0}</h3>
            </div>
            <div className="w-9 h-9 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-800">
              <Receipt className="w-4.5 h-4.5" />
            </div>
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-2 font-medium">Documentos fiscais emitidos</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 border border-zinc-200 dark:border-zinc-800 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Faturas Pagas</p>
              <h3 className="text-lg font-bold text-emerald-700 dark:text-emerald-300 mt-0.5 font-mono">{kpis.faturasPagas || 0}</h3>
            </div>
            <div className="w-9 h-9 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-4.5 h-4.5" />
            </div>
          </div>
          <p className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-2 font-medium">Liquidadas com sucesso</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 border border-zinc-200 dark:border-zinc-800 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Faturas Vencidas</p>
              <h3 className="text-lg font-bold text-rose-700 dark:text-rose-300 mt-0.5 font-mono">{kpis.faturasVencidas || 0}</h3>
            </div>
            <div className="w-9 h-9 bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-200 dark:border-rose-800">
              <AlertTriangle className="w-4.5 h-4.5" />
            </div>
          </div>
          <p className="text-[11px] text-rose-700 dark:text-rose-300 mt-2 font-medium">Aguardam cobrança ativa</p>
        </div>

      </div>

      {/* FILTROS & PESQUISA */}
      <div className="bg-white dark:bg-zinc-900 p-3.5 border border-zinc-200 dark:border-zinc-800 shadow-2xs flex flex-col md:flex-row gap-3 justify-between items-center">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input 
            type="text" 
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Pesquisar por N/Fatura ou Cliente..." 
            className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 pl-9 pr-3.5 py-1.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-zinc-900 dark:focus:border-white transition-colors placeholder:text-zinc-400"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <Filter className="w-3.5 h-3.5 text-zinc-400" />
          <select 
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-800 dark:text-zinc-200 px-3 py-1.5 focus:outline-none focus:border-zinc-900 dark:focus:border-white cursor-pointer"
          >
            <option value="TODOS">Todos os Estados</option>
            <option value="PAGA">Paga / Liquidada</option>
            <option value="EMITIDA">Emitida (Aguarda Pagamento)</option>
            <option value="VENCIDA">Vencida</option>
            <option value="CANCELADA">Anulada / Cancelada</option>
          </select>
        </div>
      </div>

      {/* TABELA DE FATURAS */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300 uppercase bg-zinc-50/50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800">
              <tr>
                <th className="px-4 py-2.5 font-semibold">Doc Nº</th>
                <th className="px-4 py-2.5 font-semibold">Cliente</th>
                <th className="px-4 py-2.5 font-semibold">Hash AGT</th>
                <th className="px-4 py-2.5 font-semibold">Valor Total</th>
                <th className="px-4 py-2.5 font-semibold">Estado</th>
                <th className="px-4 py-2.5 font-semibold">Emissão</th>
                <th className="px-4 py-2.5 font-semibold text-right">Ações & Espelho</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-zinc-800 dark:text-zinc-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-zinc-400">
                    <div className="flex justify-center"><div className="w-5 h-5 border-2 border-zinc-900 dark:border-white border-t-transparent animate-spin" /></div>
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-zinc-400">
                    <Receipt className="w-7 h-7 mx-auto mb-1.5 opacity-40 text-zinc-400" />
                    Nenhum documento fiscal encontrado.
                  </td>
                </tr>
              ) : paginated.map(f => {
                const id = f.id
                const fnome = f.clienteNome || 'Cliente Consumidor Final'
                const tipoDoc = f.tipoDocumento || 'FT'
                const valorNum = Number(f.valor || 0)
                const statusStr = f.status || 'EMITIDA'
                const hashAgt = f.hashAgt || 'AGT-SYS-CERTIFIED'
                const rawDate = f.createdAt
                const dateFormatted = rawDate ? new Date(rawDate).toLocaleDateString('pt-AO') : new Date().toLocaleDateString('pt-AO')

                return (
                  <tr key={f.id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/60 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Receipt className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                        <span className="font-mono font-semibold text-zinc-900 dark:text-white text-xs">{tipoDoc}-{id.toString().padStart(5, '0')}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div>
                        <p className="font-semibold text-zinc-900 dark:text-white text-xs">{fnome}</p>
                        <p className="text-[10px] text-zinc-400 font-mono">NIF: {f.clienteNif || '5418009900'}</p>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 border border-zinc-200 dark:border-zinc-700">
                        <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> {hashAgt.substring(0, 10)}...
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <span className="font-mono font-bold text-zinc-900 dark:text-white text-xs">
                        Kz {valorNum.toLocaleString('pt-AO')}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-[10px] font-semibold border ${
                        statusStr === 'PAGA' ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' :
                        statusStr === 'VENCIDA' ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800' :
                        statusStr === 'CANCELADA' ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700' :
                        'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                      }`}>
                        {statusStr}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">
                      {dateFormatted}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          onClick={() => setSelectedFaturaView(f)}
                          className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
                          title="Ver Espelho do Documento Fiscal"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {statusStr === 'EMITIDA' && (
                          <button 
                            onClick={() => handleUpdateStatus(f.id, 'PAGA')}
                            className="p-1.5 text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer"
                            title="Marcar como Liquidada / Paga"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button 
                          onClick={() => handleDelete(f.id)}
                          className="p-1.5 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer"
                          title="Anular Documento"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <PaginationControl
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          perPage={perPage}
          onPageChange={setCurrentPage}
          onPerPageChange={p => { setPerPage(p); setCurrentPage(1); }}
        />
      </div>

      {/* MODAL NOVA FATURA WITH SEARCHABLE SELECT */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white p-5 max-w-2xl w-full space-y-4 border border-zinc-200 dark:border-zinc-800 shadow-2xl max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <h3 className="text-sm font-bold flex items-center gap-2 text-zinc-900 dark:text-white">
                <Receipt className="w-4.5 h-4.5 text-zinc-800 dark:text-zinc-200" /> Emitir Documento Fiscal Certificado AGT
              </h3>
              <button onClick={() => setShowNewModal(false)} className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5">
              
              <div>
                <ClientSearchSelect
                  label="Pesquisar & Selecionar Entidade / Cliente"
                  value={selectedCliente?.id || null}
                  onChange={handleSelectClient}
                  placeholder="Pesquisa por Nome, NIF, E-mail ou Telefone..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">Tipo de Documento</label>
                  <select 
                    value={tipoDocumento}
                    onChange={e => setTipoDocumento(e.target.value)}
                    className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-zinc-900 dark:focus:border-white cursor-pointer"
                  >
                    <option value="FT">FT - Fatura</option>
                    <option value="FR">FR - Fatura-Recibo</option>
                    <option value="NC">NC - Nota de Crédito</option>
                    <option value="ND">ND - Nota de Débito</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">Nome do Cliente</label>
                  <input 
                    type="text" 
                    value={clienteNome}
                    onChange={e => setClienteNome(e.target.value)}
                    placeholder="Ex: Sonangol E.P."
                    className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-zinc-900 dark:focus:border-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">NIF do Cliente</label>
                  <input 
                    type="text" 
                    value={clienteNif}
                    onChange={e => setClienteNif(e.target.value)}
                    placeholder="Ex: 5418009900"
                    className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-zinc-900 dark:focus:border-white"
                  />
                </div>
              </div>

              {/* ITENS */}
              <div className="space-y-2 pt-1">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-semibold uppercase text-zinc-500 dark:text-zinc-400">Itens / Serviços Faturados</span>
                  <button type="button" onClick={handleAddItem} className="text-xs text-zinc-900 dark:text-white font-semibold hover:underline cursor-pointer">+ Adicionar Item</button>
                </div>

                <div className="bg-zinc-50 dark:bg-zinc-800/50 p-3 border border-zinc-200 dark:border-zinc-700 space-y-2">
                  {itens.map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input 
                        type="text" 
                        value={item.descricao}
                        onChange={e => handleItemChange(idx, 'descricao', e.target.value)}
                        placeholder="Descrição da prestação de serviço ou produto..."
                        className="flex-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-2.5 py-1 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-zinc-900 dark:focus:border-white"
                        required
                      />
                      <input 
                        type="number" 
                        min="1"
                        value={item.qtd}
                        onChange={e => handleItemChange(idx, 'qtd', Number(e.target.value))}
                        className="w-16 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-2 py-1 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-zinc-900 dark:focus:border-white"
                        required
                      />
                      <input 
                        type="number" 
                        step="100"
                        value={item.precoUnit}
                        onChange={e => handleItemChange(idx, 'precoUnit', Number(e.target.value))}
                        className="w-28 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-2 py-1 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-zinc-900 dark:focus:border-white font-mono font-bold"
                        required
                      />
                      <button type="button" onClick={() => handleRemoveItem(idx)} className="text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 p-1 cursor-pointer">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Total com IVA (14%):</span>
                <span className="text-lg font-bold font-mono text-zinc-900 dark:text-white">Kz {subtotal.toLocaleString('pt-AO')}</span>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setShowNewModal(false)} className="px-3.5 py-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer">
                  Cancelar
                </button>
                <button type="submit" disabled={isSaving} className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer">
                  <Receipt className="w-3.5 h-3.5" /> {isSaving ? 'A Certificar...' : 'Emitir & Assinar Digitalmente AGT'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  )
}