import { useState } from 'react'
import {
  SectionCard, FormField, inputClass, selectClass, BtnPrimary, BtnSecondary, BtnDanger, Modal, ModalFooter
} from './ui'
import { CreditCard, Phone, Hash, Plus, Trash2, CheckCircle2, Building2 } from 'lucide-react'
import {
  parsePaymentDetails, serializePaymentDetails, detectBankName,
  type ClientPaymentDetails, type ClientIban
} from '../lib/paymentHelper'

interface ClientPaymentChannelsCardProps {
  contaBancariaRaw?: string | null
  onSavePaymentDetails: (newContaBancariaRaw: string) => Promise<void>
  readOnly?: boolean
}

export function ClientPaymentChannelsCard({
  contaBancariaRaw,
  onSavePaymentDetails,
  readOnly = false
}: ClientPaymentChannelsCardProps) {
  const paymentData: ClientPaymentDetails = parsePaymentDetails(contaBancariaRaw)

  // State Modais
  const [showAddIbanModal, setShowAddIbanModal] = useState(false)
  const [showExpressModal, setShowExpressModal] = useState(false)
  const [showRefModal, setShowRefModal] = useState(false)
  const [loading, setLoading] = useState(false)

  // Form IBAN
  const [newIbanNumber, setNewIbanNumber] = useState('')
  const [newIbanBanco, setNewIbanBanco] = useState('BFA')
  const [newIbanTitular, setNewIbanTitular] = useState('')
  const [newIbanIsPrincipal, setNewIbanIsPrincipal] = useState(false)

  // Form Express
  const [expressInput, setExpressInput] = useState(paymentData.expressNumero || '')

  // Form Referência
  const [entidadeInput, setEntidadeInput] = useState(paymentData.referenciaPagamento?.entidade || '')
  const [referenciaInput, setReferenciaInput] = useState(paymentData.referenciaPagamento?.referencia || '')

  const handleAddIban = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newIbanNumber.trim()) return

    setLoading(true)
    try {
      const newIbanObj: ClientIban = {
        id: Date.now().toString(),
        banco: newIbanBanco || detectBankName(newIbanNumber),
        iban: newIbanNumber.trim(),
        titular: newIbanTitular.trim() || undefined,
        isPrincipal: newIbanIsPrincipal || paymentData.ibans.length === 0
      }

      let updatedIbans = [...paymentData.ibans]
      if (newIbanObj.isPrincipal) {
        updatedIbans = updatedIbans.map(i => ({ ...i, isPrincipal: false }))
      }
      updatedIbans.push(newIbanObj)

      const updatedPayload: ClientPaymentDetails = {
        ...paymentData,
        ibans: updatedIbans
      }

      await onSavePaymentDetails(serializePaymentDetails(updatedPayload))
      setShowAddIbanModal(false)
      setNewIbanNumber('')
      setNewIbanTitular('')
    } catch (err) {
      console.error(err)
      alert('Erro ao guardar IBAN.')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveIban = async (ibanId: string) => {
    if (!confirm('Deseja remover este IBAN?')) return
    setLoading(true)
    try {
      const updatedIbans = paymentData.ibans.filter(i => i.id !== ibanId)
      if (updatedIbans.length > 0 && !updatedIbans.some(i => i.isPrincipal)) {
        updatedIbans[0].isPrincipal = true
      }
      const updatedPayload: ClientPaymentDetails = { ...paymentData, ibans: updatedIbans }
      await onSavePaymentDetails(serializePaymentDetails(updatedPayload))
    } catch (err) {
      console.error(err)
      alert('Erro ao remover IBAN.')
    } finally {
      setLoading(false)
    }
  }

  const handleSetPrincipalIban = async (ibanId: string) => {
    setLoading(true)
    try {
      const updatedIbans = paymentData.ibans.map(i => ({
        ...i,
        isPrincipal: i.id === ibanId
      }))
      const updatedPayload: ClientPaymentDetails = { ...paymentData, ibans: updatedIbans }
      await onSavePaymentDetails(serializePaymentDetails(updatedPayload))
    } catch (err) {
      console.error(err)
      alert('Erro ao atualizar IBAN principal.')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveExpress = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const updatedPayload: ClientPaymentDetails = {
        ...paymentData,
        expressNumero: expressInput.trim()
      }
      await onSavePaymentDetails(serializePaymentDetails(updatedPayload))
      setShowExpressModal(false)
    } catch (err) {
      console.error(err)
      alert('Erro ao guardar número Express.')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveReferencia = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const updatedPayload: ClientPaymentDetails = {
        ...paymentData,
        referenciaPagamento: {
          entidade: entidadeInput.trim(),
          referencia: referenciaInput.trim()
        }
      }
      await onSavePaymentDetails(serializePaymentDetails(updatedPayload))
      setShowRefModal(false)
    } catch (err) {
      console.error(err)
      alert('Erro ao guardar dados de referência.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SectionCard className="space-y-4">
      <div className="flex items-center justify-between pb-1">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
          Canais de Pagamento & Liquidação
        </h3>
        {!readOnly && (
          <BtnSecondary onClick={() => setShowAddIbanModal(true)} icon={Plus}>
            Adicionar IBAN
          </BtnSecondary>
        )}
      </div>

      {/* 1. IBANs list */}
      <div className="space-y-2">
        <p className="text-[10px] uppercase font-bold text-zinc-400">Contas IBAN Registadas ({paymentData.ibans.length})</p>
        {paymentData.ibans.length > 0 ? (
          <div className="space-y-2">
            {paymentData.ibans.map((item, idx) => (
              <div key={item.id || idx} className="flex items-center justify-between p-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-zinc-900 dark:text-white font-mono flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-zinc-500" /> {item.banco}
                    </span>
                    {item.isPrincipal && (
                      <span className="px-1.5 py-0.2 text-[9px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                        Principal
                      </span>
                    )}
                  </div>
                  <p className="font-mono text-zinc-700 dark:text-zinc-300 font-semibold">{item.iban}</p>
                  {item.titular && <p className="text-[10px] text-zinc-400">Titular: {item.titular}</p>}
                </div>

                {!readOnly && (
                  <div className="flex items-center gap-1.5">
                    {!item.isPrincipal && (
                      <button
                        onClick={() => handleSetPrincipalIban(item.id)}
                        disabled={loading}
                        title="Definir como IBAN Principal"
                        className="text-[10px] text-zinc-500 hover:text-zinc-900 dark:hover:text-white underline cursor-pointer"
                      >
                        Tornar Principal
                      </button>
                    )}
                    <button
                      onClick={() => handleRemoveIban(item.id)}
                      disabled={loading}
                      title="Remover IBAN"
                      className="p-1 text-rose-500 hover:text-rose-700 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-400 italic">
            Nenhum IBAN registado.
          </div>
        )}
      </div>

      {/* 2. Express & Referência Codes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {/* Multicaixa Express */}
        <div className="p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
              <Phone className="w-3 h-3 text-amber-500" /> Multicaixa Express
            </span>
            {!readOnly && (
              <button
                onClick={() => { setExpressInput(paymentData.expressNumero || ''); setShowExpressModal(true) }}
                className="text-[10px] text-zinc-500 hover:text-zinc-900 dark:hover:text-white underline font-medium cursor-pointer"
              >
                Editar
              </button>
            )}
          </div>
          <p className="text-xs font-mono font-bold text-zinc-900 dark:text-white">
            {paymentData.expressNumero || 'Não associado'}
          </p>
        </div>

        {/* Referência de Pagamento / RUPE */}
        <div className="p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
              <Hash className="w-3 h-3 text-emerald-500" /> Referência RUPE / Pagamento
            </span>
            {!readOnly && (
              <button
                onClick={() => {
                  setEntidadeInput(paymentData.referenciaPagamento?.entidade || '')
                  setReferenciaInput(paymentData.referenciaPagamento?.referencia || '')
                  setShowRefModal(true)
                }}
                className="text-[10px] text-zinc-500 hover:text-zinc-900 dark:hover:text-white underline font-medium cursor-pointer"
              >
                Editar
              </button>
            )}
          </div>
          <p className="text-xs font-mono font-bold text-zinc-900 dark:text-white">
            {paymentData.referenciaPagamento?.entidade && paymentData.referenciaPagamento?.referencia
              ? `Entidade: ${paymentData.referenciaPagamento.entidade} • Ref: ${paymentData.referenciaPagamento.referencia}`
              : 'Não associada'}
          </p>
        </div>
      </div>

      {/* Modal Adicionar IBAN */}
      {showAddIbanModal && (
        <Modal title="Adicionar Novo IBAN de Liquidação" icon={CreditCard} onClose={() => setShowAddIbanModal(false)}>
          <form onSubmit={handleAddIban} className="space-y-3.5">
            <FormField label="Instituição Bancária" required>
              <select value={newIbanBanco} onChange={e => setNewIbanBanco(e.target.value)} className={selectClass}>
                <option value="BFA">BFA - Banco de Fomento Angola</option>
                <option value="BAI">BAI - Banco Angolano de Investimentos</option>
                <option value="BIC">BIC - Banco BIC Angola</option>
                <option value="Millennium Atlântico">Millennium Atlântico</option>
                <option value="Standard Bank">Standard Bank Angola</option>
                <option value="Banco SOL">Banco SOL</option>
                <option value="Banco Keve">Banco Keve</option>
                <option value="Outro">Outra Instituição Financeira</option>
              </select>
            </FormField>

            <FormField label="Número IBAN" required hint="Formato padrão: AO06 0000 0000 0000 0000 0000 0">
              <input
                type="text"
                required
                value={newIbanNumber}
                onChange={e => setNewIbanNumber(e.target.value)}
                placeholder="AO06.0006.0000..."
                className={inputClass}
              />
            </FormField>

            <FormField label="Nome do Titular da Conta (Opcional)">
              <input
                type="text"
                value={newIbanTitular}
                onChange={e => setNewIbanTitular(e.target.value)}
                placeholder="Ex: Nome Completo do Titular"
                className={inputClass}
              />
            </FormField>

            <label className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={newIbanIsPrincipal}
                onChange={e => setNewIbanIsPrincipal(e.target.checked)}
                className="w-4 h-4 accent-zinc-900 dark:accent-white"
              />
              <span>Definir como IBAN Principal para Recebimentos / Desembolsos</span>
            </label>

            <ModalFooter onCancel={() => setShowAddIbanModal(false)}>
              <BtnPrimary type="submit" loading={loading} icon={Plus}>
                Adicionar IBAN
              </BtnPrimary>
            </ModalFooter>
          </form>
        </Modal>
      )}

      {/* Modal Editar Multicaixa Express */}
      {showExpressModal && (
        <Modal title="Configurar Número Multicaixa Express" icon={Phone} onClose={() => setShowExpressModal(false)}>
          <form onSubmit={handleSaveExpress} className="space-y-3.5">
            <FormField label="Número de Telemóvel Registado no MC Express" required hint="Número associado para recebimento de transferências via Express.">
              <input
                type="text"
                required
                value={expressInput}
                onChange={e => setExpressInput(e.target.value)}
                placeholder="+244 923 000 000"
                className={inputClass}
              />
            </FormField>
            <ModalFooter onCancel={() => setShowExpressModal(false)}>
              <BtnPrimary type="submit" loading={loading} icon={CheckCircle2}>
                Guardar Número Express
              </BtnPrimary>
            </ModalFooter>
          </form>
        </Modal>
      )}

      {/* Modal Editar Referência RUPE */}
      {showRefModal && (
        <Modal title="Configurar Referência de Pagamento / RUPE" icon={Hash} onClose={() => setShowRefModal(false)}>
          <form onSubmit={handleSaveReferencia} className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Código da Entidade" required>
                <input
                  type="text"
                  required
                  value={entidadeInput}
                  onChange={e => setEntidadeInput(e.target.value)}
                  placeholder="Ex: 00123"
                  className={inputClass}
                />
              </FormField>
              <FormField label="Número de Referência" required>
                <input
                  type="text"
                  required
                  value={referenciaInput}
                  onChange={e => setReferenciaInput(e.target.value)}
                  placeholder="Ex: 987 654 321"
                  className={inputClass}
                />
              </FormField>
            </div>
            <ModalFooter onCancel={() => setShowRefModal(false)}>
              <BtnPrimary type="submit" loading={loading} icon={CheckCircle2}>
                Guardar Código de Referência
              </BtnPrimary>
            </ModalFooter>
          </form>
        </Modal>
      )}
    </SectionCard>
  )
}
