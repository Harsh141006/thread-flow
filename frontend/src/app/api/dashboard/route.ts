// ==========================================
// ThreadFlow — Dashboard API
// ==========================================

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';
import Order from '@/models/Order';
import Inventory from '@/models/Inventory';
import Payment from '@/models/Payment';
import { IDashboardStats, OrderStatus } from '@/types';

export async function GET() {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    await dbConnect();

    // Get all orders
    const orders = await Order.find().lean();
    const now = new Date();

    // Status breakdown
    const statusBreakdown: Record<OrderStatus, number> = {
      draft: 0, design: 0, approval: 0, scheduled: 0,
      production: 0, qc: 0, rework: 0, packed: 0, dispatched: 0, delivered: 0, rejected: 0,
    };
    let overdueOrders = 0;

    orders.forEach((order) => {
      const status = order.status as OrderStatus;
      if (statusBreakdown[status] !== undefined) {
        statusBreakdown[status]++;
      }
      // Overdue: past deadline and not delivered/packed
      if (
        new Date(order.deadline) < now &&
        !['delivered', 'packed'].includes(status)
      ) {
        overdueOrders++;
      }
    });

    // Low stock items
    const lowStockItems = await Inventory.countDocuments({
      $expr: { $lte: ['$quantity', '$reorderLevel'] },
    });

    // Revenue from payments
    const payments = await Payment.find().lean();
    const revenue = payments.reduce((sum, p) => {
      const paid = p.payments?.reduce(
        (s: number, entry: { amount: number }) => s + (entry.amount || 0),
        0
      ) || 0;
      return sum + paid;
    }, 0);

    // High risk orders (simple heuristic: orders with tight deadlines in production/scheduled)
    const activeOrders = orders.filter(
      (o) => ['scheduled', 'production'].includes(o.status as string)
    );
    let highRiskOrders = 0;
    activeOrders.forEach((order) => {
      const daysLeft = Math.ceil(
        (new Date(order.deadline).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysLeft <= 3) highRiskOrders++;
    });

    const stats: IDashboardStats = {
      totalOrders: orders.length,
      pendingApprovals: statusBreakdown.approval,
      inProduction: statusBreakdown.production,
      qcPending: statusBreakdown.qc,
      overdueOrders,
      highRiskOrders,
      lowStockItems,
      revenue,
      statusBreakdown,
    };

    return NextResponse.json({ success: true, data: stats });
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
