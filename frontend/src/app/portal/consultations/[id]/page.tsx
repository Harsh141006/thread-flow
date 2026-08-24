'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import PageContainer from '@/components/layout/PageContainer';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { PageLoader } from '@/components/ui/Spinner';
import { ArrowLeft, Send } from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function ConsultationChatPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const { data: session } = useSession();
  const [consultation, setConsultation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConsultation();
  }, [params.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [consultation]);

  const fetchConsultation = async () => {
    try {
      const res = await fetch(`/api/consultations/${params.id}`);
      const data = await res.json();
      if (data.success) {
        setConsultation(data.data);
      } else {
        toast('error', 'Failed to load consultation');
      }
    } catch {
      toast('error', 'Error loading consultation');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`/api/consultations/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      const data = await res.json();
      if (data.success) {
        setConsultation(data.data);
        setMessage('');
      } else {
        toast('error', data.error);
      }
    } catch {
      toast('error', 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  if (loading) return <PageLoader />;
  if (!consultation) return <div className="p-8 text-center">Consultation not found.</div>;

  return (
    <PageContainer
      title="Consultation Chat"
      description="Talk with our expert to finalize your requirements"
      action={
        <Button variant="outline" icon={<ArrowLeft className="h-4 w-4" />} onClick={() => router.back()}>
          Back
        </Button>
      }
    >
      <Card padding="none" className="flex flex-col h-[600px]">
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-[var(--color-border-default)] flex items-center justify-between bg-[var(--color-bg-muted)] rounded-t-[var(--radius-lg)]">
          <div>
            <h3 className="font-semibold text-[var(--color-text-primary)]">ThreadFlow Expert</h3>
            <p className="text-xs text-[var(--color-text-secondary)]">We typically reply within a few hours</p>
          </div>
          <Badge className={consultation.status === 'open' ? 'bg-[var(--color-warning-light)] text-[var(--color-warning)]' : 'bg-[var(--color-success-light)] text-[var(--color-success)]'}>
            {consultation.status.toUpperCase()}
          </Badge>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6" ref={scrollRef}>
          {consultation.messages.map((msg: any, i: number) => {
            const isMe = msg.sender === 'customer';
            return (
              <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-2xl px-5 py-3 ${isMe ? 'bg-[var(--color-accent)] text-white rounded-tr-sm' : 'bg-[var(--color-bg-muted)] text-[var(--color-text-primary)] rounded-tl-sm border border-[var(--color-border-default)]'}`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                  <p className={`text-[10px] mt-2 ${isMe ? 'text-white/70' : 'text-[var(--color-text-muted)]'}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Chat Input */}
        <div className="p-4 border-t border-[var(--color-border-default)] bg-white rounded-b-[var(--radius-lg)]">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 bg-[var(--color-bg-muted)] border border-[var(--color-border-default)] rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent"
            />
            <Button type="submit" loading={sending} className="rounded-full px-6" rightIcon={<Send className="h-4 w-4" />}>
              Send
            </Button>
          </form>
        </div>
      </Card>
    </PageContainer>
  );
}
