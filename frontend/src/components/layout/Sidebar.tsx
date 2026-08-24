// ==========================================
// ThreadFlow — Sidebar Component
// ==========================================

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Palette,
  Factory,
  Package,
  ShieldCheck,
  CreditCard,
  Warehouse,
  Truck,
  MessageSquare,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import { UserRole } from '@/types';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles: UserRole[]; // which roles can see this item
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: <LayoutDashboard className="h-[18px] w-[18px]" />,
    roles: ['admin', 'sales', 'designer', 'production', 'qc'],
  },
  {
    label: 'Customers',
    href: '/customers',
    icon: <Users className="h-[18px] w-[18px]" />,
    roles: ['admin', 'sales', 'designer', 'production'],
  },
  {
    label: 'Orders',
    href: '/orders',
    icon: <ClipboardList className="h-[18px] w-[18px]" />,
    roles: ['admin', 'sales', 'designer', 'production', 'qc'],
  },
  {
    label: 'Consultations',
    href: '/consultations',
    icon: <MessageSquare className="h-[18px] w-[18px]" />,
    roles: ['admin', 'sales'],
  },
  {
    label: 'Dispatched',
    href: '/dispatched',
    icon: <Truck className="h-[18px] w-[18px]" />,
    roles: ['admin', 'sales'],
  },
  {
    label: 'Designs',
    href: '/designs',
    icon: <Palette className="h-[18px] w-[18px]" />,
    roles: ['admin', 'sales', 'designer', 'production', 'qc'],
  },
  {
    label: 'Production',
    href: '/production',
    icon: <Factory className="h-[18px] w-[18px]" />,
    roles: ['admin', 'sales', 'production'],
  },
  {
    label: 'Inventory',
    href: '/inventory',
    icon: <Warehouse className="h-[18px] w-[18px]" />,
    roles: ['admin', 'production'],
  },
  {
    label: 'Quality Control',
    href: '/qc',
    icon: <ShieldCheck className="h-[18px] w-[18px]" />,
    roles: ['admin', 'sales', 'production', 'qc'],
  },
  {
    label: 'Payments',
    href: '/payments',
    icon: <CreditCard className="h-[18px] w-[18px]" />,
    roles: ['admin', 'sales'],
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: <Settings className="h-[18px] w-[18px]" />,
    roles: ['admin'],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);

  const userRole = (session?.user?.role || 'admin') as UserRole;

  // Filter nav items by user role
  const visibleItems = navItems.filter((item) => item.roles.includes(userRole));

  return (
    <aside
      className={`
        flex flex-col h-screen bg-[var(--color-sidebar-bg)]
        border-r border-gray-800 transition-all duration-200
        ${collapsed ? 'w-[60px]' : 'w-[220px]'}
      `}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 h-14 border-b border-gray-800">
        <Package className="h-5 w-5 text-[var(--color-accent)] flex-shrink-0" />
        {!collapsed && (
          <span className="text-sm font-semibold text-white tracking-tight">
            ThreadFlow
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {visibleItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-2.5 px-2.5 py-2 rounded-[var(--radius-md)]
                text-[13px] font-medium transition-colors duration-100
                ${
                  isActive
                    ? 'bg-[var(--color-sidebar-active)] text-[var(--color-sidebar-text-active)]'
                    : 'text-[var(--color-sidebar-text)] hover:bg-[var(--color-sidebar-hover)] hover:text-[var(--color-sidebar-text-active)]'
                }
              `}
              title={collapsed ? item.label : undefined}
            >
              {item.icon}
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="px-2 pb-3">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center w-full p-2 rounded-[var(--radius-md)] text-[var(--color-sidebar-text)] hover:bg-[var(--color-sidebar-hover)] transition-colors cursor-pointer"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>
    </aside>
  );
}
