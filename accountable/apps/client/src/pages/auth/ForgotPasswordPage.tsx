import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { AxiosError } from 'axios';
import type { ApiError } from '@accountable/types';
import { Alert, Button, Input } from '@accountable/ui';
import { ArrowLeft, KeyRound } from 'lucide-react';
import { authService } from '../../services/auth.service.js';
import { ClientAuthShell } from './ClientAuthShell.js';

export const ForgotPasswordPage: React.FC = () => {
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
      await authService.forgotPassword({ email });
      setSent(true);
    } catch (err) {
      setError((err as AxiosError<ApiError>).response?.data?.message || 'Não foi possível processar o pedido.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ClientAuthShell title="Recuperar senha" subtitle="Enviaremos um link e um código de 6 dígitos (válidos 15 minutos).">
      {sent ? (
        <div className="space-y-4">
          <Alert tone="success">
            Se existir uma conta ativa com <strong>{email}</strong>, receberá em breve um email com o link e o código.
          </Alert>
          <Button className="w-full" onClick={() => navigate(`/auth/reset-password?email=${encodeURIComponent(email)}`)}>
            <KeyRound className="w-4 h-4" /> Introduzir o código
          </Button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          {error && <Alert tone="danger">{error}</Alert>}
          <Input label="Email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Button type="submit" className="w-full" isLoading={loading}>
            Enviar instruções
          </Button>
        </form>
      )}
      <Link to="/auth/login" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
        <ArrowLeft className="w-4 h-4" /> Voltar ao início de sessão
      </Link>
    </ClientAuthShell>
  );
};
