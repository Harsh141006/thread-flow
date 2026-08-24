// ==========================================
// ThreadFlow — Inventory Page
// ==========================================

'use client';

import { useEffect, useState } from 'react';
import { Plus, AlertTriangle, Package } from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { Input, Select } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { PageLoader } from '@/components/ui/Spinner';
import Table from '@/components/ui/Table';
import { capitalize } from '@/utils';

interface InventoryItem {
  _id: string;
  name: string;
  category: string;
  color: string;
  quantity: number;
  unit: string;
  reorderLevel: number;
  supplier: string;
  [key: string]: unknown;
}

const categories = [
  { value: 'thread', label: 'Thread' },
  { value: 'fabric', label: 'Fabric' },
  { value: 'needle', label: 'Needle' },
  { value: 'stabilizer', label: 'Stabilizer' },
  { value: 'misc', label: 'Miscellaneous' },
];

export default function InventoryPage() {
  const { toast } = useToast();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [form, setForm] = useState({
    name: '', category: 'thread', color: '', quantity: '', unit: 'spool',
    reorderLevel: '', supplier: '',
  });

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/inventory');
      const data = await res.json();
      if (data.success) setItems(data.data);
    } catch {
      toast('error', 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const url = editItem ? `/api/inventory/${editItem._id}` : '/api/inventory';
      const method = editItem ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          quantity: Number(form.quantity),
          reorderLevel: Number(form.reorderLevel),
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast('success', editItem ? 'Item updated' : 'Item added');
        setModalOpen(false);
        setEditItem(null);
        resetForm();
        fetchItems();
      } else {
        toast('error', data.error);
      }
    } catch {
      toast('error', 'Failed to save item');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => setForm({ name: '', category: 'thread', color: '', quantity: '', unit: 'spool', reorderLevel: '', supplier: '' });

  const openEdit = (item: InventoryItem) => {
    setEditItem(item);
    setForm({
      name: item.name,
      category: item.category,
      color: item.color || '',
      quantity: String(item.quantity),
      unit: item.unit,
      reorderLevel: String(item.reorderLevel),
      supplier: item.supplier || '',
    });
    setModalOpen(true);
  };

  const lowStockItems = items.filter((i) => i.quantity <= i.reorderLevel);

  if (loading) return <PageLoader />;

  const columns = [
    { key: 'name', label: 'Name', render: (i: InventoryItem) => (
      <div className="flex items-center gap-2">
        <span className="font-medium">{i.name}</span>
        {i.quantity <= i.reorderLevel && <AlertTriangle className="h-3.5 w-3.5 text-[var(--color-warning)]" />}
      </div>
    )},
    { key: 'category', label: 'Category', render: (i: InventoryItem) => <Badge variant="default">{capitalize(i.category)}</Badge> },
    { key: 'color', label: 'Color', className: 'hidden md:table-cell' },
    { key: 'quantity', label: 'Qty', render: (i: InventoryItem) => (
      <span className={i.quantity <= i.reorderLevel ? 'text-[var(--color-danger)] font-medium' : ''}>
        {i.quantity} {i.unit}
      </span>
    )},
    { key: 'reorderLevel', label: 'Reorder At', className: 'hidden lg:table-cell', render: (i: InventoryItem) => `${i.reorderLevel} ${i.unit}` },
    { key: 'supplier', label: 'Supplier', className: 'hidden lg:table-cell' },
    { key: 'actions', label: '', render: (i: InventoryItem) => (
      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openEdit(i); }}>Edit</Button>
    )},
  ];

  return (
    <PageContainer
      title="Inventory"
      description="Track threads, materials, and supplies"
      action={
        <Button icon={<Plus className="h-4 w-4" />} onClick={() => { resetForm(); setEditItem(null); setModalOpen(true); }}>
          Add Item
        </Button>
      }
    >
      {/* Low stock alert */}
      {lowStockItems.length > 0 && (
        <Card className="mb-4 border-l-[3px] border-l-[var(--color-warning)]">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-[var(--color-warning)]" />
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Low Stock Alert</h3>
          </div>
          <p className="text-xs text-[var(--color-text-secondary)]">
            {lowStockItems.length} item{lowStockItems.length !== 1 ? 's' : ''} below reorder level:{' '}
            {lowStockItems.map((i) => i.name).join(', ')}
          </p>
        </Card>
      )}

      <Table columns={columns} data={items} emptyMessage="No inventory items. Add your first item." />

      {/* Add/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditItem(null); }}
        title={editItem ? 'Edit Item' : 'Add Inventory Item'}
        footer={
          <>
            <Button variant="outline" onClick={() => { setModalOpen(false); setEditItem(null); }}>Cancel</Button>
            <Button loading={saving} onClick={handleSave}>{editItem ? 'Save' : 'Add Item'}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Madeira Rayon Thread" />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} options={categories} />
            <Input label="Color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} placeholder="e.g. Red #FF0000" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input label="Quantity" type="number" required value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
            <Input label="Unit" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="spool, meter, box" />
            <Input label="Reorder Level" type="number" required value={form.reorderLevel} onChange={(e) => setForm({ ...form, reorderLevel: e.target.value })} />
          </div>
          <Input label="Supplier" value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} placeholder="Supplier name" />
        </div>
      </Modal>
    </PageContainer>
  );
}
