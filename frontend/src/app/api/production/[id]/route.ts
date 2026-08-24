// ==========================================
// ThreadFlow — Production Record Detail API
// ==========================================

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { requireRole } from '@/lib/api-auth';
import Production from '@/models/Production';

// PUT /api/production/[id]
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireRole(['admin', 'production']);
  if (error) return error;

  try {
    await dbConnect();
    const { id } = await params;
    const body = await req.json();

    const record = await Production.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    ).lean();

    if (!record) {
      return NextResponse.json({ success: false, error: 'Record not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: record });
  } catch (error) {
    console.error('Production update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update production record' },
      { status: 500 }
    );
  }
}
