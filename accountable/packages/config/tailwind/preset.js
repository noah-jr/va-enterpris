/**
 * Preset Tailwind institucional partilhado (admin, cliente e landing).
 * As cores semânticas apontam para variáveis CSS definidas em
 * packages/ui/src/styles/tokens.css, com valores para o tema claro e o escuro —
 * uma única classe (ex.: `bg-surface`) funciona nos dois temas.
 */
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: token('background'),
        surface: {
          DEFAULT: token('surface'),
          muted: token('surface-muted'),
          raised: token('surface-raised'),
        },
        border: token('border'),
        foreground: token('foreground'),
        muted: token('muted'),
        subtle: token('subtle'),
        primary: {
          DEFAULT: token('primary'),
          foreground: token('primary-foreground'),
          soft: token('primary-soft'),
        },
        accent: {
          DEFAULT: token('accent'),
          foreground: token('accent-foreground'),
        },
        sidebar: {
          DEFAULT: token('sidebar'),
          foreground: token('sidebar-foreground'),
          muted: token('sidebar-muted'),
          active: token('sidebar-active'),
        },
        success: token('success'),
        warning: token('warning'),
        danger: token('danger'),
        info: token('info'),
        series: { 1: token('series-1'), 2: token('series-2') },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px 0 rgb(15 23 42 / 0.04), 0 1px 3px 0 rgb(15 23 42 / 0.06)',
      },
    },
  },
};
