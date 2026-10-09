export interface DocumentSlotItem {
  id: string;
  name: string;
  required: boolean;
  file: File | null;
  status: 'PENDING' | 'READY' | 'DISPENSED';
  category?: string;
  description?: string | null;
  allowedExtensions?: string | null;
}

export type FilterTab = 'ALL' | 'PENDING' | 'READY' | 'DISPENSED';

export type DocumentPriorityValue = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export const MONTHS: Array<{ number: number; name: string; short: string }> = [
  { number: 1, name: 'Janeiro', short: 'Jan' },
  { number: 2, name: 'Fevereiro', short: 'Fev' },
  { number: 3, name: 'Março', short: 'Mar' },
  { number: 4, name: 'Abril', short: 'Abr' },
  { number: 5, name: 'Maio', short: 'Mai' },
  { number: 6, name: 'Junho', short: 'Jun' },
  { number: 7, name: 'Julho', short: 'Jul' },
  { number: 8, name: 'Agosto', short: 'Ago' },
  { number: 9, name: 'Setembro', short: 'Set' },
  { number: 10, name: 'Outubro', short: 'Out' },
  { number: 11, name: 'Novembro', short: 'Nov' },
  { number: 12, name: 'Dezembro', short: 'Dez' },
];

export function monthName(month: number): string {
  return MONTHS.find((m) => m.number === month)?.name ?? '';
}

/** Slots usados enquanto os tipos de documento ainda não chegaram da API. */
export const INITIAL_SLOTS: Array<{ id: string; name: string; required: boolean }> = [
  { id: 'comprovativo_imposto', name: 'Comprovativo de Pagamento de Imposto', required: true },
  { id: 'comprovativo_pagamentos', name: 'Comprovativo de Pagamentos', required: true },
  { id: 'extratos_bancarios', name: 'Extratos Bancarios', required: true },
  { id: 'factura_fornecedores', name: 'Factura de Fornecedores', required: true },
  { id: 'factura_vendas', name: 'Factura de Vendas', required: true },
  { id: 'ficheiro_saft', name: 'Ficheiro Saft', required: true },
  { id: 'folha_caixa', name: 'Folha de Caixa', required: true },
  { id: 'folha_salarios', name: 'Folha de Salários', required: true },
  { id: 'mapa_inss', name: 'Mapa de Guia de Pagamento INSS', required: true },
  { id: 'outros_documentos', name: 'Outros Documentos', required: false },
  { id: 'recibo_pagamentos', name: 'Recibo de Pagamentos', required: true },
];

export const PRIORITY_OPTIONS: ReadonlyArray<{ value: DocumentPriorityValue; label: string; dotColor: string }> = [
  { value: 'LOW', label: 'Baixa', dotColor: 'bg-zinc-400' },
  { value: 'NORMAL', label: 'Normal', dotColor: 'bg-blue-500' },
  { value: 'HIGH', label: 'Alta', dotColor: 'bg-amber-500' },
  { value: 'URGENT', label: 'Urgente', dotColor: 'bg-rose-500' },
];

/** Espelha a allowlist da API (store-document-file.helper.ts). */
export const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.png', '.jpg', '.jpeg', '.txt', '.csv'];
export const ACCEPT_ATTRIBUTE = ALLOWED_EXTENSIONS.join(',');
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

/**
 * Validação no browser antes de criar o processo — evita criar um processo
 * que depois falha a meio do upload. A API volta a validar (incl. conteúdo).
 */
export function validateFileForUpload(file: File): string | null {
  const dot = file.name.lastIndexOf('.');
  const ext = dot >= 0 ? file.name.slice(dot).toLowerCase() : '';
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return `"${file.name}": formato não permitido. Aceites: PDF, DOC(X), XLS(X), JPG, PNG, TXT, CSV.`;
  }
  if (file.size === 0) return `"${file.name}": o ficheiro está vazio.`;
  if (file.size > MAX_FILE_SIZE_BYTES) return `"${file.name}": excede o tamanho máximo de 10MB.`;
  return null;
}
