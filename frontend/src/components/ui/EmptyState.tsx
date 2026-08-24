// ==========================================
// ThreadFlow — Empty State Component
// ==========================================

import { ReactNode } from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="text-[var(--color-text-muted)] mb-3">
        {icon || <Inbox className="h-10 w-10" />}
      </div>
      <h3 className="text-sm font-medium text-[var(--color-text-primary)] mb-1">{title}</h3>
      {description && (
        <p className="text-xs text-[var(--color-text-muted)] max-w-sm mb-4">{description}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}
