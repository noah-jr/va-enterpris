import React, { useState } from 'react'
import {
  CreditCard, Phone, Hash, Plus, Trash2, CheckCircle2, Building2, X
} from 'lucide-react'
import {
  parsePaymentDetails, serializePaymentDetails, detectBankName,
  type ClientPaymentDetails, type ClientIban
} from '../lib/paymentHelper'

interface ClientPaymentChannelsCardProps {
  contaBancariaRaw?: string | null
  onSavePaymentDetails: (newContaBancariaRaw: string) => Promise<void>
}

export function ClientPaymentChannelsCard({
  contaBancariaRaw,
  onSavePaymentDetails,
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

  const inputClass = "w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-2.5 text-xs text-zinc-900 dark:text-white font-mono focus:outline-none focus:border-zinc-900 dark:focus:border-white"
  const selectClass = "w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-2.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-zinc-900 dark:focus:border-white"

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
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 space-y-4 shadow-2xs">
      <div className="flex items-center justify-between pb-1">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
          Os Meus Canais de Recebimento & Liquidação
        </h3>
        <button
          onClick={() => setShowAddIbanModal(true)}
          className="bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 px-3 py-1.5 text-xs font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
        >
          <Plus size={13} /> Adicionar IBAN
        </button>
      </div>

      {/* 1. IBANs list */}
      <div className="space-y-2">
        <p className="text-[10px] uppercase font-bold text-zinc-400">Contas IBAN Associadas ({paymentData.ibans.length})</p>
        {paymentData.ibans.length > 0 ? (
          <div className="space-y-2">
            {paymentData.ibans.map((item, idx) => (
              <div key={item.id || idx} className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-zinc-900 dark:text-white font-mono flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-zinc-500" /> {item.banco}
                    </span>
                    {item.isPrincipal && (
                      <span className="px-1.5 py-0.2 text-[9px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                        Principal p/ Recebimentos
                      </span>
                    )}
                  </div>
                  <p className="font-mono text-zinc-800 dark:text-zinc-200 font-semibold">{item.iban}</p>
                  {item.titular && <p className="text-[10px] text-zinc-400">Titular: {item.titular}</p>}
                </div>

                <div className="flex items-center gap-2">
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
              </div>
            ))}
          </div>
        ) : (
          <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-400 italic">
            Nenhum IBAN associado. Adicione o seu IBAN para poder receber os desembolsos de crédito.
          </div>
        )}
      </div>

      {/* 2. Express & Referência Codes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {/* Multicaixa Express */}
        <div className="p-3 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
              <Phone className="w-3 h-3 text-amber-500" /> Multicaixa Express
            </span>
            <button
              onClick={() => { setExpressInput(paymentData.expressNumero || ''); setShowExpressModal(true) }}
              className="text-[10px] text-zinc-500 hover:text-zinc-900 dark:hover:text-white underline font-medium cursor-pointer"
            >
              Editar
            </button>
          </div>
          <p className="text-xs font-mono font-bold text-zinc-900 dark:text-white">
            {paymentData.expressNumero || 'Não associado'}
          </p>
        </div>

        {/* Referência de Pagamento / RUPE */}
        <div className="p-3 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
              <Hash className="w-3 h-3 text-emerald-500" /> Código de Referência de Pagamento
            </span>
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-full max-w-md p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
                Adicionar Conta IBAN
              </h3>
              <button onClick={() => setShowAddIbanModal(false)} className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddIban} className="space-y-3.5">
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold text-zinc-500 dark:text-zinc-400">Banco / Instituição Financeira</label>
                <select value={newIbanBanco} onChange={e => setNewIbanBanco(e.target.value)} className={selectClass}>
                  <option value="BFA">BFA - Banco de Fomento Angola</option>
                  <option value="BAI">BAI - Banco Angolano de Investimentos</option>
                  <option value="BIC">BIC - Banco BIC Angola</option>
                  <option value="Millennium Atlântico">Millennium Atlântico</option>
                  <option value="Standard Bank">Standard Bank Angola</option>
                  <option value="Banco SOL">Banco SOL</option>
                  <option value="Banco Keve">Banco Keve</option>
                  <option value="Outro">Outro Banco</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold text-zinc-500 dark:text-zinc-400">Número de IBAN</label>
                <input
                  type="text"
                  required
                  value={newIbanNumber}
                  onChange={e => setNewIbanNumber(e.target.value)}
                  placeholder="AO06.0006.0000..."
                  className={inputClass}
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold text-zinc-500 dark:text-zinc-400">Nome do Titular da Conta (Opcional)</label>
                <input
                  type="text"
                  value={newIbanTitular}
                  onChange={e => setNewIbanTitular(e.target.value)}
                  placeholder="O seu nome completo ou razão social"
                  className={inputClass}
                />
              </div>

              <label className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={newIbanIsPrincipal}
                  onChange={e => setNewIbanIsPrincipal(e.target.checked)}
                  className="w-4 h-4 accent-zinc-900 dark:accent-white"
                />
                <span>Definir como IBAN Principal para Recebimentos</span>
              </label>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowAddIbanModal(false)}
                  className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar IBAN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Express */}
      {showExpressModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-full max-w-md p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2">
                <Phone className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
                Número Multicaixa Express
              </h3>
              <button onClick={() => setShowExpressModal(false)} className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveExpress} className="space-y-3.5">
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold text-zinc-500 dark:text-zinc-400">Número de Telemóvel MC Express</label>
                <input
                  type="text"
                  required
                  value={expressInput}
                  onChange={e => setExpressInput(e.target.value)}
                  placeholder="+244 923 000 000"
                  className={inputClass}
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowExpressModal(false)}
                  className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Guardar Express
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Referência */}
      {showRefModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-full max-w-md p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2">
                <Hash className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
                Referência de Pagamento / RUPE
              </h3>
              <button onClick={() => setShowRefModal(false)} className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveReferencia} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold text-zinc-500 dark:text-zinc-400">Código Entidade</label>
                  <input
                    type="text"
                    required
                    value={entidadeInput}
                    onChange={e => setEntidadeInput(e.target.value)}
                    placeholder="Ex: 00123"
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold text-zinc-500 dark:text-zinc-400">Referência</label>
                  <input
                    type="text"
                    required
                    value={referenciaInput}
                    onChange={e => setReferenciaInput(e.target.value)}
                    placeholder="Ex: 987 654 321"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowRefModal(false)}
                  className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Guardar Referência
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
