import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { ApiError, BillingCycle, PlanDTO, SubscriptionDTO, SubscriptionStatus } from '@accountable/types';
import {
  Alert,
  Badge,
  Button,
  EmptyState,
  Input,
  Modal,
  PageHeader,
  Select,
  Spinner,
  StatCard,
  Textarea,
  formatDate,
  formatKwanza,
  type BadgeTone,
} from '@accountable/ui';
import { Ban, CreditCard, PauseCircle, PlayCircle, Plus, RefreshCw } from 'lucide-react';
import { adminApiService } from '../../services/admin-api.service.js';
import { useAdminAuthStore } from '../../stores/admin-auth.store.js';

const apiError = (err: unknown, fallback: string) => (err as AxiosError<ApiError>).response?.data?.message ?? fallback;

export const STATUS_META: Record<SubscriptionStatus, { label: string; tone: BadgeTone }> = {
  TRIAL: { label: 'Período experimental', tone: 'info' },
  ACTIVE: { label: 'Ativa', tone: 'success' },
  PAST_DUE: { label: 'Pagamento em atraso', tone: 'warning' },
  SUSPENDED: { label: 'Suspensa', tone: 'danger' },
  CANCELLED: { label: 'Cancelada', tone: 'neutral' },
};

const CYCLE_LABEL: Record<BillingCycle, string> = { MONTHLY: 'Mensal', ANNUAL: 'Anual' };

/** Preço por ciclo (anual = preço mensal com faturação anual × 12). */
function planPrice(plan: PlanDTO | undefined, cycle: BillingCycle): number | null {
  if (!plan) return null;
  if (cycle === 'MONTHLY') return plan.priceMonthly;
  return plan.priceAnnual !== null ? plan.priceAnnual * 12 : null;
}

// ------------------------------------------------------------
const CreateSubscriptionModal: React.FC<{ plans: PlanDTO[]; onClose: () => void }> = ({ plans, onClose }) => {
  const queryClient = useQueryClient();
  const [clientSearch, setClientSearch] = React.useState('');
  const [clientId, setClientId] = React.useState('');
  const [planId, setPlanId] = React.useState(plans[0]?.id ?? '');
  const [billingCycle, setBillingCycle] = React.useState<BillingCycle>('MONTHLY');
  const [status, setStatus] = React.useState<'ACTIVE' | 'TRIAL'>('ACTIVE');
  const [customAmount, setCustomAmount] = React.useState('');
  const [notes, setNotes] = React.useState('');

  const clients = useQuery({
    queryKey: ['admin', 'clients', 'picker', clientSearch],
    queryFn: () => adminApiService.listClients({ perPage: 20, search: clientSearch || undefined, isActive: true }),
  });

  const plan = plans.find((p) => p.id === planId);
  const price = planPrice(plan, billingCycle);
  const needsCustom = price === null;

  const create = useMutation({
    mutationFn: () =>
      adminApiService.createSubscription({
        clientId,
        planId,
        billingCycle,
        status,
        ...(customAmount ? { customAmount: Number(customAmount) } : {}),
        ...(notes ? { notes } : {}),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
      onClose();
    },
  });

  return (
    <Modal
      open
      size="lg"
      title="Nova subscrição"
      description="Valores em Kwanzas (AOA)."
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={() => create.mutate()}
            isLoading={create.isPending}
            disabled={!clientId || !planId || (needsCustom && !customAmount)}
          >
            Criar subscrição
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {create.isError && <Alert tone="danger">{apiError(create.error, 'Não foi possível criar a subscrição.')}</Alert>}
        <div className="grid sm:grid-cols-2 gap-3">
          <Input label="Pesquisar cliente" value={clientSearch} onChange={(e) => setClientSearch(e.target.value)} placeholder="Nome, email ou NIF" />
          <Select label="Cliente" value={clientId} onChange={(e) => setClientId(e.target.value)}>
            <option value="">Selecione…</option>
            {(clients.data?.data ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.company || c.name} — {c.email}
              </option>
            ))}
          </Select>
          <Select label="Plano" value={planId} onChange={(e) => setPlanId(e.target.value)}>
            {plans
              .filter((p) => p.isActive)
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
          </Select>
          <Select label="Ciclo de faturação" value={billingCycle} onChange={(e) => setBillingCycle(e.target.value as BillingCycle)}>
            <option value="MONTHLY">Mensal</option>
            <option value="ANNUAL">Anual</option>
          </Select>
          <Select label="Estado inicial" value={status} onChange={(e) => setStatus(e.target.value as 'ACTIVE' | 'TRIAL')}>
            <option value="ACTIVE">Ativa</option>
            <option value="TRIAL">Período experimental</option>
          </Select>
          <Input
            label={needsCustom ? 'Valor acordado (AOA) *' : 'Valor personalizado (AOA, opcional)'}
            type="number"
            min={0}
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            helperText={needsCustom ? 'Este plano é sob proposta — indique o valor por ciclo.' : `Preço do plano: ${formatKwanza(price)}`}
          />
        </div>
        <Textarea label="Notas internas" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
        <div className="rounded-lg bg-surface-muted p-3 text-sm text-foreground flex justify-between" data-testid="subscription-total">
          <span>Total por ciclo ({CYCLE_LABEL[billingCycle].toLowerCase()})</span>
          <strong className="tabular-nums">{formatKwanza(customAmount ? Number(customAmount) : price)}</strong>
        </div>
      </div>
    </Modal>
  );
};

