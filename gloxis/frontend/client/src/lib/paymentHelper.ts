export interface ClientIban {
  id: string
  banco: string
  iban: string
  titular?: string
  isPrincipal?: boolean
}

export interface ClientPaymentDetails {
  ibans: ClientIban[]
  expressNumero?: string
  referenciaPagamento?: {
    entidade: string
    referencia: string
  }
}

export function parsePaymentDetails(contaBancariaStr?: string | null): ClientPaymentDetails {
  if (!contaBancariaStr || !contaBancariaStr.trim()) {
    return { ibans: [], expressNumero: '', referenciaPagamento: { entidade: '', referencia: '' } }
  }

  try {
    const parsed = JSON.parse(contaBancariaStr)
    if (parsed && typeof parsed === 'object') {
      return {
        ibans: Array.isArray(parsed.ibans) ? parsed.ibans : [],
        expressNumero: parsed.expressNumero || '',
        referenciaPagamento: parsed.referenciaPagamento || { entidade: '', referencia: '' }
      }
    }
  } catch {
    // Single IBAN string fallback
    return {
      ibans: [
        {
          id: '1',
          banco: detectBankName(contaBancariaStr),
          iban: contaBancariaStr.trim(),
          isPrincipal: true
        }
      ],
      expressNumero: '',
      referenciaPagamento: { entidade: '', referencia: '' }
    }
  }

  return { ibans: [], expressNumero: '', referenciaPagamento: { entidade: '', referencia: '' } }
}

export function serializePaymentDetails(details: ClientPaymentDetails): string {
  return JSON.stringify(details)
}

export function detectBankName(iban: string): string {
  const clean = iban.replace(/\s+/g, '').toUpperCase()
  if (clean.includes('0006') || clean.startsWith('AO06.0006') || clean.startsWith('AO060006')) return 'BFA'
  if (clean.includes('0040') || clean.startsWith('AO06.0040') || clean.startsWith('AO060040')) return 'BAI'
  if (clean.includes('0051') || clean.startsWith('AO06.0051') || clean.startsWith('AO060051')) return 'BIC'
  if (clean.includes('0055') || clean.startsWith('AO06.0055') || clean.startsWith('AO060055')) return 'Millennium Atlântico'
  if (clean.includes('0044') || clean.startsWith('AO06.0044') || clean.startsWith('AO060044')) return 'Standard Bank'
  if (clean.includes('0048') || clean.startsWith('AO06.0048') || clean.startsWith('AO060048')) return 'Banco SOL'
  if (clean.includes('0059') || clean.startsWith('AO06.0059') || clean.startsWith('AO060059')) return 'Banco Keve'
  return 'Outro Banco'
}
