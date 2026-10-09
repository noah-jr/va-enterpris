import * as React from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { ApiError, SubscriptionStatus } from '@accountable/types';
import { Alert, Badge, Button, Input, PageHeader, Spinner, formatDate, formatKwanza, type BadgeTone } from '@accountable/ui';
import { CreditCard, Monitor, Moon, Settings, Sun } from 'lucide-react';
import { authService } from '../../services/auth.service.js';
import { useAuthStore } from '../../stores/auth.store.js';
import { useTheme, type ThemePreference } from '../../hooks/useTheme.js';

const STATUS: Record<SubscriptionStatus, { label: string; tone: BadgeTone }> = {
  TRIAL: { label: 'Período experimental', tone: 'info' },
  ACTIVE: { label: 'Ativa', tone: 'success' },
  PAST_DUE: { label: 'Pagamento em atraso', tone: 'warning' },
  SUSPENDED: { label: 'Suspensa', tone: 'danger' },
  CANCELLED: { label: 'Cancelada', tone: 'neutral' },
};

const Section: React.FC<{ title: string; description?: string; children: React.ReactNode }> = ({ title, description, children }) => (
  <section className="rounded-xl border border-border bg-surface shadow-card">
    <header className="px-6 py-4 border-b border-border">
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      {description && <p className="text-xs text-muted mt-0.5">{description}</p>}
    </header>
    <div className="p-6">{children}</div>
  </section>
);

export const SettingsPage: React.FC = () => {
  const client = useAuthStore((s) => s.client);
  const { preference, setPreference } = useTheme();
  const subscription = useQuery({ queryKey: ['me', 'subscription'], queryFn: () => authService.getMySubscription() });
  const [form, setForm] = React.useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  const change = useMutation({
    mutationFn: () => authService.changePassword(form),
    onSuccess: () => setForm({ currentPassword: '', newPassword: '', confirmPassword: '' }),
  });

  const themes: Array<{ value: ThemePreference; label: string; icon: React.ReactNode }> = [
    { value: 'light', label: 'Claro', icon: <Sun className="w-5 h-5" /> },
    { value: 'dark', label: 'Escuro', icon: <Moon className="w-5 h-5" /> },
    { value: 'system', label: 'Sistema', icon: <Monitor className="w-5 h-5" /> },
  ];

  const sub = subscription.data?.data;

  return (
    <div className="space-y-6">
      <PageHeader icon={<Settings className="w-5 h-5" />} title="Definições" description="Dados da conta, subscrição, segurança e aparência" />

      <div className="grid lg:grid-cols-2 gap-6">
        <Section title="Dados da empresa">
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-xs text-muted">Nome</dt>
              <dd className="font-medium text-foreground">{client?.name}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">NIF</dt>
              <dd className="font-medium text-foreground">{client?.nip}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-xs text-muted">Email</dt>
              <dd className="font-medium text-foreground">{client?.email}</dd>
            </div>
          </dl>
        </Section>

        <Section title="A minha subscrição" description="Valores em Kwanzas (AOA)">
          {subscription.isLoading ? (
            <Spinner />
          ) : sub ? (
            <div className="space-y-3" data-testid="my-subscription">
              <div className="flex items-center justify-between">
                <p className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" /> Plano {sub.planName}
                </p>
                <Badge tone={STATUS[sub.status].tone}>{STATUS[sub.status].label}</Badge>
              </div>
              <p className="text-2xl font-semibold tabular-nums text-foreground">
                {formatKwanza(sub.amount)}
                <span className="text-sm font-normal text-muted"> / {sub.billingCycle === 'MONTHLY' ? 'mês' : 'ano'}</span>
              </p>
              <p className="text-xs text-muted">Período atual até {formatDate(sub.currentPeriodEnd)}</p>
            </div>
          ) : (
            <p className="text-sm text-muted" data-testid="no-subscription">
              Ainda não tem uma subscrição ativa. Contacte a nossa equipa para aderir a um plano.
            </p>
          )}
        </Section>
      </div>

      <Section title="Alterar senha" description="Por segurança, as sessões noutros dispositivos serão terminadas.">
        <form
          className="grid sm:grid-cols-3 gap-3 items-end"
          onSubmit={(e) => {
            e.preventDefault();
            change.mutate();
          }}
        >
          <Input label="Senha atual" type="password" autoComplete="current-password" value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} />
          <Input label="Nova senha" type="password" autoComplete="new-password" value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} />
          <Input label="Confirmar nova senha" type="password" autoComplete="new-password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} />
          <div className="sm:col-span-3 space-y-3">
            {change.isError && (
              <Alert tone="danger">{(change.error as AxiosError<ApiError>).response?.data?.message ?? 'Não foi possível alterar a senha.'}</Alert>
            )}
            {change.isSuccess && <Alert tone="success">Senha alterada com sucesso.</Alert>}
            <Button type="submit" isLoading={change.isPending}>
              Alterar senha
            </Button>
          </div>
        </form>
      </Section>

      <Section title="Aparência" description="A preferência fica guardada neste navegador.">
        <div role="radiogroup" aria-label="Tema" className="grid sm:grid-cols-3 gap-3">
          {themes.map((t) => (
            <button
              key={t.value}
              type="button"
              role="radio"
              aria-checked={preference === t.value}
              data-testid={`theme-option-${t.value}`}
              onClick={() => setPreference(t.value)}
              className={`flex items-center gap-3 p-4 rounded-xl border text-left ${
                preference === t.value ? 'border-primary bg-primary-soft' : 'border-border hover:bg-surface-muted'
              }`}
            >
              <span className="text-primary">{t.icon}</span>
              <span className="text-sm font-medium text-foreground">{t.label}</span>
            </button>
          ))}
        </div>
      </Section>
    </div>
  );
};
