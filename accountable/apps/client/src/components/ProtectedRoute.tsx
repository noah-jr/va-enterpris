import * as React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store.js';
import { authService } from '../services/auth.service.js';
import { Spinner } from '@accountable/ui';

export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading, setClient, clearAuth } = useAuthStore();
  const location = useLocation();
  const [checking, setChecking] = React.useState(!isAuthenticated);

  React.useEffect(() => {
    if (!isAuthenticated) {
      authService
        .getMe()
        .then((res) => {
          setClient(res.data);
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
  }, [isAuthenticated, setClient, clearAuth]);

  if (isLoading || checking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-[#fafafa] dark:bg-[#09090b] text-zinc-500">
        <Spinner size="lg" />
        <p className="text-xs font-medium">A carregar a sua sessão...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};
