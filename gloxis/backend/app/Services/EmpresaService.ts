import Configuracao from '../models/Configuracao.js'

export interface DadosEmpresa {
  nome: string
  denominacao: string
  nif: string
  bnaRegistro: string
  capitalSocial: string
  endereco: string
  cidade: string
  email: string
  telefone: string
  website: string
  bancoNome: string
  iban: string
  swift: string
  taxaJuroPadrao: string
  multaAtrasoDiaria: string
  agtRegime: string
}

export class EmpresaService {
  /**
   * Retorna os dados dinâmicos da empresa a partir da BD com fallbacks seguros.
   */
  public static async getDadosEmpresa(): Promise<DadosEmpresa> {
    try {
      const rows = await Configuracao.all()
      const map = rows.reduce(
        (acc, r) => {
          if (r.chave && r.valor) acc[r.chave] = r.valor
          return acc
        },
        {} as Record<string, string>
      )

      return {
        nome: map.empresa_nome || 'Gloxis Financial S.A.',
        denominacao:
          map.empresa_denominacao || 'Sociedade de Microcrédito e Serviços Financeiros, S.A.',
        nif: map.empresa_nif || '5417009823',
        bnaRegistro: map.empresa_bna_registro || '0491-MC',
        capitalSocial: map.empresa_capital_social || '50000000',
        endereco: map.empresa_endereco || 'Av. 4 de Fevereiro, Edifício Gloxis Tower, 8º Andar',
        cidade: map.empresa_cidade || 'Luanda - Angola',
        email: map.empresa_email || 'contacto@gloxis.ao',
        telefone: map.empresa_telefone || '+244 923 000 111',
        website: map.empresa_website || 'https://gloxis.ao',
        bancoNome: map.empresa_banco_nome || 'Banco Angolano de Investimentos (BAI)',
        iban: map.empresa_iban || 'AO06.0040.0000.1234.5678.1018.9',
        swift: map.empresa_swift || 'BAIAAOAL',
        taxaJuroPadrao: map.empresa_taxa_juro_padrao || '5.0',
        multaAtrasoDiaria: map.empresa_multa_atraso_diaria || '0.5',
        agtRegime:
          map.empresa_agt_regime || 'Regime Geral de IVA - Faturação Eletrónica Certificada',
      }
    } catch (error) {
      return {
        nome: 'Gloxis Financial S.A.',
        denominacao: 'Sociedade de Microcrédito e Serviços Financeiros, S.A.',
        nif: '5417009823',
        bnaRegistro: '0491-MC',
        capitalSocial: '50000000',
        endereco: 'Av. 4 de Fevereiro, Edifício Gloxis Tower, 8º Andar',
        cidade: 'Luanda - Angola',
        email: 'contacto@gloxis.ao',
        telefone: '+244 923 000 111',
        website: 'https://gloxis.ao',
        bancoNome: 'Banco Angolano de Investimentos (BAI)',
        iban: 'AO06.0040.0000.1234.5678.1018.9',
        swift: 'BAIAAOAL',
        taxaJuroPadrao: '5.0',
        multaAtrasoDiaria: '0.5',
        agtRegime: 'Regime Geral de IVA - Faturação Eletrónica Certificada',
      }
    }
  }
}
