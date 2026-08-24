// ==========================================
// ThreadFlow — Designs Page
// ==========================================

'use client';

import { useEffect, useState } from 'react';
import { Upload, Image as ImageIcon, Clock } from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { PageLoader } from '@/components/ui/Spinner';
import { formatDateTime } from '@/utils';

export default function DesignsPage() {
  const { toast } = useToast();
  const [designs, setDesigns] = useState<Record<string, unknown>[]>([]);
  const [orders, setOrders] = useState<{ _id: string; orderId: string; garmentType: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ order: '', imageUrl: '', notes: '' });

  useEffect(() => {
    async function fetchData() {
      try {
        const [designsRes, ordersRes] = await Promise.all([
          fetch('/api/designs'),
          fetch('/api/orders?limit=100'),
        ]);
        const designsData = await designsRes.json();
        const ordersData = await ordersRes.json();
        if (designsData.success) setDesigns(designsData.data);
        if (ordersData.success) setOrders(ordersData.data.items);
      } catch {
        toast('error', 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [toast]);

  const handleUpload = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/designs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        toast('success', 'Design version uploaded');
        setModalOpen(false);
        setForm({ order: '', imageUrl: '', notes: '' });
        // Refresh
        const designsRes = await fetch('/api/designs');
        const designsData = await designsRes.json();
        if (designsData.success) setDesigns(designsData.data);
      } else {
        toast('error', data.error);
      }
    } catch {
      toast('error', 'Failed to upload design');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <PageContainer
      title="Designs"
      description="Design files and version history"
      action={
        <Button icon={<Upload className="h-4 w-4" />} onClick={() => setModalOpen(true)}>
          Upload Design
        </Button>
      }
    >
      {designs.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <ImageIcon className="h-10 w-10 text-[var(--color-text-muted)] mx-auto mb-3" />
            <p className="text-sm text-[var(--color-text-muted)]">No designs uploaded yet</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {designs.map((design) => {
            const order = design.order as Record<string, unknown> | null;
            const versions = (design.versions as Record<string, unknown>[]) || [];
            return (
              <Card key={String(design._id)} padding="none">
                <div className="px-5 py-4 border-b border-[var(--color-border-default)] flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-[var(--color-accent)]">{order?.orderId ? String(order.orderId) : '—'}</span>
                    <span className="text-sm text-[var(--color-text-secondary)] ml-2">{order?.garmentType ? String(order.garmentType) : ''}</span>
                  </div>
                  <Badge variant="info">v{String(design.currentVersion)}</Badge>
                </div>
                <div className="px-5 py-4">
                  <div className="space-y-3">
                    {versions.slice().reverse().map((v) => {
                      const uploader = v.uploadedBy as Record<string, unknown> | null;
                      return (
                        <div key={String(v._id)} className="flex items-start gap-3 text-sm">
                          <div className="flex-shrink-0 w-12 h-12 bg-[var(--color-bg-muted)] rounded-[var(--radius-md)] flex items-center justify-center">
                            <ImageIcon className="h-5 w-5 text-[var(--color-text-muted)]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Version {String(v.version)}</span>
                              {Number(v.version) === Number(design.currentVersion) && (
                                <Badge variant="success" dot>Current</Badge>
                              )}
                            </div>
                            <p className="text-xs text-[var(--color-text-muted)] flex items-center gap-1 mt-0.5">
                              <Clock className="h-3 w-3" />
                              {formatDateTime(String(v.createdAt))}
                              {uploader?.name && <> · {String(uploader.name)}</>}
                            </p>
                            {v.notes && <p className="text-xs text-[var(--color-text-secondary)] mt-1">{String(v.notes)}</p>}
                            {v.imageUrl && (
                              <a href={String(v.imageUrl)} target="_blank" rel="noopener noreferrer" className="text-xs text-[var(--color-accent)] hover:underline mt-1 inline-block">
                                View Design ↗
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Upload Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Upload Design Version" footer={
        <>
          <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button loading={saving} onClick={handleUpload}>Upload</Button>
        </>
      }>
        <div className="space-y-4">
          <Select
            label="Order"
            required
            value={form.order}
            onChange={(e) => setForm({ ...form, order: e.target.value })}
            placeholder="Select order"
            options={orders.map((o) => ({ value: o._id, label: `${o.orderId} — ${o.garmentType}` }))}
          />
          <Input
            label="Image URL"
            required
            value={form.imageUrl}
            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
            placeholder="https://res.cloudinary.com/... or any image URL"
            hint="Paste a Cloudinary URL or any direct image link"
          />
          <Textarea
            label="Notes"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Version notes (e.g., 'Updated logo placement')"
          />
        </div>
      </Modal>
    </PageContainer>
  );
}
