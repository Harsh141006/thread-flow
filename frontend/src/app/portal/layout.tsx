// ==========================================
// ThreadFlow — Customer Portal Layout
// ==========================================

'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, LayoutDashboard, Package, Bell, Menu, X } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { PageLoader } from '@/components/ui/Spinner';

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    // Redirect non-customers away from portal (unless admin testing)
    if (session?.user && !['customer', 'admin'].includes(session.user.role)) {
      router.push('/dashboard');
    }
  }, [status, session, router]);

  if (status === 'loading') {
    return <PageLoader />;
  }

  if (!session) {
    return null;
  }

  const navItems = [
    { label: 'Dashboard', href: '/portal', icon: <LayoutDashboard className="h-5 w-5" /> },
    { label: 'Designs', href: '/portal/designs', icon: <Package className="h-5 w-5" /> },
    { label: 'Catalog', href: '/portal/catalog', icon: <Package className="h-5 w-5" /> },
    { label: 'My Orders', href: '/portal/orders', icon: <Package className="h-5 w-5" /> },
    { label: 'Consultations', href: '/portal/consultations', icon: <Bell className="h-5 w-5" /> },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-bg-primary)] flex-col">
      {/* Top Navbar */}
      <header className="h-16 flex-shrink-0 border-b border-[var(--color-border-default)] bg-white flex items-center justify-between px-6 z-10">
        <div className="flex items-center gap-6">
          <Link href="/portal" className="text-xl font-bold tracking-tight text-[var(--color-text-primary)]">
            ThreadFlow <span className="text-sm font-normal text-[var(--color-accent)]">Portal</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    px-3 py-2 rounded-[var(--radius-md)] text-sm font-medium transition-colors flex items-center gap-2
                    ${isActive 
                      ? 'bg-[var(--color-bg-active)] text-[var(--color-accent)]' 
                      : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)]'}
                  `}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <button className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors rounded-full hover:bg-[var(--color-bg-hover)] relative">
            <Bell className="h-5 w-5" />
          </button>
          
          <div className="hidden md:flex items-center gap-3 pl-4 border-l border-[var(--color-border-default)]">
            <div className="text-right">
              <p className="text-sm font-medium text-[var(--color-text-primary)]">{session.user.name}</p>
              <p className="text-xs text-[var(--color-text-muted)]">Customer</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-danger)] transition-colors rounded-full hover:bg-[var(--color-danger-light)]"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>

          <button 
            className="md:hidden p-2 text-[var(--color-text-secondary)]"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[var(--color-border-default)] bg-white absolute top-16 left-0 right-0 z-20">
          <nav className="flex flex-col p-4 gap-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    px-4 py-3 rounded-[var(--radius-md)] text-sm font-medium transition-colors flex items-center gap-3
                    ${isActive 
                      ? 'bg-[var(--color-bg-active)] text-[var(--color-accent)]' 
                      : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)]'}
                  `}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
            <div className="h-px bg-[var(--color-border-default)] my-2"></div>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="px-4 py-3 rounded-[var(--radius-md)] text-sm font-medium text-[var(--color-danger)] flex items-center gap-3 hover:bg-[var(--color-danger-light)]"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </nav>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
