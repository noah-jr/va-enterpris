import { ClientSearchSelect } from '../components/ClientSearchSelect'
import { PaginationControl } from '../components/PaginationControl'
import { 
  ShoppingCart, Search, Plus, Trash2, CreditCard, 
  DollarSign, CheckCircle2, XCircle, Clock, Filter, 
  Printer, User, ArrowUpRight, Receipt, Calculator, Eye, Layers, 
  Percent 
} from 'lucide-react'
import { useState } from 'react'
import { useVendas, type ItemVenda } from '../hooks/useVendas'

export function Vendas() {
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  const {
    activeTab,
    setActiveTab,
    vendas,
    loading,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    kpis,
    selectedClienteId,
    setSelectedClienteId,
    clienteNomeManual,
    setClienteNomeManual,
    formaPagamento,
    setFormaPagamento,
    descontoPerc,
    setDescontoPerc,
    impostoIvaPerc,
    setImpostoIvaPerc,
    notasVenda,
    setNotasVenda,
    isSavingVenda,
    selectedForDiscount,
    setSelectedForDiscount,
    descontoValorEspecial,
    setDescontoValorEspecial,
    itens,
    selectedVendaReceipt,
    setSelectedVendaReceipt,
    subtotal,
    totalFinal,
    handleAddItem,
    handleRemoveItem,
    handleItemChange,
    handleDelete,
    handleUpdateStatus,
    handleApplyDiscountSubmit,
    handleCreateVendaSubmit,
    filteredVendas,
  } = useVendas()

  const totalItems = filteredVendas.length
  const totalPages = Math.ceil(totalItems / perPage) || 1
  const paginatedVendas = filteredVendas.slice((currentPage - 1) * perPage, currentPage * perPage)

  return (
    <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 pb-12 space-y-6 animate-in fade-in duration-300">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5">
            <ShoppingCart className="w-6 h-6 text-zinc-800 dark:text-zinc-200" /> Gestão de Vendas & Faturação Commercial POS
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-0.5">
            Controlo de vendas, liquidações, descontos comerciais e emissão de faturas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setActiveTab('pos')}
            className="flex items-center gap-2 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 px-3.5 py-1.5 font-medium transition-colors shadow-xs text-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Terminal POS / Emitir Venda
          </button>
        </div>
      </div>

      {/* KPI METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        <div className="bg-white dark:bg-zinc-900 p-4 border border-zinc-200/80 dark:border-zinc-800 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Faturação Liquidada</p>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-0.5 font-mono">
                Kz {Number(kpis.receitaTotal || 0).toLocaleString('pt-AO')}
              </h3>
            </div>
            <div className="w-9 h-9 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4.5 h-4.5" />
            </div>
          </div>
          <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-2 flex items-center gap-1 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Total acumulado em vendas pagas
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 border border-zinc-200/80 dark:border-zinc-800 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Total de Vendas</p>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-0.5 font-mono">{kpis.totalVendas || 0}</h3>
            </div>
            <div className="w-9 h-9 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <ShoppingCart className="w-4.5 h-4.5" />
            </div>
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-2 font-medium">Operações registadas no sistema</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 border border-zinc-200/80 dark:border-zinc-800 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Vendas Pendentes</p>
              <h3 className="text-lg font-bold text-amber-700 dark:text-amber-400 mt-0.5 font-mono">{kpis.vendasPendentes || 0}</h3>
            </div>
            <div className="w-9 h-9 bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-4.5 h-4.5" />
            </div>
          </div>
          <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-2 font-medium">Faturas a aguardar pagamento</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 border border-zinc-200/80 dark:border-zinc-800 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Ticket Médio</p>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-0.5 font-mono">
                Kz {Number(kpis.ticketMedio || 0).toLocaleString('pt-AO', { maximumFractionDigits: 0 })}
              </h3>
            </div>
            <div className="w-9 h-9 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300">
              <Calculator className="w-4.5 h-4.5" />
            </div>
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-2 font-medium">Média por transação</p>
        </div>

      </div>

      {/* TABS NAVIGATION */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 gap-8 overflow-x-auto">
        <button
          onClick={() => setActiveTab('vendas')}
          className={`pb-3 font-medium text-xs transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'vendas' 
              ? 'text-zinc-900 dark:text-zinc-100 border-b-2 border-zinc-900 dark:border-zinc-100 font-bold' 
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
        >
          <Receipt className="w-4 h-4" /> Histórico de Vendas & Gestão Comercial
          <span className="px-2 py-0.5 text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
            {vendas.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('pos')}
          className={`pb-3 font-medium text-xs transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'pos' 
              ? 'text-zinc-900 dark:text-zinc-100 border-b-2 border-zinc-900 dark:border-zinc-100 font-bold' 
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
        >
          <ShoppingCart className="w-4 h-4 text-zinc-700 dark:text-zinc-300" /> Terminal POS / Emitir Nova Venda
        </button>
      </div>

      {/* TAB 1: HISTÓRICO DE VENDAS */}
      {activeTab === 'vendas' && (
        <div className="space-y-6">
          
          {/* FILTERS & SEARCH */}
          <div className="bg-white dark:bg-zinc-900 p-3.5 border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex flex-col md:flex-row gap-3 justify-between items-center">
            <div className="relative flex-1 w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500" />
              <input 
                type="text" 
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Pesquisar por ID da venda, nome do cliente..." 
                className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 pl-9 pr-3.5 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500 transition-colors placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
              />
            </div>

            <div className="flex items-center gap-2.5 w-full md:w-auto">
              <Filter className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
              <select 
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-800 dark:text-zinc-200 px-3 py-1.5 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500 cursor-pointer"
              >
                <option value="TODOS">Todos os Estados</option>
                <option value="PAGO">Pago / Liquidado</option>
                <option value="PENDENTE">Pendente</option>
                <option value="CANCELADO">Cancelado</option>
              </select>
            </div>
          </div>

          {/* TABLE OF SALES */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase bg-zinc-50/50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800">
                  <tr>
                    <th className="px-4 py-2.5 font-semibold">Nº Venda / Fatura</th>
                    <th className="px-4 py-2.5 font-semibold">Cliente</th>
                    <th className="px-4 py-2.5 font-semibold">Pagamento</th>
                    <th className="px-4 py-2.5 font-semibold">Valor Total</th>
                    <th className="px-4 py-2.5 font-semibold">Estado</th>
                    <th className="px-4 py-2.5 font-semibold">Data Emissão</th>
                    <th className="px-4 py-2.5 font-semibold text-right">Gestão & Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-zinc-800 dark:text-zinc-200">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-zinc-400 dark:text-zinc-500">
                        <div className="flex justify-center"><div className="w-5 h-5 border-2 border-zinc-900 dark:border-zinc-100 border-t-transparent animate-spin" /></div>
                      </td>
                    </tr>
                  ) : paginatedVendas.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-zinc-400 dark:text-zinc-500">
                        <ShoppingCart className="w-7 h-7 mx-auto mb-1.5 opacity-40" />
                        Nenhuma venda encontrada no registo comercial.
                      </td>
                    </tr>
                  ) : paginatedVendas.map(v => {
                    const id = v.id
                    const clienteNome = v.clienteNome || 'Consumidor Final'
                    const clienteEmail = v.clienteEmail || 'Sem email'
                    const formaPagamentoStr = v.formaPagamento || 'MULTICAIXA'
                    const valorNum = Number(v.valor || 0)
                    const statusStr = v.status || 'PENDENTE'
                    const rawDate = v.createdAt
                    const dateFormatted = rawDate ? new Date(rawDate).toLocaleString('pt-AO') : new Date().toLocaleString('pt-AO')

                    return (
                      <tr key={v.id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/60 transition-colors">
                        
                        {/* ID Venda */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <Receipt className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 shrink-0" />
                            <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">VND-{id.toString().padStart(4, '0')}</span>
                          </div>
                        </td>

                        {/* Cliente */}
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 text-xs">
                              <User className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" /> {clienteNome}
                            </p>
                            <p className="text-[10px] text-zinc-400 dark:text-zinc-500">{clienteEmail}</p>
                          </div>
                        </td>

                        {/* Pagamento */}
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700 text-[10px] font-semibold text-zinc-700 dark:text-zinc-300">
                            <CreditCard className="w-3 h-3 text-zinc-500 dark:text-zinc-400" /> {formaPagamentoStr}
                          </span>
                        </td>

                        {/* Valor */}
                        <td className="px-4 py-3">
                          <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100 text-xs">
                            Kz {valorNum.toLocaleString('pt-AO')}
                          </span>
                        </td>

                        {/* Estado */}
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 text-[10px] font-semibold border ${
                            statusStr === 'PAGO' ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' :
                            statusStr === 'CANCELADO' ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800' :
                            'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                          }`}>
                            {statusStr}
                          </span>
                        </td>

                        {/* Data */}
                        <td className="px-4 py-3 text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">
                          {dateFormatted}
                        </td>

                        {/* Ações */}
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            
                            {/* Botão Desconto Especial */}
                            <button 
                              onClick={() => setSelectedForDiscount(v)}
                              className="px-2 py-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors text-xs font-medium flex items-center gap-1 cursor-pointer"
                              title="Aplicar Desconto Comercial"
                            >
                              <Percent className="w-3 h-3 text-zinc-500 dark:text-zinc-400" /> Desconto
                            </button>

                            {/* Ver Recibo / Fatura */}
                            <button 
                              onClick={() => setSelectedVendaReceipt(v)}
                              className="p-1 text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                              title="Ver Fatura / Recibo"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* Alterar para PAGO */}
                            {statusStr === 'PENDENTE' && (
                              <button 
                                onClick={() => handleUpdateStatus(v.id, 'PAGO')}
                                className="p-1 text-zinc-400 dark:text-zinc-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                                title="Marcar como Pago"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Cancelar */}
                            <button 
                              onClick={() => handleDelete(v.id)} 
                              className="p-1 text-zinc-400 dark:text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                              title="Cancelar Venda"
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

        </div>
      )}

      {/* TAB 2: TERMINAL POS / EMITIR NOVA VENDA */}
      {activeTab === 'pos' && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 p-5 space-y-5 shadow-xs">
          <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <ShoppingCart className="w-4.5 h-4.5 text-zinc-800 dark:text-zinc-200" /> Terminal POS Commercial / Faturação Direta
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Preencha os itens e selecione o cliente para emitir a venda no sistema backend.</p>
            </div>
            <span className="text-[10px] font-mono font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 border border-emerald-200 dark:border-emerald-800">
              Caixa Aberto / Operador
            </span>
          </div>

          <form onSubmit={e => handleCreateVendaSubmit(e, 'PAGO')} className="space-y-5">
            
            {/* SELEÇÃO CLIENTE & PAGAMENTO */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 bg-zinc-50 dark:bg-zinc-800/40 p-3.5 border border-zinc-200/80 dark:border-zinc-800">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">Cliente Registado (CRM)</label>
                <ClientSearchSelect 
                  value={selectedClienteId ? Number(selectedClienteId) : null}
                  onChange={(clientId, client) => {
                    setSelectedClienteId(clientId ? String(clientId) : '')
                    if (client) {
                      setClienteNomeManual(client.nome)
                    }
                  }}
                  placeholder="Pesquisar por Nome, NIF, Email ou Telefone..."
                />
              </div>

              {!selectedClienteId && (
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">Nome do Cliente Manual</label>
                  <input 
                    type="text" 
                    value={clienteNomeManual}
                    onChange={e => setClienteNomeManual(e.target.value)}
                    placeholder="Ex: Manuel António"
                    className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">Forma de Pagamento</label>
                <select 
                  value={formaPagamento}
                  onChange={e => setFormaPagamento(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500"
                >
                  <option value="MULTICAIXA">TPA Multicaixa / Express</option>
                  <option value="TRANSFERENCIA">Transferência Bancária</option>
                  <option value="DINHEIRO">Dinheiro Vivo / Espécie</option>
                  <option value="REEMBOLSO">Conta Corrente Crédito</option>
                </select>
              </div>
            </div>

            {/* TABELA DE ITENS DA VENDA */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" /> Itens da Venda / Serviços
                </h4>
                <button 
                  type="button" 
                  onClick={handleAddItem}
                  className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 px-3 py-1 text-xs font-medium flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar Item
                </button>
              </div>

              <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 overflow-hidden">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-zinc-50/50 dark:bg-zinc-800/50 text-zinc-400 dark:text-zinc-500 uppercase text-[10px] border-b border-zinc-100 dark:border-zinc-800">
                    <tr>
                      <th className="px-3.5 py-2 font-semibold">Descrição do Item / Produto</th>
                      <th className="px-3.5 py-2 font-semibold w-24">Qtd</th>
                      <th className="px-3.5 py-2 font-semibold w-36">Preço Unit. (Kz)</th>
                      <th className="px-3.5 py-2 font-semibold w-36 text-right">Total (Kz)</th>
                      <th className="px-3.5 py-2 font-semibold w-16 text-center">Remover</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {itens.map((item, idx) => (
                      <tr key={idx} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50">
                        <td className="px-3.5 py-2">
                          <input 
                            type="text" 
                            value={item.descricao}
                            onChange={e => handleItemChange(idx, 'descricao', e.target.value)}
                            placeholder="Descrição do produto ou serviço..."
                            className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-2.5 py-1 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500"
                            required
                          />
                        </td>
                        <td className="px-3.5 py-2">
                          <input 
                            type="number" 
                            min="1"
                            value={item.qtd}
                            onChange={e => handleItemChange(idx, 'qtd', Number(e.target.value))}
                            className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-2 py-1 text-xs text-zinc-900 dark:text-zinc-100 font-mono focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500"
                            required
                          />
                        </td>
                        <td className="px-3.5 py-2">
                          <input 
                            type="number" 
                            step="100"
                            value={item.precoUnit}
                            onChange={e => handleItemChange(idx, 'precoUnit', Number(e.target.value))}
                            className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-2 py-1 text-xs text-zinc-900 dark:text-zinc-100 font-mono focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500"
                            required
                          />
                        </td>
                        <td className="px-3.5 py-2 text-right font-mono font-bold text-zinc-900 dark:text-zinc-100">
                          Kz {Number(item.qtd * item.precoUnit).toLocaleString('pt-AO')}
                        </td>
                        <td className="px-3.5 py-2 text-center">
                          <button 
                            type="button" 
                            onClick={() => handleRemoveItem(idx)}
                            className="p-1 text-zinc-400 dark:text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* RESUMO DE VALORES E DESCONTOS */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-3 border-t border-zinc-100 dark:border-zinc-800">
              <div className="md:col-span-7 space-y-2">
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Notas / Observações na Fatura</label>
                <textarea 
                  value={notasVenda}
                  onChange={e => setNotasVenda(e.target.value)}
                  placeholder="Instruções de pagamento, referência bancária..."
                  className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-2.5 text-xs text-zinc-900 dark:text-zinc-100 h-24 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500"
                />
              </div>

              <div className="md:col-span-5 bg-zinc-50 dark:bg-zinc-800/40 p-4 border border-zinc-200/80 dark:border-zinc-800 space-y-2.5">
                <div className="flex justify-between text-xs text-zinc-600 dark:text-zinc-400">
                  <span>Subtotal Bruto:</span>
                  <span className="font-mono text-zinc-900 dark:text-zinc-100 font-bold">Kz {subtotal.toLocaleString('pt-AO')}</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-600 dark:text-zinc-400">Desconto (%):</span>
                  <input 
                    type="number" 
                    min="0" 
                    max="100" 
                    value={descontoPerc}
                    onChange={e => setDescontoPerc(Number(e.target.value))}
                    className="w-20 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-2 py-1 text-right text-xs text-zinc-900 dark:text-zinc-100 font-mono focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500"
                  />
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-600 dark:text-zinc-400">Imposto IVA (%):</span>
                  <input 
                    type="number" 
                    min="0" 
                    max="30" 
                    value={impostoIvaPerc}
                    onChange={e => setImpostoIvaPerc(Number(e.target.value))}
                    className="w-20 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-2 py-1 text-right text-xs text-zinc-900 dark:text-zinc-100 font-mono focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500"
                  />
                </div>

                <div className="border-t border-zinc-200 dark:border-zinc-700 pt-2.5 flex justify-between items-center">
                  <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">Total a Pagar:</span>
                  <span className="text-xl font-bold font-mono text-zinc-900 dark:text-zinc-100">
                    Kz {totalFinal.toLocaleString('pt-AO', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex gap-2.5 pt-1.5">
                  <button 
                    type="button"
                    onClick={e => handleCreateVendaSubmit(e, 'PENDENTE')}
                    disabled={isSavingVenda}
                    className="flex-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 py-2 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Emitir Pendente
                  </button>

                  <button 
                    type="submit" 
                    disabled={isSavingVenda}
                    className="flex-1 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 py-2 text-xs font-semibold transition-colors shadow-xs cursor-pointer"
                  >
                    {isSavingVenda ? 'A Gravar...' : 'Emitir & Liquidar (Pago)'}
                  </button>
                </div>
              </div>
            </div>

          </form>
        </div>
      )}

      {/* MODAL DESCONTO ESPECIAL */}
      {selectedForDiscount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 p-5 max-w-md w-full space-y-4 border border-zinc-200/90 dark:border-zinc-800 shadow-xl">
            
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <h3 className="text-sm font-bold flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                <Percent className="w-4.5 h-4.5 text-zinc-800 dark:text-zinc-200" /> Conceder Desconto Comercial
              </h3>
              <button onClick={() => setSelectedForDiscount(null)} className="text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer">
                <XCircle className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleApplyDiscountSubmit} className="space-y-3.5">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Abater valor na venda <strong className="text-zinc-900 dark:text-zinc-100">VND-{selectedForDiscount.id}</strong> (Valor Atual: Kz {Number(selectedForDiscount.valor).toLocaleString('pt-AO')}):
              </p>

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">Valor do Desconto Aprovado (Kz)</label>
                <input 
                  type="number" 
                  step="1000"
                  value={descontoValorEspecial}
                  onChange={e => setDescontoValorEspecial(Number(e.target.value))}
                  className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 font-mono font-bold focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <button type="button" onClick={() => setSelectedForDiscount(null)} className="px-3 py-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer">
                  Cancelar
                </button>
                <button type="submit" className="bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 px-4 py-1.5 text-xs font-semibold transition-colors cursor-pointer">
                  Aplicar Desconto
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* MODAL RECEIPT / FATURA COMERCIAL */}
      {selectedVendaReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 p-6 max-w-2xl w-full space-y-5 shadow-xl border border-zinc-200 dark:border-zinc-800 font-sans max-h-[90vh] overflow-y-auto">
            
            {/* FATURA HEADER */}
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
              <div>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">GLOXIS FINTECH S.A.</h2>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">NIF: 5418009212 | Luanda, Angola</p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Departamento Comercial & Faturação</p>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 border border-emerald-200 dark:border-emerald-800 uppercase">
                  {selectedVendaReceipt.status}
                </span>
                <p className="font-mono font-bold text-base text-zinc-900 dark:text-zinc-100 mt-1.5">
                  VND-{selectedVendaReceipt.id.toString().padStart(4, '0')}
                </p>
              </div>
            </div>

            {/* DADOS DO CLIENTE & EMISSÃO */}
            <div className="grid grid-cols-2 gap-4 bg-zinc-50 dark:bg-zinc-800/40 p-3.5 text-xs border border-zinc-200/80 dark:border-zinc-800">
              <div>
                <p className="font-semibold text-zinc-500 dark:text-zinc-400 uppercase text-[10px]">Cliente / Destinatário:</p>
                <p className="font-bold text-zinc-900 dark:text-zinc-100 text-xs mt-0.5">{selectedVendaReceipt.clienteNome || 'Consumidor Final'}</p>
                <p className="text-zinc-500 dark:text-zinc-400 text-[11px]">{selectedVendaReceipt.clienteEmail || 'Sem e-mail registado'}</p>
              </div>

              <div>
                <p className="font-semibold text-zinc-500 dark:text-zinc-400 uppercase text-[10px]">Detalhes da Transação:</p>
                <p className="text-zinc-800 dark:text-zinc-200 font-medium text-xs mt-0.5">Forma: {selectedVendaReceipt.formaPagamento || 'MULTICAIXA'}</p>
                <p className="text-zinc-500 dark:text-zinc-400 text-[11px]">Data: {selectedVendaReceipt.createdAt ? new Date(selectedVendaReceipt.createdAt).toLocaleString('pt-AO') : new Date().toLocaleString('pt-AO')}</p>
              </div>
            </div>

            {/* ITENS DETALHADOS */}
            <div className="space-y-2">
              <h4 className="text-[10px] font-semibold uppercase text-zinc-500 dark:text-zinc-400">Discriminação de Produtos / Serviços</h4>
              <div className="border border-zinc-200/80 dark:border-zinc-800 overflow-hidden text-xs">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 font-semibold uppercase text-[10px]">
                    <tr>
                      <th className="p-2.5">Descrição</th>
                      <th className="p-2.5 w-16">Qtd</th>
                      <th className="p-2.5 w-28">Preço Unit.</th>
                      <th className="p-2.5 w-28 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-zinc-800 dark:text-zinc-200">
                    {(() => {
                      const jsonRaw = selectedVendaReceipt.itensJson || '[]'
                      let arrayItens: ItemVenda[] = []
                      try {
                        arrayItens = typeof jsonRaw === 'string' ? JSON.parse(jsonRaw) : jsonRaw
                      } catch {
                        arrayItens = []
                      }
                      if (!Array.isArray(arrayItens) || arrayItens.length === 0) {
                        return (
                          <tr>
                            <td colSpan={4} className="p-3 text-center text-zinc-400 dark:text-zinc-500">Sem itens registados</td>
                          </tr>
                        )
                      }
                      return arrayItens.map((it, i) => (
                        <tr key={i}>
                          <td className="p-2.5 font-medium text-zinc-900 dark:text-zinc-100">{it.descricao || 'Item de Venda'}</td>
                          <td className="p-2.5 font-mono">{it.qtd || 1}</td>
                          <td className="p-2.5 font-mono">Kz {Number(it.precoUnit || 0).toLocaleString('pt-AO')}</td>
                          <td className="p-2.5 font-mono font-bold text-right text-zinc-900 dark:text-zinc-100">Kz {Number((it.qtd || 1) * (it.precoUnit || 0)).toLocaleString('pt-AO')}</td>
                        </tr>
                      ))
                    })()}
                  </tbody>
                </table>
              </div>
            </div>

            {/* TOTAL E AÇÕES DE IMPRESSÃO */}
            <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3.5 flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <p className="text-zinc-500 dark:text-zinc-400 font-medium text-[11px]">Imposto IVA ({selectedVendaReceipt.impostoIva || 14}%): Kz {Number(selectedVendaReceipt.desconto || 0).toLocaleString('pt-AO')}</p>
                <p className="font-mono text-sm font-bold text-zinc-900 dark:text-zinc-100">Total Liquidado: Kz {Number(selectedVendaReceipt.valor || 0).toLocaleString('pt-AO')}</p>
              </div>

              <div className="flex gap-2">
                <button onClick={() => window.print()} className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-3.5 py-1.5 font-semibold flex items-center gap-1.5 hover:bg-zinc-800 dark:hover:bg-white transition-colors text-xs cursor-pointer">
                  <Printer className="w-3.5 h-3.5" /> Imprimir Fatura
                </button>
                <button onClick={() => setSelectedVendaReceipt(null)} className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 px-3.5 py-1.5 font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors text-xs cursor-pointer">
                  Fechar
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}