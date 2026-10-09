import * as React from 'react';
import { cn } from '../utils/cn.js';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:pointer-events-none active:scale-[0.99] select-none';

    const variantStyles = {
      primary: 'bg-primary text-primary-foreground hover:bg-primary/90 border border-transparent shadow-sm',
      secondary: 'bg-surface-muted text-foreground hover:bg-border/70 border border-border',
      outline: 'bg-transparent hover:bg-surface-muted text-foreground border border-border',
      ghost: 'bg-transparent hover:bg-surface-muted text-muted hover:text-foreground',
      danger: 'bg-red-700 text-white hover:bg-red-800 dark:bg-red-600 dark:hover:bg-red-500 border border-transparent shadow-sm',
    };

    const sizeStyles = {
      sm: 'text-xs px-2.5 py-1.5 gap-1.5 rounded-md tracking-tight',
      md: 'text-sm px-3.5 py-2 gap-2 rounded-lg tracking-tight',
      lg: 'text-base px-5 py-2.5 gap-2.5 rounded-lg',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
