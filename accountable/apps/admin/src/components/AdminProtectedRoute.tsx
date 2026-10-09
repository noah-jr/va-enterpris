import * as React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAdminAuthStore } from '../stores/admin-auth.store.js';
import { adminApiService } from '../services/admin-api.service.js';
import { Spinner, Button } from '@accountable/ui';
import { ShieldAlert } from 'lucide-react';

export interface AdminProtectedRouteProps {
  requiredPermission?: string;
}

export const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({
  requiredPermission,
}) => {
  const { isAuthenticated, isLoading, user, setUser, clearAuth, hasPermission } =
    useAdminAuthStore();
  const location = useLocation();
  const [checking, setChecking] = React.useState(!isAuthenticated);

  React.useEffect(() => {
    if (!isAuthenticated) {
      adminApiService
        .getMe()
        .then((res) => {
          if (res.data.userType === 'user') {
            setUser({
              id: res.data.id,
              email: res.data.email,
              name: res.data.name ?? null,
              roles: res.data.roles,
              permissions: res.data.permissions,
            });
          } else {
            clearAuth();
          }
        })
        .catch(() => {
          clearAuth();
        })
        .finally(() => {
          setChecking(false);
        });
    } else {
      setChecking(false);
    }
  }, [isAuthenticated, setUser, clearAuth]);

  if (isLoading || checking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-[#09090b] text-subtle">
        <Spinner size="lg" />
        <p className="text-xs font-medium">A verificar credenciais de acesso...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#09090b] px-4 text-center">
        <div className="max-w-md w-full bg-surface border border-border rounded-xl p-8 space-y-4">
          <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <h2 className="text-sm font-semibold text-foreground">Acesso Negado (403)</h2>
          <p className="text-xs text-muted">
            O seu perfil de utilizador não possui a permissão requerida:{' '}
            <code className="text-xs bg-surface border border-border px-1.5 py-0.5 rounded text-rose-700 dark:text-rose-400 font-mono">
              {requiredPermission}
            </code>
          </p>
          <div className="pt-2">
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="text-xs"
            >
              Voltar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <Outlet />;
};
