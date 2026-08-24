// ==========================================
// ThreadFlow — Order Detail API (Get/Update)
// ==========================================

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { requireRole } from '@/lib/api-auth';
import Order from '@/models/Order';
import Customer from '@/models/Customer';
import User from '@/models/User';
import Notification from '@/models/Notification';
import { STATUS_TRANSITIONS, OrderStatus } from '@/types';

// GET /api/orders/[id]
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = await requireRole(['admin', 'sales', 'designer', 'production', 'qc', 'customer']);
  if (error) return error;

  try {
    await dbConnect();
    // Prevent Next.js from tree-shaking the Customer model
    if (!Customer.modelName) throw new Error('Customer model missing');

    const { id } = await params;

    const order = await Order.findById(id)
      .populate('customer', 'name company email phone address')
      .populate('assignedTo', 'name email role')
      .lean();

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Security check: if user is a customer, ensure this order belongs to them
    if (session?.user.role === 'customer' && order.customer._id.toString() !== session.user.customerId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized access' },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error('Order get error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

// PUT /api/orders/[id]
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = await requireRole(['admin', 'sales', 'designer', 'production', 'qc']);
  if (error) return error;

  try {
    await dbConnect();
    // Prevent Next.js from tree-shaking the Customer model
    if (!Customer.modelName) throw new Error('Customer model missing');
    
    const { id } = await params;
    const body = await req.json();

    const existingOrder = await Order.findById(id);
    if (!existingOrder) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Validate status transition if status is being changed
    if (body.status && body.status !== existingOrder.status) {
      const currentStatus = existingOrder.status as OrderStatus;
      const newStatus = body.status as OrderStatus;
      const allowedTransitions = STATUS_TRANSITIONS[currentStatus];

      if (!allowedTransitions.includes(newStatus)) {
        return NextResponse.json(
          {
            success: false,
            error: `Cannot transition from "${currentStatus}" to "${newStatus}". Allowed: ${allowedTransitions.join(', ')}`,
          },
          { status: 400 }
        );
      }
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    )
      .populate('customer', 'name company')
      .lean();

    if (!updatedOrder) {
      return NextResponse.json(
        { success: false, error: 'Order not found after update' },
        { status: 404 }
      );
    }

    // Trigger Notification if dispatched
    if (body.status === 'dispatched' && existingOrder.status !== 'dispatched') {
      const customerId = updatedOrder.customer?._id || updatedOrder.customer;
      if (customerId) {
        const user = await User.findOne({ customerId });
        if (user) {
          await Notification.create({
            user: user._id,
            title: 'Order Dispatched',
            message: `Great news! Your order ${updatedOrder.orderId} has been dispatched.`,
            type: 'success',
            link: `/portal/orders/${updatedOrder._id}`
          });
        }
      }
    }

    return NextResponse.json({ success: true, data: updatedOrder });
  } catch (error: any) {
    console.error('Order update error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update order' },
      { status: 500 }
    );
  }
}
