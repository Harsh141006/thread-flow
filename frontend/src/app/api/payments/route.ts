// ==========================================
// ThreadFlow — Payments API
// ==========================================

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { requireRole } from '@/lib/api-auth';
import Payment from '@/models/Payment';

// GET /api/payments
export async function GET() {
  const { error } = await requireRole(['admin', 'sales']);
  if (error) return error;

  try {
    await dbConnect();
    const payments = await Payment.find()
      .populate({ path: 'order', select: 'orderId garmentType', populate: { path: 'customer', select: 'name company' } })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, data: payments });
  } catch (error) {
    console.error('Payments list error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}

// POST /api/payments — Create payment record for an order
export async function POST(req: NextRequest) {
  const { error } = await requireRole(['admin', 'sales']);
  if (error) return error;

  try {
    await dbConnect();
    const body = await req.json();

    const payment = await Payment.create(body);
    return NextResponse.json({ success: true, data: payment }, { status: 201 });
  } catch (error) {
    console.error('Payment create error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create payment' },
      { status: 500 }
    );
  }
}
