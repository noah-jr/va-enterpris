import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { authStore } from './authStore';
import { useMe } from './useAuth';
import { canAccessRoute } from '../config/moduleGuard';

export default function ProtectedRoute() {
    const location = useLocation();
    const { data: user, isLoading, isError } = useMe();

    // 1. Sem token válido localmente → login imediato (sem flash)
    if (!authStore.isAuthenticated()) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    // 2. A verificar sessão com o servidor → spinner (evita flash de menus)
    if (isLoading) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-[var(--bg-primary)]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent)]" />
            </div>
        );
    }

    // 3. Servidor rejeitou o token (401) → o useMe já faz redirect; por segurança:
    if (isError || !user) {
        authStore.clearSession();
        return <Navigate to="/login" replace />;
    }

    // 4. Super Admin bypassa tudo (gestão da plataforma)
    if (user.role?.toUpperCase() === 'SUPER_ADMIN') {
        return <Outlet />;
    }

    // 5. Subscrição expirada → redirecionar para subscrição
    const hasActiveSub    = user.hasActiveSubscription;
    const isSubPath       = location.pathname === '/subscription';
    const isDashboardPath = location.pathname === '/dashboard';

    if (!hasActiveSub && !isSubPath && !isDashboardPath) {
        return <Navigate to="/subscription" replace />;
    }

    // 6. Módulo não habilitado para esta empresa → dashboard
    const enabledModules = user.company?.enabledModules ?? (user as any)?.enabledModules ?? [];
    const role = user.role || 'USER';

    if (!canAccessRoute(location.pathname, enabledModules, role)) {
        console.warn(`[RouteGuard] Bloqueado: ${location.pathname} — módulo não activo.`);
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
}
