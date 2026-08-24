// ==========================================
// ThreadFlow — Customer Portal Dashboard
// ==========================================

'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import PageContainer from '@/components/layout/PageContainer';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { PageLoader } from '@/components/ui/Spinner';
import { Package, Clock, CheckCircle } from 'lucide-react';
import { formatDate, getStatusColor, capitalize } from '@/utils';
import { OrderStatus } from '@/types';

export default function PortalDashboard() {
  const { data: session } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMyOrders() {
      if (!session?.user?.customerId) return;
      
      try {
        const res = await fetch(`/api/orders?customer=${session.user.customerId}&limit=5`);
        const data = await res.json();
        if (data.success) {
          setOrders(data.data.items);
        }
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setLoading(false);
      }
    }
    
    if (session) {
      fetchMyOrders();
    }
  }, [session]);

  if (loading) return <PageLoader />;

  const activeOrders = orders.filter(o => !['delivered'].includes(String(o.status)));
  const pendingApprovals = orders.filter(o => String(o.status) === 'approval');

  return (
    <PageContainer
      title={`Welcome back, ${session?.user?.name?.split(' ')[0] || 'Customer'}`}
      description="View your orders and pending approvals"
      action={
        <button 
          onClick={() => router.push('/portal/catalog')}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--color-accent)] text-white rounded-[var(--radius-md)] text-sm font-medium hover:bg-[var(--color-accent)]/90 transition-colors"
        >
          <Package className="h-4 w-4" />
          Start New Order
        </button>
      }
    >
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="flex flex-col items-center justify-center p-6 text-center">
          <div className="w-12 h-12 bg-[var(--color-accent-light)] text-[var(--color-accent)] rounded-full flex items-center justify-center mb-3">
            <Package className="h-6 w-6" />
          </div>
          <p className="text-sm text-[var(--color-text-secondary)] font-medium">Active Orders</p>
          <p className="text-3xl font-bold mt-1 text-[var(--color-text-primary)]">{activeOrders.length}</p>
        </Card>
        
        <Card className="flex flex-col items-center justify-center p-6 text-center border-l-[3px] border-l-[var(--color-warning)]">
          <div className="w-12 h-12 bg-[var(--color-warning-light)] text-[var(--color-warning)] rounded-full flex items-center justify-center mb-3">
            <Clock className="h-6 w-6" />
          </div>
          <p className="text-sm text-[var(--color-text-secondary)] font-medium">Pending Approvals</p>
          <p className="text-3xl font-bold mt-1 text-[var(--color-text-primary)]">{pendingApprovals.length}</p>
          {pendingApprovals.length > 0 && (
            <button 
              onClick={() => router.push('/portal/orders')} 
              className="mt-3 text-xs font-medium text-[var(--color-accent)] hover:underline"
            >
              Review now
            </button>
          )}
        </Card>

        <Card className="flex flex-col items-center justify-center p-6 text-center">
          <div className="w-12 h-12 bg-[var(--color-success-light)] text-[var(--color-success)] rounded-full flex items-center justify-center mb-3">
            <CheckCircle className="h-6 w-6" />
          </div>
          <p className="text-sm text-[var(--color-text-secondary)] font-medium">Total Orders</p>
          <p className="text-3xl font-bold mt-1 text-[var(--color-text-primary)]">{orders.length}</p>
        </Card>
      </div>

      {/* Recent Orders */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Recent Orders</h2>
        <button 
          onClick={() => router.push('/portal/orders')}
          className="text-sm font-medium text-[var(--color-accent)] hover:underline"
        >
          View all
        </button>
      </div>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--color-border-default)] bg-[var(--color-bg-muted)]">
                <th className="px-5 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Order</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Details</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Deadline</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border-default)]">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-sm text-[var(--color-text-muted)]">
                    No orders found.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr 
                    key={String(order._id)} 
                    className="hover:bg-[var(--color-bg-hover)] cursor-pointer transition-colors"
                    onClick={() => router.push(`/portal/orders/${order._id}`)}
                  >
                    <td className="px-5 py-4">
                      <span className="font-medium text-[var(--color-accent)]">{String(order.orderId)}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-sm font-medium text-[var(--color-text-primary)]">{String(order.garmentType)}</div>
                      <div className="text-xs text-[var(--color-text-secondary)]">Qty: {String(order.quantity)}</div>
                    </td>
                    <td className="px-5 py-4">
                      <Badge className={getStatusColor(String(order.status) as OrderStatus)}>
                        {capitalize(String(order.status))}
                      </Badge>
                      {String(order.status) === 'approval' && (
                        <div className="text-[10px] text-[var(--color-warning)] mt-1 font-medium">Action Required</div>
                      )}
                    </td>
                    <td className="px-5 py-4 text-sm text-[var(--color-text-secondary)]">
                      {formatDate(String(order.deadline))}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </PageContainer>
  );
}
