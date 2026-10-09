import * as React from 'react';
import { cn } from '../utils/cn.js';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, type = 'text', ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-medium text-muted">
            {label}
            {props.required && <span className="text-danger ml-1">*</span>}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          type={type}
          aria-invalid={error ? true : undefined}
          className={cn(
            'flex h-9 w-full rounded-lg border border-border bg-surface px-3 py-1.5 text-xs sm:text-sm text-foreground placeholder:text-subtle focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-150',
            error && 'border-danger focus:ring-danger/30 focus:border-danger',
            className,
          )}
          {...props}
        />
        {error && (
          <p role="alert" className="text-[11px] text-danger font-medium">
            {error}
          </p>
        )}
        {!error && helperText && <p className="text-[11px] text-subtle">{helperText}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';
