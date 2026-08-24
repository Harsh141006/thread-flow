'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PageContainer from '@/components/layout/PageContainer';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { PageLoader } from '@/components/ui/Spinner';
import { Plus, MessageSquare } from 'lucide-react';

export default function ConsultationsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [consultations, setConsultations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchConsultations();
  }, []);

  const fetchConsultations = async () => {
    try {
      const res = await fetch('/api/consultations');
      const data = await res.json();
      if (data.success) {
        setConsultations(data.data);
      }
    } catch {
      toast('error', 'Failed to load consultations');
    } finally {
      setLoading(false);
    }
  };

  const handleStartConsultation = async () => {
    if (!message.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initialMessage: message }),
      });
      const data = await res.json();
      if (data.success) {
        toast('success', 'Consultation started!');
        setModalOpen(false);
        setMessage('');
        router.push(`/portal/consultations/${data.data._id}`);
      } else {
        toast('error', data.error);
      }
    } catch {
      toast('error', 'Failed to start consultation');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <PageContainer
      title="Expert Consultations"
      description="Talk with our experts before placing an order"
      action={
        <Button icon={<Plus className="h-4 w-4" />} onClick={() => setModalOpen(true)}>
          New Consultation
        </Button>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {consultations.length === 0 ? (
          <div className="col-span-full py-12 text-center text-[var(--color-text-muted)]">
            You don't have any past consultations.
          </div>
        ) : (
          consultations.map((c) => (
            <Card key={c._id} className="cursor-pointer hover:border-[var(--color-accent)] transition-colors" onClick={() => router.push(`/portal/consultations/${c._id}`)}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2 text-[var(--color-text-primary)] font-medium">
                  <MessageSquare className="h-5 w-5 text-[var(--color-accent)]" />
                  Consultation
                </div>
                <Badge className={c.status === 'open' ? 'bg-[var(--color-warning-light)] text-[var(--color-warning)]' : 'bg-[var(--color-success-light)] text-[var(--color-success)]'}>
                  {c.status.toUpperCase()}
                </Badge>
              </div>
              <p className="text-sm text-[var(--color-text-secondary)] line-clamp-2">
                {c.messages[0]?.text || 'No messages yet'}
              </p>
              <div className="text-xs text-[var(--color-text-muted)] mt-4">
                Last updated: {new Date(c.updatedAt).toLocaleDateString()}
              </div>
            </Card>
          ))
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Start a Consultation" footer={
        <>
          <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button loading={saving} onClick={handleStartConsultation}>Send Request</Button>
        </>
      }>
        <div className="space-y-4">
          <p className="text-sm text-[var(--color-text-secondary)]">
            Describe what you're looking for, or ask any questions you have. One of our experts will get back to you shortly.
          </p>
          <Textarea
            label="Your Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="I want to order custom lehngas but I'm not sure about the fabric..."
            rows={5}
          />
        </div>
      </Modal>
    </PageContainer>
  );
}
