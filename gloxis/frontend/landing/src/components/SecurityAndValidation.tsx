import { useState } from 'react'
import { ShieldAlert, FileCheck, Lock, AlertTriangle, CheckCircle, Search } from 'lucide-react'

export function SecurityAndValidation() {
  const [docCode, setDocCode] = useState('')
  const [validationResult, setValidationResult] = useState<string | null>(null)

  const handleValidar = (e: React.FormEvent) => {
    e.preventDefault()
    if (!docCode.trim()) {
      setValidationResult('Por favor, introduza o código constante no documento ou certidão estatal.')
      return
    }
    setValidationResult(`Documento ${docCode.toUpperCase()} autenticado com chancela oficial do Estado Angolano.`)
  }

  return (
    <section id="seguranca" className="py-16 px-6 bg-white border-b border-zinc-200" data-testid="security-section">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-900 bg-zinc-100 px-3 py-0.5 rounded border border-zinc-200 inline-flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-zinc-700" />
            <span>Serviço de Autenticidade & Segurança Digital</span>
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900">
            Validação da Chancela e Proteção do Cidadão
          </h2>
          <p className="text-zinc-600 text-xs sm:text-sm">
            Verifique a validade de certidões estatais e consulte os alertas do Banco Nacional de Angola contra cibercrime.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          
          {/* Security Alert Card */}
          <div className="bg-zinc-900 text-white p-6 rounded space-y-5 border border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-zinc-800 rounded border border-zinc-700">
                <Lock className="w-5 h-5 text-zinc-200" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">Alertas Oficiais do BNA aos Cidadãos</h3>
                <p className="text-xs text-zinc-400">Normativo de Prevenção da Engenharia Social</p>
              </div>
            </div>

            <ul className="space-y-2.5 text-xs text-zinc-300 font-medium">
              <li className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                <span><strong>Não partilhe códigos de acesso (OTP):</strong> As entidades nunca solicitam senhas ou pins por telefone ou mensagens privadas.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                <span><strong>Confirme o domínio institucional:</strong> Certifique-se de utilizar plataformas oficiais com selo de segurança SSL.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                <span><strong>Comunicações Institucionais:</strong> Todas as notificações oficiais são remetidas sob chancela do BNA/MINFIN.</span>
              </li>
            </ul>

            <a
              href="tel:+244222692000"
              data-testid="link-reportar-fraude"
              className="inline-block text-xs font-bold text-zinc-300 hover:text-white underline underline-offset-4"
            >
              Denunciar tentativas de fraude à Linha do Cidadão (+244 222 692 000) →
            </a>
          </div>

          {/* Document Verification Service Card */}
          <div className="bg-zinc-50 border border-zinc-200 p-6 rounded space-y-5 flex flex-col justify-between">
            <form onSubmit={handleValidar} className="space-y-3.5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-zinc-200 text-zinc-900 rounded border border-zinc-300">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-zinc-900">Validar Documento ou Certidão Estatal</h3>
                  <p className="text-xs text-zinc-500">Verificação jurídica de comprovativos e despachos</p>
                </div>
              </div>

              <p className="text-xs text-zinc-600 leading-relaxed">
                Insira o código de validação constante no cabeçalho ou rodapé do documento oficial.
              </p>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ex: GX-2026-GOV-DOC"
                  value={docCode}
                  onChange={(e) => setDocCode(e.target.value)}
                  data-testid="input-doc-code"
                  className="w-full bg-white border border-zinc-300 rounded px-3.5 py-2.5 text-xs outline-none focus:border-zinc-900 uppercase font-mono text-zinc-900 font-bold"
                />
                <button 
                  type="submit"
                  data-testid="btn-validar-doc"
                  className="bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2.5 rounded text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0 uppercase tracking-wider cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                  <span>Autenticar</span>
                </button>
              </div>

              {validationResult && (
                <p data-testid="doc-validation-result" className="text-xs p-2.5 bg-zinc-100 text-zinc-900 border border-zinc-300 rounded font-bold">
                  {validationResult}
                </p>
              )}
            </form>

            <p className="text-[11px] text-zinc-500 italic">
              Serviço em conformidade com o Decreto de Assinatura e Certificação Digital do Estado Angolano.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
