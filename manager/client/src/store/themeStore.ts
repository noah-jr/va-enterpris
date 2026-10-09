export const themeStore = {
    getTheme: (): 'light' | 'dark' => {
        const saved = localStorage.getItem('va_theme');
        if (saved === 'light' || saved === 'dark') return saved;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    },

    setTheme: (theme: 'light' | 'dark') => {
        localStorage.setItem('va_theme', theme);
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    },

    toggleTheme: () => {
        const current = themeStore.getTheme();
        const next = current === 'light' ? 'dark' : 'light';
        themeStore.setTheme(next);
        return next;
    },

    init: () => {
        const theme = themeStore.getTheme();
        themeStore.setTheme(theme);
    }
};
