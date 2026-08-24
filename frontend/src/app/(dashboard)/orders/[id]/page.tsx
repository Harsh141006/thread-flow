// ==========================================
// ThreadFlow — Order Detail Page
// ==========================================

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { PageLoader } from '@/components/ui/Spinner';
import { formatDate, formatNumber, getStatusColor, capitalize, daysUntilDeadline, getRiskColor } from '@/utils';
import { STATUS_TRANSITIONS, OrderStatus, IRiskAssessment } from '@/types';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [order, setOrder] = useState<Record<string, unknown> | null>(null);
  const [risk, setRisk] = useState<IRiskAssessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const [orderRes, riskRes] = await Promise.all([
          fetch(`/api/orders/${params.id}`),
          fetch(`/api/risk?order=${params.id}`),
        ]);
        const orderData = await orderRes.json();
        const riskData = await riskRes.json();
        if (orderData.success) setOrder(orderData.data);
        if (riskData.success) setRisk(riskData.data);
      } catch {
        toast('error', 'Failed to load order');
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [params.id, toast]);

  const handleStatusChange = async (newStatus: OrderStatus) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/orders/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setOrder(data.data);
        toast('success', `Status updated to ${capitalize(newStatus)}`);
      } else {
        toast('error', data.error);
      }
    } catch {
      toast('error', 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <PageLoader />;
  if (!order) return <p className="p-6 text-sm text-[var(--color-text-muted)]">Order not found</p>;

  const currentStatus = String(order.status) as OrderStatus;
  const nextStatuses = STATUS_TRANSITIONS[currentStatus] || [];
  const customer = order.customer as Record<string, unknown> | null;
  const days = daysUntilDeadline(String(order.deadline));
  const threadColors = (order.threadColors as string[]) || [];

  // Status workflow visualization
  const allStatuses: OrderStatus[] = ['draft', 'design', 'approval', 'scheduled', 'production', 'qc', 'packed', 'delivered'];
  const currentIdx = allStatuses.indexOf(currentStatus);

  return (
    <PageContainer
      title={String(order.orderId)}
      description={`${String(order.garmentType)} — ${customer?.name || 'Unknown Customer'}`}
      action={
        <Button variant="outline" icon={<ArrowLeft className="h-4 w-4" />} onClick={() => router.push('/orders')}>
          Back to Orders
        </Button>
      }
    >
      {/* Status workflow */}
      <Card className="mb-6">
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {allStatuses.map((s, i) => {
            const isActive = s === currentStatus;
            const isPast = i < currentIdx;
            const isRework = currentStatus === 'rework';
            return (
              <div key={s} className="flex items-center">
                {i > 0 && <ChevronRight className="h-4 w-4 text-[var(--color-text-muted)] mx-1 flex-shrink-0" />}
                <span className={`
                  px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap
                  ${isActive ? getStatusColor(s) : isPast ? 'bg-[var(--color-success-light)] text-[var(--color-success)]' : 'bg-[var(--color-bg-muted)] text-[var(--color-text-muted)]'}
                `}>
                  {capitalize(s)}
                </span>
              </div>
            );
          })}
          {currentStatus === 'rework' && (
            <div className="flex items-center">
              <ChevronRight className="h-4 w-4 text-[var(--color-text-muted)] mx-1" />
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-[var(--color-danger-light)] text-[var(--color-danger)]">Rework</span>
            </div>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Order details */}
        <Card className="lg:col-span-2">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">Order Details</h3>
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
            <div><span className="text-[var(--color-text-secondary)]">Garment:</span> <span className="ml-2 font-medium">{String(order.garmentType)}</span></div>
            <div><span className="text-[var(--color-text-secondary)]">Quantity:</span> <span className="ml-2 font-medium">{String(order.quantity)}</span></div>
            
            <div className="col-span-2 mt-2">
              <span className="text-[var(--color-text-secondary)] block mb-1">Sizes & Measurements:</span>
              <div className="flex flex-wrap gap-2">
                {typeof order.sizes === 'object' && order.sizes !== null ? (
                  Object.entries(order.sizes).map(([k, v]) => (
                    Number(v) > 0 ? (
                      <span key={k} className="px-2 py-1 bg-[var(--color-bg-muted)] border border-[var(--color-border-default)] rounded text-xs font-medium">
                        {k.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}: {String(v)}
                      </span>
                    ) : null
                  ))
                ) : (
                  <span className="ml-2">{String(order.sizes)}</span>
                )}
              </div>
            </div>

            <div className="mt-2"><span className="text-[var(--color-text-secondary)]">Position:</span> <span className="ml-2">{String(order.embroideryPosition)}</span></div>
            <div className="mt-2"><span className="text-[var(--color-text-secondary)]">Design Size:</span> <span className="ml-2">{String(order.designWidth)}×{String(order.designHeight)} mm</span></div>
            <div className="mt-2"><span className="text-[var(--color-text-secondary)]">Stitches/Item:</span> <span className="ml-2">{formatNumber(Number(order.stitchesPerItem))}</span></div>
            <div className="mt-2"><span className="text-[var(--color-text-secondary)]">Priority:</span> <span className="ml-2"><Badge variant={String(order.priority) === 'urgent' ? 'danger' : String(order.priority) === 'high' ? 'warning' : 'default'}>{capitalize(String(order.priority))}</Badge></span></div>
            <div className="mt-2"><span className="text-[var(--color-text-secondary)]">Deadline:</span> <span className={`ml-2 font-medium ${days < 0 ? 'text-[var(--color-danger)]' : days <= 3 ? 'text-[var(--color-warning)]' : ''}`}>{formatDate(String(order.deadline))} ({days >= 0 ? `${days}d left` : `${Math.abs(days)}d overdue`})</span></div>
          </div>
          {threadColors.length > 0 && (
            <div className="mt-4">
              <span className="text-sm text-[var(--color-text-secondary)]">Thread Colors:</span>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {threadColors.map((color) => (
                  <span key={color} className="px-2 py-0.5 text-xs bg-[var(--color-bg-muted)] rounded-full">{color}</span>
                ))}
              </div>
            </div>
          )}
          {order.notes && (
            <div className="mt-4 pt-4 border-t border-[var(--color-border-default)]">
              <span className="text-sm text-[var(--color-text-secondary)]">Notes:</span>
              <p className="text-sm mt-1 text-[var(--color-text-primary)]">{String(order.notes)}</p>
            </div>
          )}

          {order.customerDesignPreview && (
            <div className="mt-6 pt-6 border-t border-[var(--color-border-default)]">
              <span className="text-sm font-semibold text-[var(--color-text-primary)] block mb-3">Customer Reference Artwork</span>
              <div className="border border-[var(--color-border-default)] rounded-[var(--radius-md)] overflow-hidden bg-[var(--color-bg-muted)] p-2 inline-block">
                <img 
                  src={String(order.customerDesignPreview)} 
                  alt="Customer Reference Design" 
                  className="max-h-[300px] object-contain rounded" 
                />
              </div>
            </div>
          )}
        </Card>

        {/* Sidebar: Risk + Actions */}
        <div className="space-y-4">
          {/* Risk assessment */}
          {risk && (
            <Card>
              <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">Deadline Risk</h3>
              <div className="mb-3">
                <Badge className={`${getRiskColor(risk.risk)} text-sm px-3 py-1`}>
                  {capitalize(risk.risk)} Risk
                </Badge>
              </div>
              <dl className="space-y-2 text-xs">
                <div className="flex justify-between"><dt className="text-[var(--color-text-secondary)]">Total Stitches</dt><dd>{formatNumber(risk.totalStitches)}</dd></div>
                <div className="flex justify-between"><dt className="text-[var(--color-text-secondary)]">Hours Needed</dt><dd>{risk.hoursNeeded}h</dd></div>
                <div className="flex justify-between"><dt className="text-[var(--color-text-secondary)]">Hours Available</dt><dd>{risk.hoursAvailable}h</dd></div>
                <div className="flex justify-between"><dt className="text-[var(--color-text-secondary)]">Utilization</dt><dd>{risk.utilizationPercent}%</dd></div>
                {risk.capacityShortfall > 0 && (
                  <div className="flex justify-between text-[var(--color-danger)]"><dt>Shortfall</dt><dd>{risk.capacityShortfall}h</dd></div>
                )}
              </dl>
            </Card>
          )}

          {/* Status actions */}
          {(nextStatuses.length > 0 || !['dispatched', 'delivered', 'rejected'].includes(currentStatus)) && (
            <Card>
              <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">Actions</h3>
              <div className="space-y-2">
                {!['dispatched', 'delivered', 'rejected'].includes(currentStatus) ? (
                  <>
                    <Button
                      className="w-full justify-start bg-[var(--color-success)] text-white hover:bg-[var(--color-success-light)] border-none"
                      onClick={() => handleStatusChange('dispatched')}
                      loading={updating}
                    >
                      Approve Order
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-[var(--color-danger)] border-[var(--color-danger)] hover:bg-[var(--color-danger-light)]"
                      onClick={() => handleStatusChange('rejected')}
                      loading={updating}
                    >
                      Reject Order
                    </Button>
                  </>
                ) : (
                  nextStatuses.map((ns) => (
                    <Button
                      key={ns}
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => handleStatusChange(ns)}
                      loading={updating}
                    >
                      Move to {capitalize(ns)}
                    </Button>
                  ))
                )}
              </div>
            </Card>
          )}

          {/* Customer info */}
          {customer && (
            <Card>
              <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">Customer</h3>
              <p className="text-sm font-medium">{String(customer.name)}</p>
              <p className="text-xs text-[var(--color-text-secondary)]">{String(customer.company || '')}</p>
              {customer.email && <p className="text-xs text-[var(--color-text-muted)] mt-1">{String(customer.email)}</p>}
            </Card>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
