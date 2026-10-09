import { useAdminThemeStore, type Theme, type ThemePreference } from '../stores/admin-theme.store.js';

export type { Theme, ThemePreference };

export const useTheme = (): {
  theme: Theme;
  preference: ThemePreference;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  setPreference: (preference: ThemePreference) => void;
} => {
  const theme = useAdminThemeStore((s) => s.theme);
  const preference = useAdminThemeStore((s) => s.preference);
  const toggleTheme = useAdminThemeStore((s) => s.toggleTheme);
  const setTheme = useAdminThemeStore((s) => s.setTheme);
  const setPreference = useAdminThemeStore((s) => s.setPreference);
  return { theme, preference, toggleTheme, setTheme, setPreference };
};
