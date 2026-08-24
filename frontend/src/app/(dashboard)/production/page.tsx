// ==========================================
// ThreadFlow — Production Kanban Page
// ==========================================

'use client';

import { useEffect, useState } from 'react';
import { Plus, Clock, Cpu } from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { Select, Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { PageLoader } from '@/components/ui/Spinner';
import { formatDate, capitalize } from '@/utils';
import { ProductionStatus } from '@/types';

interface ProductionRecord {
  _id: string;
  order: { _id: string; orderId: string; garmentType: string; quantity: number; deadline: string; customer?: { name: string } };
  machine: { _id: string; name: string; type: string };
  status: ProductionStatus;
  completedQuantity: number;
  totalQuantity: number;
  assignedBy: { name: string };
  [key: string]: unknown;
}

const kanbanColumns: { status: ProductionStatus; label: string; color: string }[] = [
  { status: 'queued', label: 'Queued', color: 'var(--color-text-secondary)' },
  { status: 'running', label: 'Running', color: 'var(--color-accent)' },
  { status: 'paused', label: 'Paused', color: 'var(--color-warning)' },
  { status: 'done', label: 'Done', color: 'var(--color-success)' },
];

export default function ProductionPage() {
  const { toast } = useToast();
  const [records, setRecords] = useState<ProductionRecord[]>([]);
  const [machines, setMachines] = useState<{ _id: string; name: string; type: string }[]>([]);
  const [orders, setOrders] = useState<{ _id: string; orderId: string; garmentType: string; quantity: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ order: '', machine: '', totalQuantity: '' });

  const fetchAll = async () => {
    try {
      const [prodRes, machRes, ordRes] = await Promise.all([
        fetch('/api/production'),
        fetch('/api/machines'),
        fetch('/api/orders?status=scheduled&limit=100'),
      ]);
      const prodData = await prodRes.json();
      const machData = await machRes.json();
      const ordData = await ordRes.json();
      if (prodData.success) setRecords(prodData.data);
      if (machData.success) setMachines(machData.data);
      if (ordData.success) setOrders(ordData.data.items);
    } catch {
      toast('error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleCreate = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/production', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, totalQuantity: Number(form.totalQuantity), status: 'queued' }),
      });
      const data = await res.json();
      if (data.success) {
        toast('success', 'Production record created');
        setModalOpen(false);
        fetchAll();
      } else {
        toast('error', data.error);
      }
    } catch {
      toast('error', 'Failed to create production record');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: ProductionStatus) => {
    try {
      const updateData: any = { status: newStatus };
      if (newStatus === 'running') updateData.startTime = new Date().toISOString();
      if (newStatus === 'done') updateData.endTime = new Date().toISOString();

      const res = await fetch(`/api/production/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      const data = await res.json();
      if (data.success) {
        toast('success', `Moved to ${capitalize(newStatus)}`);
        fetchAll();
      }
    } catch {
      toast('error', 'Failed to update status');
    }
  };

  if (loading) return <PageLoader />;

  return (
    <PageContainer
      title="Production"
      description="Kanban workflow for production tracking"
      action={
        <Button icon={<Plus className="h-4 w-4" />} onClick={() => setModalOpen(true)}>
          Add to Production
        </Button>
      }
    >
      {/* Kanban board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kanbanColumns.map((col) => {
          const columnRecords = records.filter((r) => r.status === col.status);
          return (
            <div key={col.status}>
              {/* Column header */}
              <div className="flex items-center gap-2 mb-3 px-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: col.color }} />
                <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">{col.label}</h3>
                <span className="text-xs text-[var(--color-text-muted)]">({columnRecords.length})</span>
              </div>

              {/* Cards */}
              <div className="space-y-3 min-h-[200px]">
                {columnRecords.map((rec) => (
                  <Card key={rec._id} className="!p-3">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-sm font-medium text-[var(--color-accent)]">{rec.order?.orderId}</span>
                      <Badge variant="default" className="text-[10px]">{rec.machine?.name}</Badge>
                    </div>
                    <p className="text-xs text-[var(--color-text-primary)] mb-1">{rec.order?.garmentType}</p>
                    <p className="text-xs text-[var(--color-text-muted)] mb-2">{rec.order?.customer?.name}</p>

                    {/* Progress bar */}
                    <div className="mb-2">
                      <div className="flex justify-between text-[10px] text-[var(--color-text-muted)] mb-1">
                        <span>{rec.completedQuantity}/{rec.totalQuantity} items</span>
                        <span>{Math.round((rec.completedQuantity / rec.totalQuantity) * 100)}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-[var(--color-bg-muted)] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[var(--color-accent)] rounded-full transition-all"
                          style={{ width: `${(rec.completedQuantity / rec.totalQuantity) * 100}%` }}
                        />
                      </div>
                    </div>

                    {rec.order?.deadline && (
                      <p className="text-[10px] text-[var(--color-text-muted)] flex items-center gap-1">
                        <Clock className="h-3 w-3" /> Due {formatDate(rec.order.deadline)}
                      </p>
                    )}

                    {/* Status transitions */}
                    <div className="flex gap-1 mt-2 pt-2 border-t border-[var(--color-border-default)]">
                      {col.status === 'queued' && (
                        <Button size="sm" variant="outline" className="flex-1 text-[10px]" onClick={() => handleStatusChange(rec._id, 'running')}>Start</Button>
                      )}
                      {col.status === 'running' && (
                        <>
                          <Button size="sm" variant="outline" className="flex-1 text-[10px]" onClick={() => handleStatusChange(rec._id, 'paused')}>Pause</Button>
                          <Button size="sm" variant="primary" className="flex-1 text-[10px]" onClick={() => handleStatusChange(rec._id, 'done')}>Done</Button>
                        </>
                      )}
                      {col.status === 'paused' && (
                        <Button size="sm" variant="outline" className="flex-1 text-[10px]" onClick={() => handleStatusChange(rec._id, 'running')}>Resume</Button>
                      )}
                    </div>
                  </Card>
                ))}
                {columnRecords.length === 0 && (
                  <div className="flex items-center justify-center h-[100px] border border-dashed border-[var(--color-border-default)] rounded-[var(--radius-md)]">
                    <p className="text-xs text-[var(--color-text-muted)]">No items</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add to Production" footer={
        <>
          <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button loading={saving} onClick={handleCreate}>Add</Button>
        </>
      }>
        <div className="space-y-4">
          <Select label="Order" required value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} placeholder="Select order" options={orders.map((o) => ({ value: o._id, label: `${o.orderId} — ${o.garmentType}` }))} />
          <Select label="Machine" required value={form.machine} onChange={(e) => setForm({ ...form, machine: e.target.value })} placeholder="Select machine" options={machines.map((m) => ({ value: m._id, label: `${m.name} (${m.type})` }))} />
          <Input label="Total Quantity" type="number" required min="1" value={form.totalQuantity} onChange={(e) => setForm({ ...form, totalQuantity: e.target.value })} />
        </div>
      </Modal>
    </PageContainer>
  );
}
