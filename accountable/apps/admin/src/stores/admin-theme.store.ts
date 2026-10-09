import { create } from 'zustand';

/** Preferência escolhida pelo utilizador. */
export type ThemePreference = 'light' | 'dark' | 'system';
/** Tema efetivamente aplicado. */
export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'accountable-admin-theme';

const systemTheme = (): Theme =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

const readPreference = (): ThemePreference => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'dark' || stored === 'light' || stored === 'system') return stored;
  } catch {
    // localStorage indisponível (modo privado, bloqueado) — usa o padrão.
  }
  return 'light';
};

const resolve = (preference: ThemePreference): Theme => (preference === 'system' ? systemTheme() : preference);

const applyToDOM = (theme: Theme): void => {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('dark', theme === 'dark');
  document.documentElement.style.colorScheme = theme;
};

interface ThemeState {
  preference: ThemePreference;
  theme: Theme;
  setPreference: (preference: ThemePreference) => void;
  /** Alterna claro ↔ escuro (fixa a preferência). */
  toggleTheme: () => void;
  /** Compatibilidade: define um tema explícito. */
  setTheme: (theme: Theme) => void;
}

export const useAdminThemeStore = create<ThemeState>((set, get) => {
  const preference = readPreference();
  const theme = resolve(preference);
  applyToDOM(theme);

  const persist = (next: ThemePreference) => {
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignora — a preferência vale só para esta sessão.
    }
  };

  // Com "system", acompanha a mudança do sistema operativo em tempo real.
  if (typeof window !== 'undefined' && window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (get().preference !== 'system') return;
      const next = systemTheme();
      applyToDOM(next);
      set({ theme: next });
    });
  }

  return {
    preference,
    theme,
    setPreference: (next) => {
      const applied = resolve(next);
      applyToDOM(applied);
      persist(next);
      set({ preference: next, theme: applied });
    },
    toggleTheme: () => get().setPreference(get().theme === 'dark' ? 'light' : 'dark'),
    setTheme: (next) => get().setPreference(next),
  };
});
