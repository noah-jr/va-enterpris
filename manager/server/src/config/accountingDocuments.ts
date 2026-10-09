export interface RequiredDocumentType {
    key: string;
    label: string;
    description: string;
    workflow: 'BANK' | 'DIRECT';
}

export const REQUIRED_DOCUMENTS: RequiredDocumentType[] = [
    { key: 'BANK_STATEMENT',    label: 'Extratos Bancários',                  description: 'Extratos mensais de todas as contas bancárias da empresa.', workflow: 'BANK' },
    { key: 'INVOICE_PURCHASE',   label: 'Facturas de Fornecedores',            description: 'Facturas, recibos e justificativos de despesas do período.', workflow: 'BANK' },
    { key: 'INVOICE_SALE',       label: 'Facturas de Vendas',                  description: 'Facturas emitidas a clientes no respectivo mês.', workflow: 'BANK' },
    { key: 'SAFT',               label: 'Ficheiro SAFT',                       description: 'Ficheiro SAFT de faturação gerado pelo software de faturação.', workflow: 'DIRECT' },
    { key: 'PAYROLL',            label: 'Folha de Salários',                   description: 'Mapa de salários/remunerações dos funcionários.', workflow: 'DIRECT' },
    { key: 'INSS_GUIDE',         label: 'Guia de Pagamento INSS',              description: 'Guia e mapa de contribuições para a segurança social.', workflow: 'DIRECT' },
    { key: 'TAX_PAYMENT',        label: 'Pagamento de Impostos',               description: 'DLI, DUC e comprovativos de liquidação de impostos.', workflow: 'DIRECT' },
    { key: 'RECEIPTS',           label: 'Recibos de Pagamento',                description: 'Recibos e justificativos de pagamentos diversos.', workflow: 'DIRECT' },
    { key: 'OTHER_DOCS',         label: 'Outros Documentos',                   description: 'Contratos, atas ou outros documentos de suporte contabilístico.', workflow: 'DIRECT' }
];

export const BANKS_LIST = [
    'BAI (Banco Angolano de Investimentos)',
    'BFA (Banco de Fomento Angola)',
    'Banco BIC',
    'Banco Sol',
    'Banco Millenium Atlântico',
    'Caixa Angola',
    'Standard Bank Angola',
    'BCI (Banco de Comércio e Indústria)'
];
