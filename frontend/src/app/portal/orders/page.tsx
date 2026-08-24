// ==========================================
// ThreadFlow — Customer Portal Orders List
// ==========================================

'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import PageContainer from '@/components/layout/PageContainer';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { PageLoader } from '@/components/ui/Spinner';
import { Search } from 'lucide-react';
import { formatDate, getStatusColor, capitalize } from '@/utils';
import { OrderStatus, ORDER_STATUSES } from '@/types';

export default function PortalOrdersPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    async function fetchOrders() {
      if (!session?.user?.customerId) return;
      
      try {
        const params = new URLSearchParams();
        params.set('customer', session.user.customerId);
        if (search) params.set('search', search);
        if (statusFilter) params.set('status', statusFilter);
        params.set('_t', Date.now().toString()); // Bust cache
        
        const res = await fetch(`/api/orders?${params}`, { cache: 'no-store' });
        const data = await res.json();
        if (data.success) {
          setOrders(data.data.items);
        }
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setLoading(false);
      }
    }
    
    if (session) {
      const timer = setTimeout(fetchOrders, 300);
      return () => clearTimeout(timer);
    }
  }, [session, search, statusFilter]);

  if (loading) return <PageLoader />;

  return (
    <PageContainer
      title="My Orders"
      description="View and track your order history"
    >
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Search orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[var(--color-border-default)] rounded-[var(--radius-md)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-1"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm bg-white border border-[var(--color-border-default)] rounded-[var(--radius-md)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-1"
        >
          <option value="">All Statuses</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--color-border-default)] bg-[var(--color-bg-muted)]">
                <th className="px-5 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Order ID</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Item Details</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider hidden md:table-cell">Deadline</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border-default)]">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-sm text-[var(--color-text-muted)]">
                    No orders found.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr 
                    key={String(order._id)} 
                    className="hover:bg-[var(--color-bg-hover)] cursor-pointer transition-colors"
                    onClick={() => router.push(`/portal/orders/${order._id}`)}
                  >
                    <td className="px-5 py-4">
                      <span className="font-medium text-[var(--color-accent)]">{String(order.orderId)}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-sm font-medium text-[var(--color-text-primary)]">{String(order.garmentType)}</div>
                      <div className="text-xs text-[var(--color-text-secondary)]">Qty: {String(order.quantity)}</div>
                    </td>
                    <td className="px-5 py-4">
                      <Badge className={getStatusColor(String(order.status) as OrderStatus)}>
                        {capitalize(String(order.status))}
                      </Badge>
                      {String(order.status) === 'approval' && (
                        <div className="text-[10px] text-[var(--color-warning)] mt-1 font-medium">Action Required</div>
                      )}
                    </td>
                    <td className="px-5 py-4 text-sm text-[var(--color-text-secondary)] hidden md:table-cell">
                      {formatDate(String(order.deadline))}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </PageContainer>
  );
}
