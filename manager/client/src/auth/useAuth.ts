import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import api from '../api';
import { authStore, type AuthUser } from './authStore';

// ─── Types ──────────────────────────────────────
export interface LoginPayload {
    email: string;
    password: string;
}

export interface RegisterSaaSPayload {
    companyName: string;
    companyNif: string;
    companyPhone?: string;
    companyAddress?: string;
    userName: string;
    userEmail: string;
    password: string;
    plan?: string;
}

export interface AuthResponse {
    accessToken?: string;
    user?: AuthUser;
    message?: string;
    requiresVerification?: boolean;
    email?: string;
}

// ─── Hooks ──────────────────────────────────────

/** Fetch currently authenticated user profile */
export function useMe() {
    const navigate = useNavigate();
    const qc = useQueryClient();

    return useQuery({
        queryKey: ['auth', 'me'],
        queryFn: async () => {
            try {
                const res = await api.get<AuthUser>('/auth/me');
                // Sincronizar utilizador em cache com dados frescos do servidor
                authStore.setSession(
                    authStore.getToken()!,
                    res.data
                );
                return res.data;
            } catch (err: any) {
                if (err?.response?.status === 401) {
                    // Token rejeitado pelo servidor → limpar sessão e ir para login
                    authStore.clearSession();
                    qc.clear();
                    navigate('/login', { replace: true });
                }
                throw err;
            }
        },
        enabled: authStore.isAuthenticated(),
        staleTime: 1000 * 60 * 5, // 5 minutos (menos queries, permissões estão no JWT)
        retry: (failureCount, err: any) => {
            // Não tentar novamente em 401 (sessão inválida)
            if (err?.response?.status === 401) return false;
            return failureCount < 2;
        },
    });
}

/** Login hook */
export function useLogin() {
    const navigate = useNavigate();
    const qc = useQueryClient();

    return useMutation({
        mutationFn: async (payload: LoginPayload) => {
            const res = await api.post<AuthResponse>('/auth/login', payload);
            return res.data;
        },
        onSuccess: (data) => {
            if (!data.accessToken || !data.user) return;
            authStore.setSession(data.accessToken, data.user);
            qc.setQueryData(['auth', 'me'], data.user);
            toast.success(`Bem-vindo de volta, ${data.user.name}!`);
            navigate('/dashboard');
        },
        onError: (err: any) => {
            const errorMsg = err.response?.data?.error || 'Falha no login. Verifique as suas credenciais.';
            
            if (err.response?.status === 401) {
                toast.error('Credenciais Inválidas', {
                    description: 'O email ou a palavra-passe introduzidos estão incorretos.',
                });
            } else {
                toast.error(errorMsg);
            }
        }
    });
}

/** SaaS Register hook */
export function useRegisterSaaS() {
    const navigate = useNavigate();
    const qc = useQueryClient();

    return useMutation({
        mutationFn: async (payload: RegisterSaaSPayload) => {
            const res = await api.post<AuthResponse>('/auth/register', payload);
            return res.data;
        },
        onSuccess: (data) => {
            if (data.requiresVerification && data.email) {
                toast.success(data.message || 'Verifique o seu email para continuar.');
                navigate(`/verify-email?email=${encodeURIComponent(data.email)}`);
                return;
            }

            if (data.accessToken && data.user) {
                authStore.setSession(data.accessToken, data.user);
                qc.setQueryData(['auth', 'me'], data.user);
                toast.success(data.message || 'Conta criada com sucesso!');
                navigate('/dashboard');
            }
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.error || 'Falha ao criar conta. Tente novamente.');
        }
    });
}

/** Verify Email hook */
export function useVerifyEmail() {
    const navigate = useNavigate();
    const qc = useQueryClient();

    return useMutation({
        mutationFn: async (payload: { email: string; code: string }) => {
            const res = await api.post<AuthResponse>('/auth/verify-email', payload);
            return res.data;
        },
        onSuccess: (data) => {
            if (data.accessToken) {
                // If the backend returns user object, use it; otherwise the me endpoint will fetch it.
                // Assuming backend just returns accessToken, we fetch user later or set it if returned.
                if (data.user) {
                    authStore.setSession(data.accessToken, data.user);
                    qc.setQueryData(['auth', 'me'], data.user);
                } else {
                    authStore.setSession(data.accessToken, {} as any); // Temporary, useMe will overwrite
                }
                toast.success('Conta ativada com sucesso! Bem-vindo.');
                navigate('/dashboard');
            }
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.error || 'Código inválido ou expirado.');
        }
    });
}

/** Resend OTP hook */
export function useResendOTP() {
    return useMutation({
        mutationFn: async (payload: { email: string }) => {
            const res = await api.post('/auth/resend-verification', payload);
            return res.data;
        },
        onSuccess: () => {
            toast.success('Novo código enviado para o seu email.');
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.error || 'Falha ao reenviar código.');
        }
    });
}

/** Logout hook */
export function useLogout() {
    const navigate = useNavigate();
    const qc = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            await api.post('/auth/logout');
        },
        onSettled: () => {
            authStore.clearSession();
            qc.clear();
            toast.info('Sessão terminada.');
            navigate('/login');
        }
    });
}

/** Permissions hook — seguro para usar durante loading (nunca retorna undefined) */
export function usePermissions() {
    const { data: user, isLoading } = useMe();

    return {
        isLoading,
        hasRole: (roles: string | string[]) => {
            if (!user) return false;
            if (user.role?.toUpperCase() === 'SUPER_ADMIN') return true;
            const rolesArr = Array.isArray(roles) ? roles : [roles];
            return rolesArr.includes(user.role);
        },
        hasPermission: (permissions: string | string[]) => {
            if (!user) return false;
            if (user.role?.toUpperCase() === 'SUPER_ADMIN') return true;

            const reqPerms = Array.isArray(permissions) ? permissions : [permissions];
            const userPerms = user.permissions || [];

            return reqPerms.every(p => userPerms.includes(p));
        },
        hasAnyPermission: (permissions: string | string[]) => {
            if (!user) return false;
            if (user.role?.toUpperCase() === 'SUPER_ADMIN') return true;

            const reqPerms = Array.isArray(permissions) ? permissions : [permissions];
            const userPerms = user.permissions || [];

            return reqPerms.some(p => userPerms.includes(p));
        },
        hasModule: (moduleKey: string) => {
            if (!user) return false;
            if (user.role?.toUpperCase() === 'SUPER_ADMIN') return true;
            const modules = user.company?.enabledModules ?? (user as any)?.enabledModules ?? [];
            return modules.includes(moduleKey);
        },
    };
}

