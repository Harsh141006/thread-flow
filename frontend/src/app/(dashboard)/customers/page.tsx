// ==========================================
// ThreadFlow — Customers Page
// ==========================================

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search } from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import Table from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { formatDate } from '@/utils';

interface CustomerRow {
  _id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  createdAt: string;
  [key: string]: unknown;
}

export default function CustomersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', company: '', email: '', phone: '', address: '', notes: '' });
  const [saving, setSaving] = useState(false);

  const fetchCustomers = useCallback(async () => {
    try {
      const res = await fetch(`/api/customers?search=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (data.success) setCustomers(data.data.items);
    } catch {
      toast('error', 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  }, [search, toast]);

  useEffect(() => {
    const timer = setTimeout(fetchCustomers, 300);
    return () => clearTimeout(timer);
  }, [fetchCustomers]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        toast('success', 'Customer created');
        setModalOpen(false);
        setForm({ name: '', company: '', email: '', phone: '', address: '', notes: '' });
        fetchCustomers();
      } else {
        toast('error', data.error || 'Failed to create customer');
      }
    } catch {
      toast('error', 'Failed to create customer');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: 'name', label: 'Name', render: (c: CustomerRow) => (
      <span className="font-medium">{c.name}</span>
    )},
    { key: 'company', label: 'Company' },
    { key: 'email', label: 'Email', className: 'hidden md:table-cell' },
    { key: 'phone', label: 'Phone', className: 'hidden lg:table-cell' },
    { key: 'createdAt', label: 'Added', className: 'hidden lg:table-cell', render: (c: CustomerRow) => formatDate(c.createdAt) },
  ];

  return (
    <PageContainer
      title="Customers"
      description="Manage your customer database"
      action={
        <Button icon={<Plus className="h-4 w-4" />} onClick={() => setModalOpen(true)}>
          Add Customer
        </Button>
      }
    >
      {/* Search */}
      <div className="mb-4 max-w-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Search customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[var(--color-border-default)] rounded-[var(--radius-md)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-1"
          />
        </div>
      </div>

      <Table
        columns={columns}
        data={customers}
        loading={loading}
        onRowClick={(c) => router.push(`/customers/${c._id}`)}
        emptyMessage="No customers found. Add your first customer to get started."
      />

      {/* Create Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add New Customer"
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button loading={saving} onClick={handleCreate}>Create Customer</Button>
          </>
        }
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Contact name" />
            <Input label="Company" required value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Company name" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@company.com" />
            <Input label="Phone" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" />
          </div>
          <Input label="Address" required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Full address" />
          <Input label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Optional notes" />
        </form>
      </Modal>
    </PageContainer>
  );
}
