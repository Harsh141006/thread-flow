// ==========================================
// ThreadFlow — Risk Assessment API
// ==========================================

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';
import Order from '@/models/Order';
import Machine from '@/models/Machine';
import { calculateRisk } from '@/services/riskEngine';

// GET /api/risk?order=xxx  OR  GET /api/risk (all active orders)
export async function GET(req: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('order');

    // Get default machine (first active machine)
    const machine = await Machine.findOne({ status: 'active' }).lean();
    const machineSpeed = machine?.stitchesPerHour || 50000; // default fallback

    if (orderId) {
      // Single order risk
      const order = await Order.findById(orderId).lean();
      if (!order) {
        return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
      }

      const risk = calculateRisk(
        order.stitchesPerItem,
        order.quantity,
        machineSpeed,
        order.deadline
      );

      return NextResponse.json({ success: true, data: { order: order.orderId, ...risk } });
    }

    // All active orders risk
    const activeOrders = await Order.find({
      status: { $in: ['scheduled', 'production', 'design', 'approval'] },
    }).lean();

    const risks = activeOrders.map((order) => {
      const risk = calculateRisk(
        order.stitchesPerItem,
        order.quantity,
        machineSpeed,
        order.deadline
      );
      return { orderId: order.orderId, _id: order._id, deadline: order.deadline, ...risk };
    });

    return NextResponse.json({ success: true, data: risks });
  } catch (error) {
    console.error('Risk assessment error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to calculate risk' },
      { status: 500 }
    );
  }
}
