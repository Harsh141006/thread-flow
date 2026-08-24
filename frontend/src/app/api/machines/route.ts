// ==========================================
// ThreadFlow — Machines API
// ==========================================

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { requireRole } from '@/lib/api-auth';
import Machine from '@/models/Machine';

// GET /api/machines
export async function GET() {
  const { error } = await requireRole(['admin', 'sales', 'production']);
  if (error) return error;

  try {
    await dbConnect();
    const machines = await Machine.find().populate('currentOrder', 'orderId').sort({ name: 1 }).lean();
    return NextResponse.json({ success: true, data: machines });
  } catch (error) {
    console.error('Machines list error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch machines' },
      { status: 500 }
    );
  }
}

// POST /api/machines
export async function POST(req: NextRequest) {
  const { error } = await requireRole(['admin', 'production']);
  if (error) return error;

  try {
    await dbConnect();
    const body = await req.json();
    const machine = await Machine.create(body);
    return NextResponse.json({ success: true, data: machine }, { status: 201 });
  } catch (error) {
    console.error('Machine create error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create machine' },
      { status: 500 }
    );
  }
}
