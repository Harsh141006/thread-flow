// ==========================================
// ThreadFlow — Inventory API
// ==========================================

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { requireRole } from '@/lib/api-auth';
import Inventory from '@/models/Inventory';

// GET /api/inventory
export async function GET(req: NextRequest) {
  const { error } = await requireRole(['admin', 'production']);
  if (error) return error;

  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const lowStock = searchParams.get('lowStock');

    const query: Record<string, unknown> = {};
    if (category) query.category = category;
    if (lowStock === 'true') {
      query.$expr = { $lte: ['$quantity', '$reorderLevel'] };
    }

    const items = await Inventory.find(query).sort({ category: 1, name: 1 }).lean();

    return NextResponse.json({ success: true, data: items });
  } catch (error) {
    console.error('Inventory list error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch inventory' },
      { status: 500 }
    );
  }
}

// POST /api/inventory
export async function POST(req: NextRequest) {
  const { error } = await requireRole(['admin', 'production']);
  if (error) return error;

  try {
    await dbConnect();
    const body = await req.json();

    const item = await Inventory.create(body);
    return NextResponse.json({ success: true, data: item }, { status: 201 });
  } catch (error) {
    console.error('Inventory create error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create inventory item' },
      { status: 500 }
    );
  }
}
