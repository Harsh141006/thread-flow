// ==========================================
// ThreadFlow — Login Page
// ==========================================

'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Package } from 'lucide-react';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Demo account quick-fill
  const demoAccounts = [
    { label: 'Admin', email: 'admin@threadflow.com', password: 'admin123' },
    { label: 'Sales', email: 'sales@threadflow.com', password: 'sales123' },
    { label: 'Designer', email: 'designer@threadflow.com', password: 'designer123' },
    { label: 'Production', email: 'production@threadflow.com', password: 'production123' },
    { label: 'QC', email: 'qc@threadflow.com', password: 'qc123' },
    { label: 'Customer', email: 'customer@threadflow.com', password: 'customer123' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-primary)] px-4">
      <div className="w-full max-w-[380px]">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <Package className="h-7 w-7 text-[var(--color-accent)]" />
          <span className="text-xl font-semibold text-[var(--color-text-primary)] tracking-tight">
            ThreadFlow
          </span>
        </div>

        {/* Login card */}
        <div className="bg-white border border-[var(--color-border-default)] rounded-[var(--radius-lg)] p-6">
          <h1 className="text-base font-semibold text-[var(--color-text-primary)] mb-1">
            Sign in to your account
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mb-5">
            Enter your credentials to continue
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && (
              <div className="px-3 py-2 text-sm text-[var(--color-danger)] bg-[var(--color-danger-light)] rounded-[var(--radius-sm)]">
                {error}
              </div>
            )}

            <Button type="submit" loading={loading} className="w-full">
              Sign in
            </Button>
          </form>
        </div>

        {/* Demo accounts */}
        <div className="mt-6">
          <p className="text-xs text-[var(--color-text-muted)] text-center mb-3">
            Demo accounts — click to fill credentials
          </p>
          <div className="flex flex-wrap justify-center gap-1.5">
            {demoAccounts.map((acc) => (
              <button
                key={acc.email}
                onClick={() => {
                  setEmail(acc.email);
                  setPassword(acc.password);
                  setError('');
                }}
                className="px-2.5 py-1 text-[11px] font-medium text-[var(--color-text-secondary)] bg-white border border-[var(--color-border-default)] rounded-full hover:bg-[var(--color-bg-muted)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer"
              >
                {acc.label}
              </button>
            ))}
          </div>
        </div>

        {/* Signup Link */}
        <div className="mt-8 text-center text-sm">
          <span className="text-[var(--color-text-secondary)]">Don't have an account? </span>
          <a href="/signup" className="font-medium text-[var(--color-accent)] hover:underline">
            Sign up
          </a>
        </div>
      </div>
    </div>
  );
}
