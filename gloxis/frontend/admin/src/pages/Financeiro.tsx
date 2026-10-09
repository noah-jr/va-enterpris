import {
  PageShell, PageHeader, KpiCard, DataTable, Table, StatusBadge,
  Toolbar, FilterSelect, BtnPrimary, BtnDanger, Modal, ModalFooter,
  FormField, inputClass, selectClass, Toast, BtnNew, cn,
} from '../components/ui'
import { PaginationControl } from '../components/PaginationControl'
import {
  Landmark, ArrowUpRight, ArrowDownRight, Building2, CreditCard, Trash2
} from 'lucide-react'
import { useState } from 'react'
import { useFinanceiro } from '../hooks/useFinanceiro'

export function Financeiro() {
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  const {
    loading, search, setSearch, tipoFilter, setTipoFilter, kpis,
    showModal, setShowModal, descricao, setDescricao, tipo, setTipo,
    categoria, setCategoria, entidadeNome, setEntidadeNome,
    contaBancaria, setContaBancaria, valorPago, setValorPago,
    isSaving, handleDelete, handleCreateSubmit, filtered,
  } = useFinanceiro()

  const totalItems = filtered.length
  const totalPages = Math.ceil(totalItems / perPage) || 1
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage)

  return (
    <PageShell>
      <PageHeader
        icon={Landmark}
        title="Gestão Financeira & Tesouraria"
        description="Controlo de fluxo de caixa, liquidação de receitas, despesas e conciliação bancária."
      >
        <BtnNew onClick={() => setShowModal(true)} label="Novo Lançamento" />
      </PageHeader>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <KpiCard icon={Landmark} iconBg="bg-zinc-100" iconColor="text-zinc-700"
          label="Saldo Disponível Tesouraria"
          value={`Kz ${Number(kpis.saldoTesouraria || 0).toLocaleString('pt-AO')}`}
          sub="Saldo líquido conciliado" />
        <KpiCard icon={ArrowUpRight} iconBg="bg-emerald-50" iconColor="text-emerald-600"
          label="Receita Total Entradas"
          value={`Kz ${Number(kpis.receitaTotal || 0).toLocaleString('pt-AO')}`}
          sub="Recebimentos e cobranças" />
        <KpiCard icon={ArrowDownRight} iconBg="bg-rose-50" iconColor="text-rose-600"
          label="Despesas Saídas"
          value={`Kz ${Number(kpis.despesaTotal || 0).toLocaleString('pt-AO')}`}
          sub="Pagamentos operacionais" />
        <KpiCard icon={CreditCard} iconBg="bg-zinc-100" iconColor="text-zinc-700"
          label="Total de Movimentos" value={String(kpis.totalTransacoes || 0)}
          sub="Lançamentos em livros caixa" />
      </div>

      {/* Table */}
      <DataTable
        toolbar={
          <Toolbar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Pesquisar por Descrição ou Entidade..."
          >
            <FilterSelect
              value={tipoFilter}
              onChange={setTipoFilter}
              options={[
                { value: 'RECEITA', label: 'Receita (Entrada)' },
                { value: 'DESPESA', label: 'Despesa (Saída)' },
                { value: 'TRANSF', label: 'Transferência' },
              ]}
              placeholder="Todos os Tipos"
            />
          </Toolbar>
        }
        pagination={
          <PaginationControl
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            perPage={perPage}
            onPageChange={setCurrentPage}
            onPerPageChange={p => { setPerPage(p); setCurrentPage(1); }}
          />
        }
      >
        <Table
          headers={['Ref ID', 'Descrição / Beneficiário', 'Conta Bancária', 'Categoria', 'Valor', 'Tipo', 'Ações']}
          loading={loading}
          empty={!loading && paginated.length === 0}
          emptyMessage="Nenhum lançamento financeiro registado."
        >
          {paginated.map(l => {
            const valorNum = Number(l.valorPago || 0)
            const tipoMov = l.tipo || 'RECEITA'
            return (
              <tr key={l.id} className="hover:bg-zinc-50/60 transition-colors">
                <td className="px-4 py-3 font-mono font-semibold text-zinc-900">TRX-{l.id.toString().padStart(6, '0')}</td>
                <td className="px-4 py-3">
                  <p className="font-semibold text-zinc-900 text-xs">{l.descricao || 'Movimentação Financeira'}</p>
                  <p className="text-[10px] text-zinc-400">Entidade: {l.entidadeNome || 'Geral'}</p>
                </td>
                <td className="px-4 py-3 text-xs text-zinc-600 font-mono">
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-zinc-400" />
                    {l.contaBancaria || 'BFA - Conta Corrente'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200">
                    {l.categoria || 'OPERACIONAL'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={cn('font-mono font-bold text-xs',
                    tipoMov === 'RECEITA' ? 'text-emerald-700' :
                    tipoMov === 'DESPESA' ? 'text-rose-600' : 'text-zinc-900'
                  )}>
                    {tipoMov === 'DESPESA' ? '−' : '+'} Kz {valorNum.toLocaleString('pt-AO')}
                  </span>
                </td>
                <td className="px-4 py-3"><StatusBadge status={tipoMov} /></td>
                <td className="px-4 py-3 text-right">
                  <BtnDanger onClick={() => handleDelete(l.id)} icon={Trash2}>Estornar</BtnDanger>
                </td>
              </tr>
            )
          })}
        </Table>
      </DataTable>

      {/* Modal Novo Lançamento */}
      {showModal && (
        <Modal title="Novo Lançamento de Tesouraria" icon={Landmark} onClose={() => setShowModal(false)}>
          <form onSubmit={handleCreateSubmit} className="space-y-3.5">
            <FormField label="Tipo de Movimento">
              <div className="grid grid-cols-3 gap-2">
                {(['RECEITA', 'DESPESA', 'TRANSF'] as const).map(t => (
                  <button key={t} type="button" onClick={() => setTipo(t)}
                    className={cn('py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer',
                      tipo === t && t === 'RECEITA' ? 'bg-emerald-50 border-emerald-300 text-emerald-700' :
                      tipo === t && t === 'DESPESA' ? 'bg-rose-50 border-rose-300 text-rose-700' :
                      tipo === t ? 'bg-zinc-900 border-zinc-900 text-white' :
                      'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                    )}>
                    {t === 'RECEITA' ? '+ RECEITA' : t === 'DESPESA' ? '− DESPESA' : 'TRANSFERÊNCIA'}
                  </button>
                ))}
              </div>
            </FormField>

            <FormField label="Descrição do Lançamento" required>
              <input type="text" value={descricao} onChange={e => setDescricao(e.target.value)}
                placeholder="Ex: Recebimento Fatura FT-00012" className={inputClass} required />
            </FormField>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Entidade / Beneficiário">
                <input type="text" value={entidadeNome} onChange={e => setEntidadeNome(e.target.value)}
                  placeholder="Ex: Cliente / Fornecedor" className={inputClass} />
              </FormField>
              <FormField label="Categoria">
                <select value={categoria} onChange={e => setCategoria(e.target.value)} className={selectClass}>
                  <option value="OPERACIONAL">Operacional</option>
                  <option value="SALARIOS">Salários / Pessoal</option>
                  <option value="FORNECEDORES">Pagamento Fornecedores</option>
                  <option value="IMPOSTOS">Impostos AGT (IVA/IRT)</option>
                  <option value="INVESTIMENTO">CAPEX / Investimento</option>
                </select>
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Conta Bancária">
                <select value={contaBancaria} onChange={e => setContaBancaria(e.target.value)} className={selectClass}>
                  <option value="BFA - Conta Corrente Principal">BFA - Conta Principal</option>
                  <option value="BAI - Conta Operacional">BAI - Conta Operacional</option>
                  <option value="BIC - Conta Tesouraria">BIC - Conta Tesouraria</option>
                  <option value="CAIXA GERAL LUANDA">Caixa Geral Luanda</option>
                </select>
              </FormField>
              <FormField label="Valor (Kz)" required>
                <input type="number" step="100" value={valorPago} onChange={e => setValorPago(Number(e.target.value))}
                  className={inputClass} required />
              </FormField>
            </div>

            <ModalFooter onCancel={() => setShowModal(false)}>
              <BtnPrimary type="submit" loading={isSaving}>
                {isSaving ? 'A Processar...' : 'Salvar Movimentação'}
              </BtnPrimary>
            </ModalFooter>
          </form>
        </Modal>
      )}
    </PageShell>
  )
}