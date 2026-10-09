import * as React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { ApiError, EmailProvider, EmailTestType } from '@accountable/types';
import { Alert, Badge, Button, Input, PageHeader, Select, Spinner } from '@accountable/ui';
import {
  CheckCircle2,
  Clock,
  KeyRound,
  Mail,
  Monitor,
  Moon,
  Palette,
  Send,
  Settings,
  ShieldCheck,
  Sun,
  UserCircle,
} from 'lucide-react';
import { adminApiService } from '../../services/admin-api.service.js';
import { useAdminAuthStore } from '../../stores/admin-auth.store.js';
import { useTheme, type ThemePreference } from '../../hooks/useTheme.js';
import { roleLabel } from '../../components/AdminLayout.js';

const apiError = (err: unknown, fallback: string) => (err as AxiosError<ApiError>).response?.data?.message ?? fallback;

type Tab = 'profile' | 'appearance' | 'email';

const Section: React.FC<{ title: string; description?: string; children: React.ReactNode }> = ({ title, description, children }) => (
  <section className="rounded-xl border border-border bg-surface shadow-card">
    <header className="px-6 py-4 border-b border-border">
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      {description && <p className="text-xs text-muted mt-0.5">{description}</p>}
    </header>
    <div className="p-6">{children}</div>
  </section>
);

// ------------------------------------------------------------
const ProfileTab: React.FC = () => {
  const user = useAdminAuthStore((s) => s.user);
  const [form, setForm] = React.useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  const change = useMutation({
    mutationFn: () => adminApiService.changePassword(form),
    onSuccess: () => setForm({ currentPassword: '', newPassword: '', confirmPassword: '' }),
  });

  if (!user) return null;
  return (
    <div className="space-y-6">
      <Section title="A minha conta">
        <dl className="grid sm:grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-xs text-muted">Nome</dt>
            <dd className="text-foreground font-medium">{user.name ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Email</dt>
            <dd className="text-foreground font-medium">{user.email}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs text-muted mb-1">Perfis</dt>
            <dd className="flex flex-wrap gap-1">
              {user.roles.map((r) => (
                <Badge key={r} tone="primary">
                  {roleLabel(r)}
                </Badge>
              ))}
            </dd>
          </div>
        </dl>
      </Section>

      <Section title="Alterar senha" description="As restantes sessões abertas serão terminadas.">
        <form
          className="grid sm:grid-cols-3 gap-3 items-end"
          onSubmit={(e) => {
            e.preventDefault();
            change.mutate();
          }}
        >
          <Input
            label="Senha atual"
            type="password"
            autoComplete="current-password"
            value={form.currentPassword}
            onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
          />
          <Input
            label="Nova senha"
            type="password"
            autoComplete="new-password"
            value={form.newPassword}
            onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
          />
          <Input
            label="Confirmar nova senha"
            type="password"
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
          />
          <div className="sm:col-span-3 flex flex-col gap-3">
            {change.isError && <Alert tone="danger">{apiError(change.error, 'Não foi possível alterar a senha.')}</Alert>}
            {change.isSuccess && <Alert tone="success">Senha alterada com sucesso.</Alert>}
            <div>
              <Button type="submit" isLoading={change.isPending}>
                Alterar senha
              </Button>
            </div>
          </div>
        </form>
      </Section>
    </div>
  );
};

// ------------------------------------------------------------
const AppearanceTab: React.FC = () => {
  const { preference, setPreference } = useTheme();
  const options: Array<{ value: ThemePreference; label: string; icon: React.ReactNode; hint: string }> = [
    { value: 'light', label: 'Claro', icon: <Sun className="w-5 h-5" />, hint: 'Fundo claro, ideal para escritório' },
    { value: 'dark', label: 'Escuro', icon: <Moon className="w-5 h-5" />, hint: 'Menos brilho em ambientes escuros' },
    { value: 'system', label: 'Sistema', icon: <Monitor className="w-5 h-5" />, hint: 'Segue a preferência do sistema operativo' },
  ];
  return (
    <Section title="Tema" description="A preferência fica guardada neste navegador.">
      <div role="radiogroup" aria-label="Tema" className="grid sm:grid-cols-3 gap-3">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={preference === o.value}
            data-testid={`theme-option-${o.value}`}
            onClick={() => setPreference(o.value)}
            className={`text-left p-4 rounded-xl border transition-colors ${
              preference === o.value ? 'border-primary bg-primary-soft' : 'border-border hover:bg-surface-muted'
            }`}
          >
            <span className="text-primary">{o.icon}</span>
            <span className="block mt-2 text-sm font-medium text-foreground">{o.label}</span>
            <span className="block text-xs text-muted">{o.hint}</span>
          </button>
        ))}
      </div>
    </Section>
  );
};

