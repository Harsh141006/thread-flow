// ==========================================
// ThreadFlow — Table Component
// ==========================================

'use client';

import { ReactNode } from 'react';

interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => ReactNode;
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField?: string;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  loading?: boolean;
}

export default function Table<T extends Record<string, any>>({
  columns,
  data,
  keyField = '_id',
  onRowClick,
  emptyMessage = 'No data found',
  loading,
}: TableProps<T>) {
  if (loading) {
    return (
      <div className="bg-white border border-[var(--color-border-default)] rounded-[var(--radius-lg)] overflow-hidden">
        <div className="p-12 text-center text-sm text-[var(--color-text-muted)]">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[var(--color-border-default)] rounded-[var(--radius-lg)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--color-border-default)] bg-[var(--color-bg-muted)]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider ${col.className || ''}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border-default)]">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center text-sm text-[var(--color-text-muted)]"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr
                  key={String(item[keyField])}
                  className={`
                    hover:bg-[var(--color-bg-hover)] transition-colors duration-100
                    ${onRowClick ? 'cursor-pointer' : ''}
                  `}
                  onClick={() => onRowClick?.(item)}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-4 py-3 text-sm text-[var(--color-text-primary)] ${col.className || ''}`}
                    >
                      {col.render
                        ? col.render(item)
                        : String(item[col.key] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// === Pagination ===
interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  total: number;
}

export function Pagination({ page, totalPages, onPageChange, total }: PaginationProps) {
  return (
    <div className="flex items-center justify-between px-1 py-3">
      <p className="text-xs text-[var(--color-text-muted)]">
        {total} result{total !== 1 ? 's' : ''}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="px-3 py-1.5 text-xs border border-[var(--color-border-default)] rounded-[var(--radius-sm)] hover:bg-[var(--color-bg-muted)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          Previous
        </button>
        <span className="px-3 py-1.5 text-xs text-[var(--color-text-secondary)]">
          {page} of {totalPages}
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="px-3 py-1.5 text-xs border border-[var(--color-border-default)] rounded-[var(--radius-sm)] hover:bg-[var(--color-bg-muted)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          Next
        </button>
      </div>
    </div>
  );
}
