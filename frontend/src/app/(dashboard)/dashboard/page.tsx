// ==========================================
// ThreadFlow — Dashboard Page
// ==========================================

'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  ClipboardList,
  Clock,
  Factory,
  ShieldCheck,
  AlertTriangle,
  Package as PackageIcon,
  TrendingUp,
  Warehouse,
} from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { PageLoader } from '@/components/ui/Spinner';
import { formatCurrency, formatDate, getStatusColor, capitalize } from '@/utils';
import { IDashboardStats, OrderStatus } from '@/types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  variant?: 'default' | 'warning' | 'danger';
}

function StatCard({ label, value, icon, trend, variant = 'default' }: StatCardProps) {
  const borderColor = {
    default: '',
    warning: 'border-l-[var(--color-warning)]',
    danger: 'border-l-[var(--color-danger)]',
  };

  return (
    <Card className={`${variant !== 'default' ? `border-l-[3px] ${borderColor[variant]}` : ''}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-[var(--color-text-secondary)] mb-1">{label}</p>
          <p className="text-2xl font-semibold text-[var(--color-text-primary)]">{value}</p>
          {trend && <p className="text-xs text-[var(--color-text-muted)] mt-1">{trend}</p>}
        </div>
        <div className="p-2 bg-[var(--color-bg-muted)] rounded-[var(--radius-md)]">{icon}</div>
      </div>
    </Card>
  );
}

const PIE_COLORS = ['#6B7280', '#2563EB', '#D97706', '#4F46E5', '#F59E0B', '#7C3AED', '#DC2626', '#14B8A6', '#059669'];

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<IDashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const [statsRes, ordersRes] = await Promise.all([
          fetch('/api/dashboard'),
          fetch('/api/orders?limit=5&sort=-createdAt'),
        ]);
        const statsData = await statsRes.json();
        const ordersData = await ordersRes.json();
        if (statsData.success) setStats(statsData.data);
        if (ordersData.success) setRecentOrders(ordersData.data?.items || []);
      } catch (error) {
        console.error('Failed to fetch dashboard:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  if (loading) return <PageLoader />;

  const statusData = stats
    ? Object.entries(stats.statusBreakdown)
        .filter(([, count]) => count > 0)
        .map(([status, count]) => ({ name: capitalize(status), value: count }))
    : [];

  return (
    <PageContainer
      title={`Welcome back, ${session?.user?.name?.split(' ')[0] || 'User'}`}
      description="Here&rsquo;s what&rsquo;s happening with your production today."
    >
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Orders"
          value={stats?.totalOrders ?? 0}
          icon={<ClipboardList className="h-4 w-4 text-[var(--color-text-secondary)]" />}
        />
        <StatCard
          label="Pending Approvals"
          value={stats?.pendingApprovals ?? 0}
          icon={<Clock className="h-4 w-4 text-[var(--color-warning)]" />}
          variant={stats?.pendingApprovals ? 'warning' : 'default'}
        />
        <StatCard
          label="In Production"
          value={stats?.inProduction ?? 0}
          icon={<Factory className="h-4 w-4 text-[var(--color-text-secondary)]" />}
        />
        <StatCard
          label="QC Pending"
          value={stats?.qcPending ?? 0}
          icon={<ShieldCheck className="h-4 w-4 text-[var(--color-text-secondary)]" />}
        />
      </div>

      {/* Alert cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          label="Overdue Orders"
          value={stats?.overdueOrders ?? 0}
          icon={<AlertTriangle className="h-4 w-4 text-[var(--color-danger)]" />}
          variant={stats?.overdueOrders ? 'danger' : 'default'}
        />
        <StatCard
          label="High Risk Orders"
          value={stats?.highRiskOrders ?? 0}
          icon={<AlertTriangle className="h-4 w-4 text-[var(--color-warning)]" />}
          variant={stats?.highRiskOrders ? 'warning' : 'default'}
        />
        <StatCard
          label="Low Stock Items"
          value={stats?.lowStockItems ?? 0}
          icon={<Warehouse className="h-4 w-4 text-[var(--color-warning)]" />}
          variant={stats?.lowStockItems ? 'warning' : 'default'}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Order status breakdown */}
        <Card>
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">
            Order Status Breakdown
          </h3>
          {statusData.length > 0 ? (
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                    labelLine={false}
                  >
                    {statusData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-[var(--color-text-muted)] text-center py-12">No orders yet</p>
          )}
        </Card>

        {/* Revenue */}
        <Card>
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">
            Revenue Overview
          </h3>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-[var(--color-success)]" />
            <span className="text-2xl font-semibold text-[var(--color-text-primary)]">
              {formatCurrency(stats?.revenue ?? 0)}
            </span>
          </div>
          <p className="text-xs text-[var(--color-text-muted)]">Total revenue from all orders</p>
        </Card>
      </div>

      {/* Recent orders */}
      <Card padding="none">
        <div className="px-5 py-4 border-b border-[var(--color-border-default)]">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
            Recent Orders
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--color-border-default)] bg-[var(--color-bg-muted)]">
                <th className="px-5 py-2.5 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase">Order</th>
                <th className="px-5 py-2.5 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase">Customer</th>
                <th className="px-5 py-2.5 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase">Status</th>
                <th className="px-5 py-2.5 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase">Deadline</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border-default)]">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-sm text-[var(--color-text-muted)]">
                    No orders yet
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={String(order._id)} className="hover:bg-[var(--color-bg-hover)] transition-colors">
                    <td className="px-5 py-3 text-sm font-medium text-[var(--color-accent)]">
                      {String(order.orderId)}
                    </td>
                    <td className="px-5 py-3 text-sm text-[var(--color-text-primary)]">
                      {(order.customer as any)?.name
                        ? String((order.customer as any).name)
                        : '—'}
                    </td>
                    <td className="px-5 py-3">
                      <Badge className={getStatusColor(String(order.status) as OrderStatus)}>
                        {capitalize(String(order.status))}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-sm text-[var(--color-text-secondary)]">
                      {order.deadline ? formatDate(String(order.deadline)) : '—'}
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
