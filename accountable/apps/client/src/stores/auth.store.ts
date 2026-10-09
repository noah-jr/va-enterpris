import { create } from 'zustand';
import type { ClientDTO } from '@accountable/types';

export interface ClientAuthState {
  client: ClientDTO | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setClient: (client: ClientDTO | null) => void;
  clearAuth: () => void;
  setIsLoading: (isLoading: boolean) => void;
}

export const useAuthStore = create<ClientAuthState>((set) => ({
  client: null,
  isAuthenticated: false,
  isLoading: true,
  setClient: (client) =>
    set({
      client,
      isAuthenticated: client !== null,
      isLoading: false,
    }),
  clearAuth: () =>
    set({
      client: null,
      isAuthenticated: false,
      isLoading: false,
    }),
  setIsLoading: (isLoading) => set({ isLoading }),
}));
