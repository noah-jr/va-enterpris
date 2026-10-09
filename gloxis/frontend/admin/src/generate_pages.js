import fs from 'fs'
import path from 'path'

const pages = [
  'Vendas', 'Compras', 'Stock', 'Faturacao', 'Financeiro',
  'Contabilidade', 'RecursosHumanos', 'Contratos', 'Projetos',
  'Ativos', 'Documentos', 'Administracao'
]

const template = (name) => `
export function ${name}() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">${name.replace(/([A-Z])/g, ' $1').trim()}</h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-1">
            Módulo em desenvolvimento.
          </p>
        </div>
      </div>
      <div className="glass rounded-xl border border-[var(--color-border)] p-12 text-center">
        <h2 className="text-xl font-medium text-[var(--color-text-muted)]">Em Breve</h2>
        <p className="text-sm text-gray-500 mt-2">As funcionalidades deste módulo estão a ser implementadas.</p>
      </div>
    </div>
  )
}
`

const dir = '/home/mr-nobody/Documentos/_/VA/gloxis/frontend/admin/src/pages'

pages.forEach(p => {
  const file = path.join(dir, `${p}.tsx`)
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, template(p).trim())
    console.log(`Created ${p}.tsx`)
  }
})
