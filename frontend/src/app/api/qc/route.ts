// ==========================================
// ThreadFlow — QC Records API
// ==========================================

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { requireRole } from '@/lib/api-auth';
import QCRecord from '@/models/QCRecord';
import Order from '@/models/Order';

// GET /api/qc
export async function GET() {
  const { error } = await requireRole(['admin', 'sales', 'production', 'qc']);
  if (error) return error;

  try {
    await dbConnect();
    const records = await QCRecord.find()
      .populate({ path: 'order', select: 'orderId garmentType quantity', populate: { path: 'customer', select: 'name' } })
      .populate('inspector', 'name')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, data: records });
  } catch (error) {
    console.error('QC list error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch QC records' },
      { status: 500 }
    );
  }
}

// POST /api/qc
export async function POST(req: NextRequest) {
  const { session, error } = await requireRole(['admin', 'qc']);
  if (error) return error;

  try {
    await dbConnect();
    const body = await req.json();

    const record = await QCRecord.create({
      ...body,
      inspector: session!.user.id,
    });

    // If rework, update order status
    if (body.result === 'rework') {
      await Order.findByIdAndUpdate(body.order, { status: 'rework' });
    } else if (body.result === 'pass') {
      await Order.findByIdAndUpdate(body.order, { status: 'packed' });
    }

    return NextResponse.json({ success: true, data: record }, { status: 201 });
  } catch (error) {
    console.error('QC create error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create QC record' },
      { status: 500 }
    );
  }
}
