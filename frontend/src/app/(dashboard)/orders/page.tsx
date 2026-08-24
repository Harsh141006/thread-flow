// ==========================================
// ThreadFlow — Orders Page
// ==========================================

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Filter } from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import Table from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { formatDate, getStatusColor, capitalize, daysUntilDeadline } from '@/utils';
import { ORDER_STATUSES, OrderStatus } from '@/types';

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

export default function OrdersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [customers, setCustomers] = useState<{ _id: string; name: string; company: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    customer: '', garmentType: '', quantity: '', sizes: '',
    embroideryPosition: '', designWidth: '', designHeight: '',
    stitchesPerItem: '', threadColors: '', deadline: '', priority: 'normal', notes: '',
  });

  const fetchOrders = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      const res = await fetch(`/api/orders?${params}`);
      const data = await res.json();
      if (data.success) setOrders(data.data.items);
    } catch {
      toast('error', 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, toast]);

  useEffect(() => {
    const timer = setTimeout(fetchOrders, 300);
    return () => clearTimeout(timer);
  }, [fetchOrders]);

  useEffect(() => {
    async function fetchCustomers() {
      const res = await fetch('/api/customers?limit=100');
      const data = await res.json();
      if (data.success) setCustomers(data.data.items);
    }
    fetchCustomers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          quantity: Number(form.quantity),
          designWidth: Number(form.designWidth),
          designHeight: Number(form.designHeight),
          stitchesPerItem: Number(form.stitchesPerItem) || 0,
          threadColors: form.threadColors.split(',').map((c) => c.trim()).filter(Boolean),
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast('success', `Order ${data.data.orderId} created`);
        setModalOpen(false);
        setForm({ customer: '', garmentType: '', quantity: '', sizes: '', embroideryPosition: '', designWidth: '', designHeight: '', stitchesPerItem: '', threadColors: '', deadline: '', priority: 'normal', notes: '' });
        fetchOrders();
      } else {
        toast('error', data.error);
      }
    } catch {
      toast('error', 'Failed to create order');
    } finally {
      setSaving(false);
    }
  };

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
      title="Orders"
      description="Track and manage all embroidery orders"
      action={
        <Button icon={<Plus className="h-4 w-4" />} onClick={() => setModalOpen(true)}>
          New Order
        </Button>
      }
    >
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
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

      <Table
        columns={columns}
        data={orders}
        loading={loading}
        onRowClick={(o) => router.push(`/orders/${o._id}`)}
        emptyMessage="No orders found"
      />

      {/* Create Order Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create New Order"
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button loading={saving} onClick={handleCreate}>Create Order</Button>
          </>
        }
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Select
            label="Customer"
            required
            value={form.customer}
            onChange={(e) => setForm({ ...form, customer: e.target.value })}
            placeholder="Select customer"
            options={customers.map((c) => ({ value: c._id, label: `${c.name} — ${c.company}` }))}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Garment Type" required value={form.garmentType} onChange={(e) => setForm({ ...form, garmentType: e.target.value })} placeholder="e.g. Polo Shirt" />
            <Input label="Quantity" type="number" required min="1" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Sizes" required value={form.sizes} onChange={(e) => setForm({ ...form, sizes: e.target.value })} placeholder="e.g. S-10, M-20, L-15" />
            <Input label="Embroidery Position" required value={form.embroideryPosition} onChange={(e) => setForm({ ...form, embroideryPosition: e.target.value })} placeholder="e.g. Left Chest" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input label="Design Width (mm)" type="number" required value={form.designWidth} onChange={(e) => setForm({ ...form, designWidth: e.target.value })} />
            <Input label="Design Height (mm)" type="number" required value={form.designHeight} onChange={(e) => setForm({ ...form, designHeight: e.target.value })} />
            <Input label="Stitches per Item" type="number" value={form.stitchesPerItem} onChange={(e) => setForm({ ...form, stitchesPerItem: e.target.value })} hint="For risk calculation" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Thread Colors" value={form.threadColors} onChange={(e) => setForm({ ...form, threadColors: e.target.value })} placeholder="Red, Gold, Navy (comma-separated)" />
            <Input label="Deadline" type="date" required value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
          </div>
          <Select
            label="Priority"
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value })}
            options={[
              { value: 'low', label: 'Low' },
              { value: 'normal', label: 'Normal' },
              { value: 'high', label: 'High' },
              { value: 'urgent', label: 'Urgent' },
            ]}
          />
          <Textarea label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Additional instructions" />
        </form>
      </Modal>
    </PageContainer>
  );
}