// ------------------------------------------------------------
export const AdminSubscriptionsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { hasPermission } = useAdminAuthStore();
  const canManage = hasPermission('subscriptions:manage');
  const [status, setStatus] = React.useState<SubscriptionStatus | ''>('');
  const [creating, setCreating] = React.useState(false);
  const [cancelTarget, setCancelTarget] = React.useState<SubscriptionDTO | null>(null);
  const [feedback, setFeedback] = React.useState<{ tone: 'success' | 'danger'; text: string } | null>(null);

  const subs = useQuery({
    queryKey: ['admin', 'subscriptions', status],
    queryFn: () => adminApiService.listSubscriptions({ perPage: 100, status: status || undefined }),
  });
  const plans = useQuery({ queryKey: ['admin', 'plans'], queryFn: () => adminApiService.listPlans() });
  const stats = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => adminApiService.getStatsOverview(),
    enabled: hasPermission('reports:read'),
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'subscriptions'] });
    queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
  };

  const act = useMutation({
    mutationFn: async (input: { sub: SubscriptionDTO; action: 'renew' | 'suspend' | 'reactivate' | 'cancel' }) => {
      if (input.action === 'renew') return adminApiService.renewSubscription(input.sub.id);
      const nextStatus: Record<string, SubscriptionStatus> = { suspend: 'SUSPENDED', reactivate: 'ACTIVE', cancel: 'CANCELLED' };
      return adminApiService.updateSubscription(input.sub.id, { status: nextStatus[input.action] });
    },
    onSuccess: (res) => {
      setFeedback({ tone: 'success', text: res.message ?? 'Subscrição atualizada.' });
      setCancelTarget(null);
      refresh();
    },
    onError: (err) => setFeedback({ tone: 'danger', text: apiError(err, 'Operação não permitida.') }),
  });

  const list = subs.data?.data ?? [];
  const byStatus = (s: SubscriptionStatus) => stats.data?.data.subscriptionsByStatus.find((x) => x.status === s)?.count ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<CreditCard className="w-5 h-5" />}
        title="Subscrições"
        description="Planos contratados pelos clientes — valores em Kwanzas (AOA)"
        actions={
          canManage && (
            <Button onClick={() => setCreating(true)} disabled={!plans.data}>
              <Plus className="w-4 h-4" /> Nova subscrição
            </Button>
          )
        }
      />

      {stats.data && (
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            data-testid="kpi-mrr"
            label="Receita recorrente mensal"
            value={formatKwanza(stats.data.data.totals.monthlyRecurringRevenue)}
            hint="Subscrições ativas (anuais ÷ 12)"
          />
          <StatCard label="Ativas" value={byStatus('ACTIVE')} />
          <StatCard label="Em período experimental" value={byStatus('TRIAL')} />
          <StatCard label="Em atraso / suspensas" value={byStatus('PAST_DUE') + byStatus('SUSPENDED')} />
        </div>
      )}

      {feedback && <Alert tone={feedback.tone}>{feedback.text}</Alert>}

      <div className="rounded-xl border border-border bg-surface shadow-card overflow-hidden">
        <div className="p-4 border-b border-border flex flex-wrap gap-3 items-end">
          <div className="w-60">
            <Select label="Estado" value={status} onChange={(e) => setStatus(e.target.value as SubscriptionStatus | '')}>
              <option value="">Todos</option>
              {Object.entries(STATUS_META).map(([value, meta]) => (
                <option key={value} value={value}>
                  {meta.label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {subs.isLoading ? (
          <div className="py-16 flex justify-center">
            <Spinner />
          </div>
        ) : list.length === 0 ? (
          <EmptyState icon={<CreditCard className="w-5 h-5" />} title="Sem subscrições" description="Crie a primeira subscrição para um cliente." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-muted text-left text-[11px] uppercase tracking-wide text-muted">
                  <th className="px-4 py-3 font-semibold">Cliente</th>
                  <th className="px-4 py-3 font-semibold">Plano</th>
                  <th className="px-4 py-3 font-semibold text-right">Valor</th>
                  <th className="px-4 py-3 font-semibold">Estado</th>
                  <th className="px-4 py-3 font-semibold">Período até</th>
                  <th className="px-4 py-3 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {list.map((s) => {
                  const meta = STATUS_META[s.status];
                  const open = s.status !== 'CANCELLED';
                  return (
                    <tr key={s.id} data-testid={`subscription-row-${s.clientEmail}`} className="hover:bg-surface-muted/60">
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">{s.clientName}</p>
                        <p className="text-xs text-muted">{s.clientEmail}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-foreground">{s.planName}</p>
                        <p className="text-xs text-muted">{CYCLE_LABEL[s.billingCycle]}</p>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums font-medium text-foreground">{formatKwanza(s.amount)}</td>
                      <td className="px-4 py-3">
                        <Badge tone={meta.tone}>{meta.label}</Badge>
                      </td>
                      <td className="px-4 py-3 text-muted">{formatDate(s.currentPeriodEnd)}</td>
                      <td className="px-4 py-3">
                        {canManage && open && (
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="sm" title="Renovar" aria-label={`Renovar ${s.clientEmail}`} onClick={() => act.mutate({ sub: s, action: 'renew' })}>
                              <RefreshCw className="w-4 h-4" />
                            </Button>
                            {s.status === 'SUSPENDED' || s.status === 'PAST_DUE' ? (
                              <Button variant="ghost" size="sm" title="Reativar" aria-label={`Reativar ${s.clientEmail}`} onClick={() => act.mutate({ sub: s, action: 'reactivate' })}>
                                <PlayCircle className="w-4 h-4 text-success" />
                              </Button>
                            ) : s.status === 'ACTIVE' ? (
                              <Button variant="ghost" size="sm" title="Suspender" aria-label={`Suspender ${s.clientEmail}`} onClick={() => act.mutate({ sub: s, action: 'suspend' })}>
                                <PauseCircle className="w-4 h-4 text-warning" />
                              </Button>
                            ) : null}
                            <Button variant="ghost" size="sm" title="Cancelar" aria-label={`Cancelar ${s.clientEmail}`} onClick={() => setCancelTarget(s)}>
                              <Ban className="w-4 h-4 text-danger" />
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {creating && plans.data && <CreateSubscriptionModal plans={plans.data.data} onClose={() => setCreating(false)} />}

      <Modal
        open={cancelTarget !== null}
        role="alertdialog"
        size="sm"
        title="Cancelar subscrição?"
        description={cancelTarget ? `${cancelTarget.clientName} — ${cancelTarget.planName}` : undefined}
        onClose={() => setCancelTarget(null)}
        footer={
          <>
            <Button variant="outline" onClick={() => setCancelTarget(null)}>
              Voltar
            </Button>
            <Button variant="danger" isLoading={act.isPending} onClick={() => cancelTarget && act.mutate({ sub: cancelTarget, action: 'cancel' })}>
              Confirmar cancelamento
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted">O cancelamento é definitivo. Para voltar a subscrever será necessário criar uma nova subscrição.</p>
      </Modal>
    </div>
  );
};
