import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { createTicketSchema, type CreateTicketInput } from '@accountable/schemas';
import { ticketService } from '../../services/ticket.service.js';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
  Input,
} from '@accountable/ui';
import {
  ArrowLeft,
  AlertCircle,
  Calculator,
  FileSpreadsheet,
  Scale,
  Users,
  Laptop,
  HelpCircle,
  ShieldCheck,
  Send,
  LifeBuoy,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import type { AxiosError } from 'axios';
import type { ApiError } from '@accountable/types';

interface CategoryOption {
  value: string;
  label: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
}

const CATEGORIES: CategoryOption[] = [
  {
    value: 'Fiscalidade',
    label: 'Fiscalidade & Impostos',
    subtitle: 'IVA, Modelo 1, Retenções e liquidações',
    icon: Calculator,
  },
  {
    value: 'Contabilidade',
    label: 'Contabilidade Geral',
    subtitle: 'Balancetes, fecho mensal e reconciliação',
    icon: FileSpreadsheet,
  },
  {
    value: 'Recursos Humanos',
    label: 'Recursos Humanos',
    subtitle: 'Folhas de salário, INSS, IRT e pessoal',
    icon: Users,
  },
  {
    value: 'Jurídico',
    label: 'Jurídico & Societário',
    subtitle: 'Contratos, actas, estatutos e conformidade',
    icon: Scale,
  },
  {
    value: 'Plataforma',
    label: 'Plataforma & Acessos',
    subtitle: 'Dúvidas de utilização, links e ficheiros',
    icon: Laptop,
  },
  {
    value: 'Outro',
    label: 'Outro Assunto',
    subtitle: 'Dúvidas gerais ou pedidos diversos',
    icon: HelpCircle,
  },
];

const PRIORITIES: Array<{
  value: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  label: string;
  sla: string;
  dotColor: string;
  activeBorder: string;
  activeBg: string;
  activeText: string;
}> = [
  {
    value: 'NORMAL',
    label: 'Normal',
    sla: 'SLA ~24h',
    dotColor: 'bg-blue-500',
    activeBorder: 'border-blue-500 ring-2 ring-blue-500/20',
    activeBg: 'bg-blue-50/70 dark:bg-blue-950/40',
    activeText: 'text-blue-700 dark:text-blue-300 font-semibold',
  },
  {
    value: 'HIGH',
    label: 'Alta',
    sla: 'SLA ~8h',
    dotColor: 'bg-amber-500',
    activeBorder: 'border-amber-500 ring-2 ring-amber-500/20',
    activeBg: 'bg-amber-50/70 dark:bg-amber-950/40',
    activeText: 'text-amber-700 dark:text-amber-300 font-semibold',
  },
  {
    value: 'URGENT',
    label: 'Urgente',
    sla: 'SLA ~2h',
    dotColor: 'bg-rose-500',
    activeBorder: 'border-rose-500 ring-2 ring-rose-500/20',
    activeBg: 'bg-rose-50/70 dark:bg-rose-950/40',
    activeText: 'text-rose-700 dark:text-rose-300 font-semibold',
  },
  {
    value: 'LOW',
    label: 'Baixa',
    sla: 'SLA ~48h',
    dotColor: 'bg-zinc-400',
    activeBorder: 'border-zinc-500 ring-2 ring-zinc-500/20',
    activeBg: 'bg-zinc-100 dark:bg-zinc-800',
    activeText: 'text-zinc-800 dark:text-zinc-200 font-semibold',
  },
];

export const CreateTicketPage: React.FC = () => {
  const navigate = useNavigate();
  const [serverError, setServerError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateTicketInput>({
    resolver: zodResolver(createTicketSchema),
    defaultValues: {
      subject: '',
      category: CATEGORIES[0]?.value ?? 'Fiscalidade',
      description: '',
      priority: 'NORMAL',
    },
  });

  const selectedCategory = watch('category');
  const selectedPriority = watch('priority') || 'NORMAL';
  const descriptionText = watch('description') || '';

  const onSubmit = async (data: CreateTicketInput) => {
    setServerError(null);
    try {
      const ticket = await ticketService.create(data);
      navigate(`/tickets/${ticket.id}`);
    } catch (err) {
      const axiosErr = err as AxiosError<ApiError>;
      setServerError(axiosErr.response?.data?.message || 'Erro ao submeter ticket.');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Navigation Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/tickets"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          <span>Voltar aos Tickets de Suporte</span>
        </Link>

        <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-500" />
          <span>Atendimento Contabilístico Direto</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Main Form Column (2 Cols on Desktop) */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-white dark:bg-zinc-950 border-zinc-200/80 dark:border-zinc-800/80 shadow-xs">
            <CardHeader className="border-b border-zinc-100 dark:border-zinc-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200/60 dark:border-blue-900 shrink-0">
                  <LifeBuoy className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-base sm:text-lg font-bold">Novo Ticket de Suporte</CardTitle>
                  <CardDescription className="text-xs">
                    Submeta um pedido de esclarecimento, apoio técnico ou consultoria contabilística
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <form onSubmit={handleSubmit(onSubmit)}>
              <CardContent className="p-4 sm:p-6 space-y-6">
                {serverError && (
                  <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{serverError}</span>
                  </div>
                )}

                {/* 1. Category Tiles */}
                <div className="space-y-2.5">
                  <label className="block text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                    1. Selecione a Categoria do Pedido <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    {CATEGORIES.map((cat) => {
                      const Icon = cat.icon;
                      const isSelected = selectedCategory === cat.value;
                      return (
                        <button
                          key={cat.value}
                          type="button"
                          onClick={() => setValue('category', cat.value, { shouldValidate: true })}
                          className={`p-3 rounded-xl border text-left transition-all duration-150 flex flex-col gap-1.5 focus:outline-none ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 ring-2 ring-blue-500/20 shadow-2xs'
                              : 'border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div
                              className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                                isSelected
                                  ? 'bg-blue-600 text-white shadow-xs'
                                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                              }`}
                            >
                              <Icon className="w-4 h-4" />
                            </div>
                            {isSelected && (
                              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                            )}
                          </div>
                          <div>
                            <p
                              className={`text-xs font-bold leading-tight ${
                                isSelected
                                  ? 'text-blue-700 dark:text-blue-300'
                                  : 'text-zinc-900 dark:text-zinc-100'
                              }`}
                            >
                              {cat.label}
                            </p>
                            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 line-clamp-1 mt-0.5">
                              {cat.subtitle}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Priority Selection */}
                <div className="space-y-2.5">
                  <label className="block text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                    2. Nível de Prioridade & SLA
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {PRIORITIES.map((p) => {
                      const isSelected = selectedPriority === p.value;
                      return (
                        <button
                          key={p.value}
                          type="button"
                          onClick={() => setValue('priority', p.value, { shouldValidate: true })}
                          className={`p-2.5 rounded-xl border text-left transition-all duration-150 focus:outline-none flex items-center justify-between ${
                            isSelected
                              ? `${p.activeBorder} ${p.activeBg}`
                              : 'border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:bg-zinc-50 dark:hover:bg-zinc-900'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className={`w-2 h-2 rounded-full shrink-0 ${p.dotColor}`} />
                            <div className="min-w-0">
                              <p
                                className={`text-xs ${
                                  isSelected
                                    ? p.activeText
                                    : 'font-medium text-zinc-800 dark:text-zinc-200'
                                }`}
                              >
                                {p.label}
                              </p>
                              <p className="text-[10px] text-subtle font-mono">{p.sla}</p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Subject Input */}
                <div className="space-y-1">
                  <Input
                    label="3. Assunto Resumido"
                    placeholder="ex: Esclarecimento sobre retenção na fonte na fatura de fornecedor estrangeiro"
                    required
                    error={errors.subject?.message}
                    {...register('subject')}
                  />
                </div>

                {/* 4. Detailed Description Textarea */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                      4. Descrição e Detalhes do Pedido <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[11px] text-subtle font-mono">
                      {descriptionText.length}/5000 carateres
                    </span>
                  </div>

                  <textarea
                    rows={6}
                    placeholder="Descreva com o máximo de detalhe a sua questão, indicando número de faturas, valores, entidades envolvidas ou o resultado pretendido..."
                    className="w-full p-3.5 text-xs sm:text-sm rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors resize-y leading-relaxed"
                    {...register('description')}
                  />
                  {errors.description && (
                    <p className="text-xs text-rose-600 font-medium">{errors.description.message}</p>
                  )}
                  <p className="text-[11px] text-subtle">
                    Dica: Quanto mais contexto fornecer, mais rapidamente a equipa contabilística poderá responder.
                  </p>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-zinc-100 dark:border-zinc-800 p-4 sm:p-6 bg-zinc-50/50 dark:bg-zinc-900/30">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => navigate('/tickets')}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto justify-center"
                >
                  Cancelar
                </Button>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isSubmitting}
                  className="w-full sm:w-auto justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm px-6"
                >
                  <Send className="w-4 h-4" />
                  <span>Submeter Ticket de Suporte</span>
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>

        {/* Right Help & SLA Sidebar */}
        <div className="space-y-4">
          <Card className="bg-white dark:bg-zinc-950 border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs">
            <CardContent className="p-4 sm:p-5 space-y-3.5">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>Compromisso de SLA</span>
              </div>

              <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                Todos os pedidos são triados diretamente por contabilistas certificados e consultores sénior.
              </p>

              <div className="space-y-2 pt-1 border-t border-zinc-100 dark:border-zinc-800 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-zinc-100/60 dark:border-zinc-800/40">
                  <span className="text-zinc-500 dark:text-zinc-400">Dias Úteis:</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">08:30 — 18:00</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-zinc-100/60 dark:border-zinc-800/40">
                  <span className="text-zinc-500 dark:text-zinc-400">Tempo de Resposta Médio:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">&lt; 4 horas</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-zinc-500 dark:text-zinc-400">Segurança de Dados:</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">Auditado &amp; Encriptado</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-50/70 dark:bg-zinc-900/50 border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs">
            <CardContent className="p-4 sm:p-5 space-y-2.5">
              <div className="flex items-center gap-2 text-zinc-800 dark:text-zinc-200 font-semibold text-xs">
                <MessageSquare className="w-4 h-4 text-subtle" />
                <span>Precisa de anexar ficheiros?</span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Após submeter o ticket, terá acesso ao chat direto onde pode anexar documentos, relatórios ou extratos em tempo real.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

