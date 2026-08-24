// ==========================================
// ThreadFlow — Header Component
// ==========================================

'use client';

import { useSession, signOut } from 'next-auth/react';
import { LogOut, User, Menu, Bell } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { getInitials, capitalize, formatDate } from '@/utils';
import { INotification } from '@/types';
import Link from 'next/link';

interface HeaderProps {
  onMenuToggle?: () => void;
}

export default function Header({ onMenuToggle }: HeaderProps) {
  const { data: session } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<INotification[]>([]);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch notifications
  useEffect(() => {
    if (session?.user) {
      fetch('/api/notifications')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setNotifications(data.data);
          }
        })
        .catch(console.error);
    }
  }, [session]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true }),
      });
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const handleNotificationClick = async (notif: INotification) => {
    if (!notif.read) {
      try {
        await fetch('/api/notifications', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notificationId: notif._id }),
        });
        setNotifications(notifications.map(n => n._id === notif._id ? { ...n, read: true } : n));
      } catch (e) {
        console.error(e);
      }
    }
    setNotifOpen(false);
  };

  const userName = session?.user?.name || 'User';
  const userRole = session?.user?.role || 'user';

  return (
    <header className="h-14 bg-white border-b border-[var(--color-border-default)] flex items-center justify-between px-4 lg:px-6 relative z-40">
      {/* Mobile menu button */}
      <button
        onClick={onMenuToggle}
        className="lg:hidden p-2 rounded-[var(--radius-sm)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)] cursor-pointer"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Notifications */}
      <div className="relative mr-4" ref={notifRef}>
        <button
          onClick={() => setNotifOpen(!notifOpen)}
          className="p-2 rounded-full hover:bg-[var(--color-bg-muted)] transition-colors relative cursor-pointer"
        >
          <Bell className="h-5 w-5 text-[var(--color-text-secondary)]" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[var(--color-danger)] animate-pulse" />
          )}
        </button>

        {notifOpen && (
          <div className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto bg-white border border-[var(--color-border-default)] rounded-[var(--radius-lg)] shadow-lg py-2">
            <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--color-border-default)]">
              <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Notifications</h3>
              {unreadCount > 0 && (
                <button onClick={handleMarkAllRead} className="text-xs text-[var(--color-accent)] hover:underline cursor-pointer">
                  Mark all read
                </button>
              )}
            </div>
            
            {notifications.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-[var(--color-text-muted)]">
                No notifications yet
              </div>
            ) : (
              <div className="divide-y divide-[var(--color-border-default)]">
                {notifications.map(notif => (
                  <div key={notif._id} className={`p-3 transition-colors ${notif.read ? 'bg-white' : 'bg-[var(--color-accent-light)]/10'}`}>
                    {notif.link ? (
                      <Link href={notif.link} onClick={() => handleNotificationClick(notif)} className="block group">
                        <div className="flex justify-between items-start mb-1">
                          <p className={`text-sm font-medium group-hover:text-[var(--color-accent)] transition-colors ${notif.read ? 'text-[var(--color-text-secondary)]' : 'text-[var(--color-text-primary)]'}`}>
                            {notif.title}
                          </p>
                          <span className="text-[10px] text-[var(--color-text-muted)] flex-shrink-0 ml-2">
                            {formatDate(notif.createdAt)}
                          </span>
                        </div>
                        <p className={`text-xs ${notif.read ? 'text-[var(--color-text-muted)]' : 'text-[var(--color-text-secondary)]'}`}>
                          {notif.message}
                        </p>
                      </Link>
                    ) : (
                      <div onClick={() => handleNotificationClick(notif)} className="cursor-pointer">
                        <div className="flex justify-between items-start mb-1">
                          <p className={`text-sm font-medium ${notif.read ? 'text-[var(--color-text-secondary)]' : 'text-[var(--color-text-primary)]'}`}>
                            {notif.title}
                          </p>
                          <span className="text-[10px] text-[var(--color-text-muted)] flex-shrink-0 ml-2">
                            {formatDate(notif.createdAt)}
                          </span>
                        </div>
                        <p className={`text-xs ${notif.read ? 'text-[var(--color-text-muted)]' : 'text-[var(--color-text-secondary)]'}`}>
                          {notif.message}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

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
          <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-[var(--color-border-default)] rounded-[var(--radius-md)] shadow-lg py-1">
            <div className="px-3 py-2 border-b border-[var(--color-border-default)]">
              <p className="text-sm font-medium text-[var(--color-text-primary)]">{userName}</p>
              <p className="text-xs text-[var(--color-text-muted)]">{session?.user?.email}</p>
            </div>
            <button
              onClick={() => {
                setDropdownOpen(false);
                signOut({ callbackUrl: '/login' });
              }}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[var(--color-danger)] hover:bg-[var(--color-danger-light)] transition-colors cursor-pointer"
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
