import { useThemeStore, type Theme, type ThemePreference } from '../stores/theme.store.js';

export type { Theme, ThemePreference };

export const useTheme = (): {
  theme: Theme;
  preference: ThemePreference;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  setPreference: (preference: ThemePreference) => void;
} => {
  const theme = useThemeStore((s) => s.theme);
  const preference = useThemeStore((s) => s.preference);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const setTheme = useThemeStore((s) => s.setTheme);
  const setPreference = useThemeStore((s) => s.setPreference);
  return { theme, preference, toggleTheme, setTheme, setPreference };
};
