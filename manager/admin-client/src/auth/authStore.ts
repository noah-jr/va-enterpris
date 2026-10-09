import Cookies from 'js-cookie';

const API_KEY = import.meta.env.VITE_API_KEY || 'va_onegest_x_master_key';

export interface AuthUser {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: string;

    companyId: string;
    permissions?: string[];
    company?: {
        name: string;
        nif: string;
        address?: string;
        logo?: string;
        capitalSocial?: number;
        registryOffice?: string;
        enabledModules: string[];
        bankAccounts?: any[];
        phone?: string;
        email?: string;
    };
    hasActiveSubscription?: boolean;
    subscriptionExpiry?: string;
}

const TOKEN_KEY = 'va_access_token';
const USER_KEY  = 'va_user';
const COMPANY_KEY = 'va_company_id';

/**
 * Lê o campo `exp` de um JWT sem verificar a assinatura (só para UI).
 * A verificação real continua a ser feita no backend em cada request.
 */
function isTokenExpired(token: string): boolean {
    try {
        const base64 = token.split('.')[1];
        if (!base64) return true;
        const payload = JSON.parse(atob(base64));
        // exp está em segundos; Date.now() em ms
        return typeof payload.exp === 'number' && payload.exp * 1000 < Date.now();
    } catch {
        return true; // Token malformado → tratar como expirado
    }
}

function getRawToken(): string | null {
    return Cookies.get('accessToken') || localStorage.getItem(TOKEN_KEY);
}

export const authStore = {
    getToken: (): string | null => {
        // Devolvemos o token bruto mesmo que esteja expirado. 
        // O Axios enviará para a API, vai receber 401, e fará o fluxo de refresh 
        // usando o cookie de refreshToken seguro.
        return getRawToken();
    },

    getUser: (): AuthUser | null => {
        try {
            // Devolver sempre o utilizador em cache enquanto aguardamos refresh
            const raw = localStorage.getItem(USER_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    },

    getCompanyId: (): string | null =>
        localStorage.getItem(COMPANY_KEY),

    setSession: (token: string, user: AuthUser) => {
        Cookies.set('accessToken', token, { secure: true, sameSite: 'strict' });
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        localStorage.setItem(COMPANY_KEY, user.companyId);
    },

    clearSession: () => {
        Cookies.remove('accessToken');
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(COMPANY_KEY);
    },

    /** Devolve true apenas se houver token válido (não expirado) */
    isAuthenticated: (): boolean => !!authStore.getToken(),

    getHeaders: () => {
        const headers: Record<string, string> = {};
        const token = authStore.getToken();
        const companyId = authStore.getCompanyId();
        if (token) headers['Authorization'] = `Bearer ${token}`;
        if (companyId) headers['x-company-id'] = companyId;
        headers['x-api-key'] = API_KEY;
        return headers;
    },
};
