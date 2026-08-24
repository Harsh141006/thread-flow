// ==========================================
// ThreadFlow — Payments Page
// ==========================================

'use client';

import { useEffect, useState } from 'react';
import { Plus, IndianRupee } from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { Input, Select } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { PageLoader } from '@/components/ui/Spinner';
import Table from '@/components/ui/Table';
import { formatCurrency, formatDate, getPaymentStatusColor, capitalize } from '@/utils';
import { PaymentStatus } from '@/types';

interface PaymentRow {
  _id: string;
  order: { _id: string; orderId: string; garmentType: string; customer?: { name: string; company: string } };
  totalAmount: number;
  payments: { amount: number; method: string; date: string; note?: string }[];
  status: PaymentStatus;
  [key: string]: unknown;
}

export default function PaymentsPage() {
  const { toast } = useToast();
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [orders, setOrders] = useState<{ _id: string; orderId: string; garmentType: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [addPaymentOpen, setAddPaymentOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [createForm, setCreateForm] = useState({ order: '', totalAmount: '' });
  const [payForm, setPayForm] = useState({ amount: '', method: 'Cash', note: '' });

  const fetchData = async () => {
    try {
      const [payRes, ordRes] = await Promise.all([
        fetch('/api/payments'),
        fetch('/api/orders?limit=100'),
      ]);
      const payData = await payRes.json();
      const ordData = await ordRes.json();
      if (payData.success) setPayments(payData.data);
      if (ordData.success) setOrders(ordData.data.items);
    } catch {
      toast('error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: createForm.order, totalAmount: Number(createForm.totalAmount), payments: [], status: 'unpaid' }),
      });
      const data = await res.json();
      if (data.success) {
        toast('success', 'Payment record created');
        setCreateOpen(false);
        setCreateForm({ order: '', totalAmount: '' });
        fetchData();
      } else {
        toast('error', data.error);
      }
    } catch {
      toast('error', 'Failed to create payment');
    } finally {
      setSaving(false);
    }
  };

  const handleAddPayment = async () => {
    if (!selectedPayment) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/payments/${selectedPayment._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          addPayment: { amount: Number(payForm.amount), method: payForm.method, date: new Date(), note: payForm.note },
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast('success', 'Payment recorded');
        setAddPaymentOpen(false);
        setPayForm({ amount: '', method: 'Cash', note: '' });
        fetchData();
      } else {
        toast('error', data.error);
      }
    } catch {
      toast('error', 'Failed to record payment');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageLoader />;

  const totalRevenue = payments.reduce((sum, p) => sum + p.payments.reduce((s, e) => s + e.amount, 0), 0);
  const totalPending = payments.reduce((sum, p) => {
    const paid = p.payments.reduce((s, e) => s + e.amount, 0);
    return sum + Math.max(0, p.totalAmount - paid);
  }, 0);

  const columns = [
    { key: 'order', label: 'Order', render: (p: PaymentRow) => (
      <span className="font-medium text-[var(--color-accent)]">{p.order?.orderId || '—'}</span>
    )},
    { key: 'customer', label: 'Customer', className: 'hidden md:table-cell', render: (p: PaymentRow) => p.order?.customer?.name || '—' },
    { key: 'totalAmount', label: 'Total', render: (p: PaymentRow) => formatCurrency(p.totalAmount) },
    { key: 'paid', label: 'Paid', render: (p: PaymentRow) => {
      const paid = p.payments.reduce((s, e) => s + e.amount, 0);
      return <span className="text-[var(--color-success)]">{formatCurrency(paid)}</span>;
    }},
    { key: 'balance', label: 'Balance', render: (p: PaymentRow) => {
      const paid = p.payments.reduce((s, e) => s + e.amount, 0);
      const balance = p.totalAmount - paid;
      return <span className={balance > 0 ? 'text-[var(--color-danger)]' : ''}>{formatCurrency(Math.max(0, balance))}</span>;
    }},
    { key: 'status', label: 'Status', render: (p: PaymentRow) => (
      <Badge className={getPaymentStatusColor(p.status)}>{capitalize(p.status)}</Badge>
    )},
    { key: 'actions', label: '', render: (p: PaymentRow) => p.status !== 'paid' ? (
      <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedPayment(p); setAddPaymentOpen(true); }}>
        Record Payment
      </Button>
    ) : null },
  ];

  return (
    <PageContainer
      title="Payments"
      description="Track payments and balances"
      action={
        <Button icon={<Plus className="h-4 w-4" />} onClick={() => setCreateOpen(true)}>
          New Payment Record
        </Button>
      }
    >
      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card>
          <div className="flex items-center gap-2">
            <IndianRupee className="h-4 w-4 text-[var(--color-success)]" />
            <p className="text-xs text-[var(--color-text-secondary)]">Total Collected</p>
          </div>
          <p className="text-2xl font-semibold mt-1 text-[var(--color-success)]">{formatCurrency(totalRevenue)}</p>
        </Card>
        <Card>
          <div className="flex items-center gap-2">
            <IndianRupee className="h-4 w-4 text-[var(--color-danger)]" />
            <p className="text-xs text-[var(--color-text-secondary)]">Total Pending</p>
          </div>
          <p className="text-2xl font-semibold mt-1 text-[var(--color-danger)]">{formatCurrency(totalPending)}</p>
        </Card>
      </div>

      <Table columns={columns} data={payments} emptyMessage="No payment records" />

      {/* Create Modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="New Payment Record" footer={
        <>
          <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button loading={saving} onClick={handleCreate}>Create</Button>
        </>
      }>
        <div className="space-y-4">
          <Select label="Order" required value={createForm.order} onChange={(e) => setCreateForm({ ...createForm, order: e.target.value })} placeholder="Select order" options={orders.map((o) => ({ value: o._id, label: `${o.orderId} — ${o.garmentType}` }))} />
          <Input label="Total Amount (₹)" type="number" required value={createForm.totalAmount} onChange={(e) => setCreateForm({ ...createForm, totalAmount: e.target.value })} />
        </div>
      </Modal>

      {/* Add Payment Modal */}
      <Modal
        open={addPaymentOpen}
        onClose={() => setAddPaymentOpen(false)}
        title={`Record Payment — ${selectedPayment?.order?.orderId || ''}`}
        footer={
          <>
            <Button variant="outline" onClick={() => setAddPaymentOpen(false)}>Cancel</Button>
            <Button loading={saving} onClick={handleAddPayment}>Record Payment</Button>
          </>
        }
      >
        <div className="space-y-4">
          {selectedPayment && (
            <div className="p-3 bg-[var(--color-bg-muted)] rounded-[var(--radius-md)] text-sm">
              <div className="flex justify-between"><span>Total:</span><span className="font-medium">{formatCurrency(selectedPayment.totalAmount)}</span></div>
              <div className="flex justify-between"><span>Paid:</span><span className="text-[var(--color-success)]">{formatCurrency(selectedPayment.payments.reduce((s, e) => s + e.amount, 0))}</span></div>
              <div className="flex justify-between border-t mt-2 pt-2"><span>Balance:</span><span className="font-medium text-[var(--color-danger)]">{formatCurrency(Math.max(0, selectedPayment.totalAmount - selectedPayment.payments.reduce((s, e) => s + e.amount, 0)))}</span></div>
            </div>
          )}
          <Input label="Amount (₹)" type="number" required value={payForm.amount} onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })} />
          <Select label="Method" value={payForm.method} onChange={(e) => setPayForm({ ...payForm, method: e.target.value })} options={[
            { value: 'Cash', label: 'Cash' },
            { value: 'Bank Transfer', label: 'Bank Transfer' },
            { value: 'UPI', label: 'UPI' },
            { value: 'Cheque', label: 'Cheque' },
          ]} />
          <Input label="Note" value={payForm.note} onChange={(e) => setPayForm({ ...payForm, note: e.target.value })} placeholder="Payment reference" />
        </div>
      </Modal>
    </PageContainer>
  );
}
