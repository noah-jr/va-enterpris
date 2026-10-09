import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { registerClientSchema, type RegisterClientInput } from '@accountable/schemas';
import type { AxiosError } from 'axios';
import type { ApiError } from '@accountable/types';
import { Alert, Button, Input } from '@accountable/ui';
import { ArrowRight } from 'lucide-react';
import { authService } from '../../services/auth.service.js';
import { ClientAuthShell } from './ClientAuthShell.js';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [serverError, setServerError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterClientInput>({ resolver: zodResolver(registerClientSchema) });

  const onSubmit = async (data: RegisterClientInput) => {
    setServerError(null);
    try {
      await authService.register(data);
      // O email traz um link e um código — seguimos para a página de ativação por código.
      navigate(`/auth/verify-email?email=${encodeURIComponent(data.email)}&registered=1`);
    } catch (err) {
      setServerError((err as AxiosError<ApiError>).response?.data?.message || 'Não foi possível concluir o registo.');
    }
  };

  return (
    <ClientAuthShell title="Registar empresa" subtitle="Enviaremos um link e um código de ativação para o seu email.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {serverError && <Alert tone="danger">{serverError}</Alert>}
        <Input label="NIP / NIF da Empresa" placeholder="5000000000" error={errors.nip?.message} {...register('nip')} />
        <Input label="Nome / Denominação Social" error={errors.name?.message} {...register('name')} />
        <Input label="Email Institucional" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
        <Button type="submit" className="w-full" isLoading={isSubmitting}>
          Criar conta <ArrowRight className="w-4 h-4" />
        </Button>
      </form>
      <p className="text-sm text-muted text-center">
        Já tem conta?{' '}
        <Link to="/auth/login" className="font-medium text-primary hover:underline">
          Entrar
        </Link>
      </p>
    </ClientAuthShell>
  );
};
