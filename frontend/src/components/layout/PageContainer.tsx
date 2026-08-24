// ==========================================
// ThreadFlow — Page Container Component
// ==========================================

import { ReactNode } from 'react';

interface PageContainerProps {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}

export default function PageContainer({ title, description, action, children }: PageContainerProps) {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
        {/* Page header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-lg font-semibold text-[var(--color-text-primary)]">{title}</h1>
            {description && (
              <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">{description}</p>
            )}
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>

        {/* Page content */}
        {children}
      </div>
    </div>
  );
}
