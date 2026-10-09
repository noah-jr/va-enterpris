import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { adminApiService } from '../../services/admin-api.service.js';
import { useAdminAuthStore } from '../../stores/admin-auth.store.js';
import type { PlanDTO } from '@accountable/types';
import { Card, CardContent, Button, Input, Spinner, formatKwanza } from '@accountable/ui';
import {
  Layers,
  Plus,
  Pencil,
  Trash2,
  Power,
  Star,
  X,
  AlertCircle,
  Check,
} from 'lucide-react';

const planFormSchema = z.object({
  name: z.string().min(2, 'Nome demasiado curto').max(100, 'Nome demasiado longo'),
  badge: z.string().max(100).optional(),
  description: z.string().min(5, 'Descrição demasiado curta').max(2000, 'Descrição demasiado longa'),
  priceMonthly: z.string().optional(),
  priceAnnual: z.string().optional(),
  currency: z.string().length(3, 'Deve ter 3 letras (ex: AOA)'),
  ctaText: z.string().min(2, 'Obrigatório').max(255),
  isPopular: z.boolean(),
  isActive: z.boolean(),
  sortOrder: z.string(),
});

type PlanFormData = z.infer<typeof planFormSchema>;

const emptyFormValues: PlanFormData = {
  name: '',
  badge: '',
  description: '',
  priceMonthly: '',
  priceAnnual: '',
  currency: 'AOA',
  ctaText: 'Começar Agora',
  isPopular: false,
  isActive: true,
  sortOrder: '0',
};

const formatPrice = (value: number | null): string => {
  if (value === null) return 'Sob consulta';
  // Valores inteiros em Kwanzas (sem cêntimos).
  return formatKwanza(value);
};

