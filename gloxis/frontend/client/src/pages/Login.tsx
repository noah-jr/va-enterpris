import { useState } from 'react'
import { Link } from 'react-router'
import { Eye, EyeOff, AlertCircle, Mail, Lock, Sun, Moon, CreditCard, ArrowRight, UserPlus } from 'lucide-react'
import { useLoginFlow } from '../hooks/useLoginFlow'
import { useTheme } from '../context/ThemeContext'

export default function Login() {
  const { theme, toggleTheme } = useTheme()
  const [loginMethod, setLoginMethod] = useState<'NIF' | 'EMAIL'>('NIF')

  const {
    email,
    setEmail,
    password,
    setPassword,
    showPw,
    setShowPw,
    error,
    loading,
    totpToken,
    setTotpToken,
    requires2fa,
    setRequires2fa,
    handleSubmit,
  } = useLoginFlow()

  return (
    <div className="min-h-screen flex bg-zinc-50 dark:bg-zinc-950 font-sans text-zinc-900 dark:text-zinc-100 relative transition-colors duration-200" data-testid="client-login-page">
      {/* Sun / Moon Theme Toggle */}
      <div className="absolute top-4 right-4 z-20">
        <button 
          onClick={toggleTheme}
          title={theme === 'light' ? 'Mudar para Modo Escuro' : 'Mudar para Modo Claro'}
          className="p-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-200 shadow-sm cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-wider rounded-xl"
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
          <span>Modo {theme === 'light' ? 'Escuro' : 'Claro'}</span>
        </button>
      </div>

      {/* Left branding banner */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-zinc-900 dark:bg-zinc-900 text-white relative overflow-hidden">
        <div className="flex items-center gap-3 z-10">
          <img src="/logo.png" alt="Gloxis Financial Services" className="h-10 w-auto object-contain brightness-0 invert" />
          <span className="font-bold tracking-tight text-lg text-white">Gloxis Financials</span>
        </div>

        <div className="z-10 space-y-4 max-w-lg">
          <h1 className="text-3xl font-extrabold text-white tracking-tight leading-snug">
            Gestão de microcrédito e tesouraria com transparência.
          </h1>
          <p className="text-sm text-zinc-300 leading-relaxed">
            Aceda às suas linhas de financiamento, emita faturas e acompanhe as suas amortizações em tempo real com o Portal de Cliente Gloxis.
          </p>

          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-zinc-800">
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider">Protegido</p>
              <p className="text-[11px] text-zinc-400 mt-0.5">Encriptação bancária</p>
            </div>
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider">Líquido</p>
              <p className="text-[11px] text-zinc-400 mt-0.5">Desembolsos em 24h</p>
            </div>
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider">Auditado</p>
              <p className="text-[11px] text-zinc-400 mt-0.5">Conformidade BNA</p>
            </div>
          </div>
        </div>

        <div className="z-10 text-xs text-zinc-500 font-mono">
          &copy; 2026 Gloxis Financial Services. Todos os direitos reservados.
        </div>
      </div>

      {/* Right form container */}
      <div className="flex-1 flex items-center justify-center p-6 bg-zinc-50 dark:bg-zinc-950">
        <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-2xl p-8 space-y-6 shadow-xs">
          
          {/* Header Title */}
          <div className="text-center space-y-1.5">
            <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
              {requires2fa
                ? 'Autenticação 2FA'
                : loginMethod === 'NIF'
                ? 'Acesso por B.I. ou NIF'
                : 'Acesso por E-mail'}
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {requires2fa
                ? 'Insira o código de 6 dígitos gerado pela sua aplicação'
                : loginMethod === 'NIF'
                ? 'Introduza o seu NIF ou B.I. de Angola com a sua palavra-passe'
                : 'Introduza o seu e-mail institucional e palavra-passe'}
            </p>
          </div>

          {/* Login Method Tabs */}
          {!requires2fa && (
            <div className="grid grid-cols-2 gap-1 p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-xl">
              <button
                type="button"
                data-testid="tab-login-nif"
                onClick={() => setLoginMethod('NIF')}
                className={`py-2 px-1 text-[11px] font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  loginMethod === 'NIF'
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs font-bold'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>NIF / B.I.</span>
              </button>

              <button
                type="button"
                data-testid="tab-login-email"
                onClick={() => setLoginMethod('EMAIL')}
                className={`py-2 px-1 text-[11px] font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  loginMethod === 'EMAIL'
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs font-bold'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>E-mail</span>
              </button>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in duration-200">
            {!requires2fa ? (
              <>
                {loginMethod === 'NIF' ? (
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                      Número de B.I. ou NIF (Angola) *
                    </label>
                    <div className="relative">
                      <CreditCard className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-lg pl-9 pr-3 py-2.5 text-xs font-mono font-semibold text-zinc-900 dark:text-white focus:outline-none focus:border-zinc-900 dark:focus:border-white transition-colors"
                        placeholder="Ex: 004891234LA042"
                        required
                        autoFocus
                      />
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1">
                      Insira o seu Bilhete de Identidade nacional ou número de contribuinte NIF.
                    </p>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                      Endereço de E-mail *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-lg pl-9 pr-3 py-2.5 text-xs font-medium text-zinc-900 dark:text-white focus:outline-none focus:border-zinc-900 dark:focus:border-white transition-colors"
                        placeholder="cliente@gloxis.ao"
                        required
                        autoFocus
                      />
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1">
                      Insira o endereço de correio eletrónico associado à sua conta de cliente.
                    </p>
                  </div>
                )}

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                      Palavra-Passe / PIN *
                    </label>
                    <Link to="/forgot-password" className="text-xs font-semibold text-zinc-900 dark:text-zinc-300 hover:underline">
                      Esqueceu a senha?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-lg pl-9 pr-9 py-2.5 text-xs font-medium text-zinc-900 dark:text-white focus:outline-none focus:border-zinc-900 dark:focus:border-white font-mono tracking-wider transition-colors"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(p => !p)}
                      className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
                    >
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* TELA 2FA */
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                  Código de Autenticação 2FA (6 dígitos)
                </label>
                <input
                  type="text"
                  value={totpToken}
                  onChange={e => setTotpToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-center font-mono text-lg font-bold tracking-widest text-zinc-900 dark:text-white focus:outline-none focus:border-zinc-900 dark:focus:border-white"
                  placeholder="000000"
                  maxLength={6}
                  autoFocus
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-xs py-3 rounded-lg flex items-center justify-center gap-2 uppercase tracking-wider transition-all cursor-pointer shadow-xs"
            >
              {loading ? (
                <span>A autenticar...</span>
              ) : (
                <>
                  <span>{requires2fa ? 'Verificar Código 2FA' : 'Entrar no Portal'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {requires2fa && (
              <button
                type="button"
                onClick={() => setRequires2fa(false)}
                className="w-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 font-semibold text-xs py-2 rounded-lg cursor-pointer"
              >
                Voltar
              </button>
            )}
          </form>

          {/* Separate Registration Link */}
          <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 text-center text-xs text-zinc-500 dark:text-zinc-400 font-medium">
            Ainda não tem uma conta de cliente?{' '}
            <Link to="/register" className="text-zinc-900 dark:text-white font-bold hover:underline inline-flex items-center gap-1">
              <UserPlus className="w-3.5 h-3.5" />
              <span>Registe-se aqui</span>
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}
