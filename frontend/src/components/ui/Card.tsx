// ==========================================
// ThreadFlow — Card Component
// ==========================================

import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingStyles = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
};

export default function Card({ children, className = '', padding = 'md' }: CardProps) {
  return (
    <div
      className={`
        bg-white border border-[var(--color-border-default)]
        rounded-[var(--radius-lg)]
        ${paddingStyles[padding]}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

// === Card Header ===
export function CardHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div>
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">{title}</h3>
        {description && (
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{description}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
