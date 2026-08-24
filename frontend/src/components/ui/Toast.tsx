// ==========================================
// ThreadFlow — Toast Notification System
// ==========================================

'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { X, CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  toast: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}

const icons: Record<ToastType, ReactNode> = {
  success: <CheckCircle className="h-4 w-4 text-[var(--color-success)]" />,
  error: <XCircle className="h-4 w-4 text-[var(--color-danger)]" />,
  warning: <AlertTriangle className="h-4 w-4 text-[var(--color-warning)]" />,
  info: <Info className="h-4 w-4 text-[var(--color-info)]" />,
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 min-w-[320px]">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="flex items-center gap-3 px-4 py-3 bg-white border border-[var(--color-border-default)] rounded-[var(--radius-md)] shadow-md animate-in slide-in-from-right"
          >
            {icons[t.type]}
            <p className="flex-1 text-sm text-[var(--color-text-primary)]">{t.message}</p>
            <button
              onClick={() => removeToast(t.id)}
              className="p-0.5 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
