import * as React from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import type { AxiosError } from 'axios';
import type { ApiError } from '@accountable/types';
import { Alert, Button, Input, Spinner } from '@accountable/ui';
import { authService } from '../../services/auth.service.js';
import { ClientAuthShell, OtpInput } from './ClientAuthShell.js';

const apiError = (err: unknown, fallback: string) => (err as AxiosError<ApiError>).response?.data?.message ?? fallback;

/**
 * Ativação de conta: pelo link do email (token no URL, automático) ou pelo código
 * de 6 dígitos (email + código). Permite reenviar um novo código.
 */
export const VerifyEmailPage: React.FC = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token');
  const justRegistered = params.get('registered') === '1';

  const [email, setEmail] = React.useState(params.get('email') ?? '');
  const [code, setCode] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [info, setInfo] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(Boolean(token));
  const [resending, setResending] = React.useState(false);
  const verifiedRef = React.useRef(false);

  const goToSetPassword = React.useCallback(
    (setupToken: string) => navigate(`/auth/set-password?token=${setupToken}`, { replace: true }),
    [navigate],
  );

  React.useEffect(() => {
    if (!token || verifiedRef.current) return;
    verifiedRef.current = true; // StrictMode: o link é de uso único, verificar só uma vez.
    authService
      .verifyEmail(token)
      .then((res) => goToSetPassword(res.data.setupToken))
      .catch((err) => {
        setError(apiError(err, 'Link de ativação inválido ou expirado.'));
        setLoading(false);
      });
  }, [token, goToSetPassword]);

  const submitCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      const res = await authService.verifyEmailWithCode(email, code);
      goToSetPassword(res.data.setupToken);
    } catch (err) {
      setError(apiError(err, 'Código inválido.'));
      setLoading(false);
    }
  };

  const resend = async () => {
    setError(null);
    setResending(true);
    try {
      await authService.resendVerification(email);
      setInfo('Se a conta estiver por ativar, enviámos um novo link e um novo código.');
      setCode('');
    } catch (err) {
      setError(apiError(err, 'Não foi possível reenviar.'));
    } finally {
      setResending(false);
    }
  };

  if (token && loading) {
    return (
      <ClientAuthShell title="A ativar a sua conta…">
        <div className="flex justify-center py-8">
          <Spinner size="lg" />
        </div>
      </ClientAuthShell>
    );
  }

  return (
    <ClientAuthShell title="Ativar conta" subtitle="Introduza o código de 6 dígitos que enviámos para o seu email.">
      {justRegistered && !error && (
        <Alert tone="success">
          Conta criada. Verifique a caixa de correio de <strong>{email}</strong> — o email traz um link e um código.
        </Alert>
      )}
      {error && <Alert tone="danger">{error}</Alert>}
      {info && <Alert tone="info">{info}</Alert>}

      <form onSubmit={submitCode} className="space-y-4">
        <Input label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <OtpInput value={code} onChange={setCode} />
        <Button type="submit" className="w-full" isLoading={loading} disabled={code.length !== 6 || !email}>
          Ativar conta
        </Button>
      </form>

      <div className="flex items-center justify-between text-sm">
        <button
          type="button"
          onClick={resend}
          disabled={!email || resending}
          className="font-medium text-primary hover:underline disabled:opacity-50"
        >
          {resending ? 'A reenviar…' : 'Reenviar código'}
        </button>
        <Link to="/auth/login" className="text-muted hover:text-foreground">
          Voltar ao início de sessão
        </Link>
      </div>
    </ClientAuthShell>
  );
};
