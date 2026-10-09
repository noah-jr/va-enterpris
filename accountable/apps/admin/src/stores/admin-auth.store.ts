import { create } from 'zustand';

export interface AdminUser {
  id: string;
  email: string;
  name?: string | null;
  roles: string[];
  permissions: string[];
}

export interface AdminAuthState {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: AdminUser | null) => void;
  clearAuth: () => void;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
}

export const useAdminAuthStore = create<AdminAuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  setUser: (user) =>
    set({
      user,
      isAuthenticated: user !== null,
      isLoading: false,
    }),
  clearAuth: () =>
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    }),
  hasPermission: (permission) => {
    const user = get().user;
    if (!user) return false;
    return user.permissions.includes(permission);
  },
  hasAnyPermission: (permissions) => {
    const user = get().user;
    if (!user) return false;
    return permissions.some((p) => user.permissions.includes(p));
  },
}));
