// ==========================================
// ThreadFlow — Button Component
// ==========================================

'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] active:bg-[var(--color-accent-hover)]',
  secondary:
    'bg-[var(--color-bg-muted)] text-[var(--color-text-primary)] hover:bg-[var(--color-border-default)]',
  outline:
    'border border-[var(--color-border-default)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-muted)] bg-white',
  ghost:
    'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)] hover:text-[var(--color-text-primary)]',
  danger:
    'bg-[var(--color-danger)] text-white hover:bg-red-700',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-sm',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, icon, rightIcon, children, className = '', disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`
          inline-flex items-center justify-center gap-2 font-medium
          rounded-[var(--radius-md)] transition-colors duration-150
          disabled:opacity-50 disabled:cursor-not-allowed
          cursor-pointer
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${className}
        `}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : icon ? (
          <span className="h-4 w-4 flex items-center">{icon}</span>
        ) : null}
        {children}
        {rightIcon && !loading && (
          <span className="h-4 w-4 flex items-center">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
