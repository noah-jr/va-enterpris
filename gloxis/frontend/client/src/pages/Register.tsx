import { Link } from 'react-router'
import { AlertCircle, Mail, Phone, Lock, UserPlus, Sun, Moon, CreditCard, User, ArrowRight } from 'lucide-react'
import { useLoginFlow } from '../hooks/useLoginFlow'
import { useTheme } from '../context/ThemeContext'

export default function Register() {
  const { theme, toggleTheme } = useTheme()

  const {
    fullName,
    setFullName,
    nif,
    setNif,
    signupEmail,
    setSignupEmail,
    signupPassword,
    setSignupPassword,
    telefone,
    setTelefone,
    signupError,
    signupLoading,
    handleSignupSubmit,
  } = useLoginFlow()

  return (
    <div className="min-h-screen flex bg-zinc-50 dark:bg-zinc-950 font-sans text-zinc-900 dark:text-zinc-100 relative transition-colors duration-200" data-testid="client-register-page">
      {/* Theme Toggle */}
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
            Crie a sua conta de cliente e aceda às linhas de financiamento.
          </h1>
          <p className="text-sm text-zinc-300 leading-relaxed">
            Apenas necessita do seu Bilhete de Identidade / NIF nacional de Angola para registar a sua conta e solicitar crédito imediato.
          </p>

          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-zinc-800">
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider">Simples</p>
              <p className="text-[11px] text-zinc-400 mt-0.5">Registo em 2 minutos</p>
            </div>
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider">Transparente</p>
              <p className="text-[11px] text-zinc-400 mt-0.5">Sem custos ocultos</p>
            </div>
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider">Oficial</p>
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
              Registo de Conta de Cliente
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Preencha os seus dados pessoais para ter acesso instantâneo ao balcão digital
            </p>
          </div>

          {/* Error Banner */}
          {signupError && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{signupError}</span>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSignupSubmit} className="space-y-4 animate-in fade-in duration-200">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                Nome Completo *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="Nome Completo do Titular"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-lg pl-9 pr-3 py-2.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-zinc-900 dark:focus:border-white transition-colors"
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                Número de B.I. ou NIF (Angola) *
              </label>
              <div className="relative">
                <CreditCard className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="Ex: 004891234LA042"
                  value={nif}
                  onChange={e => setNif(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-lg pl-9 pr-3 py-2.5 text-xs font-mono font-semibold text-zinc-900 dark:text-white focus:outline-none focus:border-zinc-900 dark:focus:border-white transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                Endereço de E-mail *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  placeholder="exemplo@email.com"
                  value={signupEmail}
                  onChange={e => setSignupEmail(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-lg pl-9 pr-3 py-2.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-zinc-900 dark:focus:border-white transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                  Telemóvel
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    placeholder="923000000"
                    value={telefone}
                    onChange={e => setTelefone(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-lg pl-9 pr-3 py-2.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-zinc-900 dark:focus:border-white transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                  Palavra-Passe / PIN *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={signupPassword}
                    onChange={e => setSignupPassword(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-lg pl-9 pr-3 py-2.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-zinc-900 dark:focus:border-white font-mono tracking-wider transition-colors"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={signupLoading}
              className="w-full bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-xs py-3 rounded-lg flex items-center justify-center gap-2 uppercase tracking-wider transition-all cursor-pointer shadow-xs mt-2"
            >
              {signupLoading ? (
                <span>A Registar Conta...</span>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Concluir Registo de Cliente</span>
                </>
              )}
            </button>
          </form>

          {/* Navigation to Login */}
          <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 text-center text-xs text-zinc-500 dark:text-zinc-400 font-medium">
            Já possui uma conta de cliente?{' '}
            <Link to="/login" className="text-zinc-900 dark:text-white font-bold hover:underline inline-flex items-center gap-1">
              <span>Iniciar Sessão</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}
