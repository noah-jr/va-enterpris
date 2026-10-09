import { Avatar } from '../components/Avatar'
import { ClientPaymentChannelsCard } from '../components/ClientPaymentChannelsCard'
import { Save, Phone, MapPin, Camera, LogOut, Lock, AlertCircle, CheckCircle, User, FileText, Mail } from 'lucide-react'
import { usePerfil } from '../hooks/usePerfil'

export function Perfil() {
  const {
    user,
    perfil,
    loading,
    saving,
    form,
    setForm,
    preview,
    feedback,
    showChangePw,
    setShowChangePw,
    pw,
    setPw,
    changingPw,
    pwFeedback,
    setPwFeedback,
    handlePhoto,
    handleSave,
    handleSavePaymentDetails,
    handleChangePw,
    handleLogout,
  } = usePerfil()

  if (loading) return (
    <div className="flex justify-center p-16">
      <div className="w-7 h-7 border-2 border-zinc-900 dark:border-white border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <h1 className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-white">O Meu Perfil</h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Gerencie os seus dados pessoais, informações de contacto e canais de liquidação bancária.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main form */}
        <div className="lg:col-span-8 space-y-5">
          {feedback && (
            <div className={`p-3 text-xs font-semibold flex items-center gap-2 border ${
              feedback.type === 'success' 
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300' 
                : 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
            }`}>
              {feedback.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
              <span>{feedback.msg}</span>
            </div>
          )}

          {/* Avatar + name */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 flex items-center gap-5 shadow-2xs">
            <div className="relative shrink-0">
              {preview ? (
                <img src={preview} alt="Avatar Preview" className="w-20 h-20 border-2 border-zinc-200 dark:border-zinc-700 object-cover" />
              ) : (
                <Avatar src={perfil?.fotografia} name={form.nome || user?.fullName} size={80} className="border-2 border-zinc-200 dark:border-zinc-700" />
              )}
              <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border border-white dark:border-zinc-900 flex items-center justify-center cursor-pointer shadow-xs">
                <Camera size={13} />
                <input type="file" className="hidden" accept="image/*" onChange={handlePhoto} />
              </label>
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-zinc-900 dark:text-white">{form.nome || user?.fullName}</h2>
              <p className="text-xs text-zinc-400 mt-0.5">{form.email || user?.email}</p>
              {form.nif && (
                <span className="inline-block mt-2 px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[10px] font-mono font-bold">
                  NIF: {form.nif}
                </span>
              )}
            </div>
          </div>

          {/* Edit personal & contact info form */}
          <form onSubmit={handleSave}>
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 space-y-4 shadow-2xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">Dados Pessoais & Contacto</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                    <User size={13} /> Nome Completo / Razão Social
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-2.5 text-xs text-zinc-900 dark:text-white font-medium"
                    placeholder="Ex: João da Silva"
                    value={form.nome}
                    onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                    <FileText size={13} /> Número de NIF
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-2.5 text-xs text-zinc-900 dark:text-white font-mono"
                    placeholder="Ex: 005432100LA042"
                    value={form.nif}
                    onChange={e => setForm(f => ({ ...f, nif: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                    <Mail size={13} /> E-mail de Contacto
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-2.5 text-xs text-zinc-900 dark:text-white font-mono"
                    placeholder="cliente@email.com"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                    <Phone size={13} /> Número de Telefone
                  </label>
                  <input
                    type="tel"
                    className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-2.5 text-xs text-zinc-900 dark:text-white font-mono"
                    placeholder="Ex: 923 000 000"
                    value={form.telefone}
                    onChange={e => setForm(f => ({ ...f, telefone: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <MapPin size={13} /> Endereço Residencial / Comercial
                </label>
                <textarea
                  className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-2.5 text-xs text-zinc-900 dark:text-white resize-y"
                  rows={2}
                  placeholder="Morada completa..."
                  value={form.endereco}
                  onChange={e => setForm(f => ({ ...f, endereco: e.target.value }))}
                />
              </div>

              <button type="submit" className="w-full bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 py-3 font-bold text-xs uppercase tracking-wider flex justify-center items-center gap-2 transition-all cursor-pointer shadow-xs disabled:opacity-50" disabled={saving}>
                {saving ? (
                  <span>A guardar...</span>
                ) : (
                  <><Save size={14} /> Guardar Alterações do Perfil</>
                )}
              </button>
            </div>
          </form>

          {/* Client Payment Channels (Multiple IBANs, Express, RUPE) */}
          <ClientPaymentChannelsCard
            contaBancariaRaw={form.contaBancaria || perfil?.contaBancaria as string}
            onSavePaymentDetails={handleSavePaymentDetails}
          />
        </div>

        {/* Right sidebar */}
        <div className="lg:col-span-4 space-y-4">
          {/* Account info */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 space-y-3 shadow-2xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2">
              <User size={15} /> Informações da Conta
            </h4>
            <div className="space-y-2 text-xs divide-y divide-zinc-100 dark:divide-zinc-800">
              {[
                ['Papel', 'Cliente Mutuário'],
                ['NIF', form.nif || 'Não definido'],
                ['Classificação', perfil?.classificacao || 'Não avaliado'],
                ['Estado', perfil?.isListaNegra ? '⛔ Restrito' : '✅ Activo'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between pt-2">
                  <span className="text-zinc-400">{k}</span>
                  <span className="font-bold text-zinc-900 dark:text-white">{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Change password */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 space-y-3 shadow-2xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2">
              <Lock size={15} /> Segurança
            </h4>
            {!showChangePw ? (
              <button className="w-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 py-2 text-xs font-bold uppercase tracking-wider cursor-pointer" onClick={() => setShowChangePw(true)}>
                Alterar Senha
              </button>
            ) : (
              <form onSubmit={handleChangePw} className="space-y-2.5">
                {pwFeedback && (
                  <div className={`p-2 text-[11px] font-bold flex items-center gap-1.5 border ${
                    pwFeedback.type === 'success' 
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300' 
                      : 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                  }`}>
                    {pwFeedback.type === 'success' ? <CheckCircle size={13} /> : <AlertCircle size={13} />}
                    <span>{pwFeedback.msg}</span>
                  </div>
                )}
                <input type="password" className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-2 text-xs text-zinc-900 dark:text-white" placeholder="Senha actual" value={pw.atual} onChange={e => setPw(p => ({ ...p, atual: e.target.value }))} required />
                <input type="password" className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-2 text-xs text-zinc-900 dark:text-white" placeholder="Nova senha" value={pw.nova} onChange={e => setPw(p => ({ ...p, nova: e.target.value }))} required />
                <input type="password" className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-2 text-xs text-zinc-900 dark:text-white" placeholder="Confirmar nova senha" value={pw.confirmar} onChange={e => setPw(p => ({ ...p, confirmar: e.target.value }))} required />
                <div className="flex gap-2">
                  <button type="button" className="flex-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 py-1.5 text-xs font-bold uppercase tracking-wider cursor-pointer" onClick={() => { setShowChangePw(false); setPwFeedback(null) }}>Cancelar</button>
                  <button type="submit" className="flex-1 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 py-1.5 text-xs font-bold uppercase tracking-wider cursor-pointer disabled:opacity-50" disabled={changingPw}>
                    {changingPw ? 'A alterar...' : 'Confirmar'}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Logout */}
          <button className="w-full bg-rose-600 hover:bg-rose-700 text-white py-3 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-xs" onClick={handleLogout}>
            <LogOut size={15} /> Terminar Sessão
          </button>
        </div>
      </div>
    </div>
  )
}
