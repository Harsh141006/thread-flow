// ==========================================
// ThreadFlow — Approvals API
// ==========================================

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { requireRole } from '@/lib/api-auth';
import Approval from '@/models/Approval';
import Order from '@/models/Order';
import Design from '@/models/Design';

// GET /api/approvals?order=xxx
export async function GET(req: NextRequest) {
  const { error } = await requireRole(['admin', 'sales', 'designer', 'production', 'qc', 'customer']);
  if (error) return error;

  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('order');

    const query: any = {};
    if (orderId) query.order = orderId;

    const approvals = await Approval.find(query)
      .populate('order', 'orderId')
      .populate('decidedBy', 'name email role')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, data: approvals });
  } catch (error) {
    console.error('Approvals list error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch approvals' },
      { status: 500 }
    );
  }
}

// POST /api/approvals — Submit approval decision
export async function POST(req: NextRequest) {
  const { session, error } = await requireRole(['admin', 'customer']);
  if (error) return error;

  try {
    await dbConnect();
    const body = await req.json();
    const { order: orderId, decision, comment } = body;

    if (!orderId || !decision || !comment) {
      return NextResponse.json(
        { success: false, error: 'Order, decision, and comment are required' },
        { status: 400 }
      );
    }

    if (decision === 'revision' && !comment.trim()) {
      return NextResponse.json(
        { success: false, error: 'Comment is required for revision requests' },
        { status: 400 }
      );
    }

    // Get design for this order
    const design = await Design.findOne({ order: orderId });
    if (!design) {
      return NextResponse.json(
        { success: false, error: 'No design found for this order' },
        { status: 404 }
      );
    }

    const approval = await Approval.create({
      order: orderId,
      design: design._id,
      designVersion: design.currentVersion,
      decision,
      comment,
      decidedBy: session!.user.id,
    });

    // Update order status based on decision
    if (decision === 'approved') {
      await Order.findByIdAndUpdate(orderId, { status: 'scheduled' });
    } else if (decision === 'revision') {
      await Order.findByIdAndUpdate(orderId, { status: 'design' });
    }

    return NextResponse.json({ success: true, data: approval }, { status: 201 });
  } catch (error) {
    console.error('Approval create error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit approval' },
      { status: 500 }
    );
  }
}
