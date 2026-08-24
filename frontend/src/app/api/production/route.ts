// ==========================================
// ThreadFlow — Production API
// ==========================================

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { requireRole } from '@/lib/api-auth';
import Production from '@/models/Production';

// GET /api/production
export async function GET(req: NextRequest) {
  const { error } = await requireRole(['admin', 'sales', 'production']);
  if (error) return error;

  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const query: any = {};
    if (status) query.status = status;

    const items = await Production.find(query)
      .populate({ path: 'order', select: 'orderId garmentType quantity deadline status', populate: { path: 'customer', select: 'name company' } })
      .populate('machine', 'name type')
      .populate('assignedBy', 'name')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, data: items });
  } catch (error) {
    console.error('Production list error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch production records' },
      { status: 500 }
    );
  }
}

// POST /api/production
export async function POST(req: NextRequest) {
  const { session, error } = await requireRole(['admin', 'production']);
  if (error) return error;

  try {
    await dbConnect();
    const body = await req.json();

    const record = await Production.create({
      ...body,
      assignedBy: session!.user.id,
    });

    return NextResponse.json({ success: true, data: record }, { status: 201 });
  } catch (error) {
    console.error('Production create error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create production record' },
      { status: 500 }
    );
  }
}
