// ==========================================
// ThreadFlow — Dispatched Orders Page
// ==========================================

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { formatDate, getStatusColor, capitalize, daysUntilDeadline } from '@/utils';
import { OrderStatus } from '@/types';

interface OrderRow {
  _id: string;
  orderId: string;
  customer: { name: string; company: string } | null;
  garmentType: string;
  quantity: number;
  status: string;
  priority: string;
  deadline: string;
  [key: string]: unknown;
}

export default function DispatchedOrdersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchOrders = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      params.set('status', 'dispatched');
      if (search) params.set('search', search);
      const res = await fetch(`/api/orders?${params}`);
      const data = await res.json();
      if (data.success) setOrders(data.data.items);
    } catch {
      toast('error', 'Failed to load dispatched orders');
    } finally {
      setLoading(false);
    }
  }, [search, toast]);

  useEffect(() => {
    const timer = setTimeout(fetchOrders, 300);
    return () => clearTimeout(timer);
  }, [fetchOrders]);

  const columns = [
    { key: 'orderId', label: 'Order', render: (o: OrderRow) => (
      <span className="font-medium text-[var(--color-accent)]">{o.orderId}</span>
    )},
    { key: 'customer', label: 'Customer', render: (o: OrderRow) => o.customer?.name || '—' },
    { key: 'garmentType', label: 'Garment', className: 'hidden md:table-cell' },
    { key: 'quantity', label: 'Qty', className: 'hidden md:table-cell' },
    { key: 'status', label: 'Status', render: (o: OrderRow) => (
      <Badge className={getStatusColor(o.status as OrderStatus)}>{capitalize(o.status)}</Badge>
    )},
    { key: 'deadline', label: 'Deadline', render: (o: OrderRow) => {
      const days = daysUntilDeadline(o.deadline);
      const isLate = days < 0 && !['delivered', 'packed'].includes(o.status);
      return (
        <span className={isLate ? 'text-[var(--color-danger)] font-medium' : ''}>
          {formatDate(o.deadline)}
          {isLate && <span className="text-xs ml-1">({Math.abs(days)}d late)</span>}
        </span>
      );
    }},
    { key: 'priority', label: 'Priority', className: 'hidden lg:table-cell', render: (o: OrderRow) => {
      const colors: Record<string, string> = { low: 'default', normal: 'default', high: 'warning', urgent: 'danger' };
      return <Badge variant={(colors[o.priority] || 'default') as 'default' | 'warning' | 'danger'}>{capitalize(o.priority)}</Badge>;
    }},
  ];

  return (
    <PageContainer
      title="Dispatched Orders"
      description="Track and manage dispatched orders"
    >
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Search dispatched orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[var(--color-border-default)] rounded-[var(--radius-md)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-1"
          />
        </div>
      </div>

      <Table
        columns={columns}
        data={orders}
        loading={loading}
        onRowClick={(o) => router.push(`/orders/${o._id}`)}
        emptyMessage="No dispatched orders found"
      />
    </PageContainer>
  );
}
