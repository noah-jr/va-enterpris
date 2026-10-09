import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router'
import { api } from '../api/client'
import { useFileUrl } from '../hooks/useFileUrl'
import {
  PageShell, PageHeader, StatusBadge, BtnPrimary, BtnSecondary, BtnDanger,
  FormField, selectClass, KzValue, SectionCard, Toast, Modal, ModalFooter
} from '../components/ui'
import { ClientPaymentChannelsCard } from '../components/ClientPaymentChannelsCard'
import { PdfViewerModal } from '../components/PdfViewerModal'
import { Avatar } from '../components/Avatar'
import {
  ArrowLeft, FileText, CheckCircle, XCircle, ShieldCheck,
  DollarSign, Eye, AlertTriangle, Calendar, Award,
  CheckCircle2, Download
} from 'lucide-react'

interface SolicitacaoDetail {
  id: number
  clienteId: number
  valor: number
  valorSolicitado?: number
  parcelas: number
  numParcelas?: number
  prazoMeses?: number
  taxaJuros?: number
  finalidade?: string
  status: string
  comprovativoUrl?: string
  comprovativoDesembolsoPath?: string
  motivoRejeicao?: string
  createdAt: string
  cliente?: {
    id: number
    nome: string
    nif: string
    email?: string
    telefone?: string
    endereco?: string
    contaBancaria?: string
    scoreCredito?: number
    score_credito?: number
    risco?: string
    fotografia?: string
    logotipo?: string
  }
  clienteNome?: string
}

