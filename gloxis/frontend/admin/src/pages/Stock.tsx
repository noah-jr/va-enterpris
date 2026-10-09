import { PaginationControl } from '../components/PaginationControl'
import { 
  Package, Search, Plus, Trash2, AlertTriangle, 
  DollarSign, CheckCircle2, Filter, Layers, MapPin, Tag, X, 
  ArrowUpDown, ArrowRightLeft 
} from 'lucide-react'
import { useStock } from '../hooks/useStock'

export function Stock() {
  const {
    loading,
    search,
    setSearch,
    categoriaFilter,
    setCategoriaFilter,
    currentPage,
    setCurrentPage,
    perPage,
    setPerPage,
    kpis,
    showModal,
    setShowModal,
    nome,
    setNome,
    codigoSku,
    setCodigoSku,
    categoria,
    setCategoria,
    quantidade,
    setQuantidade,
    precoUnitario,
    setPrecoUnitario,
    localizacao,
    setLocalizacao,
    isSaving,
    selectedForMovement,
    setSelectedForMovement,
    tipoMovimento,
    setTipoMovimento,
    qtdMovimento,
    setQtdMovimento,
    motivoMovimento,
    setMotivoMovimento,
    isSubmittingMovement,
    selectedForTransfer,
    setSelectedForTransfer,
    novoArmazem,
    setNovoArmazem,
    handleDelete,
    handleMovementSubmit,
    handleTransferSubmit,
    handleCreateSubmit,
    totalItems,
    totalPages,
    paginated,
  } = useStock()

  return (
    <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 pb-12 space-y-6 animate-in fade-in duration-300">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5">
            <Package className="w-6 h-6 text-zinc-800 dark:text-zinc-200" /> Gestão de Stock & Inventário
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-0.5">
            Controlo de movimentos de entrada/saída, transferências entre armazéns e alertas de reposição.
          </p>
        </div>

        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 px-3.5 py-1.5 rounded-none font-medium transition-colors shadow-xs text-xs cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> Adicionar Produto ao Stock
        </button>
      </div>

      {/* KPIS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-none border border-zinc-200/80 dark:border-zinc-800 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Valor Total em Stock</p>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-0.5 font-mono">
                Kz {Number(kpis.valorTotalEstoque || 0).toLocaleString('pt-AO')}
              </h3>
            </div>
            <div className="w-9 h-9 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4.5 h-4.5" />
            </div>
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-2 font-medium">Valor de inventário imobilizado</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-none border border-zinc-200/80 dark:border-zinc-800 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Tipos de Produtos</p>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-0.5 font-mono">{kpis.totalItens || 0}</h3>
            </div>
            <div className="w-9 h-9 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300">
              <Package className="w-4.5 h-4.5" />
            </div>
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-2 font-medium">Referências ativas no catálogo</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-none border border-zinc-200/80 dark:border-zinc-800 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Itens em Alerta Crítico</p>
              <h3 className="text-lg font-bold text-rose-700 dark:text-rose-400 mt-0.5 font-mono">{kpis.itensCriticos || 0}</h3>
            </div>
            <div className="w-9 h-9 bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-4.5 h-4.5" />
            </div>
          </div>
          <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-2 font-medium">Abaixo do nível mínimo de segurança</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-none border border-zinc-200/80 dark:border-zinc-800 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Total de Unidades</p>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-0.5 font-mono">{kpis.totalUnidades || 0} un</h3>
            </div>
            <div className="w-9 h-9 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Layers className="w-4.5 h-4.5" />
            </div>
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-2 font-medium">Unidades físicas armazenadas</p>
        </div>

      </div>

      {/* FILTROS & SEARCH */}
      <div className="bg-white dark:bg-zinc-900 p-3.5 rounded-none border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex flex-col md:flex-row gap-3 justify-between items-center">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500" />
          <input 
            type="text" 
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Pesquisar por SKU, Nome do Produto..." 
            className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-none pl-9 pr-3.5 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500 transition-colors placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <Filter className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
          <select 
            value={categoriaFilter}
            onChange={e => setCategoriaFilter(e.target.value)}
            className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-800 dark:text-zinc-200 rounded-none px-3 py-1.5 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500 cursor-pointer"
          >
            <option value="TODOS">Todas as Categorias</option>
            <option value="HARDWARE">Hardware & Servidores</option>
            <option value="REDE">Equipamento de Rede</option>
            <option value="SOFTWARE">Licenças / Mídia</option>
            <option value="ESCRITORIO">Material de Escritório</option>
          </select>
        </div>
      </div>

      {/* TABELA DE STOCK */}
      <div className="bg-white dark:bg-zinc-900 rounded-none border border-zinc-200/80 dark:border-zinc-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase bg-zinc-50/50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800">
              <tr>
                <th className="px-4 py-2.5 font-semibold">SKU / Código</th>
                <th className="px-4 py-2.5 font-semibold">Nome do Produto</th>
                <th className="px-4 py-2.5 font-semibold">Localização</th>
                <th className="px-4 py-2.5 font-semibold">Qtd em Stock</th>
                <th className="px-4 py-2.5 font-semibold">Preço Unit.</th>
                <th className="px-4 py-2.5 font-semibold">Estado Stock</th>
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
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-zinc-400 dark:text-zinc-500">
                    <Package className="w-7 h-7 mx-auto mb-1.5 opacity-40" />
                    Nenhum item em stock.
                  </td>
                </tr>
              ) : paginated.map(item => {
                const sku = item.codigoSku || `SKU-PROD-${item.produtoId || item.id}`
                const inome = item.nome || `Produto de Inventário #${item.id}`
                const loc = item.localizacao || 'Armazém Central'
                const qtd = Number(item.quantidade || 0)
                const punit = Number(item.precoUnitario || 0)
                const minAlert = Number(item.minimoAlerta || 10)

                return (
                  <tr key={item.id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/60 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 shrink-0" />
                        <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100 text-xs">{sku}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div>
                        <p className="font-semibold text-zinc-900 dark:text-zinc-100 text-xs">{inome}</p>
                        <p className="text-[10px] text-zinc-400 dark:text-zinc-500">{item.categoria || 'GERAL'}</p>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-xs text-zinc-600 dark:text-zinc-400">
                        <MapPin className="w-3 h-3 text-zinc-400 dark:text-zinc-500" /> {loc}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100 text-xs">{qtd} un</span>
                    </td>

                    <td className="px-4 py-3">
                      <span className="font-mono text-zinc-900 dark:text-zinc-100 font-bold text-xs">
                        Kz {punit.toLocaleString('pt-AO')}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      {qtd <= minAlert ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-none text-[10px] font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                          <AlertTriangle className="w-3 h-3" /> Crítico (&le;{minAlert})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-none text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="w-3 h-3" /> Em Stock Normal
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button 
                          onClick={() => setSelectedForMovement(item)}
                          className="px-2.5 py-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors text-xs font-medium flex items-center gap-1 cursor-pointer"
                          title="Entrada / Saída / Ajuste"
                        >
                          <ArrowUpDown className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" /> Movimento
                        </button>

                        <button 
                          onClick={() => setSelectedForTransfer(item)}
                          className="p-1 text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                          title="Transferir de Armazém"
                        >
                          <ArrowRightLeft className="w-3.5 h-3.5" />
                        </button>

                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="p-1 text-zinc-400 dark:text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                          title="Remover Item"
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

      {/* MODAL MOVIMENTAÇÃO DE STOCK */}
      {selectedForMovement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 rounded-none p-5 max-w-md w-full space-y-4 border border-zinc-200/90 dark:border-zinc-800 shadow-xl">
            
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <h3 className="text-sm font-bold flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                <ArrowUpDown className="w-4.5 h-4.5 text-zinc-800 dark:text-zinc-200" /> Movimento de Stock & Inventário
              </h3>
              <button onClick={() => setSelectedForMovement(null)} className="text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleMovementSubmit} className="space-y-3.5">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Movimentação física para: <strong className="text-zinc-900 dark:text-zinc-100">{selectedForMovement.nome}</strong> (Qtd Atual: {selectedForMovement.quantidade} un)
              </p>

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">Tipo de Operação</label>
                <div className="grid grid-cols-3 gap-2">
                  <button 
                    type="button" 
                    onClick={() => setTipoMovimento('ENTRADA')}
                    className={`py-1.5 text-xs font-semibold border transition-all cursor-pointer ${tipoMovimento === 'ENTRADA' ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300' : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300'}`}
                  >
                    ENTRADA (+)
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setTipoMovimento('SAIDA')}
                    className={`py-1.5 text-xs font-semibold border transition-all cursor-pointer ${tipoMovimento === 'SAIDA' ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-700 text-rose-700 dark:text-rose-300' : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300'}`}
                  >
                    SAÍDA (-)
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setTipoMovimento('AJUSTE')}
                    className={`py-1.5 text-xs font-semibold border transition-all cursor-pointer ${tipoMovimento === 'AJUSTE' ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300' : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300'}`}
                  >
                    AJUSTE (=)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
                  {tipoMovimento === 'AJUSTE' ? 'Nova Quantidade Absoluta' : 'Quantidade a Movimentar'} (Unidades)
                </label>
                <input 
                  type="number" 
                  min="1"
                  value={qtdMovimento}
                  onChange={e => setQtdMovimento(Number(e.target.value))}
                  className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 font-mono font-bold focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">Justificativa / Ordem de Saída</label>
                <input 
                  type="text" 
                  value={motivoMovimento}
                  onChange={e => setMotivoMovimento(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <button type="button" onClick={() => setSelectedForMovement(null)} className="px-3 py-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer">
                  Cancelar
                </button>
                <button type="submit" disabled={isSubmittingMovement} className="bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 px-4 py-1.5 text-xs font-semibold transition-colors cursor-pointer">
                  {isSubmittingMovement ? 'A Gravar...' : 'Registar Movimento'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* MODAL TRANSFERÊNCIA DE ARMAZÉM */}
      {selectedForTransfer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 rounded-none p-5 max-w-md w-full space-y-4 border border-zinc-200/90 dark:border-zinc-800 shadow-xl">
            
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <h3 className="text-sm font-bold flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                <ArrowRightLeft className="w-4.5 h-4.5 text-zinc-800 dark:text-zinc-200" /> Transferência Entre Armazéns
              </h3>
              <button onClick={() => setSelectedForTransfer(null)} className="text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleTransferSubmit} className="space-y-3.5">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Transferir o item <strong className="text-zinc-900 dark:text-zinc-100">{selectedForTransfer.nome}</strong> de <span className="text-zinc-800 dark:text-zinc-200 font-semibold">{selectedForTransfer.localizacao}</span> para:
              </p>

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">Armazém de Destino</label>
                <select 
                  value={novoArmazem}
                  onChange={e => setNovoArmazem(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500"
                >
                  <option value="Armazém Central - Luanda">Armazém Central - Luanda</option>
                  <option value="Armazém Filial - Benguela">Armazém Filial - Benguela</option>
                  <option value="Armazém Filial - Huambo">Armazém Filial - Huambo</option>
                  <option value="Armazém Operativo - Cabinda">Armazém Operativo - Cabinda</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <button type="button" onClick={() => setSelectedForTransfer(null)} className="px-3 py-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer">
                  Cancelar
                </button>
                <button type="submit" className="bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 px-4 py-1.5 text-xs font-semibold transition-colors cursor-pointer">
                  Confirmar Transferência
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* MODAL NOVO ITEM */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 rounded-none p-5 max-w-lg w-full space-y-4 border border-zinc-200/90 dark:border-zinc-800 shadow-xl">
            
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <h3 className="text-sm font-bold flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                <Package className="w-4.5 h-4.5 text-zinc-800 dark:text-zinc-200" /> Registar Item em Inventário
              </h3>
              <button onClick={() => setShowModal(false)} className="text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">Nome do Produto</label>
                <input 
                  type="text" 
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  placeholder="Ex: Switch Cisco Catalyst 9300 48P"
                  className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">Código SKU</label>
                  <input 
                    type="text" 
                    value={codigoSku}
                    onChange={e => setCodigoSku(e.target.value)}
                    placeholder="Ex: SKU-CISCO-9300"
                    className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">Categoria</label>
                  <select 
                    value={categoria}
                    onChange={e => setCategoria(e.target.value)}
                    className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500"
                  >
                    <option value="HARDWARE">Hardware & Servidores</option>
                    <option value="REDE">Equipamento de Rede</option>
                    <option value="SOFTWARE">Licenças de Software</option>
                    <option value="ESCRITORIO">Material de Escritório</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">Quantidade Inicial</label>
                  <input 
                    type="number" 
                    min="1"
                    value={quantidade}
                    onChange={e => setQuantidade(Number(e.target.value))}
                    className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">Preço Unitário (Kz)</label>
                  <input 
                    type="number" 
                    step="100"
                    value={precoUnitario}
                    onChange={e => setPrecoUnitario(Number(e.target.value))}
                    className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">Localização do Armazém</label>
                <input 
                  type="text" 
                  value={localizacao}
                  onChange={e => setLocalizacao(e.target.value)}
                  placeholder="Ex: Armazém Central - Luanda / Prateleira B"
                  className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <button type="button" onClick={() => setShowModal(false)} className="px-3 py-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer">
                  Cancelar
                </button>
                <button type="submit" disabled={isSaving} className="bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 px-4 py-1.5 text-xs font-semibold transition-colors cursor-pointer">
                  {isSaving ? 'A Registar...' : 'Salvar no Inventário'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  )
}