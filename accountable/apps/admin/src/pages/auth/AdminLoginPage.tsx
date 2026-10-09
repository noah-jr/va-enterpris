import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { loginSchema, type LoginInput } from '@accountable/schemas';
import { adminApiService } from '../../services/admin-api.service.js';
import { useAdminAuthStore } from '../../stores/admin-auth.store.js';
import { Alert, Button, Input } from '@accountable/ui';
import { ArrowRight } from 'lucide-react';
import { AuthShell } from './AuthShell.js';
import type { AxiosError } from 'axios';
import type { ApiError } from '@accountable/types';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setUser } = useAdminAuthStore();
  const [serverError, setServerError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: import.meta.env.DEV ? 'admin@accountable.local' : '',
      password: import.meta.env.DEV ? 'AccountableAdmin2026!' : '',
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setServerError(null);
    try {
      await adminApiService.login(data);
      const me = await adminApiService.getMe();
      setUser({
        id: me.data.id,
        email: me.data.email,
        name: me.data.name ?? null,
        roles: me.data.roles,
        permissions: me.data.permissions,
      });
      navigate('/dashboard');
    } catch (err) {
      const axiosErr = err as AxiosError<ApiError>;
      setServerError(
        axiosErr.response?.data?.message || 'Credenciais inválidas ou sem permissões de acesso.',
      );
    }
  };

  return (
    <AuthShell title="VA OneGest Admin" subtitle="Acesso reservado a administradores e consultores">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {serverError && <Alert tone="danger">{serverError}</Alert>}

        <Input
          label="Email Profissional"
          type="email"
          autoComplete="username"
          placeholder="nome@empresa.ao"
          required
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Senha de Acesso"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          required
          error={errors.password?.message}
          {...register('password')}
        />

        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-xs font-medium text-primary hover:underline">
            Esqueceu-se da senha?
          </Link>
        </div>

        <Button type="submit" className="w-full gap-1.5" isLoading={isSubmitting}>
          Aceder ao Painel
          <ArrowRight className="w-4 h-4" />
        </Button>
      </form>
    </AuthShell>
  );
};
