import * as React from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import type { AxiosError } from 'axios';
import type { ApiError } from '@accountable/types';
import { Alert, Button, Input } from '@accountable/ui';
import { ArrowLeft, CheckCircle2, KeyRound } from 'lucide-react';
import { adminApiService } from '../../services/admin-api.service.js';
import { AuthShell } from './AuthShell.js';

const errorMessage = (err: unknown, fallback: string) =>
  (err as AxiosError<ApiError>).response?.data?.message ?? fallback;

// ============================================================
// Esqueci-me da senha
// ============================================================

export const AdminForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = React.useState('');
  const [sent, setSent] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await adminApiService.forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(errorMessage(err, 'Não foi possível processar o pedido.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Recuperar senha" subtitle="Enviaremos um link e um código de 6 dígitos para o seu email.">
      {sent ? (
        <div className="space-y-4">
          <Alert tone="success">
            Se existir uma conta ativa com <strong>{email}</strong>, receberá um email com um link e um código válido
            durante 15 minutos.
          </Alert>
          <Button className="w-full" onClick={() => navigate(`/reset-password?email=${encodeURIComponent(email)}`)}>
            <KeyRound className="w-4 h-4" /> Tenho o código
          </Button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          {error && <Alert tone="danger">{error}</Alert>}
          <Input
            label="Email Profissional"
            type="email"
            required
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button type="submit" className="w-full" isLoading={loading}>
            Enviar instruções
          </Button>
        </form>
      )}
      <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline">
        <ArrowLeft className="w-3.5 h-3.5" /> Voltar ao início de sessão
      </Link>
    </AuthShell>
  );
};

// ============================================================
// Redefinir senha (link do email, código OTP ou convite)
// ============================================================

export const AdminResetPasswordPage: React.FC = () => {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const isInvite = params.get('invite') === '1';

  const [email, setEmail] = React.useState(params.get('email') ?? '');
  const [code, setCode] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [done, setDone] = React.useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    setLoading(true);
    try {
      await adminApiService.resetPassword(
        token ? { token, password, confirmPassword } : { email, code, password, confirmPassword },
      );
      setDone(true);
    } catch (err) {
      setError(errorMessage(err, 'Não foi possível redefinir a senha.'));
    } finally {
      setLoading(false);
    }
  };

  const title = isInvite ? 'Ative a sua conta' : 'Definir nova senha';
  const subtitle = token
    ? 'Escolha uma senha forte para a sua conta.'
    : 'Introduza o email e o código de 6 dígitos que recebeu.';

  if (done) {
    return (
      <AuthShell title="Senha definida" subtitle="Já pode iniciar sessão no painel.">
        <Alert tone="success">
          <span className="inline-flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> A sua senha foi definida com sucesso.
          </span>
        </Alert>
        <Link to="/login">
          <Button className="w-full">Iniciar sessão</Button>
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell title={title} subtitle={subtitle}>
      <form onSubmit={submit} className="space-y-4">
        {error && <Alert tone="danger">{error}</Alert>}
        {!token && (
          <>
            <Input label="Email Profissional" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input
              label="Código de verificação"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="\d{6}"
              maxLength={6}
              required
              placeholder="000000"
              className="tracking-[0.5em] font-mono text-center text-base"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            />
          </>
        )}
        <Input
          label="Nova senha"
          type="password"
          autoComplete="new-password"
          required
          helperText="Mínimo 8 caracteres, com maiúscula, minúscula, número e símbolo."
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Input
          label="Confirmar senha"
          type="password"
          autoComplete="new-password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <Button type="submit" className="w-full" isLoading={loading}>
          {isInvite ? 'Ativar conta' : 'Redefinir senha'}
        </Button>
      </form>
      <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline">
        <ArrowLeft className="w-3.5 h-3.5" /> Voltar ao início de sessão
      </Link>
    </AuthShell>
  );
};
