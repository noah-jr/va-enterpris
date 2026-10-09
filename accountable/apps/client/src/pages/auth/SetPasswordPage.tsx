import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useSearchParams } from 'react-router-dom';
import { setPasswordSchema } from '@accountable/schemas';
import type { AxiosError } from 'axios';
import type { ApiError } from '@accountable/types';
import type { z } from 'zod';
import { Alert, Button, Input } from '@accountable/ui';
import { authService } from '../../services/auth.service.js';
import { ClientAuthShell } from './ClientAuthShell.js';

type FormData = z.infer<typeof setPasswordSchema>;

export const SetPasswordPage: React.FC = () => {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [done, setDone] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(setPasswordSchema), defaultValues: { token } });

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    try {
      await authService.setPassword(data);
      setDone(true);
    } catch (err) {
      setServerError((err as AxiosError<ApiError>).response?.data?.message || 'Não foi possível definir a senha.');
    }
  };

  if (!token) {
    return (
      <ClientAuthShell title="Link inválido" subtitle="Abra o link do email de ativação ou ative a conta com o código.">
        <Link to="/auth/verify-email">
          <Button className="w-full">Ativar com código</Button>
        </Link>
      </ClientAuthShell>
    );
  }

  if (done) {
    return (
      <ClientAuthShell title="Conta ativa" subtitle="A sua senha foi definida. Já pode entrar no portal.">
        <Alert tone="success">Conta ativada com sucesso.</Alert>
        <Link to="/auth/login">
          <Button className="w-full">Entrar</Button>
        </Link>
      </ClientAuthShell>
    );
  }

  return (
    <ClientAuthShell title="Definir senha" subtitle="Último passo: escolha a senha de acesso ao portal.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {serverError && <Alert tone="danger">{serverError}</Alert>}
        <input type="hidden" {...register('token')} />
        <Input
          label="Nova Senha"
          type="password"
          autoComplete="new-password"
          helperText="Mínimo 8 caracteres, com maiúscula, minúscula, número e símbolo."
          error={errors.password?.message}
          {...register('password')}
        />
        <Input
          label="Confirmar Senha"
          type="password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
        <Button type="submit" className="w-full" isLoading={isSubmitting}>
          Definir senha
        </Button>
      </form>
    </ClientAuthShell>
  );
};
