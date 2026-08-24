// ==========================================
// ThreadFlow — Utility Functions
// ==========================================

import { OrderStatus, RiskLevel, PaymentStatus } from '@/types';

/**
 * Format a date to a readable string
 */
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format a date with time
 */
export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format currency (INR)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format large numbers with commas
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-IN').format(num);
}

/**
 * Get color class for order status
 */
export function getStatusColor(status: OrderStatus): string {
  const colors: Record<OrderStatus, string> = {
    draft: 'bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)]',
    design: 'bg-[var(--color-accent-light)] text-[var(--color-accent)]',
    approval: 'bg-[var(--color-warning-light)] text-[var(--color-warning)]',
    scheduled: 'bg-[var(--color-info-light)] text-[var(--color-info)]',
    production: 'bg-amber-50 text-amber-700',
    qc: 'bg-purple-50 text-purple-700',
    rework: 'bg-[var(--color-danger-light)] text-[var(--color-danger)]',
    packed: 'bg-teal-50 text-teal-700',
    dispatched: 'bg-cyan-50 text-cyan-700',
    delivered: 'bg-[var(--color-success-light)] text-[var(--color-success)]',
    rejected: 'bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)]',
  };
  return colors[status];
}

/**
 * Get color class for risk level
 */
export function getRiskColor(risk: RiskLevel): string {
  const colors: Record<RiskLevel, string> = {
    low: 'bg-[var(--color-success-light)] text-[var(--color-success)]',
    medium: 'bg-[var(--color-warning-light)] text-[var(--color-warning)]',
    high: 'bg-[var(--color-danger-light)] text-[var(--color-danger)]',
  };
  return colors[risk];
}

/**
 * Get color class for payment status
 */
export function getPaymentStatusColor(status: PaymentStatus): string {
  const colors: Record<PaymentStatus, string> = {
    unpaid: 'bg-[var(--color-danger-light)] text-[var(--color-danger)]',
    partial: 'bg-[var(--color-warning-light)] text-[var(--color-warning)]',
    paid: 'bg-[var(--color-success-light)] text-[var(--color-success)]',
  };
  return colors[status];
}

/**
 * Capitalize first letter
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Truncate string
 */
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

/**
 * Generate initials from name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Calculate days until a deadline
 */
export function daysUntilDeadline(deadline: Date | string): number {
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const diffMs = deadlineDate.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Check if a deadline is overdue
 */
export function isOverdue(deadline: Date | string): boolean {
  return daysUntilDeadline(deadline) < 0;
}

/**
 * Build query string from params object
 */
export function buildQueryString(params: Record<string, string | number | boolean | undefined>): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      searchParams.set(key, String(value));
    }
  });
  const qs = searchParams.toString();
  return qs ? `?${qs}` : '';
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Sleep for ms
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