// ------------------------------------------------------------
// ------------------------------------------------------------
const EmailTab: React.FC = () => {
  const queryClient = useQueryClient();
  const user = useAdminAuthStore((s) => s.user);
  const settings = useQuery({ queryKey: ['admin', 'email-settings'], queryFn: () => adminApiService.getEmailSettings() });

  const [form, setForm] = React.useState({
    provider: 'SMTP' as EmailProvider,
    host: '',
    port: 587,
    secure: false,
    username: '',
    password: '',
    fromName: '',
    fromEmail: '',
    isEnabled: true,
    otpEnabled: true,
    verificationExpiresHours: 24,
    passwordResetExpiresMinutes: 15,
  });
  const [testTo, setTestTo] = React.useState(user?.email ?? '');
  const [testType, setTestType] = React.useState<EmailTestType>('GENERIC');

  React.useEffect(() => {
    const s = settings.data?.data;
    if (!s) return;
    setForm({
      provider: s.provider,
      host: s.host,
      port: s.port,
      secure: s.secure,
      username: s.username ?? '',
      password: '',
      fromName: s.fromName,
      fromEmail: s.fromEmail,
      isEnabled: s.source === 'database' ? s.isEnabled : true,
      otpEnabled: s.otpEnabled ?? true,
      verificationExpiresHours: s.verificationExpiresHours ?? 24,
      passwordResetExpiresMinutes: s.passwordResetExpiresMinutes ?? 15,
    });
  }, [settings.data]);

  const isGmail = form.provider === 'GMAIL';

  const save = useMutation({
    mutationFn: () =>
      adminApiService.updateEmailSettings({
        ...form,
        ...(isGmail ? { host: 'smtp.gmail.com', port: 465, secure: true } : {}),
        password: form.password || undefined,
      }),
    onSuccess: () => {
      setForm((f) => ({ ...f, password: '' }));
      queryClient.invalidateQueries({ queryKey: ['admin', 'email-settings'] });
    },
  });

  const test = useMutation({
    mutationFn: () => adminApiService.sendTestEmail(testTo, testType),
  });

  if (settings.isLoading) return <Spinner />;
  const current = settings.data?.data;

  return (
    <div className="space-y-6">
      <Section
        title="Servidor de email"
        description="Usado para ativação de contas, envio de códigos OTP, recuperação de senha e notificações da plataforma."
      >
        <form
          className="space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate();
          }}
        >
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
            Configuração em uso:
            <Badge tone={current?.source === 'database' ? 'success' : 'neutral'}>
              {current?.source === 'database' ? 'Definida no painel' : 'Variáveis de ambiente (SMTP_*)'}
            </Badge>
            {current?.hasPassword && <Badge tone="primary">Senha guardada (cifrada com AES-256)</Badge>}
            {form.otpEnabled && <Badge tone="success">OTP de 6 dígitos ativo</Badge>}
          </div>

          <div role="radiogroup" aria-label="Fornecedor" className="grid sm:grid-cols-2 gap-3">
            {(['GMAIL', 'SMTP'] as const).map((p) => (
              <button
                key={p}
                type="button"
                role="radio"
                aria-checked={form.provider === p}
                data-testid={`email-provider-${p}`}
                onClick={() => setForm({ ...form, provider: p, ...(p === 'GMAIL' ? { host: 'smtp.gmail.com', port: 465, secure: true } : {}) })}
                className={`text-left p-4 rounded-xl border ${form.provider === p ? 'border-primary bg-primary-soft' : 'border-border hover:bg-surface-muted'}`}
              >
                <span className="block text-sm font-medium text-foreground">{p === 'GMAIL' ? 'Gmail / Google Workspace' : 'Servidor SMTP'}</span>
                <span className="block text-xs text-muted">
                  {p === 'GMAIL' ? 'smtp.gmail.com:465 (SSL) com palavra-passe de aplicação' : 'Qualquer servidor SMTP (ex.: do seu alojamento)'}
                </span>
              </button>
            ))}
          </div>

          {isGmail && (
            <Alert tone="info">
              No Gmail, ative a verificação em 2 passos e crie uma <strong>palavra-passe de aplicação</strong> em
              myaccount.google.com → Segurança. Use-a no campo de senha (não a senha normal da conta).
            </Alert>
          )}

          <div className="grid sm:grid-cols-3 gap-3">
            {!isGmail && (
              <>
                <Input label="Servidor (host)" value={form.host} onChange={(e) => setForm({ ...form, host: e.target.value })} />
                <Input label="Porta" type="number" value={form.port} onChange={(e) => setForm({ ...form, port: Number(e.target.value) })} />
                <Select
                  label="Segurança"
                  value={form.secure ? 'ssl' : 'starttls'}
                  onChange={(e) => setForm({ ...form, secure: e.target.value === 'ssl' })}
                >
                  <option value="starttls">STARTTLS / sem SSL (587, 25)</option>
                  <option value="ssl">SSL/TLS (465)</option>
                </Select>
              </>
            )}
            <Input
              label={isGmail ? 'Conta Gmail' : 'Utilizador'}
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
            <Input
              label={isGmail ? 'Palavra-passe de aplicação' : 'Senha'}
              type="password"
              autoComplete="new-password"
              placeholder={current?.hasPassword ? '•••••••• (manter a atual)' : ''}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <div />
            <Input label="Nome do remetente" value={form.fromName} onChange={(e) => setForm({ ...form, fromName: e.target.value })} />
            <Input label="Email do remetente" type="email" value={form.fromEmail} onChange={(e) => setForm({ ...form, fromEmail: e.target.value })} />
          </div>

          {/* Secção de Códigos OTP e Autenticação */}
          <div className="pt-4 border-t border-border space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-primary" />
                Autenticação & Códigos OTP por Email
              </h3>
              <p className="text-xs text-muted mt-0.5">
                Os emails de ativação de conta e recuperação de senha enviam links assinados e códigos numéricos de 6 dígitos.
              </p>
            </div>

            <label className="flex items-center gap-2.5 text-sm text-foreground">
              <input
                type="checkbox"
                checked={form.otpEnabled}
                onChange={(e) => setForm({ ...form, otpEnabled: e.target.checked })}
                className="rounded border-border text-primary focus:ring-primary"
              />
              <span className="font-medium">Ativar envio de códigos numéricos OTP nos emails de autenticação</span>
            </label>

            <div className="grid sm:grid-cols-2 gap-3">
              <Input
                label="Validade do código de ativação de conta (horas)"
                type="number"
                min={1}
                max={168}
                value={form.verificationExpiresHours}
                onChange={(e) => setForm({ ...form, verificationExpiresHours: Number(e.target.value) || 24 })}
                helperText="Tempo durante o qual o novo cliente pode usar o link ou código de 6 dígitos (padrão: 24h)."
              />
              <Input
                label="Validade do código de recuperação de senha (minutos)"
                type="number"
                min={5}
                max={120}
                value={form.passwordResetExpiresMinutes}
                onChange={(e) => setForm({ ...form, passwordResetExpiresMinutes: Number(e.target.value) || 15 })}
                helperText="Tempo durante o qual o link ou código de recuperação é válido (padrão: 15 min)."
              />
            </div>

            <div className="grid sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-surface-muted border border-border text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-foreground">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  HMAC-SHA256
                </div>
                <p className="text-muted">
                  O código em texto limpo nunca é guardado na base de dados.
                </p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-foreground">
                  <KeyRound className="w-3.5 h-3.5 text-blue-600" />
                  Anti-Força Bruta
                </div>
                <p className="text-muted">
                  Bloqueio automático do token após 5 tentativas de código incorretas.
                </p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-foreground">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  Uso Único
                </div>
                <p className="text-muted">
                  Códigos e links são invalidados logo após o primeiro uso com sucesso.
                </p>
              </div>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-foreground pt-2">
            <input type="checkbox" checked={form.isEnabled} onChange={(e) => setForm({ ...form, isEnabled: e.target.checked })} />
            Usar esta configuração na plataforma (desmarque para voltar às variáveis de ambiente)
          </label>

          {save.isError && <Alert tone="danger">{apiError(save.error, 'Não foi possível guardar.')}</Alert>}
          {save.isSuccess && <Alert tone="success">Configuração de email e autenticação guardada.</Alert>}
          <Button type="submit" isLoading={save.isPending}>
            Guardar configuração
          </Button>
        </form>
      </Section>

      <Section
        title="Testar envio de email & códigos OTP"
        description="Envia um email com a configuração guardada para validar a entrega e o formato visual do código OTP."
      >
        <div className="space-y-4">
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <Input
                label="Destinatário do teste"
                type="email"
                value={testTo}
                onChange={(e) => setTestTo(e.target.value)}
              />
            </div>
            <div>
              <Select
                label="Tipo de teste"
                value={testType}
                onChange={(e) => setTestType(e.target.value as EmailTestType)}
              >
                <option value="GENERIC">Teste simples de conexão SMTP</option>
                <option value="ACCOUNT_VERIFICATION">Simulação de Ativação com Código OTP</option>
                <option value="PASSWORD_RESET">Simulação de Recuperação com Código OTP</option>
              </Select>
            </div>
          </div>

          <Button variant="outline" onClick={() => test.mutate()} isLoading={test.isPending} disabled={!testTo}>
            <Send className="w-4 h-4" /> Enviar teste ({testType === 'GENERIC' ? 'Simples' : 'Com OTP'})
          </Button>
        </div>

        {test.data && (
          <div className="mt-4 space-y-2" data-testid="email-test-result">
            {test.data.data.success ? (
              <Alert tone="success">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Email enviado com sucesso para {testTo}.
                  </div>
                  {test.data.data.code && (
                    <div className="text-xs font-mono bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                      Código OTP enviado no teste: <strong className="text-sm tracking-widest">{test.data.data.code}</strong>
                    </div>
                  )}
                </div>
              </Alert>
            ) : (
              <Alert tone="danger">Falhou: {test.data.data.error}</Alert>
            )}
          </div>
        )}
        {test.isError && <Alert tone="danger">{apiError(test.error, 'Falha ao enviar o teste.')}</Alert>}
      </Section>
    </div>
  );
};

