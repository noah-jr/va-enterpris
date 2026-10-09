import { ShieldCheck, Scale, Lock, FileCheck } from 'lucide-react'

export function TermosPage() {
  return (
    <div className="min-h-screen bg-zinc-50 py-12 px-6" data-testid="termos-page">
      <div className="max-w-4xl mx-auto space-y-8 bg-white border border-zinc-200 rounded-lg p-8 shadow-xs">
        
        {/* Header */}
        <div className="border-b border-zinc-100 pb-6 space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-900 text-white rounded text-xs font-semibold uppercase tracking-wider">
            <Scale className="w-3.5 h-3.5" />
            Quadro Jurídico Institucional
          </span>
          <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">
            Termos de Uso, Diário da República & Proteção de Dados
          </h1>
          <p className="text-xs text-zinc-500 font-medium">
            Última atualização: 15 de Fevereiro de 2026 • Em conformidade com as diretivas do Banco Nacional de Angola (BNA).
          </p>
        </div>

        {/* Legal Text Content */}
        <div className="space-y-6 text-xs text-zinc-700 leading-relaxed font-normal">
          <section className="space-y-2">
            <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-zinc-800" />
              1. Enquadramento Legal e Registo BNA
            </h3>
            <p>
              A <strong>Gloxis Financial Services S.A.</strong> é uma instituição financeira não bancária, devidamente registada e supervisionada pelo Banco Nacional de Angola (BNA) sob o Registo N.º 0048-26. Todos os produtos de microcrédito e garantias bancárias são regidos pela legislação financeira vigente na República de Angola.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-zinc-800" />
              2. Proteção de Dados Pessoais & Privacidade
            </h3>
            <p>
              Em cumprimento da Lei de Proteção de Dados Pessoais de Angola, os dados recolhidos durante o processo de solicitação (Bilhete de Identidade, NIF, comprovativos de rendimento) são estritamente confidenciais e utilizados exclusivamente para análise de risco de crédito e prevenção de branqueamento de capitais.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-zinc-800" />
              3. Autenticidade e Chancela Digital
            </h3>
            <p>
              Todos os documentos oficiais de aprovação e contratos emitidos pela Gloxis possuem Chancela Digital verificável online. A falsificação ou uso indevido de credenciais constitui crime punível nos termos do Código Penal Angolano.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
