// ==========================================
// ThreadFlow — Customer Detail Page
// ==========================================

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { PageLoader } from '@/components/ui/Spinner';
import { formatDate, getStatusColor, capitalize } from '@/utils';
import { OrderStatus } from '@/types';

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [customer, setCustomer] = useState<Record<string, unknown> | null>(null);
  const [orders, setOrders] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState({ name: '', company: '', email: '', phone: '', address: '', notes: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchCustomer() {
      try {
        const res = await fetch(`/api/customers/${params.id}`);
        const data = await res.json();
        if (data.success) {
          setCustomer(data.data);
          setOrders(data.data.orders || []);
          setForm({
            name: data.data.name || '',
            company: data.data.company || '',
            email: data.data.email || '',
            phone: data.data.phone || '',
            address: data.data.address || '',
            notes: data.data.notes || '',
          });
        }
      } catch {
        toast('error', 'Failed to load customer');
      } finally {
        setLoading(false);
      }
    }
    fetchCustomer();
  }, [params.id, toast]);

  const handleUpdate = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/customers/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setCustomer(data.data);
        setEditOpen(false);
        toast('success', 'Customer updated');
      } else {
        toast('error', data.error);
      }
    } catch {
      toast('error', 'Failed to update customer');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this customer?')) return;
    try {
      const res = await fetch(`/api/customers/${params.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast('success', 'Customer deleted');
        router.push('/customers');
      } else {
        toast('error', data.error);
      }
    } catch {
      toast('error', 'Failed to delete customer');
    }
  };

  if (loading) return <PageLoader />;
  if (!customer) return <p className="p-6 text-sm text-[var(--color-text-muted)]">Customer not found</p>;

  return (
    <PageContainer
      title={String(customer.name)}
      description={String(customer.company)}
      action={
        <div className="flex gap-2">
          <Button variant="outline" icon={<ArrowLeft className="h-4 w-4" />} onClick={() => router.push('/customers')}>
            Back
          </Button>
          <Button variant="outline" icon={<Edit className="h-4 w-4" />} onClick={() => setEditOpen(true)}>
            Edit
          </Button>
          <Button variant="danger" icon={<Trash2 className="h-4 w-4" />} onClick={handleDelete} size="sm">
            Delete
          </Button>
        </div>
      }
    >
      {/* Customer info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card>
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">Contact Information</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-[var(--color-text-secondary)]">Email</dt><dd>{String(customer.email)}</dd></div>
            <div className="flex justify-between"><dt className="text-[var(--color-text-secondary)]">Phone</dt><dd>{String(customer.phone)}</dd></div>
            <div className="flex justify-between"><dt className="text-[var(--color-text-secondary)]">Address</dt><dd className="text-right max-w-[200px]">{String(customer.address)}</dd></div>
          </dl>
        </Card>
        <Card>
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">Summary</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-[var(--color-text-secondary)]">Total Orders</dt><dd className="font-medium">{orders.length}</dd></div>
            <div className="flex justify-between"><dt className="text-[var(--color-text-secondary)]">Customer Since</dt><dd>{formatDate(String(customer.createdAt))}</dd></div>
            {customer.notes && (
              <div><dt className="text-[var(--color-text-secondary)] mb-1">Notes</dt><dd className="text-[var(--color-text-muted)]">{String(customer.notes)}</dd></div>
            )}
          </dl>
        </Card>
      </div>

      {/* Order history */}
      <Card padding="none">
        <div className="px-5 py-4 border-b border-[var(--color-border-default)]">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Order History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--color-border-default)] bg-[var(--color-bg-muted)]">
                <th className="px-5 py-2.5 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase">Order</th>
                <th className="px-5 py-2.5 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase">Garment</th>
                <th className="px-5 py-2.5 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase">Qty</th>
                <th className="px-5 py-2.5 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase">Status</th>
                <th className="px-5 py-2.5 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase">Deadline</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border-default)]">
              {orders.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-sm text-[var(--color-text-muted)]">No orders yet</td></tr>
              ) : orders.map((order) => (
                <tr
                  key={String(order._id)}
                  className="hover:bg-[var(--color-bg-hover)] cursor-pointer"
                  onClick={() => router.push(`/orders/${order._id}`)}
                >
                  <td className="px-5 py-3 text-sm font-medium text-[var(--color-accent)]">{String(order.orderId)}</td>
                  <td className="px-5 py-3 text-sm">{String(order.garmentType)}</td>
                  <td className="px-5 py-3 text-sm">{String(order.quantity)}</td>
                  <td className="px-5 py-3">
                    <Badge className={getStatusColor(String(order.status) as OrderStatus)}>{capitalize(String(order.status))}</Badge>
                  </td>
                  <td className="px-5 py-3 text-sm text-[var(--color-text-secondary)]">{formatDate(String(order.deadline))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Edit Modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Customer" footer={
        <>
          <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button loading={saving} onClick={handleUpdate}>Save Changes</Button>
        </>
      }>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input label="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <Input label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <Input label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </div>
      </Modal>
    </PageContainer>
  );
}
