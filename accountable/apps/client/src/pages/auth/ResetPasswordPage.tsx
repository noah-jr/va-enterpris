import * as React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import type { AxiosError } from 'axios';
import type { ApiError } from '@accountable/types';
import { Alert, Button, Input } from '@accountable/ui';
import { authService } from '../../services/auth.service.js';
import { ClientAuthShell, OtpInput } from './ClientAuthShell.js';

/** Redefinição pelo link (token no URL) ou pelo email + código de 6 dígitos. */
export const ResetPasswordPage: React.FC = () => {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
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
      await authService.resetPassword(token ? { token, password, confirmPassword } : { email, code, password, confirmPassword });
      setDone(true);
    } catch (err) {
      setError((err as AxiosError<ApiError>).response?.data?.message || 'Não foi possível redefinir a senha.');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <ClientAuthShell title="Senha redefinida" subtitle="Por segurança, as sessões abertas noutros dispositivos foram terminadas.">
        <Alert tone="success">A sua senha foi alterada com sucesso.</Alert>
        <Link to="/auth/login">
          <Button className="w-full">Entrar</Button>
        </Link>
      </ClientAuthShell>
    );
  }

  return (
    <ClientAuthShell
      title="Nova senha"
      subtitle={token ? 'Escolha a sua nova senha.' : 'Introduza o email, o código recebido e a nova senha.'}
    >
      <form onSubmit={submit} className="space-y-4">
        {error && <Alert tone="danger">{error}</Alert>}
        {!token && (
          <>
            <Input label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            <OtpInput value={code} onChange={setCode} />
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
          label="Confirmar nova senha"
          type="password"
          autoComplete="new-password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <Button type="submit" className="w-full" isLoading={loading}>
          Redefinir senha
        </Button>
      </form>
      <Link to="/auth/forgot-password" className="text-sm font-medium text-primary hover:underline">
        Pedir um novo código
      </Link>
    </ClientAuthShell>
  );
};
