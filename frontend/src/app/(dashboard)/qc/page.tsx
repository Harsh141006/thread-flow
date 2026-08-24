// ==========================================
// ThreadFlow — Quality Control Page
// ==========================================

'use client';

import { useEffect, useState } from 'react';
import { Plus, CheckCircle, XCircle } from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { Select, Textarea } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { PageLoader } from '@/components/ui/Spinner';
import Table from '@/components/ui/Table';
import { formatDateTime } from '@/utils';

const QC_CHECKLIST_ITEMS = [
  'Design accuracy',
  'Thread color match',
  'Placement accuracy',
  'Dimension check',
  'Stitch quality',
  'Defect inspection',
  'Quantity verification',
];

interface QCRow {
  _id: string;
  order: { _id: string; orderId: string; garmentType: string; customer?: { name: string } };
  result: string;
  inspector: { name: string };
  checklist: { name: string; passed: boolean; notes?: string }[];
  notes: string;
  createdAt: string;
  [key: string]: unknown;
}

export default function QCPage() {
  const { toast } = useToast();
  const [records, setRecords] = useState<QCRow[]>([]);
  const [orders, setOrders] = useState<{ _id: string; orderId: string; garmentType: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    order: '',
    checklist: QC_CHECKLIST_ITEMS.map((name) => ({ name, passed: true, notes: '' })),
    result: 'pass' as 'pass' | 'rework',
    notes: '',
  });

  const fetchData = async () => {
    try {
      const [qcRes, ordRes] = await Promise.all([
        fetch('/api/qc'),
        fetch('/api/orders?status=qc&limit=100'),
      ]);
      const qcData = await qcRes.json();
      const ordData = await ordRes.json();
      if (qcData.success) setRecords(qcData.data);
      if (ordData.success) setOrders(ordData.data.items);
    } catch {
      toast('error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const toggleCheckItem = (index: number) => {
    const updated = [...form.checklist];
    updated[index].passed = !updated[index].passed;
    // Auto-set result: any failed item = rework
    const allPassed = updated.every((i) => i.passed);
    setForm({ ...form, checklist: updated, result: allPassed ? 'pass' : 'rework' });
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/qc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        toast('success', `QC recorded: ${form.result === 'pass' ? 'PASS' : 'REWORK'}`);
        setModalOpen(false);
        setForm({
          order: '',
          checklist: QC_CHECKLIST_ITEMS.map((name) => ({ name, passed: true, notes: '' })),
          result: 'pass',
          notes: '',
        });
        fetchData();
      } else {
        toast('error', data.error);
      }
    } catch {
      toast('error', 'Failed to submit QC');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageLoader />;

  // Stats
  const passCount = records.filter((r) => r.result === 'pass').length;
  const reworkCount = records.filter((r) => r.result === 'rework').length;

  const columns = [
    { key: 'order', label: 'Order', render: (r: QCRow) => (
      <span className="font-medium text-[var(--color-accent)]">{r.order?.orderId || '—'}</span>
    )},
    { key: 'garment', label: 'Garment', render: (r: QCRow) => r.order?.garmentType || '—' },
    { key: 'customer', label: 'Customer', className: 'hidden md:table-cell', render: (r: QCRow) => r.order?.customer?.name || '—' },
    { key: 'result', label: 'Result', render: (r: QCRow) => (
      <Badge variant={r.result === 'pass' ? 'success' : 'danger'} dot>
        {r.result === 'pass' ? 'PASS' : 'REWORK'}
      </Badge>
    )},
    { key: 'inspector', label: 'Inspector', className: 'hidden lg:table-cell', render: (r: QCRow) => r.inspector?.name || '—' },
    { key: 'createdAt', label: 'Date', render: (r: QCRow) => formatDateTime(r.createdAt) },
  ];

  return (
    <PageContainer
      title="Quality Control"
      description="Inspection records and QC checklist"
      action={
        <Button icon={<Plus className="h-4 w-4" />} onClick={() => setModalOpen(true)}>
          New Inspection
        </Button>
      }
    >
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <p className="text-xs text-[var(--color-text-secondary)]">Total Inspections</p>
          <p className="text-2xl font-semibold mt-1">{records.length}</p>
        </Card>
        <Card>
          <p className="text-xs text-[var(--color-success)]">Passed</p>
          <p className="text-2xl font-semibold mt-1 text-[var(--color-success)]">{passCount}</p>
        </Card>
        <Card>
          <p className="text-xs text-[var(--color-danger)]">Rework</p>
          <p className="text-2xl font-semibold mt-1 text-[var(--color-danger)]">{reworkCount}</p>
        </Card>
      </div>

      <Table columns={columns} data={records} emptyMessage="No QC records yet" />

      {/* QC Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="QC Inspection" size="lg" footer={
        <>
          <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button
            loading={saving}
            onClick={handleSubmit}
            variant={form.result === 'rework' ? 'danger' : 'primary'}
          >
            Submit: {form.result === 'pass' ? 'PASS' : 'REWORK'}
          </Button>
        </>
      }>
        <div className="space-y-4">
          <Select label="Order" required value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} placeholder="Select order" options={orders.map((o) => ({ value: o._id, label: `${o.orderId} — ${o.garmentType}` }))} />

          {/* Checklist */}
          <div>
            <label className="text-sm font-medium text-[var(--color-text-primary)] mb-2 block">Inspection Checklist</label>
            <div className="space-y-2">
              {form.checklist.map((item, i) => (
                <div key={item.name} className="flex items-center gap-3 p-2.5 border border-[var(--color-border-default)] rounded-[var(--radius-md)]">
                  <button
                    type="button"
                    onClick={() => toggleCheckItem(i)}
                    className="flex-shrink-0 cursor-pointer"
                  >
                    {item.passed ? (
                      <CheckCircle className="h-5 w-5 text-[var(--color-success)]" />
                    ) : (
                      <XCircle className="h-5 w-5 text-[var(--color-danger)]" />
                    )}
                  </button>
                  <span className={`text-sm ${item.passed ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-danger)]'}`}>
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Result */}
          <div className="flex items-center gap-4 p-3 border border-[var(--color-border-default)] rounded-[var(--radius-md)]">
            <span className="text-sm font-medium">Result:</span>
            <Badge variant={form.result === 'pass' ? 'success' : 'danger'} className="text-sm px-3 py-1">
              {form.result === 'pass' ? 'PASS' : 'REWORK'}
            </Badge>
          </div>

          <Textarea label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Additional observations" />
        </div>
      </Modal>
    </PageContainer>
  );
}