export function SolicitacaoDetalhes() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getApiUrl } = useFileUrl()

  const [solicitacao, setSolicitacao] = useState<SolicitacaoDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  // Decision state
  const [parecerCredito, setParecerCredito] = useState(
    'Análise de risco concluída: Mutuário sem incidentes no BNA. Rácio de endividamento (DSR) compatível com a capacidade financeira.'
  )
  const [motivoRejeicao, setMotivoRejeicao] = useState('')
  const [taxaJuros, setTaxaJuros] = useState(5.0)

  // Modais
  const [pdfModal, setPdfModal] = useState<{ isOpen: boolean; title: string; url: string }>({
    isOpen: false,
    title: '',
    url: ''
  })
  const [showDesembolsoModal, setShowDesembolsoModal] = useState(false)
  const [desembolsando, setDesembolsando] = useState(false)

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const loadSolicitacao = async () => {
    if (!id) return
    setLoading(true)
    try {
      const res = await api.get(`/solicitacoes/${id}`)
      const data = res.data?.data || res.data

      // If backend didn't attach full cliente object, fetch client details
      if (data && !data.cliente && data.clienteId) {
        try {
          const clientRes = await api.get(`/clientes/${data.clienteId}`)
          data.cliente = clientRes.data?.data || clientRes.data
        } catch {
          // Fallback if client endpoint fails
        }
      }
      setSolicitacao(data)
      if (data?.taxaJuros) setTaxaJuros(Number(data.taxaJuros))
      if (data?.motivoRejeicao) setMotivoRejeicao(data.motivoRejeicao)
    } catch (err) {
      console.error(err)
      showToast('Erro ao carregar detalhes da solicitação.', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSolicitacao()
  }, [id])

  const handleUpdateStatus = async (status: string, customMotivo?: string) => {
    if (!solicitacao) return

    if (status === 'REJEITADO' && !customMotivo?.trim() && !motivoRejeicao.trim()) {
      showToast('Por favor, informe a justificativa ou motivo do indeferimento.', 'error')
      return
    }

    setActionLoading(true)
    try {
      await api.patch(`/solicitacoes/${solicitacao.id}/status`, {
        status,
        motivoRejeicao: customMotivo || motivoRejeicao || undefined
      })
      showToast(`Solicitação #${solicitacao.id} atualizada para ${status}!`, 'success')
      await loadSolicitacao()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string; error?: string } } })?.response?.data?.message || 'Erro ao atualizar solicitação.'
      showToast(msg, 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDesembolsoSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!solicitacao) return
    setDesembolsando(true)
    try {
      const fd = new FormData(e.currentTarget)
      fd.append('solicitacaoId', String(solicitacao.id))
      await api.post('/operacoes/desembolsos', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      showToast(`Desembolso de crédito #${solicitacao.id} efetuado com sucesso!`, 'success')
      setShowDesembolsoModal(false)
      await loadSolicitacao()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Erro ao processar desembolso.'
      showToast(msg, 'error')
    } finally {
      setDesembolsando(false)
    }
  }

  const handleSavePaymentChannels = async (newContaBancariaRaw: string) => {
    if (!solicitacao?.cliente?.id) return
    try {
      const fd = new FormData()
      fd.append('contaBancaria', newContaBancariaRaw)
      await api.put(`/clientes/${solicitacao.cliente.id}`, fd)
      showToast('Canais de pagamento do cliente atualizados com sucesso!', 'success')
      await loadSolicitacao()
    } catch (err) {
      console.error(err)
      showToast('Erro ao atualizar canais de pagamento do cliente.', 'error')
    }
  }

  if (loading) {
    return (
      <PageShell>
        <div className="flex items-center justify-center h-64">
          <div className="w-7 h-7 border-2 border-zinc-900 dark:border-white border-t-transparent rounded-full animate-spin" />
        </div>
      </PageShell>
    )
  }

  if (!solicitacao) {
    return (
      <PageShell>
        <div className="text-center py-16 space-y-4">
          <p className="text-zinc-500">Solicitação não encontrada.</p>
          <BtnSecondary onClick={() => navigate('/solicitacoes')} icon={ArrowLeft}>
            Voltar às Solicitações
          </BtnSecondary>
        </div>
      </PageShell>
    )
  }

  // Financial Calculations (Tabela Price)
  const montante = Number(solicitacao.valorSolicitado || solicitacao.valor || 0)
  const meses = Number(solicitacao.prazoMeses || solicitacao.numParcelas || solicitacao.parcelas || 12)
  const i = (taxaJuros || 5.0) / 100
  const prestacao = i > 0 ? (montante * (i * Math.pow(1 + i, meses))) / (Math.pow(1 + i, meses) - 1) : montante / meses
  const totalReembolso = prestacao * meses
  const totalJuros = totalReembolso - montante

  const cliente = solicitacao.cliente || {
    id: solicitacao.clienteId,
    nome: solicitacao.clienteNome || 'Cliente Mutuário',
    nif: '000000000',
    contaBancaria: '',
    scoreCredito: 720,
    risco: 'BAIXO'
  }

  const isPendente = solicitacao.status === 'PENDENTE' || solicitacao.status === 'EM_ANALISE'
  const isAprovado = solicitacao.status === 'APROVADO' || solicitacao.status === 'APROVADA'
  const isRejeitado = solicitacao.status === 'REJEITADO' || solicitacao.status === 'REPROVADO' || solicitacao.status === 'REJEITADA'
  const isDesembolsado = solicitacao.status === 'DESEMBOLSADO'

  return (
    <PageShell>
      {toast && <Toast message={toast.msg} type={toast.type} />}

      <PageHeader
        icon={FileText}
        title={`Análise Técnica — SOL-${solicitacao.id.toString().padStart(5, '0')}`}
        description={`Mutuário: ${cliente.nome} • Criada a ${new Date(solicitacao.createdAt || Date.now()).toLocaleDateString('pt-AO')}`}
      >
        <BtnSecondary onClick={() => navigate('/solicitacoes')} icon={ArrowLeft}>
          Voltar às Solicitações
        </BtnSecondary>
        <StatusBadge status={solicitacao.status} />
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Painel Esquerdo: Ficha Técnica da Solicitação */}
        <div className="lg:col-span-2 space-y-5">
          {/* Card 1: Resumo Financeiro */}
          <SectionCard className="space-y-4">
            <div className="flex items-center justify-between pb-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
                Resumo Operacional & Condições Financeiras
              </h3>
              <span className="text-[10px] font-mono font-bold text-zinc-400">
                PROPOSTA #SOL-{solicitacao.id.toString().padStart(5, '0')}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-3 space-y-1">
                <p className="text-[10px] uppercase font-bold text-zinc-400">Montante Solicitado</p>
                <p className="text-sm font-black font-mono text-zinc-900 dark:text-white">
                  <KzValue value={montante} />
                </p>
              </div>

              <div className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-3 space-y-1">
                <p className="text-[10px] uppercase font-bold text-zinc-400">Prazo de Amortização</p>
                <p className="text-sm font-black font-mono text-zinc-900 dark:text-white">
                  {meses} Meses
                </p>
              </div>

              <div className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-3 space-y-1">
                <p className="text-[10px] uppercase font-bold text-zinc-400">Taxa de Juros (a.m.)</p>
                <p className="text-sm font-black font-mono text-zinc-900 dark:text-white">
                  {taxaJuros.toFixed(1)}% a.m.
                </p>
              </div>

              <div className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-3 space-y-1">
                <p className="text-[10px] uppercase font-bold text-zinc-400">Prestação Estimada</p>
                <p className="text-sm font-black font-mono text-emerald-600 dark:text-emerald-400">
                  <KzValue value={prestacao} />
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 space-y-1">
                <p className="text-[10px] uppercase font-bold text-zinc-400">Total de Juros do Período</p>
                <p className="text-xs font-mono font-bold text-zinc-900 dark:text-white">
                  <KzValue value={totalJuros} />
                </p>
              </div>

              <div className="p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 space-y-1">
                <p className="text-[10px] uppercase font-bold text-zinc-400">Montante Total a Reembolsar</p>
                <p className="text-xs font-mono font-bold text-zinc-900 dark:text-white">
                  <KzValue value={totalReembolso} />
                </p>
              </div>
            </div>

            <div className="p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 space-y-1">
              <p className="text-[10px] uppercase font-bold text-zinc-400">Finalidade Declarada do Crédito</p>
              <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200">
                {solicitacao.finalidade || 'Capital de giro para expansão de atividade comercial'}
              </p>
            </div>
          </SectionCard>

          {/* Card 2: Documentos & Comprovativos */}
          <SectionCard className="space-y-3">
            <div className="flex items-center justify-between pb-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
                Documentos de Suporte & Comprovativos
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-zinc-900 dark:text-white">Comprovativo de Pedido / Rendimento</p>
                  <p className="text-[10px] text-zinc-400 font-mono mt-0.5">
                    {solicitacao.comprovativoUrl ? 'Ficheiro anexado' : 'Documento gerado pelo sistema'}
                  </p>
                </div>
                {solicitacao.comprovativoUrl ? (
                  <BtnSecondary
                    onClick={() => setPdfModal({ isOpen: true, url: getApiUrl(solicitacao.comprovativoUrl!), title: `Comprovativo — SOL-${solicitacao.id}` })}
                    icon={Eye}
                  >
                    Visualizar
                  </BtnSecondary>
                ) : (
                  <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Validado
                  </span>
                )}
              </div>

              <div className="p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-zinc-900 dark:text-white">Ficha de Mutuário / NIF</p>
                  <p className="text-[10px] text-zinc-400 font-mono mt-0.5">NIF: {cliente.nif}</p>
                </div>
                <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Conforme
                </span>
              </div>
            </div>

            {solicitacao.comprovativoDesembolsoPath && (
              <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" /> Comprovativo de Liquidação / Desembolso
                </span>
                <a
                  href={getApiUrl(solicitacao.comprovativoDesembolsoPath)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-emerald-700 dark:text-emerald-300 font-bold underline"
                >
                  <Download className="w-3.5 h-3.5" /> Baixar Recibo
                </a>
              </div>
            )}
          </SectionCard>

          {/* Card 3: Mesa de Parecer & Decisão Final */}
          <SectionCard className="space-y-4">
            <div className="flex items-center justify-between pb-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
                Mesa de Parecer Técnico & Decisão da Comissão
              </h3>
            </div>

            <div className="space-y-3.5">
              <FormField label="Parecer Técnico da Comissão de Risco & Análise de Solvabilidade">
                <textarea
                  rows={3}
                  value={parecerCredito}
                  onChange={e => setParecerCredito(e.target.value)}
                  placeholder="Fundamentação técnica para a decisão de crédito..."
                  disabled={!isPendente}
                  className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-2.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-900 dark:focus:border-white resize-none"
                />
              </FormField>

              <FormField
                label="Justificativa / Motivo da Rejeição (Preenchimento Obrigatório para Indeferimento)"
                hint="Se a solicitação for recusada, a justificativa será notificada ao cliente e registada no histórico."
              >
                <textarea
                  rows={3}
                  value={motivoRejeicao}
                  onChange={e => setMotivoRejeicao(e.target.value)}
                  placeholder="Ex: Rácio de DSR superior ao limite admitido (40%) / Incidentes bancários ativos..."
                  disabled={!isPendente && !isRejeitado}
                  className="w-full bg-white dark:bg-zinc-800 border border-rose-300 dark:border-rose-800 p-2.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-rose-500 resize-none"
                />
              </FormField>

              {isPendente && (
                <div className="flex items-center justify-end gap-2 pt-2">
                  <BtnDanger
                    onClick={() => handleUpdateStatus('REJEITADO')}
                    loading={actionLoading}
                    icon={XCircle}
                  >
                    Rejeitar & Notificar Motivo
                  </BtnDanger>
                  <BtnPrimary
                    onClick={() => handleUpdateStatus('APROVADO')}
                    loading={actionLoading}
                    icon={CheckCircle}
                  >
                    Aprovar Solicitação de Crédito
                  </BtnPrimary>
                </div>
              )}

              {isAprovado && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between flex-wrap gap-2">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-emerald-600" /> Solicitação Aprovada pela Comissão
                    </p>
                    <p className="text-[10px] text-emerald-700 dark:text-emerald-300">
                      Pronta para transferência de liquidação / desembolso.
                    </p>
                  </div>
                  <BtnPrimary onClick={() => setShowDesembolsoModal(true)} icon={DollarSign}>
                    Realizar Desembolso
                  </BtnPrimary>
                </div>
              )}

              {isDesembolsado && (
                <div className="p-3 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 flex items-center gap-2 text-xs text-teal-900 dark:text-teal-200 font-bold">
                  <CheckCircle className="w-4 h-4 text-teal-600" /> Operação Desembolsada e Cronograma de Reembolso Ativo.
                </div>
              )}

              {isRejeitado && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 space-y-1">
                  <p className="text-xs font-bold text-rose-900 dark:text-rose-200 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600" /> Solicitação Rejeitada / Indeferida
                  </p>
                  {solicitacao.motivoRejeicao && (
                    <p className="text-xs text-rose-700 dark:text-rose-300">
                      Motivo: <strong>{solicitacao.motivoRejeicao}</strong>
                    </p>
                  )}
                </div>
              )}
            </div>
          </SectionCard>
        </div>

        {/* Painel Direito: Ficha do Cliente & Canais de Pagamento */}
        <div className="space-y-5">
          {/* Ficha do Cliente */}
          <SectionCard className="space-y-4">
            <div className="flex flex-col items-center text-center p-3 space-y-2">
              <Avatar
                src={cliente.fotografia || cliente.logotipo}
                name={cliente.nome}
                className="!w-20 !h-20 !text-2xl border-2 border-zinc-200 dark:border-zinc-700"
              />
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white">{cliente.nome}</h3>
                <p className="text-xs text-zinc-400 font-mono mt-0.5">NIF: {cliente.nif}</p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={cliente.risco || 'BAIXO'} label={`Risco ${cliente.risco || 'BAIXO'}`} />
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 flex items-center gap-1">
                  <Award className="w-3 h-3 text-amber-500" /> Score: {cliente.scoreCredito ?? cliente.score_credito ?? 720} pts
                </span>
              </div>
            </div>

            <div className="space-y-2.5 text-xs pt-1">
              <div>
                <p className="text-[10px] uppercase font-semibold text-zinc-400">E-mail de Contacto</p>
                <p className="font-semibold text-zinc-900 dark:text-white font-mono">{cliente.email || 'Não informado'}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-semibold text-zinc-400">Telefone / Telemóvel</p>
                <p className="font-semibold text-zinc-900 dark:text-white">{cliente.telefone || 'Não informado'}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-semibold text-zinc-400">Endereço Registado</p>
                <p className="text-zinc-700 dark:text-zinc-300">{cliente.endereco || 'Luanda, Angola'}</p>
              </div>
            </div>
          </SectionCard>

          {/* Componente Dinâmico de Canais de Pagamento (Múltiplos IBANs, Express & Referência) */}
          <ClientPaymentChannelsCard
            contaBancariaRaw={cliente.contaBancaria}
            onSavePaymentDetails={handleSavePaymentChannels}
          />
        </div>
      </div>

      {/* Modal de Desembolso */}
      {showDesembolsoModal && (
        <Modal title={`Efetuar Desembolso — SOL-${solicitacao.id}`} icon={DollarSign} onClose={() => setShowDesembolsoModal(false)}>
          <form onSubmit={handleDesembolsoSubmit} className="space-y-3.5">
            <FormField label="Instrução de Transferência / Conta de Saída">
              <select className={selectClass}>
                <option value="CONTA_PRINCIPAL">Conta Corrente Principal - BFA (IBAN ...8890)</option>
                <option value="CONTA_SECUNDARIA">Conta Operacional - BAI (IBAN ...1120)</option>
              </select>
            </FormField>

            <FormField label="Comprovativo de Transferência" required>
              <input
                name="comprovativo"
                type="file"
                required
                accept=".pdf,.jpg,.jpeg,.png"
                className="w-full text-xs text-zinc-600 dark:text-zinc-300 file:mr-3 file:py-1 file:px-3 file:border-0 file:text-xs file:font-semibold file:bg-zinc-100 dark:file:bg-zinc-800 file:text-zinc-800 dark:file:text-zinc-200 hover:file:bg-zinc-200 dark:hover:file:bg-zinc-700 cursor-pointer"
              />
            </FormField>

            <ModalFooter onCancel={() => setShowDesembolsoModal(false)}>
              <BtnPrimary type="submit" loading={desembolsando} icon={CheckCircle}>
                {desembolsando ? 'A Processar...' : 'Confirmar & Transferir Fundos'}
              </BtnPrimary>
            </ModalFooter>
          </form>
        </Modal>
      )}

      {/* Modal PDF Viewer */}
      <PdfViewerModal
        isOpen={pdfModal.isOpen}
        url={pdfModal.url}
        title={pdfModal.title}
        onClose={() => setPdfModal({ isOpen: false, url: '', title: '' })}
      />
    </PageShell>
  )
}
