// ==========================================
// ThreadFlow — Spinner Component
// ==========================================

import { Loader2 } from 'lucide-react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
};

export default function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Loader2 className={`${sizeMap[size]} animate-spin text-[var(--color-accent)]`} />
    </div>
  );
}

/**
 * Full page loading spinner
 */
export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Spinner size="lg" />
    </div>
  );
}
