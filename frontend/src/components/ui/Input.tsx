// ==========================================
// ThreadFlow — Input Component
// ==========================================

'use client';

import { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, forwardRef } from 'react';

// === Text Input ===
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-[var(--color-text-primary)]">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full px-3 py-2 text-sm bg-white
            border border-[var(--color-border-default)] rounded-[var(--radius-md)]
            text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]
            hover:border-[var(--color-border-strong)]
            focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-1
            disabled:bg-[var(--color-bg-muted)] disabled:cursor-not-allowed
            transition-colors duration-150
            ${error ? 'border-[var(--color-danger)] focus:ring-[var(--color-danger)]' : ''}
            ${className}
          `}
          {...props}
        />
        {error && <p className="text-xs text-[var(--color-danger)]">{error}</p>}
        {hint && !error && <p className="text-xs text-[var(--color-text-muted)]">{hint}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

// === Select ===
interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className = '', id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-sm font-medium text-[var(--color-text-primary)]">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`
            w-full px-3 py-2 text-sm bg-white
            border border-[var(--color-border-default)] rounded-[var(--radius-md)]
            text-[var(--color-text-primary)]
            hover:border-[var(--color-border-strong)]
            focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-1
            disabled:bg-[var(--color-bg-muted)] disabled:cursor-not-allowed
            transition-colors duration-150
            ${error ? 'border-[var(--color-danger)] focus:ring-[var(--color-danger)]' : ''}
            ${className}
          `}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-[var(--color-danger)]">{error}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';

// === Textarea ===
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={textareaId} className="text-sm font-medium text-[var(--color-text-primary)]">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={`
            w-full px-3 py-2 text-sm bg-white min-h-[80px] resize-y
            border border-[var(--color-border-default)] rounded-[var(--radius-md)]
            text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]
            hover:border-[var(--color-border-strong)]
            focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-1
            disabled:bg-[var(--color-bg-muted)] disabled:cursor-not-allowed
            transition-colors duration-150
            ${error ? 'border-[var(--color-danger)] focus:ring-[var(--color-danger)]' : ''}
            ${className}
          `}
          {...props}
        />
        {error && <p className="text-xs text-[var(--color-danger)]">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';
