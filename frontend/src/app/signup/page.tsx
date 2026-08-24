// ==========================================
// ThreadFlow — Signup Page
// ==========================================

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Package } from 'lucide-react';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [form, setForm] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    address: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      
      const data = await res.json();
      
      if (data.success) {
        toast('success', 'Account created successfully! Please log in.');
        router.push('/login');
      } else {
        setError(data.error);
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-primary)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-[450px]">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <Package className="h-7 w-7 text-[var(--color-accent)]" />
          <span className="text-xl font-semibold text-[var(--color-text-primary)] tracking-tight">
            ThreadFlow
          </span>
        </div>

        {/* Signup card */}
        <div className="bg-white border border-[var(--color-border-default)] rounded-[var(--radius-lg)] p-6 md:p-8">
          <h1 className="text-xl font-semibold text-[var(--color-text-primary)] mb-1">
            Create an account
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mb-6">
            Sign up to place and manage custom embroidery orders
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                placeholder="John Doe"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <Input
                label="Company (Optional)"
                placeholder="Acme Inc."
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
              />
            </div>
            
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
            
            <Input
              label="Phone Number"
              type="tel"
              placeholder="+1 (555) 000-0000"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
            />
            
            <Input
              label="Delivery Address"
              placeholder="123 Main St, City, Country"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              minLength={6}
            />

            {error && (
              <div className="px-3 py-2 text-sm text-[var(--color-danger)] bg-[var(--color-danger-light)] rounded-[var(--radius-sm)] border border-[var(--color-danger-light)]">
                {error}
              </div>
            )}

            <Button type="submit" loading={loading} className="w-full mt-2">
              Create account
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-[var(--color-text-secondary)]">Already have an account? </span>
            <Link href="/login" className="font-medium text-[var(--color-accent)] hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
