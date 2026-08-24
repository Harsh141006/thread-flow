// ==========================================
// ThreadFlow — Payment Detail API (Add payment entry)
// ==========================================

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { requireRole } from '@/lib/api-auth';
import Payment from '@/models/Payment';

// PUT /api/payments/[id] — Add a payment entry
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireRole(['admin', 'sales']);
  if (error) return error;

  try {
    await dbConnect();
    const { id } = await params;
    const body = await req.json();

    if (body.addPayment) {
      // Add a payment entry and recalculate status
      const payment = await Payment.findById(id);
      if (!payment) {
        return NextResponse.json({ success: false, error: 'Payment record not found' }, { status: 404 });
      }

      payment.payments.push(body.addPayment);

      // Calculate new status
      const totalPaid = payment.payments.reduce((sum: number, p: { amount: number }) => sum + p.amount, 0);
      if (totalPaid >= payment.totalAmount) {
        payment.status = 'paid';
      } else if (totalPaid > 0) {
        payment.status = 'partial';
      } else {
        payment.status = 'unpaid';
      }

      await payment.save();
      return NextResponse.json({ success: true, data: payment });
    }

    // Regular update
    const payment = await Payment.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    ).lean();

    if (!payment) {
      return NextResponse.json({ success: false, error: 'Payment record not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: payment });
  } catch (error) {
    console.error('Payment update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update payment' },
      { status: 500 }
    );
  }
}
