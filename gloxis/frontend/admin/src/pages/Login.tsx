import React, { useState } from 'react'
import { useAdminLogin } from '../hooks/useAdminLogin'
import { useTheme } from '../context/ThemeContext'
import {
  ShieldCheck, Lock, Mail, KeyRound, Eye, EyeOff,
  AlertCircle, ArrowRight, Shield, Building2, Sun, Moon
} from 'lucide-react'

export default function Login() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    totpToken,
    setTotpToken,
    requires2fa,
    error,
    loading,
    handleSubmit,
  } = useAdminLogin()

  const { theme, toggleTheme } = useTheme()
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden transition-colors duration-200">
      {/* Botão Flutuante de Toggle Light/Dark Mode */}
      <div className="absolute top-4 right-4 z-20">
        <button 
          onClick={toggleTheme}
          title={theme === 'light' ? 'Mudar para Modo Escuro' : 'Mudar para Modo Claro'}
          className="p-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-200 shadow-sm cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
          <span>Modo {theme === 'light' ? 'Escuro' : 'Claro'}</span>
        </button>
      </div>

      {/* Elementos Decorativos de Fundo */}
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-zinc-300/20 dark:bg-zinc-800/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-emerald-500/10 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-300">
        {/* Cartão de Autenticação retilíneo */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-7 sm:p-9 shadow-2xl">
          {/* Branding & Logotipo */}
          <div className="text-center mb-7 flex flex-col items-center">
            <img src="/logo.png" alt="Gloxis Financial Services" className="h-14 w-auto object-contain mb-3.5" />
            
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-zinc-700 dark:text-zinc-300" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Gloxis ERP · Institutional Access
              </span>
            </div>

            <h1 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight font-sans uppercase">
              Portal Administrativo
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-xs leading-relaxed font-medium">
              Autenticação de alta segurança para Direção, Gestores e Operadores.
            </p>
          </div>

          {/* Banner de Erro */}
          {error && (
            <div className="bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 p-3 text-xs font-semibold mb-5 flex items-start gap-2 animate-in slide-in-from-top-2 duration-200">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <div className="flex-1 leading-tight">{error}</div>
            </div>
          )}

          {/* Formulário Principal */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!requires2fa ? (
              <>
                {/* Campo Email */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                    E-mail Corporativo
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@gloxis.com"
                      className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white text-xs font-medium pl-9 pr-3 py-2.5 focus:bg-white dark:focus:bg-zinc-900 focus:border-zinc-900 dark:focus:border-white outline-none transition-all placeholder:text-zinc-400"
                      required
                    />
                  </div>
                </div>

                {/* Campo Senha */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                      Palavra-passe
                    </label>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white text-xs font-medium pl-9 pr-9 py-2.5 focus:bg-white dark:focus:bg-zinc-900 focus:border-zinc-900 dark:focus:border-white outline-none transition-all placeholder:text-zinc-400"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* Campo 2FA TOTP */
              <div className="space-y-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-3.5 animate-in fade-in duration-200">
                <div className="flex items-center gap-2 text-zinc-900 dark:text-white font-bold text-xs">
                  <KeyRound className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Etapa 2 de 2: Autenticação Segura (2FA)</span>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Insira o código dinâmico de 6 dígitos gerado pela sua aplicação autenticadora.
                </p>

                <div className="relative">
                  <input
                    type="text"
                    value={totpToken}
                    onChange={(e) => setTotpToken(e.target.value.replace(/\D/g, ''))}
                    placeholder="000 000"
                    maxLength={6}
                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white font-mono font-bold text-center tracking-[0.5em] text-lg py-2.5 focus:border-emerald-600 outline-none transition-all"
                    required
                    autoFocus
                  />
                </div>
              </div>
            )}

            {/* Botão Submeter */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-xs uppercase tracking-wider py-3 transition-all shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group mt-5"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent animate-spin" />
                  <span>A validar credenciais...</span>
                </>
              ) : (
                <>
                  <span>{requires2fa ? 'Confirmar Código 2FA' : 'Entrar no Dashboard'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Rodapé */}
          <div className="mt-7 pt-5 border-t border-zinc-100 dark:border-zinc-800 space-y-1.5 text-center">
            <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
              <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Conexão Encriptada TLS 1.3 / 256-bit AES</span>
            </div>
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500">
              Gloxis Financial S.A. · Instituição Auditada Registo BNA nº 0432
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
