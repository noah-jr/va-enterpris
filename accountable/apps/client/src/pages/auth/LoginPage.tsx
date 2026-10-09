import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { loginSchema, type LoginInput } from '@accountable/schemas';
import type { AxiosError } from 'axios';
import type { ApiError } from '@accountable/types';
import { Alert, Button, Input } from '@accountable/ui';
import { ArrowRight } from 'lucide-react';
import { authService } from '../../services/auth.service.js';
import { useAuthStore } from '../../stores/auth.store.js';
import { ClientAuthShell } from './ClientAuthShell.js';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setClient } = useAuthStore();
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [unverifiedEmail, setUnverifiedEmail] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: import.meta.env.DEV ? 'cliente@empresa.com' : '',
      password: import.meta.env.DEV ? 'AccountableClient2026!' : '',
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setServerError(null);
    setUnverifiedEmail(null);
    try {
      await authService.login(data);
      const me = await authService.getMe();
      setClient(me.data);
      navigate('/dashboard');
    } catch (err) {
      const message = (err as AxiosError<ApiError>).response?.data?.message;
      if (message?.includes('não verificado')) setUnverifiedEmail(data.email);
      setServerError(message || 'Credenciais inválidas ou erro ao ligar ao servidor.');
    }
  };

  return (
    <ClientAuthShell title="Iniciar Sessão" subtitle="Aceda ao portal VA OneGest para acompanhar processos">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {serverError && (
          <Alert tone="danger">
            {serverError}
            {unverifiedEmail && (
              <Link
                to={`/auth/verify-email?email=${encodeURIComponent(unverifiedEmail)}`}
                className="block mt-1 font-semibold underline"
              >
                Ativar a conta com o código recebido
              </Link>
            )}
          </Alert>
        )}
        <Input
          label="Email Corporativo"
          type="email"
          autoComplete="username"
          placeholder="nome@empresa.ao"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label="Senha"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register('password')}
        />
        <div className="flex justify-end">
          <Link to="/auth/forgot-password" className="text-xs font-medium text-primary hover:underline">
            Esqueceu-se da senha?
          </Link>
        </div>
        <Button type="submit" className="w-full" isLoading={isSubmitting}>
          Entrar <ArrowRight className="w-4 h-4" />
        </Button>
      </form>
      <p className="text-sm text-muted text-center">
        Ainda não tem conta?{' '}
        <Link to="/auth/register" className="font-medium text-primary hover:underline">
          Registar empresa
        </Link>
      </p>
    </ClientAuthShell>
  );
};
