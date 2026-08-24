// ==========================================
// ThreadFlow — Customer Portal Order Detail
// ==========================================

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowLeft, Check, X } from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Textarea } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { PageLoader } from '@/components/ui/Spinner';
import { formatDate, getStatusColor, capitalize } from '@/utils';
import { OrderStatus } from '@/types';

export default function PortalOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();
  
  const [order, setOrder] = useState<Record<string, unknown> | null>(null);
  const [design, setDesign] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [comment, setComment] = useState('');

  useEffect(() => {
    async function fetchDetails() {
      if (!session?.user?.customerId) return;

      try {
        const orderRes = await fetch(`/api/orders/${params.id}`);
        const orderData = await orderRes.json();
        
        if (orderData.success) {
          // Security check: ensure order belongs to this customer
          if (orderData.data.customer?._id !== session.user.customerId) {
            toast('error', 'Unauthorized access');
            router.push('/portal/orders');
            return;
          }
          setOrder(orderData.data);
          
          // Fetch design if any
          const designRes = await fetch(`/api/designs?order=${params.id}`);
          const designData = await designRes.json();
          if (designData.success && designData.data.length > 0) {
            setDesign(designData.data[0]);
          }
        }
      } catch (error) {
        toast('error', 'Failed to load order details');
      } finally {
        setLoading(false);
      }
    }

    if (session) {
      fetchDetails();
    }
  }, [params.id, session, router, toast]);

  const handleApproval = async (decision: 'approved' | 'revision') => {
    if (decision === 'revision' && !comment.trim()) {
      toast('error', 'Please provide a comment for the revision request');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order: params.id,
          decision,
          comment: comment.trim() || 'Approved by customer',
        }),
      });
      const data = await res.json();
      
      if (data.success) {
        toast('success', `Design ${decision === 'approved' ? 'approved' : 'revision requested'}`);
        // Refetch order
        const orderRes = await fetch(`/api/orders/${params.id}`);
        const orderData = await orderRes.json();
        if (orderData.success) setOrder(orderData.data);
      } else {
        toast('error', data.error || 'Failed to submit approval');
      }
    } catch (error) {
      toast('error', 'Failed to submit approval');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <PageLoader />;
  if (!order) return <p className="p-6 text-sm text-[var(--color-text-muted)]">Order not found</p>;

  const currentVersion = design?.versions 
    ? (design.versions as Record<string, unknown>[]).find(v => v.version === design.currentVersion)
    : null;

  return (
    <PageContainer
      title={`Order ${order.orderId}`}
      description={String(order.garmentType)}
      action={
        <Button variant="outline" icon={<ArrowLeft className="h-4 w-4" />} onClick={() => router.push('/portal/orders')}>
          Back to Orders
        </Button>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="flex justify-between items-start mb-4 border-b border-[var(--color-border-default)] pb-4">
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Order Details</h3>
              <Badge className={getStatusColor(String(order.status) as OrderStatus)}>
                {capitalize(String(order.status))}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-[var(--color-text-secondary)]">Item:</span> <span className="font-medium ml-2">{String(order.garmentType)}</span></div>
              <div><span className="text-[var(--color-text-secondary)]">Quantity:</span> <span className="font-medium ml-2">{String(order.quantity)}</span></div>
              <div><span className="text-[var(--color-text-secondary)]">Sizes:</span> <span className="ml-2">{String(order.sizes)}</span></div>
              <div><span className="text-[var(--color-text-secondary)]">Position:</span> <span className="ml-2">{String(order.embroideryPosition)}</span></div>
              <div><span className="text-[var(--color-text-secondary)]">Design Size:</span> <span className="ml-2">{String(order.designWidth)}x{String(order.designHeight)} mm</span></div>
              <div><span className="text-[var(--color-text-secondary)]">Deadline:</span> <span className="font-medium ml-2">{formatDate(String(order.deadline))}</span></div>
              {order.paymentMethod && (
                <div className="col-span-2"><span className="text-[var(--color-text-secondary)]">Payment Method:</span> <span className="font-medium ml-2">{String(order.paymentMethod)}</span></div>
              )}
            </div>
            
            {(order.threadColors as string[])?.length > 0 && (
              <div className="mt-4">
                <span className="text-sm text-[var(--color-text-secondary)]">Thread Colors:</span>
                <span className="ml-2 text-sm">{((order.threadColors) as string[]).join(', ')}</span>
              </div>
            )}
            
            {order.notes && (
              <div className="mt-4 p-3 bg-[var(--color-bg-muted)] rounded-[var(--radius-md)] text-sm">
                <span className="text-[var(--color-text-secondary)] block mb-1">Order Notes:</span>
                <p>{String(order.notes)}</p>
              </div>
            )}
          </Card>

          {/* Design & Approval Section */}
          <Card>
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4 border-b border-[var(--color-border-default)] pb-4">
              Design Files
            </h3>
            
            {!design || !currentVersion ? (
              <div className="text-center py-8">
                <p className="text-sm text-[var(--color-text-muted)]">No design files have been uploaded yet.</p>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">Our team is currently working on your design.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Badge variant="info">Version {String(currentVersion.version)}</Badge>
                  <span className="text-xs text-[var(--color-text-muted)]">
                    Uploaded {formatDate(String(currentVersion.createdAt))}
                  </span>
                </div>
                
                {currentVersion.imageUrl && (
                  <div className="border border-[var(--color-border-default)] rounded-[var(--radius-md)] overflow-hidden">
                    <img 
                      src={String(currentVersion.imageUrl)} 
                      alt="Design Preview" 
                      className="w-full max-h-[400px] object-contain bg-[var(--color-bg-muted)]" 
                    />
                  </div>
                )}
                
                {currentVersion.notes && (
                  <p className="text-sm p-3 bg-[var(--color-bg-muted)] rounded-[var(--radius-md)]">
                    <span className="font-medium">Designer Note:</span> {String(currentVersion.notes)}
                  </p>
                )}

                {/* Approval Form - Only show if status is 'approval' */}
                {String(order.status) === 'approval' && (
                  <div className="mt-6 p-4 border border-[var(--color-warning)] rounded-[var(--radius-md)] bg-[var(--color-warning-light)]/20">
                    <h4 className="text-sm font-semibold text-[var(--color-text-primary)] mb-2">Design Approval Required</h4>
                    <p className="text-xs text-[var(--color-text-secondary)] mb-4">
                      Please review the design above. If it meets your requirements, approve it to begin production. 
                      If you need changes, request a revision.
                    </p>
                    
                    <Textarea 
                      label="Comments (Required for revisions)" 
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="e.g. Please make the logo slightly larger..."
                      className="mb-4"
                    />
                    
                    <div className="flex gap-3">
                      <Button 
                        onClick={() => handleApproval('approved')} 
                        loading={submitting}
                        className="flex-1 bg-[var(--color-success)] hover:bg-[var(--color-success)]/90 text-white border-none"
                        icon={<Check className="h-4 w-4" />}
                      >
                        Approve Design
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => handleApproval('revision')} 
                        loading={submitting}
                        className="flex-1 border-[var(--color-danger)] text-[var(--color-danger)] hover:bg-[var(--color-danger-light)]"
                        icon={<X className="h-4 w-4" />}
                      >
                        Request Revision
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">Support</h3>
            <p className="text-sm text-[var(--color-text-secondary)] mb-4">
              Need help with this order? Contact our support team.
            </p>
            <Button variant="outline" className="w-full">
              Contact Support
            </Button>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
