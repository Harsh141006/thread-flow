'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PageContainer from '@/components/layout/PageContainer';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { MessageSquare } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';

export default function AdminConsultationsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [consultations, setConsultations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Chat modal state
  const [activeConsultation, setActiveConsultation] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

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

  const handleSendMessage = async () => {
    if (!message.trim() || !activeConsultation) return;
    setSending(true);
    try {
      const res = await fetch(`/api/consultations/${activeConsultation._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      const data = await res.json();
      if (data.success) {
        setActiveConsultation(data.data);
        setMessage('');
        fetchConsultations();
      } else {
        toast('error', data.error);
      }
    } catch {
      toast('error', 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleResolve = async () => {
    if (!activeConsultation) return;
    try {
      const res = await fetch(`/api/consultations/${activeConsultation._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'resolved' }),
      });
      const data = await res.json();
      if (data.success) {
        toast('success', 'Consultation marked as resolved');
        setActiveConsultation(null);
        fetchConsultations();
      }
    } catch {
      toast('error', 'Failed to resolve consultation');
    }
  };

  const columns = [
    { key: 'id', label: 'Consultation', render: (c: any) => (
      <span className="font-medium text-[var(--color-accent)] flex items-center gap-2">
        <MessageSquare className="h-4 w-4" />
        Consultation
      </span>
    )},
    { key: 'customer', label: 'Customer', render: (c: any) => c.customer?.name || 'Unknown' },
    { key: 'company', label: 'Company', render: (c: any) => c.customer?.company || '—' },
    { key: 'status', label: 'Status', render: (c: any) => (
      <Badge className={c.status === 'open' ? 'bg-[var(--color-warning-light)] text-[var(--color-warning)]' : 'bg-[var(--color-success-light)] text-[var(--color-success)]'}>
        {c.status.toUpperCase()}
      </Badge>
    )},
    { key: 'updated', label: 'Last Updated', render: (c: any) => new Date(c.updatedAt).toLocaleDateString() },
  ];

  return (
    <PageContainer
      title="Expert Consultations"
      description="Manage and reply to customer inquiries"
    >
      <Table
        columns={columns}
        data={consultations}
        loading={loading}
        onRowClick={(c) => setActiveConsultation(c)}
        emptyMessage="No consultations found"
      />

      <Modal open={!!activeConsultation} onClose={() => setActiveConsultation(null)} title={`Consultation with ${activeConsultation?.customer?.name}`} size="lg" footer={
        <div className="flex justify-between w-full">
          <Button variant="outline" className="text-[var(--color-success)]" onClick={handleResolve} disabled={activeConsultation?.status === 'resolved'}>Mark as Resolved</Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setActiveConsultation(null)}>Close</Button>
            <Button loading={sending} onClick={handleSendMessage}>Send Reply</Button>
          </div>
        </div>
      }>
        <div className="space-y-4">
          <div className="max-h-[300px] overflow-y-auto space-y-4 p-2">
            {activeConsultation?.messages.map((msg: any, i: number) => {
              const isAdmin = msg.sender === 'admin';
              return (
                <div key={i} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-xl px-4 py-2 ${isAdmin ? 'bg-[var(--color-accent)] text-white' : 'bg-[var(--color-bg-muted)] border border-[var(--color-border-default)]'}`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                    <p className={`text-[10px] mt-1 ${isAdmin ? 'text-white/70' : 'text-[var(--color-text-muted)]'}`}>
                      {msg.sender === 'customer' ? activeConsultation.customer?.name : 'Admin'} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="border-t border-[var(--color-border-default)] pt-4">
            <Textarea
              placeholder="Type your reply here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
}
