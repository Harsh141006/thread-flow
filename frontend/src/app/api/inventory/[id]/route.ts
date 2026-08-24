// ==========================================
// ThreadFlow — Inventory Item Detail API
// ==========================================

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { requireRole } from '@/lib/api-auth';
import Inventory from '@/models/Inventory';

// PUT /api/inventory/[id]
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireRole(['admin', 'production']);
  if (error) return error;

  try {
    await dbConnect();
    const { id } = await params;
    const body = await req.json();

    const item = await Inventory.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    ).lean();

    if (!item) {
      return NextResponse.json({ success: false, error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    console.error('Inventory update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update item' },
      { status: 500 }
    );
  }
}

// DELETE /api/inventory/[id]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireRole(['admin']);
  if (error) return error;

  try {
    await dbConnect();
    const { id } = await params;

    const item = await Inventory.findByIdAndDelete(id);
    if (!item) {
      return NextResponse.json({ success: false, error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Item deleted' });
  } catch (error) {
    console.error('Inventory delete error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete item' },
      { status: 500 }
    );
  }
}
