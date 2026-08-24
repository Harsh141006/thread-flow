// ==========================================
// ThreadFlow — Customer Detail API (Get/Update/Delete)
// ==========================================

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { requireRole } from '@/lib/api-auth';
import Customer from '@/models/Customer';
import Order from '@/models/Order';

// GET /api/customers/[id]
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireRole(['admin', 'sales', 'designer', 'production']);
  if (error) return error;

  try {
    await dbConnect();
    const { id } = await params;
    const customer = await Customer.findById(id).lean();
    if (!customer) {
      return NextResponse.json(
        { success: false, error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Get order history
    const orders = await Order.find({ customer: id })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: { ...customer, orders },
    });
  } catch (error) {
    console.error('Customer get error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch customer' },
      { status: 500 }
    );
  }
}

// PUT /api/customers/[id]
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireRole(['admin', 'sales']);
  if (error) return error;

  try {
    await dbConnect();
    const { id } = await params;
    const body = await req.json();

    const customer = await Customer.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    ).lean();

    if (!customer) {
      return NextResponse.json(
        { success: false, error: 'Customer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: customer });
  } catch (error) {
    console.error('Customer update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update customer' },
      { status: 500 }
    );
  }
}

// DELETE /api/customers/[id]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireRole(['admin']);
  if (error) return error;

  try {
    await dbConnect();
    const { id } = await params;

    // Check if customer has orders
    const orderCount = await Order.countDocuments({ customer: id });
    if (orderCount > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete customer with existing orders' },
        { status: 400 }
      );
    }

    const customer = await Customer.findByIdAndDelete(id);
    if (!customer) {
      return NextResponse.json(
        { success: false, error: 'Customer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Customer deleted' });
  } catch (error) {
    console.error('Customer delete error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete customer' },
      { status: 500 }
    );
  }
}
