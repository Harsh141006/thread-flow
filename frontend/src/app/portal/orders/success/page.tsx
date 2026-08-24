// ==========================================
// ThreadFlow — Customer Order Success
// ==========================================

'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import PageContainer from '@/components/layout/PageContainer';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { CheckCircle, Clock, Search, ShieldCheck } from 'lucide-react';

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('id') || 'Unknown';

  return (
    <PageContainer
      title="Order Placed Successfully"
      description="Your personalization request has been received"
    >
      <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Card className="text-center py-10">
          <div className="w-20 h-20 bg-[var(--color-success-light)] text-[var(--color-success)] rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10" />
          </div>
          
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">Thank you for your order!</h2>
          <p className="text-[var(--color-text-secondary)] mb-1">
            Order Reference: <span className="font-semibold text-[var(--color-accent)]">{orderId}</span>
          </p>
          <p className="text-sm text-[var(--color-text-muted)] mb-8">
            Your order is currently in the <span className="font-medium text-[var(--color-text-primary)]">Draft / Pending Review</span> state.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left border-t border-[var(--color-border-default)] pt-8 mt-4">
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 bg-[var(--color-bg-muted)] text-[var(--color-accent)] rounded-full flex items-center justify-center mb-3">
                <Search className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-semibold text-[var(--color-text-primary)] mb-1">1. Admin Review</h4>
              <p className="text-xs text-[var(--color-text-secondary)]">Our team will review your requirements and artwork for feasibility.</p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 bg-[var(--color-bg-muted)] text-[var(--color-warning)] rounded-full flex items-center justify-center mb-3">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-semibold text-[var(--color-text-primary)] mb-1">2. Final Approval</h4>
              <p className="text-xs text-[var(--color-text-secondary)]">We will digitize the design and send a final digital proof for you to approve.</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 bg-[var(--color-bg-muted)] text-[var(--color-success)] rounded-full flex items-center justify-center mb-3">
                <Clock className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-semibold text-[var(--color-text-primary)] mb-1">3. Production</h4>
              <p className="text-xs text-[var(--color-text-secondary)]">Once approved, production begins and you'll be updated on the progress.</p>
            </div>
          </div>
        </Card>

        <div className="flex justify-center gap-4">
          <Button variant="outline" onClick={() => router.push('/portal/catalog')}>
            Order Another Item
          </Button>
          <Button onClick={() => router.push('/portal/orders')}>
            Track Order Status
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}
