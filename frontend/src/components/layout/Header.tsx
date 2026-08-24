// ==========================================
// ThreadFlow — Header Component
// ==========================================

'use client';

import { useSession, signOut } from 'next-auth/react';
import { LogOut, User, Menu } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { getInitials, capitalize } from '@/utils';

interface HeaderProps {
  onMenuToggle?: () => void;
}

export default function Header({ onMenuToggle }: HeaderProps) {
  const { data: session } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const userName = session?.user?.name || 'User';
  const userRole = session?.user?.role || 'user';

  return (
    <header className="h-14 bg-white border-b border-[var(--color-border-default)] flex items-center justify-between px-4 lg:px-6">
      {/* Mobile menu button */}
      <button
        onClick={onMenuToggle}
        className="lg:hidden p-2 rounded-[var(--radius-sm)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)] cursor-pointer"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* User menu */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2.5 pl-3 pr-2 py-1.5 rounded-[var(--radius-md)] hover:bg-[var(--color-bg-muted)] transition-colors cursor-pointer"
        >
          <div className="flex flex-col items-end">
            <span className="text-sm font-medium text-[var(--color-text-primary)]">{userName}</span>
            <span className="text-[10px] text-[var(--color-text-muted)]">{capitalize(userRole)}</span>
          </div>
          <div className="h-8 w-8 rounded-full bg-[var(--color-accent)] text-white flex items-center justify-center text-xs font-medium">
            {getInitials(userName)}
          </div>
        </button>

        {/* Dropdown */}
        {dropdownOpen && (
          <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-[var(--color-border-default)] rounded-[var(--radius-md)] shadow-md py-1 z-50">
            <div className="px-3 py-2 border-b border-[var(--color-border-default)]">
              <p className="text-sm font-medium text-[var(--color-text-primary)]">{userName}</p>
              <p className="text-xs text-[var(--color-text-muted)]">{session?.user?.email}</p>
            </div>
            <button
              onClick={() => {
                setDropdownOpen(false);
                signOut({ callbackUrl: '/login' });
              }}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)] transition-colors cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