export const AdminPlansPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { hasPermission } = useAdminAuthStore();
  const canManage = hasPermission('plans:manage');

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingPlan, setEditingPlan] = React.useState<PlanDTO | null>(null);
  const [features, setFeatures] = React.useState<string[]>(['']);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<PlanDTO | null>(null);

  const { data: plansData, isLoading } = useQuery({
    queryKey: ['admin', 'plans'],
    queryFn: () => adminApiService.listPlans(),
  });

  const plans: PlanDTO[] = React.useMemo(
    () => [...(plansData?.data ?? [])].sort((a, b) => a.sortOrder - b.sortOrder),
    [plansData],
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PlanFormData>({
    resolver: zodResolver(planFormSchema),
    defaultValues: emptyFormValues,
  });

  const openCreateModal = () => {
    setEditingPlan(null);
    setFeatures(['']);
    setServerError(null);
    reset(emptyFormValues);
    setIsModalOpen(true);
  };

  const openEditModal = (plan: PlanDTO) => {
    setEditingPlan(plan);
    setFeatures(plan.features.length > 0 ? plan.features : ['']);
    setServerError(null);
    reset({
      name: plan.name,
      badge: plan.badge ?? '',
      description: plan.description,
      priceMonthly: plan.priceMonthly !== null ? String(plan.priceMonthly) : '',
      priceAnnual: plan.priceAnnual !== null ? String(plan.priceAnnual) : '',
      currency: plan.currency,
      ctaText: plan.ctaText,
      isPopular: plan.isPopular,
      isActive: plan.isActive,
      sortOrder: String(plan.sortOrder),
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPlan(null);
    setServerError(null);
  };

  const invalidatePlans = () => queryClient.invalidateQueries({ queryKey: ['admin', 'plans'] });

  const createMutation = useMutation({
    mutationFn: adminApiService.createPlan,
    onSuccess: () => {
      invalidatePlans();
      closeModal();
    },
    onError: (err: unknown) => {
      setServerError(err instanceof Error ? err.message : 'Falha ao criar plano.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (vars: { id: string; data: Parameters<typeof adminApiService.updatePlan>[1] }) =>
      adminApiService.updatePlan(vars.id, vars.data),
    onSuccess: () => {
      invalidatePlans();
      closeModal();
    },
    onError: (err: unknown) => {
      setServerError(err instanceof Error ? err.message : 'Falha ao atualizar plano.');
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: (plan: PlanDTO) => adminApiService.updatePlan(plan.id, { isActive: !plan.isActive }),
    onSuccess: invalidatePlans,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApiService.deletePlan(id),
    onSuccess: () => {
      invalidatePlans();
      setDeleteTarget(null);
    },
  });

  const onSubmit = (data: PlanFormData) => {
    setServerError(null);
    const cleanedFeatures = features.map((f) => f.trim()).filter((f) => f.length > 0);
    if (cleanedFeatures.length === 0) {
      setServerError('Pelo menos uma funcionalidade é obrigatória.');
      return;
    }

    const payload = {
      name: data.name.trim(),
      badge: data.badge?.trim() ? data.badge.trim() : null,
      description: data.description.trim(),
      priceMonthly: data.priceMonthly?.trim() ? Math.round(parseFloat(data.priceMonthly)) : null,
      priceAnnual: data.priceAnnual?.trim() ? Math.round(parseFloat(data.priceAnnual)) : null,
      currency: data.currency.trim().toUpperCase(),
      features: cleanedFeatures,
      ctaText: data.ctaText.trim(),
      isPopular: data.isPopular,
      isActive: data.isActive,
      sortOrder: parseInt(data.sortOrder, 10) || 0,
    };

    if (editingPlan) {
      updateMutation.mutate({ id: editingPlan.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleFeatureChange = (index: number, value: string) => {
    setFeatures((prev) => prev.map((f, i) => (i === index ? value : f)));
  };

  const handleAddFeature = () => setFeatures((prev) => [...prev, '']);

  const handleRemoveFeature = (index: number) => {
    setFeatures((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
  };

  if (!hasPermission('plans:read')) {
    return (
      <div className="max-w-md mx-auto mt-16 bg-surface border border-border rounded-xl p-8 space-y-4 text-center">
        <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 flex items-center justify-center mx-auto">
          <AlertCircle className="w-5 h-5" />
        </div>
        <h2 className="text-sm font-semibold text-foreground">Acesso Negado</h2>
        <p className="text-xs text-muted">Não tem permissão para consultar os planos de subscrição.</p>
      </div>
    );
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-foreground tracking-tight">Planos de Subscrição</h1>
          <p className="text-xs sm:text-sm text-muted mt-1">Gestão dos planos e pacotes de serviços para clientes</p>
        </div>

        {canManage && (
          <Button onClick={openCreateModal} className="gap-2">
            <Plus className="w-4 h-4" />
            Novo Plano
          </Button>
        )}
      </div>

      {isLoading && (
        <div className="py-16 flex flex-col items-center justify-center gap-2 text-subtle">
          <Spinner size="lg" />
          <p className="text-xs">A carregar planos...</p>
        </div>
      )}

      {!isLoading && plans.length === 0 && (
        <Card className="bg-surface/60 border-border/80">
          <CardContent className="py-16 text-center text-subtle text-xs">
            Nenhum plano configurado até ao momento.
          </CardContent>
        </Card>
      )}

      {!isLoading && plans.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`bg-surface/60 border-border/80 p-5 space-y-4 flex flex-col justify-between ${
                plan.isActive ? '' : 'opacity-40 grayscale'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-semibold text-foreground text-base">{plan.name}</h3>
                      {plan.isPopular && <Star className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400 fill-amber-400 shrink-0" />}
                    </div>
                    {plan.badge && (
                      <span className="inline-block mt-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-surface-muted text-muted border border-border/50">
                        {plan.badge}
                      </span>
                    )}
                  </div>
                  {!plan.isActive && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60 shrink-0">
                      Inativo
                    </span>
                  )}
                </div>

                <p className="text-xs text-muted line-clamp-2">{plan.description}</p>

                <div className="space-y-0.5 pt-1">
                  <div className="text-xl font-bold text-foreground tracking-tight">
                    {formatPrice(plan.priceMonthly)}
                    {plan.priceMonthly !== null && <span className="text-xs font-normal text-muted"> / mês</span>}
                  </div>
                  <div className="text-[11px] text-subtle">
                    Anual: {formatPrice(plan.priceAnnual)} / mês
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-border/60">
                  <p className="text-[10px] font-semibold text-subtle uppercase tracking-wider">Funcionalidades</p>
                  <ul className="space-y-1">
                    {plan.features.slice(0, 4).map((f, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-xs text-muted">
                        <Check className="w-3.5 h-3.5 text-muted shrink-0" />
                        <span className="truncate">{f}</span>
                      </li>
                    ))}
                    {plan.features.length > 4 && (
                      <li className="text-[11px] text-subtle pl-5.5">
                        +{plan.features.length - 4} adicionais
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              {canManage && (
                <div className="flex items-center gap-2 pt-3 border-t border-border/80">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditModal(plan)}
                    className="text-xs flex-1 gap-1"
                  >
                    <Pencil className="w-3 h-3" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleActiveMutation.mutate(plan)}
                    isLoading={toggleActiveMutation.isPending && toggleActiveMutation.variables?.id === plan.id}
                    title={plan.isActive ? 'Desativar' : 'Ativar'}
                  >
                    <Power className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeleteTarget(plan)}
                    className="text-rose-700 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                    title="Eliminar"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {isModalOpen && canManage && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2 text-foreground font-medium text-sm">
                <Layers className="w-4 h-4 text-muted" />
                <span>{editingPlan ? 'Editar Plano' : 'Novo Plano'}</span>
              </div>
              <button onClick={closeModal} className="text-muted hover:text-foreground p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            {serverError && (
              <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{serverError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Nome *"
                  className="bg-surface border-border text-foreground"
                  error={errors.name?.message}
                  {...register('name')}
                />
                <Input
                  label="Badge"
                  placeholder="Opcional"
                  className="bg-surface border-border text-foreground"
                  error={errors.badge?.message}
                  {...register('badge')}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted mb-1">
                  Descrição *
                </label>
                <textarea
                  rows={2}
                  className="w-full rounded-lg bg-surface border border-border px-3 py-2 text-xs text-foreground placeholder:text-subtle focus:outline-none focus:ring-1 focus:ring-primary resize-y"
                  {...register('description')}
                />
                {errors.description && (
                  <p className="text-xs text-rose-700 dark:text-rose-400 mt-1">{errors.description.message}</p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Input
                  label="Preço Mensal (Kz)"
                  placeholder="Vazio = consulta"
                  type="number"
                  step="0.01"
                  className="bg-surface border-border text-foreground"
                  {...register('priceMonthly')}
                />
                <Input
                  label="Preço mensal com faturação anual (Kz)"
                  placeholder="Vazio = consulta"
                  type="number"
                  step="0.01"
                  className="bg-surface border-border text-foreground"
                  {...register('priceAnnual')}
                />
                <Input
                  label="Moeda"
                  className="bg-surface border-border text-foreground"
                  error={errors.currency?.message}
                  {...register('currency')}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-muted uppercase tracking-wider mb-1.5">
                  Funcionalidades *
                </label>
                <div className="space-y-2">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-muted shrink-0" />
                      <input
                        value={feature}
                        onChange={(e) => handleFeatureChange(index, e.target.value)}
                        className="flex-1 rounded-lg bg-surface border border-border px-3 py-1.5 text-xs text-foreground placeholder:text-subtle focus:outline-none focus:ring-1 focus:ring-primary"
                        placeholder="Descreva a funcionalidade"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(index)}
                        className="text-subtle hover:text-rose-700 dark:hover:text-rose-400 p-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddFeature}
                  className="mt-2 text-xs gap-1"
                >
                  <Plus className="w-3 h-3" />
                  Adicionar
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Texto do Botão (CTA) *"
                  className="bg-surface border-border text-foreground"
                  error={errors.ctaText?.message}
                  {...register('ctaText')}
                />
                <Input
                  label="Ordem"
                  type="number"
                  className="bg-surface border-border text-foreground"
                  {...register('sortOrder')}
                />
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-xs text-muted cursor-pointer">
                  <input type="checkbox" className="rounded bg-surface border-border text-foreground" {...register('isPopular')} />
                  Destacar como Popular
                </label>
                <label className="flex items-center gap-2 text-xs text-muted cursor-pointer">
                  <input type="checkbox" className="rounded bg-surface border-border text-foreground" {...register('isActive')} />
                  Plano Ativo
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={closeModal}
                >
                  Cancelar
                </Button>
                <Button type="submit" size="sm" isLoading={isSaving}>
                  {editingPlan ? 'Guardar' : 'Criar Plano'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && canManage && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-medium text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>Eliminar Plano</span>
            </div>
            <p className="text-xs text-muted">
              Tem a certeza que pretende eliminar o plano <strong className="text-foreground">{deleteTarget.name}</strong>?
              Esta ação não pode ser revertida.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteTarget(null)}
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                variant="danger"
                isLoading={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(deleteTarget.id)}
              >
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