// ------------------------------------------------------------
export const AdminSettingsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const canManageSettings = useAdminAuthStore((s) => s.hasPermission('settings:manage'));
  const urlTab = searchParams.get('tab') as Tab | null;
  const [tab, setTab] = React.useState<Tab>(urlTab === 'email' && canManageSettings ? 'email' : 'profile');

  React.useEffect(() => {
    if (urlTab && (urlTab === 'profile' || urlTab === 'appearance' || (urlTab === 'email' && canManageSettings))) {
      setTab(urlTab);
    }
  }, [urlTab, canManageSettings]);

  const handleSelectTab = (newTab: Tab) => {
    setTab(newTab);
    setSearchParams(newTab === 'profile' ? {} : { tab: newTab });
  };

  const tabs: Array<{ id: Tab; label: string; icon: React.ReactNode; visible: boolean }> = [
    { id: 'profile', label: 'Perfil', icon: <UserCircle className="w-4 h-4" />, visible: true },
    { id: 'appearance', label: 'Aparência', icon: <Palette className="w-4 h-4" />, visible: true },
    { id: 'email', label: 'Servidor de Email & OTP', icon: <Mail className="w-4 h-4" />, visible: canManageSettings },
  ];

  return (
    <div className="space-y-6">
      <PageHeader icon={<Settings className="w-5 h-5" />} title="Definições" description="Conta, aparência e configurações do sistema" />

      <div role="tablist" aria-label="Secções das definições" className="flex gap-1 border-b border-border">
        {tabs
          .filter((t) => t.visible)
          .map((t) => (
            <button
              key={t.id}
              role="tab"
              type="button"
              aria-selected={tab === t.id}
              onClick={() => handleSelectTab(t.id)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                tab === t.id ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-foreground'
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
      </div>

      {tab === 'profile' && <ProfileTab />}
      {tab === 'appearance' && <AppearanceTab />}
      {tab === 'email' && canManageSettings && <EmailTab />}
    </div>
  );
};
