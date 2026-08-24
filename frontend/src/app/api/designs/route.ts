// ==========================================
// ThreadFlow — Designs API
// ==========================================

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { requireRole } from '@/lib/api-auth';
import Design from '@/models/Design';
import Order from '@/models/Order';

// GET /api/designs?order=xxx
export async function GET(req: NextRequest) {
  const { error } = await requireRole(['admin', 'sales', 'designer', 'production', 'qc', 'customer']);
  if (error) return error;

  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('order');

    const query: Record<string, unknown> = {};
    if (orderId) query.order = orderId;

    const designs = await Design.find(query)
      .populate('order', 'orderId garmentType')
      .populate('versions.uploadedBy', 'name')
      .sort({ updatedAt: -1 })
      .lean();

    return NextResponse.json({ success: true, data: designs });
  } catch (error) {
    console.error('Designs list error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch designs' },
      { status: 500 }
    );
  }
}

// POST /api/designs — Upload a new design version
export async function POST(req: NextRequest) {
  const { session, error } = await requireRole(['admin', 'designer']);
  if (error) return error;

  try {
    await dbConnect();
    const body = await req.json();
    const { order: orderId, imageUrl, thumbnailUrl, notes } = body;

    if (!orderId || !imageUrl) {
      return NextResponse.json(
        { success: false, error: 'Order and image URL are required' },
        { status: 400 }
      );
    }

    // Check order exists
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Find or create design doc for this order
    let design = await Design.findOne({ order: orderId });

    if (design) {
      // Add new version (never overwrite)
      const newVersion = design.currentVersion + 1;
      design.versions.push({
        version: newVersion,
        imageUrl,
        thumbnailUrl,
        uploadedBy: session!.user.id,
        notes,
        createdAt: new Date(),
      } as any);
      design.currentVersion = newVersion;
      await design.save();
    } else {
      // Create first version
      design = await Design.create({
        order: orderId,
        versions: [
          {
            version: 1,
            imageUrl,
            thumbnailUrl,
            uploadedBy: session!.user.id,
            notes,
            createdAt: new Date(),
          },
        ],
        currentVersion: 1,
      });
    }

    // Update order status to 'design' if it's still in draft
    if (order.status === 'draft') {
      order.status = 'design';
      await order.save();
    }

    return NextResponse.json({ success: true, data: design }, { status: 201 });
  } catch (error) {
    console.error('Design upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload design' },
      { status: 500 }
    );
  }
}
