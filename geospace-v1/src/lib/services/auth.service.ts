"use client";

import api, { setTokens, clearTokens } from '../axios';
import { toastSuccess, toastError } from '@/hooks/use-toast';

// ============================================
// TIPOS
// ============================================

export interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: 'SUPER_ADMIN' | 'ADMIN_REGIONAL' | 'OPERADOR_GEOSPACE' | 'COORDENADOR_EMPRESA' | 'AGENTE_CAMPO';
    permissions?: string[];
    status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
    createdAt: string;
    updatedAt: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    user: User;
}

export interface RegisterRequest {
    name: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
}

export interface ForgotPasswordRequest {
    email: string;
}

export interface ResetPasswordRequest {
    token: string;
    password: string;
    confirmPassword: string;
}

export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

// ============================================
// SERVIÇO DE AUTENTICAÇÃO
// ============================================

class AuthService {
    /**
     * Fazer login
     */
    async login(data: LoginRequest): Promise<LoginResponse> {
        try {
            // Backend expects 'emailOrPhone', mapping from 'email'
            const payload = {
                emailOrPhone: data.email,
                password: data.password
            };
            const response = await api.post<LoginResponse>('/auth/login', payload);

            // The axios interceptor returns data.object directly, so response is already the data
            const responseData = response as any;
            const { accessToken, refreshToken, user } = responseData;

            // Salvar tokens e usuário
            setTokens(accessToken, refreshToken, user.role);
            this.saveUser(user);

            toastSuccess('Login realizado', `Bem-vindo, ${user.name}!`);

            return responseData;
        } catch (error) {
            console.error('Erro no login:', error);
            throw error;
        }
    }

    /**
     * Registrar novo usuário
     */
    async register(data: RegisterRequest): Promise<LoginResponse> {
        try {
            const response = await api.post<LoginResponse>('/auth/register', data);
            const { accessToken, refreshToken, user } = response.data;

            // Salvar tokens e usuário
            setTokens(accessToken, refreshToken, user.role);
            this.saveUser(user);

            toastSuccess('Conta criada', 'Sua conta foi criada com sucesso!');

            return response as any;
        } catch (error) {
            console.error('Erro no registro:', error);
            throw error;
        }
    }

    /**
     * Fazer logout
     */
    async logout(): Promise<void> {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Erro no logout:', error);
        } finally {
            // Limpar dados locais independente do resultado
            clearTokens();
            this.clearUser();
            toastSuccess('Logout realizado', 'Até logo!');
        }
    }

    /**
     * Solicitar recuperação de senha
     */
    async forgotPassword(data: ForgotPasswordRequest): Promise<void> {
        try {
            await api.post('/auth/forgot-password', data);
            toastSuccess(
                'Email enviado',
                'Verifique seu email para redefinir sua senha.'
            );
        } catch (error) {
            console.error('Erro ao solicitar recuperação de senha:', error);
            throw error;
        }
    }

    /**
     * Redefinir senha
     */
    async resetPassword(data: ResetPasswordRequest): Promise<void> {
        try {
            await api.post('/auth/reset-password', data);
            toastSuccess(
                'Senha redefinida',
                'Sua senha foi redefinida com sucesso!'
            );
        } catch (error) {
            console.error('Erro ao redefinir senha:', error);
            throw error;
        }
    }

    /**
     * Alterar senha
     */
    async changePassword(data: ChangePasswordRequest): Promise<void> {
        try {
            await api.post('/auth/change-password', data);
            toastSuccess('Senha alterada', 'Sua senha foi alterada com sucesso!');
        } catch (error) {
            console.error('Erro ao alterar senha:', error);
            throw error;
        }
    }

    /**
     * Obter perfil do usuário atual
     */
    async getProfile(): Promise<User> {
        try {
            const response = await api.get<User>('/auth/profile');
            this.saveUser(response.data);
            return response as any;
        } catch (error) {
            console.error('Erro ao obter perfil:', error);
            throw error;
        }
    }

    /**
     * Atualizar perfil do usuário
     */
    async updateProfile(data: Partial<User>): Promise<User> {
        try {
            const response = await api.patch<User>('/auth/profile', data);
            this.saveUser(response.data);
            toastSuccess('Perfil atualizado', 'Suas informações foram atualizadas!');
            return response as any;
        } catch (error) {
            console.error('Erro ao atualizar perfil:', error);
            throw error;
        }
    }

    /**
     * Verificar se o usuário está autenticado
     */
    isAuthenticated(): boolean {
        if (typeof window === 'undefined') return false;
        return !!localStorage.getItem('token');
    }

    /**
     * Obter usuário do localStorage
     */
    getUser(): User | null {
        if (typeof window === 'undefined') return null;

        const userStr = localStorage.getItem('user');
        if (!userStr) return null;

        try {
            return JSON.parse(userStr);
        } catch (error) {
            console.error('Erro ao parsear usuário:', error);
            return null;
        }
    }

    /**
     * Salvar usuário no localStorage
     */
    private saveUser(user: User): void {
        if (typeof window === 'undefined') return;
        localStorage.setItem('user', JSON.stringify(user));
    }

    /**
     * Limpar usuário do localStorage
     */
    private clearUser(): void {
        if (typeof window === 'undefined') return;
        localStorage.removeItem('user');
    }

    /**
     * Verificar se o usuário tem permissão
     */
    hasRole(role: User['role'] | User['role'][]): boolean {
        const user = this.getUser();
        if (!user) return false;

        if (Array.isArray(role)) {
            return role.includes(user.role);
        }

        return user.role === role;
    }

    /**
     * Verificar se o usuário é SUPER_ADMIN
     */
    isSuperAdmin(): boolean {
        return this.hasRole('SUPER_ADMIN');
    }

    /**
     * Verificar se o usuário é ADMIN_REGIONAL ou superior
     */
    isAdminRegional(): boolean {
        return this.hasRole(['SUPER_ADMIN', 'ADMIN_REGIONAL']);
    }

    /**
     * Verificar se o usuário é OPERADOR_CENTRAL ou superior
     */
    isOperator(): boolean {
        return this.hasRole(['SUPER_ADMIN', 'ADMIN_REGIONAL', 'OPERADOR_GEOSPACE']);
    }

    /**
     * Verificar se o usuário é Gestor de Empresa
     */
    isCompanyManager(): boolean {
        return this.hasRole(['COORDENADOR_EMPRESA']);
    }

    /**
     * Verificar se o usuário é Agente de Campo
     */
    isAgent(): boolean {
        return this.hasRole(['AGENTE_CAMPO']);
    }
}

// ============================================
// INSTÂNCIA SINGLETON
// ============================================

const authService = new AuthService();

export default authService;
