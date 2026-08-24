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

const CLOTH_COLORS = [
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Black', hex: '#111827' },
  { name: 'Navy', hex: '#1E3A8A' },
  { name: 'Ash Grey', hex: '#D1D5DB' },
  { name: 'Red', hex: '#DC2626' },
  { name: 'Royal Blue', hex: '#2563EB' },
  { name: 'Forest Green', hex: '#059669' },
  { name: 'Maroon', hex: '#7F1D1D' },
];

const THREAD_COLORS = [
  { name: 'Classic Black', hex: '#000000' },
  { name: 'Pure White', hex: '#FFFFFF' },
  { name: 'Navy Blue', hex: '#0A1128' },
  { name: 'Royal Blue', hex: '#1D4ED8' },
  { name: 'Forest Green', hex: '#065F46' },
  { name: 'Ruby Red', hex: '#991B1B' },
  { name: 'Gold', hex: '#D4AF37' },
  { name: 'Silver', hex: '#C0C0C0' },
  { name: 'Bronze', hex: '#CD7F32' },
  { name: 'Burgundy', hex: '#800020' },
  { name: 'Teal', hex: '#0F766E' },
  { name: 'Plum', hex: '#701A75' },
];

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
    stitchesPerItem: '', threadColors: '', clothColor: '', deadline: '', priority: 'normal', notes: '',
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
          clothColor: form.clothColor,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast('success', `Order ${data.data.orderId} created`);
        setModalOpen(false);
        setForm({ customer: '', garmentType: '', quantity: '', sizes: '', embroideryPosition: '', designWidth: '', designHeight: '', stitchesPerItem: '', threadColors: '', clothColor: '', deadline: '', priority: 'normal', notes: '' });
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

  const handleStatusChange = async (id: string, newStatus: OrderStatus) => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        toast('success', `Order status updated to ${capitalize(newStatus)}`);
        fetchOrders();
      } else {
        toast('error', data.error);
      }
    } catch {
      toast('error', 'Failed to update status');
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
    { key: 'actions', label: 'Actions', render: (o: OrderRow) => {
      const isTerminal = ['dispatched', 'delivered', 'rejected'].includes(o.status);
      if (!isTerminal) {
        return (
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <Button size="sm" className="bg-[var(--color-success)] text-white hover:bg-[var(--color-success-light)] border-none" onClick={() => handleStatusChange(o._id, 'dispatched')}>
              Approve
            </Button>
            <Button size="sm" variant="outline" className="text-[var(--color-danger)] border-[var(--color-danger)] hover:bg-[var(--color-danger-light)]" onClick={() => handleStatusChange(o._id, 'rejected')}>
              Reject
            </Button>
          </div>
        );
      }
      return <span className="text-[var(--color-text-muted)] text-xs">—</span>;
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
            <div className="col-span-1 md:col-span-2 space-y-2 mb-2">
              <label className="block text-sm font-medium text-[var(--color-text-primary)]">Cloth Color Guide</label>
              <div className="flex flex-wrap gap-3 p-3 bg-[var(--color-bg-muted)] rounded-lg border border-[var(--color-border-default)]">
                {CLOTH_COLORS.map(color => {
                  const isSelected = form.clothColor === color.name;
                  return (
                    <button
                      key={color.name}
                      type="button"
                      title={color.name}
                      onClick={() => setForm({ ...form, clothColor: color.name })}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${isSelected ? 'border-[var(--color-accent)] scale-110 shadow-md' : 'border-[var(--color-border-strong)] hover:scale-105'} shadow-sm`}
                      style={{ backgroundColor: color.hex }}
                    />
                  );
                })}
              </div>
              <Input label="Selected Cloth Color" value={form.clothColor} onChange={(e) => setForm({ ...form, clothColor: e.target.value })} placeholder="Select from guide or type custom color" />
            </div>
            
            <div className="col-span-1 md:col-span-2 space-y-2">
              <label className="block text-sm font-medium text-[var(--color-text-primary)]">Thread Color Guide</label>
              <div className="flex flex-wrap gap-3 mb-3 p-3 bg-[var(--color-bg-muted)] rounded-lg border border-[var(--color-border-default)]">
                {THREAD_COLORS.map(color => {
                  const currentColors = form.threadColors.split(',').map(c => c.trim()).filter(Boolean);
                  const isSelected = currentColors.includes(color.name);
                  return (
                    <button
                      key={color.name}
                      type="button"
                      title={color.name}
                      onClick={() => {
                        let current = [...currentColors];
                        if (isSelected) {
                          current = current.filter(c => c !== color.name);
                        } else {
                          current.push(color.name);
                        }
                        setForm({ ...form, threadColors: current.join(', ') });
                      }}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${isSelected ? 'border-[var(--color-accent)] scale-110 shadow-md' : 'border-[var(--color-border-strong)] hover:scale-105'} shadow-sm`}
                      style={{ backgroundColor: color.hex }}
                    />
                  );
                })}
              </div>
              <Input label="Selected Colors" value={form.threadColors} onChange={(e) => setForm({ ...form, threadColors: e.target.value })} placeholder="Select from guide or type custom colors" />
            </div>
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
